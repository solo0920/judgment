#!/usr/bin/env python3
"""Export the judgment Qdrant payload schema for query-filter design.

Usage:
    uv run python scripts/export_qdrant_schema.py
    uv run python scripts/export_qdrant_schema.py --limit 20000
    uv run python scripts/export_qdrant_schema.py \\
        --alias judgments_current \\
        --output docs/rag-query-filter-handoff.md

The script reads QDRANT_URL, QDRANT_API_KEY and JUDGMENT_VECTOR_ALIAS from
the environment/.env. It never writes the API key to the output.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from judgment.config import Settings
from judgment.courts import DISTRICT_COURTS
from judgment.vector_store import QdrantStore

FIELD_NOTES = {
    "jid": "判決 JID；民國年、案號、西元裁判日期混合。",
    "court": "正規化後的法院名稱（keyword）。",
    "title": "案由（keyword，精確值；不是全文）。",
    "jdate": "裁判日期，字串 YYYYMMDD。",
    "jdate_num": "整數 YYYYMMDD；年份／日期 range filter 使用。",
    "source_year": "裁判年份，字串 YYYY；適合用 MatchAny 做年份清單。",
    "matched_laws": "判決命中的法規名稱陣列。",
    "citation_count": "判決引用法規次數。",
    "source_archive": "來源壓縮檔。",
    "snippet": "索引用 head/tail 摘要，不是全文。",
    "full_text_length": "判決全文長度。",
    "pdf_url": "司法院原判決 PDF。",
    "model": "索引使用的 embedding 模型。",
    "embedding_version": "向量版本。",
    "index_recipe_version": "索引文字規則版本。",
    "valid_from_version_id": "向量開始有效的索引版本。",
    "valid_to_version_id": "向量失效的索引版本；null 表示 current。",
    "is_current": "是否為 current 向量。",
}


def _type_name(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "bool"
    if isinstance(value, (int, float)):
        return "number"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        inner = {_type_name(item) for item in value[:5]}
        return f"array[{','.join(sorted(inner)) or 'empty'}]"
    if isinstance(value, dict):
        return "object"
    return type(value).__name__


def _is_present(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict)):
        return bool(value)
    return True


def _example(value: Any, limit: int = 160) -> Any:
    if isinstance(value, str):
        text = " ".join(value.split())
        return text[:limit] + ("…" if len(text) > limit else "")
    if isinstance(value, list):
        return value[:5]
    if isinstance(value, dict):
        return {key: _example(item, 80) for key, item in list(value.items())[:8]}
    return value


def _top(counter: Counter, limit: int = 30) -> List[Dict[str, Any]]:
    return [
        {"value": value, "count": count}
        for value, count in counter.most_common(limit)
    ]


def _load_points(
    store: QdrantStore,
    collection: str,
    limit: int,
) -> List[Dict[str, Any]]:
    payloads: List[Dict[str, Any]] = []
    for batch in store.scroll_points(
        collection,
        batch_size=min(512, max(1, limit)),
        with_payload=True,
        with_vector=False,
    ):
        for point in batch:
            payload = point.get("payload")
            if isinstance(payload, dict):
                payloads.append(payload)
            if len(payloads) >= limit:
                return payloads
    return payloads


def _parse_question_excerpt(root: Path) -> List[str]:
    path = root / "src" / "judgment" / "rag.py"
    if not path.exists():
        return ["（找不到 src/judgment/rag.py）"]
    lines = path.read_text(encoding="utf-8").splitlines()
    start = None
    for index, line in enumerate(lines):
        if '"rag.parse_question"' in line:
            start = max(0, index - 2)
            break
    if start is None:
        return ["（找不到 rag.parse_question trace）"]
    return lines[start : start + 36]


def _search_hits_excerpt(root: Path) -> List[str]:
    path = root / "src" / "judgment" / "rag.py"
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()
    for index, line in enumerate(lines):
        if line.startswith("def _search_hits("):
            return lines[index : index + 46]
    return []


def build_report(
    *,
    root: Path,
    alias: str,
    collection: str,
    info: Dict[str, Any],
    payloads: List[Dict[str, Any]],
) -> Dict[str, Any]:
    fields: Dict[str, Dict[str, Any]] = {}
    courts: Counter = Counter()
    years: Counter = Counter()
    titles: Counter = Counter()
    jdates: List[str] = []
    for payload in payloads:
        for field, value in payload.items():
            entry = fields.setdefault(
                field,
                {"present": 0, "total": 0, "types": Counter(), "examples": []},
            )
            if _is_present(value):
                entry["present"] += 1
                entry["types"][_type_name(value)] += 1
                if len(entry["examples"]) < 4:
                    example = _example(value)
                    if example not in entry["examples"]:
                        entry["examples"].append(example)
        court = str(payload.get("court") or "").strip()
        if court:
            courts[court] += 1
        year = str(payload.get("source_year") or "").strip()
        if year:
            years[year] += 1
        title = str(payload.get("title") or "").strip()
        if title:
            titles[title] += 1
        jdate = str(payload.get("jdate") or "").strip()
        if jdate:
            jdates.append(jdate)

    field_rows = []
    for field in sorted(fields):
        entry = fields[field]
        entry["total"] = len(payloads)
        field_rows.append(
            {
                "field": field,
                "present": entry["present"],
                "total": entry["total"],
                "types": dict(entry["types"]),
                "examples": entry["examples"],
                "note": FIELD_NOTES.get(field, ""),
            }
        )

    fraud_sample = None
    for payload in payloads:
        if "詐" in str(payload.get("title") or ""):
            fraud_sample = payload
            break
    samples = [fraud_sample] if fraud_sample is not None else []
    for payload in payloads:
        if payload not in samples:
            samples.append(payload)
        if len(samples) >= 3:
            break

    vector = (
        ((info.get("config") or {}).get("params") or {}).get("vectors") or {}
    )
    dimension = vector.get("size") if isinstance(vector, dict) else None

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "alias": alias,
        "collection": collection,
        "points_count": info.get("points_count"),
        "dimension": dimension,
        "sample_size": len(payloads),
        "fields": field_rows,
        "courts": _top(courts),
        "source_years": [
            {"value": key, "count": years[key]} for key in sorted(years)
        ],
        "titles": _top(titles, 40),
        "jdate_min": min(jdates) if jdates else None,
        "jdate_max": max(jdates) if jdates else None,
        "samples": samples,
    }


def render_markdown(report: Dict[str, Any], root: Path) -> str:
    lines: List[str] = [
        "# RAG 判決查詢 Filter 交接資料",
        "",
        f"- 產生時間：`{report['generated_at']}`",
        f"- Qdrant alias：`{report['alias']}`",
        f"- 實際 collection：`{report['collection']}`",
        f"- points：`{report['points_count']}`",
        f"- 向量維度：`{report['dimension']}`",
        f"- 抽樣 payload 數：`{report['sample_size']}`",
        "",
        "> 這份文件由 `scripts/export_qdrant_schema.py` 自動產生；"
        "不包含 QDRANT_URL、API key 或任何密鑰。",
        "",
        "## P0 實作檔案",
        "",
        "- `src/judgment/query_parser.py`：`parse_judgment_query()`、"
        "`build_query_filter()`、`violations()`。",
        "- `scripts/backfill_jdate_num.py`：回填 `jdate_num`／`source_year`，"
        "並建立 `court`／`title`／`jdate_num` 等 payload index。",
        "- `src/judgment/vector_store.py`：新增 `count()`、`facet()`、`scroll()`。",
        "- `src/judgment/rag.py`：`_search_hits(query_filter=...)`、"
        "結構化列舉路徑與後驗 `violations()`。",
        "",
        "## 1. Payload 欄位",
        "",
        "| 欄位 | 有值 / 抽樣 | 型別 | 範例 | 說明 |",
        "|---|---:|---|---|---|",
    ]
    for field in report["fields"]:
        types = ", ".join(
            f"{name}×{count}" for name, count in field["types"].items()
        )
        examples = json.dumps(
            field["examples"][:2], ensure_ascii=False
        )
        missing = field["total"] - field["present"]
        presence = (
            f"{field['present']} / {field['total']}"
            + (f"（缺 {missing}）" if missing else "")
        )
        lines.append(
            f"| `{field['field']}` | {presence} | "
            f"{types or '—'} | {examples} | {field['note']} |"
        )
    lines += [
        "",
        "### 欄位缺漏警告",
        "",
    ]
    missing_fields = [
        field
        for field in report["fields"]
        if field["present"] < field["total"]
    ]
    if missing_fields:
        for field in missing_fields:
            missing = field["total"] - field["present"]
            lines.append(
                f"- `{field['field']}`：抽樣 {field['total']} 筆中 "
                f"{missing} 筆沒有值。使用此欄位做 filter 會排除這些點。"
            )
    else:
        lines.append("- 抽樣中所有欄位都有值。")
    lines += [
        "",
        "> 目前 `jdate_num` 與 `source_year` 已完成回填（缺值 0）；"
        "年份 filter 請使用數值 `jdate_num` 的 range。"
        "`valid_to_version_id` 的 null 代表 current，`pdf_url` 缺漏不影響 filter。",
        "",
        "### 欄位判讀",
        "",
        "- `court` 是正規化後的法院名稱，不是判決全文中的原始字串。"
        "2000–2010 的舊判決可能同時以 `臺灣新北地方法院` 或 "
        "`臺灣板橋地方法院` 出現；filter 應同時包含兩者。",
        "- `jdate` 是 `YYYYMMDD` 字串；`source_year` 是 `YYYY` 字串。"
        "Qdrant 的 `range` 不適合直接套在字串欄位，年份請用 "
        "`source_year` 的 `MatchAny` 清單，或先在索引加入數值欄位。",
        "- `title` 是案由的精確 keyword，不是全文索引。"
        "詐騙類常見值為 `詐欺`、`詐欺等`；不要用 `match: {text: ...}` "
        "期待它做全文搜尋。",
        "- 目前沒有獨立的 `case_type`／`crime_type` 欄位；案由與 "
        "`matched_laws` 只能作為輔助條件，不能取代判決全文語意。",
        "",
        "## 2. 法院值分佈",
        "",
        "| 法院 | 筆數 |",
        "|---|---:|",
    ]
    for item in report["courts"]:
        lines.append(f"| {item['value']} | {item['count']} |")
    lines += [
        "",
        "### 法院別名建議",
        "",
        "| 使用者可能輸入 | 建議 filter 值 |",
        "|---|---|",
    ]
    aliases = {
        "板橋地方法院": ["臺灣新北地方法院", "臺灣板橋地方法院"],
        "新北地方法院": ["臺灣新北地方法院", "臺灣板橋地方法院"],
    }
    for district, canonical in DISTRICT_COURTS.items():
        aliases.setdefault(f"{district}地方法院", [canonical])
    for user_text, values in aliases.items():
        lines.append(
            f"| {user_text} | {', '.join(f'`{value}`' for value in values)} |"
        )
    lines += [
        "",
        "## 3. 年份與案由分佈",
        "",
        f"- `jdate` 範圍：`{report['jdate_min']}` – `{report['jdate_max']}`",
        "",
        "| source_year | 筆數 |",
        "|---|---:|",
    ]
    for item in report["source_years"]:
        lines.append(f"| {item['value']} | {item['count']} |")
    lines += [
        "",
        "### 案由 top 40",
        "",
        "| 案由 | 筆數 |",
        "|---|---:|",
    ]
    for item in report["titles"]:
        lines.append(f"| {item['value']} | {item['count']} |")
    lines += [
        "",
        "## 4. 建議的 Qdrant filter",
        "",
        "以「2000–2010 年、板橋／新北地院、詐騙」為例：",
        "",
        "```json",
        json.dumps(
            {
                "must": [
                    {
                        "key": "court",
                        "match": {
                            "any": [
                                "臺灣新北地方法院",
                                "臺灣板橋地方法院",
                            ]
                        },
                    },
                    {
                        "key": "source_year",
                        "match": {
                            "any": [str(year) for year in range(2000, 2011)]
                        },
                    },
                    {
                        "key": "title",
                        "match": {
                            "any": ["詐欺", "詐欺等", "詐騙", "詐騙等"]
                        },
                    },
                ]
            },
            ensure_ascii=False,
            indent=2,
        ),
        "```",
        "",
        "注意：`jdate_num` 已建立 integer index，年份／日期請用 range；"
        "`title` 是 keyword，動態值用 facet 取得。新匯入資料必須同步寫入 "
        "`jdate_num`／`source_year`，否則新 points 會缺欄位。",
        "",
        "## 5. 目前 `parse_question` 的程式碼",
        "",
        "位置：`src/judgment/rag.py`。trace 只做去除空白與長度記錄；"
        "結構化日期／法院／案由解析已由 "
        "`src/judgment/query_parser.py` 的 `parse_judgment_query()` 實作。",
        "",
        "```python",
        *_parse_question_excerpt(root),
        "```",
        "",
        "## 6. 目前判決向量檢索的入口",
        "",
        "位置：`src/judgment/rag.py` 的 `_search_hits()`。"
        "目前接受 `query_filter` 並傳給 `QdrantStore.search()`；"
        "列舉路徑另用 `count()` + `scroll(order_by=jdate_num)`。",
        "",
        "```python",
        *_search_hits_excerpt(root),
        "```",
        "",
        "## 7. 建議的 parser 契約",
        "",
        "```json",
        json.dumps(
            {
                "year_from": 2000,
                "year_to": 2010,
                "courts": [
                    "臺灣新北地方法院",
                    "臺灣板橋地方法院",
                ],
                "title_terms": ["詐欺", "詐欺等", "詐騙", "詐騙等"],
                "active": True,
            },
            ensure_ascii=False,
            indent=2,
        ),
        "```",
        "",
        "驗收方式：準備 20 題帶條件的問題，對 `/api/rag/query` 回傳的"
        "每一筆 `judgments` 檢查 `jdate` 年份、`court`、`title` 是否符合"
        "parser 輸出；不符合即視為 filter 回歸失敗。",
        "",
        "## 8. 抽樣 payload",
        "",
        "```json",
        json.dumps(report["samples"], ensure_ascii=False, indent=2)[:20000],
        "```",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Export judgment Qdrant payload schema for filter design."
    )
    parser.add_argument("--alias", default="")
    parser.add_argument("--limit", type=int, default=5000)
    parser.add_argument(
        "--output",
        default="docs/rag-query-filter-handoff.md",
    )
    parser.add_argument(
        "--json-output",
        default="",
        help="預設與 --output 同路徑，副檔名改為 .json",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    settings = Settings.from_env()
    if not settings.qdrant_url:
        raise SystemExit("QDRANT_URL 未設定")
    store = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=60.0,
    )
    alias = args.alias or settings.judgment_vector_alias
    collection = store.get_alias(alias) or settings.judgment_vector_collection
    info = store.collection_info(collection)
    if info is None:
        raise SystemExit(f"找不到 collection：{collection}")
    payloads = _load_points(store, collection, max(1, args.limit))
    report = build_report(
        root=root,
        alias=alias,
        collection=collection,
        info=info,
        payloads=payloads,
    )
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_markdown(report, root), encoding="utf-8")
    json_output = (
        Path(args.json_output)
        if args.json_output
        else output.with_suffix(".json")
    )
    json_output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"已寫入 {output}")
    print(f"已寫入 {json_output}")
    print(f"collection={collection} sample={len(payloads)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
