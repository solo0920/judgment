#!/usr/bin/env python3
"""Interactive terminal annotator for a blind batch.

Examples:
    uv run python scripts/annotate_batch.py \
      --batch .run/fraud_relevance/batches/pilot_batch.jsonl \
      --annotator annotator_1

    uv run python scripts/annotate_batch.py \
      --batch .run/fraud_relevance/batches/title_batch.jsonl \
      --annotator annotator_1

The tool shows only the opaque case ID and the judgment text.  It never reads
or displays the analysis key.  Answers are appended to a JSONL file after each
case, so the annotator can stop and resume.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import pydoc
from pathlib import Path
from typing import Any, Dict, List, Sequence

from judgment.text_normalization import NORMALIZATION_VERSION

OFFENCES = ("fraud", "money_laundering", "fraud_civil", "mixed")
SECTIONS = ("main_text", "facts", "reasoning", "cited_law", "other")


def _read_jsonl(path: Path) -> List[Dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def _existing_ids(path: Path, id_field: str) -> set[str]:
    if not path.exists():
        return set()
    return {
        str(row.get(id_field) or "")
        for row in _read_jsonl(path)
        if row.get(id_field)
    }


def _choice(prompt: str, choices: Sequence[str], default: str) -> str:
    labels = " / ".join(
        f"{index + 1}={value}" for index, value in enumerate(choices)
    )
    while True:
        raw = input(f"{prompt} [{labels}] (default {default}): ").strip()
        if not raw:
            return default
        if raw in choices:
            return raw
        if raw.isdigit() and 1 <= int(raw) <= len(choices):
            return choices[int(raw) - 1]
        print("請輸入編號或完整值。")


def _text(prompt: str, *, required: bool = False) -> str:
    while True:
        value = input(prompt).strip()
        if value or not required:
            return value
        print("此欄位必填。")


def _yes_no(prompt: str, default: bool) -> bool:
    suffix = "Y/n" if default else "y/N"
    while True:
        raw = input(f"{prompt} [{suffix}]: ").strip().lower()
        if not raw:
            return default
        if raw in {"y", "yes", "true", "1"}:
            return True
        if raw in {"n", "no", "false", "0"}:
            return False
        print("請輸入 y 或 n。")


def _confidence(default: float = 1.0) -> float:
    while True:
        raw = input(f"confidence 0–1 (default {default}): ").strip()
        if not raw:
            return default
        try:
            value = float(raw)
        except ValueError:
            print("請輸入 0 到 1 的數字。")
            continue
        if 0.0 <= value <= 1.0:
            return value
        print("請輸入 0 到 1 的數字。")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch", required=True)
    parser.add_argument("--annotator", required=True)
    parser.add_argument("--output", default="")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--no-pager", action="store_true")
    args = parser.parse_args()

    batch_path = Path(args.batch)
    cases = _read_jsonl(batch_path)
    if not cases:
        raise SystemExit("batch is empty")
    id_field = "case_id" if "case_id" in cases[0] else "batch_id"
    output = Path(
        args.output
        or (
            Path(".run/fraud_relevance/annotations")
            / f"{batch_path.stem}_{args.annotator}.jsonl"
        )
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    done = _existing_ids(output, id_field)
    remaining = [
        case
        for case in cases
        if str(case.get(id_field) or "") not in done
    ]
    if args.limit > 0:
        remaining = remaining[: args.limit]
    if not remaining:
        print(f"沒有待標註案件；已完成 {len(done)} 筆。")
        return 0

    print(
        f"批次 {batch_path.name}：共 {len(cases)} 筆，"
        f"已完成 {len(done)} 筆，本次 {len(remaining)} 筆。"
    )
    for index, case in enumerate(remaining, 1):
        case_id = str(case[id_field])
        text = str(case.get("text") or "")
        header = f"[{index}/{len(remaining)}] {case_id}"
        if args.no_pager or not sys.stdin.isatty():
            print(header)
            print(text)
        else:
            pydoc.pager(f"{header}\n\n{text}")

        grade_raw = input("grade 0/1/2（q 離開並保留進度）：").strip().lower()
        if grade_raw == "q":
            break
        if grade_raw not in {"0", "1", "2"}:
            print("請輸入 0、1 或 2；本筆不儲存。")
            continue
        grade = int(grade_raw)

        if grade == 0:
            offence = "other"
            conviction = False
            section = "other"
            quote = ""
        else:
            offence = _choice("primary_offence", OFFENCES, "fraud")
            if offence in {"money_laundering", "fraud_civil"}:
                conviction = False
            else:
                conviction = _yes_no(
                    "fraud_conviction", default=True
                )
            section = _choice("evidence_section", SECTIONS, "main_text")
            quote = _text("evidence_quote（原文片段，必填）：", required=True)

        reason = _text("relevance_reason（可空白）：")
        confidence = _confidence()
        notes = _text("notes（可空白）：")

        record = {
            id_field: case_id,
            "grade": grade,
            "primary_offence": offence,
            "fraud_conviction": conviction,
            "evidence_section": section,
            "evidence_quote": quote,
            "relevance_reason": reason,
            "confidence": confidence,
            "notes": notes,
            "normalization_version": case.get(
                "normalization_version", NORMALIZATION_VERSION
            ),
            "full_text_sha256": hashlib.sha256(
                text.encode("utf-8")
            ).hexdigest(),
            "annotator": args.annotator,
            "annotation_version": "v2.0",
        }
        with output.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
        print(f"已儲存 {case_id} → {output}")

    print(f"結束；輸出 {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
