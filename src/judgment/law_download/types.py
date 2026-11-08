from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional


class SourceType(str, Enum):
    LAW = "law"
    ORDER = "order"


@dataclass(frozen=True)
class SourceSpec:
    source_type: SourceType
    url: str
    json_filename: str
    label: str


@dataclass
class FetchedArchive:
    """A downloaded and validated ZIP archive plus its parsed JSON payload."""

    source: SourceSpec
    temp_zip_path: Path
    zip_sha256: str
    raw_json_sha256: str
    payload: Dict[str, Any]
    update_date: str
    http_status: int


@dataclass
class LawRecord:
    law_key: str
    law_name: str
    law_level: str
    law_category: str
    law_url: str
    law_modified_date: str
    law_effective_date: str
    law_effective_note: str
    law_abandon_note: str
    law_has_eng_version: bool
    eng_law_name: str
    law_attachments_json: str
    law_histories: str
    law_foreword: str
    law_articles: List[Dict[str, str]]
    article_count: int
    content_hash: str
    raw_json: str


@dataclass
class ParsedDataset:
    source: SourceSpec
    update_date: str
    laws: List[LawRecord]
    law_count: int
    article_count: int
    semantic_sha256: str
    warnings: List[str] = field(default_factory=list)


@dataclass
class ApplyResult:
    status: str
    version_id: Optional[int]
    law_count: int
    article_count: int
    added: int = 0
    modified: int = 0
    removed: int = 0
    unchanged: int = 0


@dataclass
class RunResult:
    source_type: str
    status: str
    message: str
    version_id: Optional[int] = None
    law_count: int = 0
    article_count: int = 0
    added: int = 0
    modified: int = 0
    removed: int = 0
    unchanged: int = 0
    parquet_path: Optional[str] = None
    duration_ms: int = 0
