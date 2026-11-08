from __future__ import annotations

import json
import zipfile
from pathlib import Path
from typing import Any, Dict, List

from judgment.law_download.types import FetchedArchive, SourceSpec, SourceType


def law(
    name: str,
    url: str,
    article_content: str = "條文內容",
    *,
    modified_date: str = "20260101",
    category: str = "金融法規",
) -> Dict[str, Any]:
    return {
        "LawLevel": "法律",
        "LawName": name,
        "LawURL": url,
        "LawCategory": category,
        "LawModifiedDate": modified_date,
        "LawEffectiveDate": "20260101",
        "LawEffectiveNote": "",
        "LawAbandonNote": "",
        "LawHasEngVersion": "N",
        "EngLawName": "",
        "LawAttachements": [],
        "LawHistories": f"{name}沿革",
        "LawForeword": "",
        "LawArticles": [
            {"ArticleType": "C", "ArticleNo": "", "ArticleContent": "第一章 總則"},
            {
                "ArticleType": "A",
                "ArticleNo": "第 1 條",
                "ArticleContent": article_content,
            },
        ],
    }


def payload(
    laws: List[Dict[str, Any]], update_date: str = "2026/10/30 上午 12:00:00"
) -> Dict[str, Any]:
    return {"UpdateDate": update_date, "Laws": laws}


def source(source_type: SourceType = SourceType.LAW) -> SourceSpec:
    if source_type == SourceType.LAW:
        return SourceSpec(
            source_type=source_type,
            url="https://example.test/law",
            json_filename="ChLaw.json",
            label="中文法規",
        )
    return SourceSpec(
        source_type=source_type,
        url="https://example.test/order",
        json_filename="ChOrder.json",
        label="中文命令",
    )


class FakeClient:
    """Returns a freshly built ZIP for each fetch, like the real client."""

    def __init__(self, data: Dict[str, Any], temp_dir: Path) -> None:
        self.data = data
        self.temp_dir = temp_dir
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.calls = 0

    def fetch(self, spec: SourceSpec, progress=None) -> FetchedArchive:
        self.calls += 1
        raw = json.dumps(self.data, ensure_ascii=False).encode("utf-8")
        archive_path = self.temp_dir / f"fake-{spec.source_type.value}-{self.calls}.zip"
        with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
            archive.writestr(spec.json_filename, raw)

        import hashlib

        return FetchedArchive(
            source=spec,
            temp_zip_path=archive_path,
            zip_sha256=hashlib.sha256(archive_path.read_bytes()).hexdigest(),
            raw_json_sha256=hashlib.sha256(raw).hexdigest(),
            payload=self.data,
            update_date=str(self.data.get("UpdateDate") or ""),
            http_status=200,
        )
