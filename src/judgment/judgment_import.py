from __future__ import annotations

import argparse
import hashlib
import io
import json
import logging
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Callable, Dict, Generator, List, Optional, Sequence, Tuple

from sqlalchemy import delete, func, select

from .config import Settings
from .courts import normalize_court
from .db import build_engine, build_session_factory, init_db
from .judgment_duckdb import candidate_count, iter_candidate_batches
from .judgment_backup import (
    find_previous_raw_parquet,
    prune_raw_parquet,
    write_raw_delta,
)
from .judgment_raw_parquet import (
    find_reusable_raw_parquets,
    write_archive_raw_parquet,
)
from .judgment_versioning import (
    apply_versioned_batch,
    archive_snapshot_info,
    create_snapshot,
    finalize_snapshot,
)
from .models import JudgmentDocument, JudgmentImportRun, JudgmentSnapshot
from .observability import record_performance
from .processing_events import publish_event
from .processing_state import ProcessingStateStore, parent_run_id

logger = logging.getLogger(__name__)

ARTICLE_PATTERN = (
    r"第[0-9〇零一二三四五六七八九十百千萬億]+條"
    r"(?:之[0-9〇零一二三四五六七八九十百千萬億]+)?"
)


@dataclass(frozen=True)
class LawList:
    path: Path
    sha256: str
    names: Tuple[str, ...]
    entries: Tuple[Dict[str, Any], ...]


@dataclass(frozen=True)
class CitationResult:
    citations: Tuple[Dict[str, str], ...]
    matched_laws: Tuple[str, ...]


def _archive_month_label(archive: Path) -> str:
    """Return a readable YYYY-MM label for an archive filename."""

    match = re.match(r"(\d{4})[-_]?(\d{2})", archive.name)
    if match:
        return f"{match.group(1)}-{match.group(2)}"
    return archive.stem or archive.name


def _normalize_for_match(value: str) -> str:
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", value))


def _clean_law_name(value: str) -> Tuple[str, str]:
    text = unicodedata.normalize("NFKC", value).strip()
    text = re.sub(r"^[-*•\d.、)）\s]+", "", text)
    scope = ""
    match = re.search(r"[（(]", text)
    if match:
        scope = text[match.start() :].strip()
        text = text[: match.start()].strip()
    name = re.sub(r"\s+", "", text)
    return name, scope


def load_law_list(path: Path) -> LawList:
    source = Path(path).expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(f"找不到金融法規清單：{source}")
    raw_text = source.read_text(encoding="utf-8")
    entries: List[Dict[str, Any]] = []
    names: List[str] = []
    seen = set()
    for line_number, raw_line in enumerate(raw_text.splitlines(), start=1):
        raw = raw_line.strip()
        if not raw or raw.startswith("#"):
            continue
        name, scope = _clean_law_name(raw)
        if len(name) < 2 or not re.search(r"[\u4e00-\u9fff]", name):
            continue
        if name in seen:
            continue
        seen.add(name)
        names.append(name)
        entries.append(
            {
                "name": name,
                "scope": scope,
                "raw": raw,
                "line": line_number,
            }
        )
    if not names:
        raise ValueError(f"金融法規清單沒有有效項目：{source}")
    return LawList(
        path=source,
        sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
        names=tuple(sorted(names, key=len, reverse=True)),
        entries=tuple(entries),
    )


def build_citation_pattern(law_list: LawList) -> re.Pattern[str]:
    alternatives = "|".join(re.escape(name) for name in law_list.names)
    return re.compile(rf"({alternatives}){ARTICLE_PATTERN}")


@lru_cache(maxsize=8)
def _nfkc_variants(characters: str) -> Dict[str, Tuple[str, ...]]:
    """Map each character to every code point that NFKC-normalizes to it."""

    wanted = set(characters)
    variants: Dict[str, List[str]] = {character: [] for character in wanted}
    for code_point in range(0x110000):
        candidate = chr(code_point)
        normalized = unicodedata.normalize("NFKC", candidate)
        if len(normalized) == 1 and normalized in variants:
            variants[normalized].append(candidate)
    return {key: tuple(values) for key, values in variants.items()}


def build_candidate_regex(law_list: LawList) -> str:
    """Build a broad DuckDB prefilter that still understands NFKC variants.

    Python parses citations after NFKC normalization. A plain law-name regex
    would miss compatibility ideographs (for example U+F9BE -> 料), so each
    character is expanded to all code points with the same NFKC form.
    """

    characters = "".join(law_list.names)
    if not characters:
        return ""
    variants = _nfkc_variants(characters)
    alternatives = []
    for name in law_list.names:
        alternatives.append(
            "".join(
                "(?:"
                + "|".join(
                    re.escape(item) for item in variants.get(character, (character,))
                )
                + ")"
                for character in name
            )
        )
    return "|".join(alternatives)


def extract_citations(full_text: str, pattern: re.Pattern[str]) -> CitationResult:
    normalized = _normalize_for_match(full_text)
    found: Dict[Tuple[str, str], Dict[str, str]] = {}
    for match in pattern.finditer(normalized):
        law_name = match.group(1)
        article_no = match.group(0)[len(law_name) :]
        key = (law_name, article_no)
        if key in found:
            continue
        found[key] = {
            "law_name": law_name,
            "article_no": article_no,
            "text": match.group(0),
        }
    citations = tuple(
        found[key] for key in sorted(found, key=lambda item: (item[0], item[1]))
    )
    matched_laws = tuple(sorted({item["law_name"] for item in citations}))
    return CitationResult(citations=citations, matched_laws=matched_laws)


def _find_bsdtar() -> str:
    executable = shutil.which("bsdtar")
    if not executable:
        raise RuntimeError(
            "找不到 bsdtar；請先安裝 libarchive（macOS 內建 bsdtar）。"
        )
    return executable


def archive_uncompressed_bytes(archive: Path) -> Optional[int]:
    """Return the sum of file sizes in a RAR archive using ``bsdtar -tvf``.

    The listing only reads archive headers, so it is much cheaper than a
    second extraction pass. When the format is unexpected, the caller gets
    ``None`` and the UI must show an indeterminate extraction bar.
    """

    try:
        executable = _find_bsdtar()
        completed = subprocess.run(
            [executable, "-tvf", str(archive)],
            capture_output=True,
            text=True,
            timeout=120,
        )
    except (OSError, subprocess.SubprocessError, RuntimeError):
        return None
    if completed.returncode != 0:
        return None
    total = 0
    matched = False
    for line in completed.stdout.splitlines():
        match = re.match(r"^\S+\s+\d+\s+\S+\s+\S+\s+(\d+)\s+", line)
        if match:
            total += int(match.group(1))
            matched = True
    return total if matched else None


def _iter_archive_json_raw(
    archive: Path,
    progress: Optional[Callable[[int], None]] = None,
) -> Generator[Tuple[Dict[str, Any], str], None, None]:
    """Yield ``(parsed_object, exact_json_text)`` for every JSON object."""

    executable = _find_bsdtar()
    process = subprocess.Popen(
        [executable, "-xOf", str(archive)],
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    assert process.stdout is not None
    stream = io.TextIOWrapper(process.stdout, encoding="utf-8", errors="replace")
    decoder = json.JSONDecoder()
    buffer = ""
    position = 0
    parsed = 0
    bytes_read = 0
    try:
        while True:
            chunk = stream.read(1024 * 1024)
            if chunk:
                bytes_read += len(chunk.encode("utf-8", "ignore"))
                if progress is not None:
                    progress(bytes_read)
                buffer += chunk
            if not chunk and position >= len(buffer):
                break
            while True:
                while position < len(buffer) and buffer[position].isspace():
                    position += 1
                if position >= len(buffer):
                    buffer = ""
                    position = 0
                    break
                entry_start = position
                try:
                    obj, end = decoder.raw_decode(buffer, position)
                except json.JSONDecodeError:
                    if not chunk:
                        logger.warning(
                            "ignoring incomplete JSON at end of %s", archive.name
                        )
                        position = len(buffer)
                        buffer = ""
                        position = 0
                        break
                    break
                raw_json = buffer[entry_start:end]
                position = end
                parsed += 1
                if isinstance(obj, dict):
                    yield obj, raw_json
            if chunk:
                buffer = buffer[position:]
                position = 0
        process.wait(timeout=30)
        if process.returncode not in (0, None) and parsed == 0:
            raise RuntimeError(
                f"無法讀取判決壓縮檔 {archive.name}（bsdtar 結束碼 {process.returncode}）"
            )
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        stream.close()


def iter_archive_json(
    archive: Path,
    progress: Optional[Callable[[int], None]] = None,
) -> Generator[Dict[str, Any], None, None]:
    for obj, _raw_json in _iter_archive_json_raw(archive, progress=progress):
        yield obj


def iter_archive_json_with_raw(
    archive: Path,
    progress: Optional[Callable[[int], None]] = None,
) -> Generator[Tuple[Dict[str, Any], str], None, None]:
    """Yield parsed objects together with their exact original JSON text."""

    yield from _iter_archive_json_raw(archive, progress=progress)


def _first_court_line(full_text: str) -> str:
    for line in full_text.splitlines():
        text = line.strip()
        if not text:
            continue
        if "判決" in text or "裁定" in text or "法院" in text:
            return text
    return ""


def parse_court(full_text: str) -> str:
    line = _first_court_line(full_text)
    for marker in ("判決", "裁定"):
        if marker in line:
            line = line.split(marker, 1)[0]
            break
    line = re.sub(r"\s+", "", line)
    return line[:255]


def _judgment_base_fields(
    obj: Dict[str, Any],
    *,
    archive: Path,
) -> Dict[str, Any]:
    jid = str(obj.get("JID") or "").strip()
    full_text = str(obj.get("JFULL") or "")
    court = parse_court(full_text)
    return {
        "jid": jid[:255],
        "jyear": str(obj.get("JYEAR") or "")[:16],
        "jcase": str(obj.get("JCASE") or "")[:64],
        "jno": str(obj.get("JNO") or "")[:32],
        "jdate": str(obj.get("JDATE") or "")[:16],
        "court": court,
        "court_normalized": normalize_court(court, full_text, jid=jid),
        "title": str(obj.get("JTITLE") or ""),
        "full_text": full_text,
        "pdf_url": str(obj.get("JPDF") or ""),
        "source_archive": archive.name,
        "content_hash": hashlib.sha256(full_text.encode("utf-8")).hexdigest(),
        "full_text_length": len(full_text),
    }


def _raw_base_fields(
    obj: Dict[str, Any],
    *,
    archive: Path,
) -> Dict[str, Any]:
    row = _judgment_base_fields(obj, archive=archive)
    row.pop("full_text", None)
    return row


def _raw_match_fields(
    obj: Dict[str, Any],
    *,
    pattern: re.Pattern[str],
) -> Dict[str, Any]:
    full_text = str(obj.get("JFULL") or "")
    matched_laws: List[str] = []
    citations: List[Dict[str, str]] = []
    if str(obj.get("JID") or "").strip() and full_text.strip():
        result = extract_citations(full_text, pattern)
        matched_laws = list(result.matched_laws)
        citations = [dict(item) for item in result.citations]
    return {
        "matched_laws": matched_laws,
        "matched_laws_text": "\n" + "\n".join(matched_laws) + "\n",
        "citations": json.dumps(citations, ensure_ascii=False),
        "citation_count": len(citations),
    }


def _row_from_duckdb_candidate(
    raw: Dict[str, Any],
    *,
    archive: Path,
    run_id: Optional[int],
) -> Optional[Dict[str, Any]]:
    jid = str(raw.get("jid") or "").strip()
    full_text = str(raw.get("full_text") or "")
    if not jid or not full_text.strip():
        return None
    citations_value = raw.get("citations") or "[]"
    if isinstance(citations_value, str):
        try:
            citations = json.loads(citations_value)
        except ValueError:
            citations = []
    elif isinstance(citations_value, list):
        citations = citations_value
    else:
        citations = []
    if not isinstance(citations, list):
        citations = []
    citations = [dict(item) for item in citations if isinstance(item, dict)]
    matched_laws = [str(item) for item in (raw.get("matched_laws") or [])]
    matched_text = str(raw.get("matched_laws_text") or "")
    if not matched_text:
        matched_text = "\n" + "\n".join(matched_laws) + "\n"
    content_hash = str(raw.get("content_hash") or "")
    if not content_hash:
        content_hash = hashlib.sha256(full_text.encode("utf-8")).hexdigest()
    return {
        "jid": jid[:255],
        "jyear": str(raw.get("jyear") or "")[:16],
        "jcase": str(raw.get("jcase") or "")[:64],
        "jno": str(raw.get("jno") or "")[:32],
        "jdate": str(raw.get("jdate") or "")[:16],
        "court": str(raw.get("court") or ""),
        "court_normalized": str(raw.get("court_normalized") or ""),
        "title": str(raw.get("title") or ""),
        "full_text": full_text,
        "pdf_url": str(raw.get("pdf_url") or ""),
        "source_archive": str(raw.get("source_archive") or archive.name),
        "content_hash": content_hash,
        "matched_laws": matched_laws,
        "matched_laws_text": matched_text,
        "citations": citations,
        "citation_count": int(raw.get("citation_count") or len(citations)),
        "full_text_length": int(raw.get("full_text_length") or len(full_text)),
        "import_run_id": run_id,
    }


def _flush_batch(
    session_factory,
    rows: List[Dict[str, Any]],
    *,
    snapshot_id: int,
    issue_month: str,
) -> Tuple[int, Dict[str, int]]:
    if not rows:
        return 0, {}
    counts = apply_versioned_batch(
        session_factory,
        rows=rows,
        snapshot_id=snapshot_id,
        issue_month=issue_month,
    )
    return len(rows), counts


def import_judgments(
    *,
    settings: Settings,
    data_dir: Optional[Path] = None,
    law_list_path: Optional[Path] = None,
    archives: Optional[Sequence[Path]] = None,
    limit: Optional[int] = None,
    batch_size: int = 500,
    replace: bool = False,
    dry_run: bool = False,
    raw_only: bool = False,
    session_factory=None,
    track_state: bool = False,
    state_parent_run_id: str = "",
) -> Dict[str, Any]:
    source_dir = Path(data_dir or settings.judgment_data_dir).expanduser().resolve()
    source_list = Path(law_list_path or settings.judgment_law_list).expanduser().resolve()
    law_list = load_law_list(source_list)
    pattern = build_citation_pattern(law_list)
    candidate_regex = build_candidate_regex(law_list)

    if archives is None:
        if not source_dir.is_dir():
            raise FileNotFoundError(f"找不到判決資料目錄：{source_dir}")
        archive_paths = []
        for pattern in ("*.rar", "*.7z", "*.zip"):
            archive_paths.extend(sorted(source_dir.glob(pattern)))
        raw_rar_dir = source_dir / "raw_rar"
        if raw_rar_dir.is_dir():
            for pattern in ("*.rar", "*.7z", "*.zip"):
                archive_paths.extend(sorted(raw_rar_dir.glob(pattern)))
    else:
        archive_paths = [Path(item).expanduser().resolve() for item in archives]
    if not archive_paths:
        raise FileNotFoundError(f"在 {source_dir} 找不到 .rar／.7z／.zip 判決檔")
    for archive in archive_paths:
        if not archive.is_file():
            raise FileNotFoundError(f"找不到判決壓縮檔：{archive}")

    if raw_only:
        engine_to_dispose = None
    elif session_factory is None:
        engine = build_engine(settings.database_url)
        if settings.auto_create_schema:
            init_db(engine)
        session_factory = build_session_factory(engine)
        engine_to_dispose = engine
    else:
        engine_to_dispose = None

    started_perf = time.perf_counter()
    run_started_at = datetime.now(timezone.utc)
    run_id: Optional[int] = None
    if not dry_run and not raw_only:
        with session_factory() as session:
            run = JudgmentImportRun(
                status="running",
                data_dir=str(source_dir),
                law_list_path=str(law_list.path),
                law_list_sha256=law_list.sha256,
                law_list_count=len(law_list.names),
                archive_count=len(archive_paths),
                started_at=run_started_at,
            )
            session.add(run)
            session.commit()
            run_id = run.id

    scanned = 0
    matched = 0
    stored = 0
    failed = 0
    citation_total = 0
    filter_total_s = 0.0
    db_total_s = 0.0
    raw_total_rows = 0
    raw_total_bytes = 0
    raw_reused = 0
    version_added = 0
    version_modified = 0
    version_removed = 0
    version_unchanged = 0
    delta_count = 0
    extract_total_ms = 0
    raw_total_ms = 0
    raw_results: Dict[Path, Dict[str, Any]] = {}
    temp_raw_dir = None
    artifact_dir = Path(settings.judgment_data_dir).expanduser().resolve()
    raw_data_dir = artifact_dir
    if dry_run:
        temp_raw_dir = tempfile.TemporaryDirectory(prefix="judgment-raw-")
        raw_data_dir = Path(temp_raw_dir.name)
    batch: List[Dict[str, Any]] = []
    batch_jids = set()
    stopped_early = False
    current_archive: Optional[Path] = None
    current_phase = "raw"

    state: Optional[ProcessingStateStore] = None
    state_run_id: Optional[str] = None
    resume_archives: Dict[Path, Dict[str, Any]] = {}
    resume_candidate_totals: Dict[Path, int] = {}
    if track_state and not dry_run:
        try:
            state = ProcessingStateStore()
            run_meta = {
                "data_dir": str(source_dir),
                "law_list": str(law_list.path),
                "law_list_sha256": law_list.sha256,
                "archive_count": len(archive_paths),
                "limit": limit,
                "replace": replace,
                "raw_only": raw_only,
                "parent_run_id": parent_run_id() or state_parent_run_id,
            }
            state_run_id = state.start_run(
                branch="judgment",
                kind="import",
                title=(
                    "判決原始 Parquet 備份" if raw_only else "判決 RAR 匯入"
                ),
                stages=(
                    ["extract", "raw_parquet"]
                    if raw_only
                    else ["extract", "raw_parquet", "filter", "postgres"]
                ),
                meta=run_meta,
                message=f"準備處理 {len(archive_paths)} 個壓縮檔。",
            )
            publish_event(
                "run_started",
                run_id=state_run_id,
                status="running",
                message=f"準備處理 {len(archive_paths)} 個壓縮檔。",
                extra={"archive_count": len(archive_paths)},
            )
            archive_entries: List[Dict[str, Any]] = []
            for archive in archive_paths:
                try:
                    size_bytes = archive.stat().st_size
                except OSError:
                    size_bytes = 0
                archive_entries.append(
                    {
                        "name": archive.name,
                        "path": str(archive),
                        "size_bytes": size_bytes,
                    }
                )
            state.add_archives(state_run_id, archive_entries)
            state.start_stage(
                state_run_id,
                "extract",
                total=None,
                message="檢查可接續的先前進度…",
            )
            if (
                not raw_only
                and session_factory is not None
                and run_id is not None
            ):
                resume_allowed = False
                with session_factory() as session:
                    previous_run = session.scalars(
                        select(JudgmentImportRun)
                        .where(JudgmentImportRun.id != run_id)
                        .order_by(
                            JudgmentImportRun.started_at.desc(),
                            JudgmentImportRun.id.desc(),
                        )
                        .limit(1)
                    ).first()
                    resume_allowed = bool(
                        previous_run is not None
                        and previous_run.law_list_sha256 == law_list.sha256
                    )
                if resume_allowed:
                    prior_payload = state.read()
                    latest_processed: Dict[str, Dict[str, Any]] = {}
                    for prior_run in prior_payload.get("runs") or []:
                        if not isinstance(prior_run, dict):
                            continue
                        if prior_run.get("id") == state_run_id:
                            continue
                        if prior_run.get("kind") != "import":
                            continue
                        for name, archive_state in (
                            prior_run.get("archives") or {}
                        ).items():
                            if name in latest_processed:
                                continue
                            if not isinstance(archive_state, dict):
                                continue
                            if archive_state.get("status") in {
                                "pending",
                                "idle",
                            }:
                                continue
                            latest_processed[str(name)] = archive_state
                    prior_states: Dict[str, Dict[str, Any]] = {}
                    blocked_resume: set[str] = set()
                    for name, archive_state in latest_processed.items():
                        stages = archive_state.get("stages") or {}
                        if (
                            archive_state.get("status") == "success"
                            and (stages.get("filter") or {}).get("status")
                            == "success"
                            and (stages.get("postgres") or {}).get("status")
                            == "success"
                        ):
                            prior_states[name] = archive_state
                        else:
                            blocked_resume.add(name)
                    snapshot_by_archive: Dict[str, Tuple[str, int]] = {}
                    if session_factory is not None:
                        with session_factory() as session:
                            existing_archives = session.execute(
                                select(
                                    JudgmentDocument.source_archive,
                                    func.count(),
                                )
                                .where(
                                    JudgmentDocument.source_archive != "",
                                    JudgmentDocument.is_current.is_(True),
                                )
                                .group_by(JudgmentDocument.source_archive)
                            ).all()
                            snapshot_rows = session.execute(
                                select(
                                    JudgmentSnapshot.source_archive,
                                    JudgmentSnapshot.raw_parquet_path,
                                    JudgmentSnapshot.raw_row_count,
                                ).where(
                                    JudgmentSnapshot.is_current.is_(True),
                                )
                            ).all()
                        for source_archive, raw_path, raw_rows in snapshot_rows:
                            name = str(source_archive or "")
                            if name:
                                snapshot_by_archive[name] = (
                                    str(raw_path or ""),
                                    int(raw_rows or 0),
                                )
                        for archive_name, count in existing_archives:
                            name = str(archive_name or "")
                            if (
                                not name
                                or name in prior_states
                                or name in blocked_resume
                            ):
                                continue
                            count = int(count or 0)
                            prior_states[name] = {
                                "status": "success",
                                "scanned": count,
                                "matched": count,
                                "stored": count,
                                "stages": {
                                    "extract": {"status": "success"},
                                    "raw_parquet": {"status": "success"},
                                    "filter": {
                                        "status": "success",
                                        "current": count,
                                        "total": count,
                                    },
                                    "postgres": {
                                        "status": "success",
                                        "current": count,
                                        "total": count,
                                    },
                                },
                            }
                    archive_by_name = {a.name: a for a in archive_paths}
                    candidates = [
                        (archive_by_name[name], previous_state)
                        for name, previous_state in prior_states.items()
                        if name in archive_by_name
                    ]
                    for archive, previous_state in candidates:
                        snapshot = snapshot_by_archive.get(archive.name)
                        raw_path = ""
                        raw_rows = int(
                            previous_state.get("scanned") or 0
                        )
                        if snapshot is not None:
                            raw_path, snapshot_rows = snapshot
                            if snapshot_rows:
                                raw_rows = int(snapshot_rows)
                        try:
                            size_bytes = archive.stat().st_size
                        except OSError:
                            size_bytes = 0
                        resume_archives[archive] = {
                            "previous": previous_state,
                            "reusable": {
                                "path": Path(raw_path) if raw_path else "",
                                "rows": raw_rows,
                                "size_bytes": size_bytes,
                                "reused": True,
                                "duration_ms": 0,
                                "write_ms": 0,
                            },
                        }
                    resume_entries: List[Dict[str, Any]] = []
                    for archive, info in resume_archives.items():
                        previous_state = info["previous"]
                        reusable = info["reusable"]
                        previous_stages = previous_state.get("stages") or {}
                        extract_previous = (
                            previous_stages.get("extract") or {}
                        )
                        filter_previous = previous_stages.get("filter") or {}
                        postgres_previous = (
                            previous_stages.get("postgres") or {}
                        )
                        raw_rows = int(
                            reusable.get("rows")
                            or previous_state.get("scanned")
                            or 0
                        )
                        extract_current = int(
                            extract_previous.get("current") or 0
                        )
                        if not extract_current:
                            try:
                                extract_current = archive.stat().st_size
                            except OSError:
                                extract_current = int(
                                    reusable.get("size_bytes") or 0
                                )
                        filter_current = int(
                            filter_previous.get("current") or 0
                        )
                        filter_total = int(
                            filter_previous.get("total") or 0
                        )
                        postgres_current = int(
                            postgres_previous.get("current") or 0
                        )
                        matched_previous = int(
                            previous_state.get("matched") or 0
                        )
                        stored_previous = int(
                            previous_state.get("stored")
                            or postgres_current
                        )
                        resume_entries.append(
                            {
                                "name": archive.name,
                                "raw_rows": raw_rows,
                                "extract_current": extract_current,
                                "filter_current": filter_current,
                                "filter_total": filter_total,
                                "postgres_current": postgres_current,
                                "matched": matched_previous,
                                "stored": stored_previous,
                            }
                        )
                        raw_result = dict(reusable)
                        raw_result["bytes_read"] = extract_current
                        raw_result["extract_ms"] = 0
                        raw_result["write_ms"] = 0
                        raw_results[archive] = raw_result
                        raw_total_rows += raw_rows
                        raw_total_bytes += extract_current
                        raw_reused += 1
                        scanned += filter_current
                        matched += matched_previous
                        stored += postgres_current
                        resume_candidate_totals[archive] = filter_total
                    if resume_entries:
                        state.mark_archives_resumed(
                            state_run_id, resume_entries
                        )
            if resume_archives:
                first_unresumed = next(
                    (
                        archive
                        for archive in archive_paths
                        if archive not in resume_archives
                    ),
                    None,
                )
                state.update_run(
                    state_run_id,
                    meta={"current_archive": "", "current_phase": ""},
                )
                state.update_stage(
                    state_run_id,
                    "extract",
                    current=raw_total_bytes,
                    total=None,
                    message=(
                        f"接續上次進度：{len(resume_archives)} 個壓縮檔已完成"
                        + (
                            f"，從 {first_unresumed.name} 繼續。"
                            if first_unresumed is not None
                            else "。"
                        )
                    ),
                )
            else:
                state.update_stage(
                    state_run_id,
                    "extract",
                    current=raw_total_bytes,
                    total=None,
                    message=(
                        f"共 {len(archive_paths)} 個壓縮檔；"
                        "優先沿用既有原始 Parquet；只有缺少備份時才解壓縮並建立備份。"
                    ),
                )
        except Exception:
            logger.exception("無法建立判決匯入的處理狀態")
            state = None
            state_run_id = None

    try:
        if state is not None and state_run_id is not None:
            state.start_stage(
                state_run_id,
                "raw_parquet",
                message="檢查既有原始 Parquet；可沿用者不重新備份、不重新解壓縮。",
            )
            if resume_archives:
                state.update_stage(
                    state_run_id,
                    "raw_parquet",
                    current=raw_total_rows,
                    message=(
                        f"接續上次進度：{len(resume_archives)} 個"
                        "原始 Parquet 已沿用。"
                    ),
                )
        # One manifest scan for the whole run.  Archives whose backup still
        # matches the downloaded file are marked complete in one state write
        # and skipped by the extraction loop below.
        reuse_candidates = [
            archive
            for archive in archive_paths
            if archive not in resume_archives
        ]
        reused_backups = find_reusable_raw_parquets(
            raw_data_dir, reuse_candidates
        )
        if reused_backups:
            reuse_entries: List[Dict[str, Any]] = []
            for archive, reusable in reused_backups.items():
                raw_result = dict(reusable)
                bytes_read = int(reusable.get("size_bytes") or 0)
                if not bytes_read:
                    try:
                        bytes_read = archive.stat().st_size
                    except OSError:
                        bytes_read = 0
                raw_result["bytes_read"] = bytes_read
                raw_result["extract_ms"] = 0
                raw_result["write_ms"] = 0
                raw_results[archive] = raw_result
                rows = int(reusable.get("rows") or 0)
                raw_total_rows += rows
                raw_total_bytes += bytes_read
                raw_reused += 1
                reuse_entries.append(
                    {
                        "name": archive.name,
                        "raw_rows": rows,
                        "extract_current": bytes_read,
                        "month_label": _archive_month_label(archive),
                    }
                )
            if state is not None and state_run_id is not None:
                state.mark_archives_raw_reused(state_run_id, reuse_entries)
                remaining = len(archive_paths) - len(raw_results)
                state.update_stage(
                    state_run_id,
                    "extract",
                    current=raw_total_bytes,
                    total=None,
                    message=(
                        f"已沿用 {raw_reused} 個原始 Parquet 備份；"
                        f"檢查 {remaining} 個缺少備份的壓縮檔。"
                    ),
                )
                state.update_stage(
                    state_run_id,
                    "raw_parquet",
                    current=raw_total_rows,
                    message=(
                        f"已沿用 {raw_reused} 個原始 Parquet 備份；"
                        f"剩餘 {remaining} 個待檢查。"
                    ),
                )
        for archive_index, archive in enumerate(archive_paths):
            if archive in raw_results:
                continue
            current_archive = archive
            month_label = _archive_month_label(archive)
            if state is not None and state_run_id is not None:
                state.update_stage(
                    state_run_id,
                    "extract",
                    message=(
                        "檢查 RAR 壓縮檔 "
                        f"{archive_index + 1}/{len(archive_paths)}："
                        f"{archive.name}"
                    ),
                )
                state.update_run(
                    state_run_id,
                    message=(
                        "檢查 RAR 壓縮檔 "
                        f"{archive_index + 1}/{len(archive_paths)}："
                        f"{archive.name}"
                    ),
                    meta={
                        "current_archive": archive.name,
                        "current_phase": "extract",
                    },
                )
            archive_total_bytes = archive_uncompressed_bytes(archive)
            archive_bytes_read = 0
            last_raw_state_at = 0.0
            if state is not None and state_run_id is not None:
                state.update_archive(
                    state_run_id,
                    archive.name,
                    status="running",
                    current_stage="extract",
                    scanned=0,
                    matched=0,
                    stored=0,
                    size_bytes=archive.stat().st_size
                    if archive.exists()
                    else None,
                )
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "extract",
                    status="running",
                    current=0,
                    total=archive_total_bytes,
                    message="讀取壓縮檔並解壓縮 JSON。",
                )
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "raw_parquet",
                    status="running",
                    current=0,
                    total=None,
                    message=(
                        f"缺少可用備份：建立 {month_label} 原始 Parquet 備份"
                        f"（{archive.name}）。"
                    ),
                )
                state.set_current_stage(state_run_id, "extract")

            def on_raw_bytes(
                read_bytes: int,
                *,
                archive=archive,
                archive_total_bytes=archive_total_bytes,
            ) -> None:
                nonlocal archive_bytes_read, last_raw_state_at
                archive_bytes_read = max(archive_bytes_read, int(read_bytes))
                if state is None or state_run_id is None:
                    return
                now = time.perf_counter()
                if now - last_raw_state_at < 0.5:
                    return
                last_raw_state_at = now
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "extract",
                    current=archive_bytes_read,
                    total=archive_total_bytes,
                    status="running",
                    message="解壓縮並讀取 JSON。",
                )
                state.update_stage(
                    state_run_id,
                    "extract",
                    current=raw_total_bytes + archive_bytes_read,
                    total=None,
                    duration_ms=extract_total_ms,
                    message=(
                        f"{month_label}（{archive.name}，"
                        f"{archive_index + 1}/{len(archive_paths)}）"
                    ),
                )

            def on_raw_rows(
                written_rows: int,
                *,
                archive=archive,
            ) -> None:
                if state is None or state_run_id is None:
                    return
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "raw_parquet",
                    current=written_rows,
                    total=None,
                    status="running",
                    message=(
                        f"建立 {month_label} 原始 Parquet 備份："
                        f"已寫入 {written_rows:,} 筆。"
                    ),
                )
                state.update_stage(
                    state_run_id,
                    "raw_parquet",
                    current=raw_total_rows + written_rows,
                    duration_ms=raw_total_ms,
                    message=(
                        f"建立 {month_label} 原始 Parquet 備份"
                        f"（{archive.name}）："
                        f"已寫入 {raw_total_rows + written_rows:,} 筆。"
                    ),
                )

            def on_match_progress(
                processed: int,
                total: int,
                *,
                archive=archive,
            ) -> None:
                if state is None or state_run_id is None:
                    return
                message = (
                    f"DuckDB 候選 {processed:,}/{total:,}；"
                    "Python 精析法規引用。"
                )
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "raw_parquet",
                    status="running",
                    message=f"建立 {month_label} 原始 Parquet 備份：{message}",
                )
                state.update_stage(
                    state_run_id,
                    "raw_parquet",
                    duration_ms=raw_total_ms,
                    message=(
                        f"建立 {month_label} 原始 Parquet 備份"
                        f"（{archive.name}）：{message}"
                    ),
                )

            raw_result = write_archive_raw_parquet(
                archive,
                raw_data_dir,
                iter_archive_json_with_raw(archive, progress=on_raw_bytes),
                run_token=str(run_id) if run_id else "",
                row_progress=on_raw_rows,
                entry_transform=lambda obj, archive=archive: _raw_base_fields(
                    obj, archive=archive
                ),
                match_transform=lambda obj: _raw_match_fields(
                    obj, pattern=pattern
                ),
                candidate_regex=candidate_regex,
                match_progress=on_match_progress,
            )
            raw_result["bytes_read"] = archive_bytes_read or int(
                archive_total_bytes or 0
            )
            raw_result["extract_ms"] = max(
                0,
                int(raw_result["duration_ms"]) - int(raw_result["write_ms"]),
            )
            if state is not None and state_run_id is not None:
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "extract",
                    status="success",
                    current=int(raw_result["bytes_read"]),
                    total=archive_total_bytes or raw_result["bytes_read"],
                    duration_ms=int(raw_result["extract_ms"]),
                    message="解壓縮完成；原始內容已寫入 Parquet。",
                )
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "raw_parquet",
                    status="success",
                    current=int(raw_result["rows"]),
                    total=int(raw_result["rows"]),
                    duration_ms=int(raw_result["write_ms"]),
                    message=(
                        f"已建立 {month_label} 原始 Parquet 備份"
                        f"（{int(raw_result['rows']):,} 筆）。"
                    ),
                )
                state.update_archive(
                    state_run_id,
                    archive.name,
                    scanned=int(raw_result["rows"]),
                    matched=0,
                    stored=0,
                )
            raw_results[archive] = raw_result
            raw_total_rows += int(raw_result["rows"])
            raw_total_bytes += int(raw_result["bytes_read"])
            extract_total_ms += int(raw_result["extract_ms"])
            raw_total_ms += int(raw_result["write_ms"])
            if state is not None and state_run_id is not None:
                state.update_archive(
                    state_run_id,
                    archive.name,
                    status="pending",
                    current_stage="",
                )
                processed_count = len(raw_results)
                extracted_so_far = processed_count - raw_reused
                state.update_stage(
                    state_run_id,
                    "extract",
                    current=raw_total_bytes,
                    total=None,
                    duration_ms=extract_total_ms,
                    message=(
                        f"已檢查 {processed_count}/{len(archive_paths)} 個壓縮檔："
                        f"{raw_reused} 個沿用原始 Parquet、"
                        f"{extracted_so_far} 個解壓縮。"
                    ),
                )
                state.update_stage(
                    state_run_id,
                    "raw_parquet",
                    current=raw_total_rows,
                    duration_ms=raw_total_ms,
                    message=(
                        f"已確認 {processed_count}/{len(archive_paths)} 個原始 Parquet："
                        f"{raw_reused} 個沿用、{extracted_so_far} 個新建備份；"
                        f"目前 {month_label}。"
                    ),
                )
        if state is not None and state_run_id is not None:
            state.update_run(
                state_run_id,
                meta={"current_archive": "", "current_phase": ""},
            )
            extracted_total = len(archive_paths) - raw_reused
            state.finish_stage(
                state_run_id,
                "extract",
                current=raw_total_bytes,
                total=raw_total_bytes,
                duration_ms=extract_total_ms,
                message=(
                    f"完成檢查 {len(archive_paths)} 個壓縮檔："
                    f"{raw_reused} 個沿用原始 Parquet、"
                    f"{extracted_total} 個解壓縮並新建備份。"
                ),
            )
            state.finish_stage(
                state_run_id,
                "raw_parquet",
                current=raw_total_rows,
                total=raw_total_rows,
                duration_ms=raw_total_ms,
                message=(
                    f"原始資料檢查完成：{raw_total_rows:,} 筆"
                    f"（{raw_reused} 個沿用、{extracted_total} 個新建備份）。"
                ),
            )
        if raw_only:
            duration_ms = int((time.perf_counter() - started_perf) * 1000)
            if state is not None and state_run_id is not None:
                for archive, result in raw_results.items():
                    state.update_archive(
                        state_run_id,
                        archive.name,
                        status="success",
                        current_stage="",
                        scanned=int(result.get("rows") or 0),
                        matched=0,
                        stored=0,
                        duration_ms=int(result.get("duration_ms") or 0),
                        finished_at=datetime.now(timezone.utc).isoformat(),
                    )
                state.finish_run(
                    state_run_id,
                    status="success",
                    message=(
                        f"原始資料檢查完成：{raw_total_rows:,} 筆、"
                        f"{len(raw_results)} 個壓縮檔"
                        f"（{raw_reused} 個沿用、"
                        f"{len(raw_results) - raw_reused} 個新建備份）。"
                    ),
                    counts={
                        "raw_parquet_rows": raw_total_rows,
                        "raw_parquet_count": len(raw_results),
                        "archive_count": len(archive_paths),
                    },
                )
                publish_event(
                    "run_finished",
                    run_id=state_run_id,
                    status="success",
                    message=(
                        f"原始資料檢查完成：{raw_total_rows:,} 筆、"
                        f"{len(raw_results)} 個壓縮檔。"
                    ),
                    month_overall="complete",
                    extra={"raw_only": True},
                    workflow_id="judgment_import",
                )
            return {
                "status": "raw_only",
                "run_id": None,
                "data_dir": str(source_dir),
                "law_list": str(law_list.path),
                "law_list_sha256": law_list.sha256,
                "law_list_count": len(law_list.names),
                "archive_count": len(archive_paths),
                "raw_parquet_count": len(raw_results),
                "raw_parquet_rows": raw_total_rows,
                "raw_parquet_bytes": sum(
                    int(item.get("size_bytes") or 0)
                    for item in raw_results.values()
                ),
                "raw_parquet_reused": raw_reused,
                "raw_parquet_paths": [
                    str(item.get("path"))
                    for item in raw_results.values()
                    if item.get("path")
                ],
                "scanned_count": 0,
                "matched_count": 0,
                "stored_count": 0,
                "citation_count": 0,
                "duration_ms": duration_ms,
            }
        if state is not None and state_run_id is not None:
            state.start_stage(
                state_run_id,
                "filter",
                total=None,
                message=(
                    f"建立 {len(archive_paths)} 個壓縮檔的版本快照與候選統計。"
                ),
            )
            state.set_current_stage(state_run_id, "filter")
        snapshots: Dict[Path, Dict[str, Any]] = {}
        for snapshot_index, archive in enumerate(archive_paths):
            if archive in resume_archives:
                continue
            if state is not None and state_run_id is not None:
                snapshot_month = _archive_month_label(archive)
                state.update_import_progress(
                    state_run_id,
                    message=(
                        f"建立版本快照 {snapshot_index + 1}/"
                        f"{len(archive_paths)}：{archive.name}"
                    ),
                    stage_updates={
                        "filter": {
                            "message": (
                                f"建立版本快照 {snapshot_index + 1}/"
                                f"{len(archive_paths)}：{snapshot_month}"
                                f"（{archive.name}）。"
                            )
                        }
                    },
                )
            if dry_run:
                snapshots[archive] = {
                    "id": 0,
                    "issue_month": "",
                    "is_current": True,
                    "delta": {},
                    "previous_raw": None,
                }
                continue
            issue_month, update_date = archive_snapshot_info(archive)
            if not issue_month and archive.stem[:6].isdigit():
                issue_month = archive.stem[:6]
            raw_path = Path(str(raw_results[archive]["path"]))
            previous_raw = (
                find_previous_raw_parquet(
                    artifact_dir,
                    issue_month=issue_month,
                    current_path=raw_path,
                )
                if issue_month
                else None
            )
            from_archive = ""
            if previous_raw is not None:
                previous_manifest = previous_raw.parent / "manifest.json"
                try:
                    previous_payload = json.loads(
                        previous_manifest.read_text(encoding="utf-8")
                    )
                    from_archive = str(
                        previous_payload.get("archive_name") or ""
                    )
                except (OSError, ValueError):
                    from_archive = ""
            delta: Dict[str, Any] = {
                "path": "",
                "added": 0,
                "modified": 0,
                "removed": 0,
            }
            if issue_month:
                try:
                    delta = write_raw_delta(
                        data_dir=artifact_dir,
                        issue_month=issue_month,
                        from_archive=from_archive,
                        to_archive=archive.name,
                        old_raw_path=previous_raw,
                        new_raw_path=raw_path,
                    )
                except Exception:
                    logger.exception(
                        "無法建立 %s 的 raw Parquet delta；保留舊 full snapshot",
                        archive.name,
                    )
            if delta.get("path"):
                delta_count += 1
            snapshot_id = 0
            snapshot_current = True
            if issue_month:
                with session_factory() as session:
                    snapshot = create_snapshot(
                        session,
                        issue_month=issue_month,
                        archive=archive,
                        source_update_date=update_date,
                        raw_parquet_path=str(raw_path),
                        delta_parquet_path=str(delta.get("path") or ""),
                        raw_row_count=int(raw_results[archive]["rows"]),
                        matched_count=0,
                    )
                    session.commit()
                    snapshot_id = int(snapshot.id)
                    snapshot_current = bool(snapshot.is_current)
            snapshots[archive] = {
                "id": snapshot_id,
                "issue_month": issue_month,
                "is_current": snapshot_current,
                "delta": delta,
                "previous_raw": previous_raw,
            }
            if not snapshot_current:
                logger.info(
                    "略過較舊的 %s snapshot（issue_month=%s）",
                    archive.name,
                    issue_month,
                )
        candidate_totals: Dict[Path, int] = dict(resume_candidate_totals)
        for candidate_index, archive in enumerate(archive_paths):
            if archive in resume_archives:
                continue
            snapshot_info = snapshots.get(archive) or {}
            if not dry_run and not snapshot_info.get("is_current", True):
                candidate_totals[archive] = 0
                continue
            if state is not None and state_run_id is not None:
                candidate_month = _archive_month_label(archive)
                state.update_import_progress(
                    state_run_id,
                    message=(
                        f"DuckDB 候選統計 {candidate_index + 1}/"
                        f"{len(archive_paths)}：{archive.name}"
                    ),
                    stage_updates={
                        "filter": {
                            "message": (
                                f"DuckDB 候選統計 {candidate_index + 1}/"
                                f"{len(archive_paths)}：{candidate_month}"
                                f"（{archive.name}）。"
                            )
                        }
                    },
                )
            raw_path = Path(str(raw_results[archive]["path"]))
            candidate_totals[archive] = candidate_count(raw_path)
        candidate_total_all = sum(
            candidate_totals[archive]
            for archive in archive_paths
            if archive in resume_archives
            or (snapshots.get(archive) or {}).get("is_current", True)
        )
        logger.info(
            "duckdb candidates=%s raw_rows=%s",
            candidate_total_all,
            raw_total_rows,
        )
        if state is not None and state_run_id is not None:
            state.update_run(
                state_run_id,
                message=f"DuckDB 已選出 {candidate_total_all:,} 筆候選。",
                meta={"current_archive": "", "current_phase": ""},
            )
            state.start_stage(
                state_run_id,
                "filter",
                total=candidate_total_all,
                message=(
                    f"DuckDB 已選出 {candidate_total_all:,} 筆候選；"
                    "Python 只組裝 PostgreSQL metadata。"
                ),
            )
            state.start_stage(
                state_run_id,
                "postgres",
                message="等待符合金融法規條件的判決。",
            )
            if resume_archives:
                state.update_stage(
                    state_run_id,
                    "filter",
                    current=scanned,
                    message=(
                        f"接續上次進度：已處理 {scanned:,}/"
                        f"{candidate_total_all:,} 筆候選。"
                    ),
                )
                state.update_stage(
                    state_run_id,
                    "postgres",
                    current=stored,
                    message=f"接續上次進度：已寫入 {stored:,} 筆。",
                )
        current_phase = "filter"
        for archive_index, archive in enumerate(archive_paths):
            if archive in resume_archives:
                continue
            current_archive = archive
            month_label = _archive_month_label(archive)
            snapshot_info = snapshots.get(archive) or {}
            snapshot_id = int(snapshot_info.get("id") or 0)
            issue_month = str(snapshot_info.get("issue_month") or "")
            if not dry_run and (
                not snapshot_id or not snapshot_info.get("is_current")
            ):
                logger.info(
                    "skip historical snapshot %s (issue_month=%s)",
                    archive.name,
                    issue_month,
                )
                continue
            if state is not None and state_run_id is not None:
                state.update_import_progress(
                    state_run_id,
                    message=(
                        f"目前篩選 {month_label}（{archive.name}，"
                        f"{archive_index + 1}/{len(archive_paths)}）。"
                    ),
                    meta={
                        "current_archive": archive.name,
                        "current_phase": "filter",
                    },
                    stage_updates={
                        "filter": {
                            "message": (
                                f"目前篩選 {month_label}（{archive.name}，"
                                f"{archive_index + 1}/{len(archive_paths)}）。"
                            )
                        }
                    },
                )
            archive_seen_jids: set[str] = set()
            raw_result = raw_results[archive]
            raw_path = Path(str(raw_result["path"]))
            archive_raw_rows = int(raw_result["rows"])
            archive_candidates = candidate_totals[archive]
            logger.info(
                "filtering %s (%s raw rows, %s candidates)",
                archive.name,
                archive_raw_rows,
                archive_candidates,
            )
            archive_scanned = 0
            archive_matched = 0
            archive_stored = 0
            archive_extract_s = int(raw_result.get("extract_ms") or 0) / 1000
            archive_filter_s = 0.0
            archive_db_s = 0.0
            if state is not None and state_run_id is not None:
                state.update_import_progress(
                    state_run_id,
                    archive_name=archive.name,
                    archive_fields={
                        "status": "running",
                        "current_stage": "filter",
                        "scanned": 0,
                        "matched": 0,
                        "stored": 0,
                        "size_bytes": (
                            archive.stat().st_size if archive.exists() else None
                        ),
                    },
                    archive_stage_updates={
                        "filter": {
                            "status": "running",
                            "current": 0,
                            "total": archive_candidates,
                            "message": (
                                f"{month_label}（{archive.name}）：DuckDB 選出 "
                                f"{archive_candidates:,} 筆候選；"
                                "Python 組裝 metadata。"
                            ),
                        },
                        "postgres": {
                            "status": "running",
                            "current": 0,
                            "total": None,
                            "message": (
                                f"{month_label}（{archive.name}）："
                                "等待符合條件的判決。"
                            ),
                        },
                    },
                )
            publish_event(
                "archive_started",
                run_id=state_run_id or "",
                month=month_label,
                archive=archive.name,
                stage="filter",
                status="running",
                message=(
                    f"目前篩選 {month_label}（{archive.name}，"
                    f"{archive_index + 1}/{len(archive_paths)}）："
                    f"DuckDB 選出 {archive_candidates:,} 筆候選。"
                ),
                current=0,
                total=archive_candidates,
                percent=0.0,
                overall_percent=(
                    round(scanned / candidate_total_all * 100, 1)
                    if candidate_total_all
                    else 0.0
                ),
                month_stages={
                    "filter": "processing",
                    "postgres": "processing",
                },
                month_overall="processing",
                extra={
                    "archive_index": archive_index + 1,
                    "archive_count": len(archive_paths),
                },
            )

            def candidate_rows():
                for batch in iter_candidate_batches(
                    raw_path,
                    batch_size=max(1, int(batch_size)),
                ):
                    yield from batch

            iterator = candidate_rows()
            last_filter_state_at = 0.0

            def publish_filter_progress(force: bool = False) -> None:
                nonlocal last_filter_state_at
                if state is None or state_run_id is None:
                    return
                now = time.perf_counter()
                if not force and now - last_filter_state_at < 0.5:
                    return
                last_filter_state_at = now
                state.update_import_progress(
                    state_run_id,
                    message=(
                        f"目前篩選 {month_label}（{archive.name}）："
                        f"已處理 {scanned:,}/{candidate_total_all:,} 筆候選，"
                        f"命中 {matched:,} 筆。"
                    ),
                    meta={
                        "current_archive": archive.name,
                        "current_phase": "filter",
                    },
                    stage_updates={
                        "filter": {
                            "status": "running",
                            "current": scanned,
                            "total": candidate_total_all,
                            "duration_ms": int(filter_total_s * 1000),
                            "message": (
                                f"目前篩選 {month_label}（{archive.name}）："
                                f"已處理 {scanned:,}/"
                                f"{candidate_total_all:,} 筆候選，"
                                f"命中 {matched:,} 筆。"
                            ),
                        },
                        "postgres": {
                            "status": "running",
                            "current": stored,
                            "duration_ms": int(db_total_s * 1000),
                            "message": (
                                f"目前寫入 {month_label}（{archive.name}）："
                                f"已寫入 {stored:,} 筆。"
                            ),
                        },
                    },
                    archive_name=archive.name,
                    archive_fields={
                        "status": "running",
                        "current_stage": "filter",
                        "scanned": archive_scanned,
                        "matched": archive_matched,
                        "stored": archive_stored,
                    },
                    archive_stage_updates={
                        "filter": {
                            "status": "running",
                            "current": archive_scanned,
                            "total": archive_candidates,
                            "message": (
                                f"{month_label}：已處理 {archive_scanned:,}/"
                                f"{archive_candidates:,} 筆候選，"
                                f"命中 {archive_matched:,} 筆。"
                            ),
                        },
                        "postgres": {
                            "status": "running",
                            "current": archive_stored,
                            "message": (
                                f"{month_label}：已寫入 "
                                f"{archive_stored:,} 筆。"
                            ),
                        },
                    },
                )
                filter_percent = (
                    scanned / candidate_total_all * 100
                    if candidate_total_all
                    else 0.0
                )
                postgres_percent = (
                    stored / matched * 100 if matched else 0.0
                )
                publish_event(
                    "stage_progress",
                    run_id=state_run_id,
                    month=month_label,
                    archive=archive.name,
                    stage="filter",
                    status="running",
                    message=(
                        f"目前篩選 {month_label}（{archive.name}）："
                        f"已處理 {scanned:,}/{candidate_total_all:,} 筆候選，"
                        f"命中 {matched:,} 筆。"
                    ),
                    current=scanned,
                    total=candidate_total_all,
                    percent=filter_percent,
                    overall_percent=filter_percent,
                    month_stages={"filter": "processing"},
                    month_overall="processing",
                )
                publish_event(
                    "stage_progress",
                    run_id=state_run_id,
                    month=month_label,
                    archive=archive.name,
                    stage="postgres",
                    status="running",
                    message=(
                        f"目前寫入 {month_label}（{archive.name}）："
                        f"已寫入 {stored:,} 筆。"
                    ),
                    current=stored,
                    total=matched or None,
                    percent=postgres_percent,
                    overall_percent=filter_percent,
                    month_stages={"postgres": "processing"},
                    month_overall="processing",
                )

            while True:
                read_started = time.perf_counter()
                try:
                    raw_row = next(iterator)
                except StopIteration:
                    filter_elapsed = time.perf_counter() - read_started
                    filter_total_s += filter_elapsed
                    archive_filter_s += filter_elapsed
                    break
                filter_elapsed = time.perf_counter() - read_started
                filter_total_s += filter_elapsed
                archive_filter_s += filter_elapsed
                if limit is not None and scanned >= limit:
                    stopped_early = True
                    break
                scanned += 1
                archive_scanned += 1
                filter_started = time.perf_counter()
                row = _row_from_duckdb_candidate(
                    raw_row,
                    archive=archive,
                    run_id=run_id,
                )
                filter_elapsed = time.perf_counter() - filter_started
                filter_total_s += filter_elapsed
                archive_filter_s += filter_elapsed
                if row is None:
                    failed += 1
                    publish_filter_progress()
                    continue
                matched += 1
                archive_matched += 1
                archive_seen_jids.add(str(row["jid"]))
                citation_total += row["citation_count"]
                if dry_run:
                    if scanned % 10000 == 0:
                        logger.info(
                            "scanned=%s matched=%s (dry run)", scanned, matched
                        )
                    continue
                if row["jid"] in batch_jids:
                    batch = [item for item in batch if item["jid"] != row["jid"]]
                batch.append(row)
                batch_jids.add(row["jid"])
                if len(batch) >= batch_size:
                    db_started = time.perf_counter()
                    flushed, version_counts = _flush_batch(
                        session_factory,
                        batch,
                        snapshot_id=snapshot_id,
                        issue_month=issue_month,
                    )
                    stored += flushed
                    archive_stored += flushed
                    version_added += int(version_counts.get("added") or 0)
                    version_modified += int(
                        version_counts.get("modified") or 0
                    )
                    version_removed += int(
                        version_counts.get("removed") or 0
                    )
                    version_unchanged += int(
                        version_counts.get("unchanged") or 0
                    )
                    db_elapsed = time.perf_counter() - db_started
                    db_total_s += db_elapsed
                    archive_db_s += db_elapsed
                    batch = []
                    batch_jids = set()
                    publish_filter_progress()
                if scanned % 10000 == 0:
                    logger.info(
                        "scanned=%s matched=%s stored=%s", scanned, matched, stored
                    )
                publish_filter_progress()
            if not dry_run and batch:
                db_started = time.perf_counter()
                flushed, version_counts = _flush_batch(
                    session_factory,
                    batch,
                    snapshot_id=snapshot_id,
                    issue_month=issue_month,
                )
                stored += flushed
                archive_stored += flushed
                version_added += int(version_counts.get("added") or 0)
                version_modified += int(version_counts.get("modified") or 0)
                version_removed += int(version_counts.get("removed") or 0)
                version_unchanged += int(version_counts.get("unchanged") or 0)
                db_elapsed = time.perf_counter() - db_started
                db_total_s += db_elapsed
                archive_db_s += db_elapsed
                batch = []
                batch_jids = set()

            logger.info(
                "%s: scanned=%s matched=%s",
                archive.name,
                archive_scanned,
                archive_matched,
            )
            if state is not None and state_run_id is not None:
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "filter",
                    status="success",
                    current=archive_scanned,
                    total=archive_candidates,
                    duration_ms=int(archive_filter_s * 1000),
                    message=(
                        f"{month_label}：DuckDB 候選 {archive_candidates:,} 筆；"
                        f"Python 命中 {archive_matched:,} 筆。"
                    ),
                )
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "postgres",
                    status="success",
                    current=archive_stored,
                    total=archive_stored or archive_matched,
                    duration_ms=int(archive_db_s * 1000),
                    message=(
                        f"{month_label}：寫入 {archive_stored:,} 筆"
                        f"（命中 {archive_matched:,} 筆）。"
                    ),
                )
                state.update_archive(
                    state_run_id,
                    archive.name,
                    status="success",
                    current_stage="",
                    scanned=archive_raw_rows,
                    matched=archive_matched,
                    stored=archive_stored,
                    duration_ms=int(
                        (
                            archive_extract_s
                            + archive_filter_s
                            + archive_db_s
                        )
                        * 1000
                    ),
                    finished_at=datetime.now(timezone.utc).isoformat(),
                )
                state.update_stage(
                    state_run_id,
                    "filter",
                    current=scanned,
                    total=candidate_total_all,
                    duration_ms=int(filter_total_s * 1000),
                    message=(
                        f"目前篩選 {month_label}（{archive.name}）："
                        f"已處理 {scanned:,}/{candidate_total_all:,} 筆候選，"
                        f"命中 {matched:,} 筆。"
                    ),
                )
                state.update_stage(
                    state_run_id,
                    "postgres",
                    current=stored,
                    duration_ms=int(db_total_s * 1000),
                    message=(
                        f"目前寫入 {month_label}（{archive.name}）："
                        f"已寫入 {stored:,} 筆。"
                    ),
                )
            publish_event(
                "archive_completed",
                run_id=state_run_id or "",
                month=month_label,
                archive=archive.name,
                stage="postgres",
                status="success",
                message=(
                    f"{month_label} 完成：DuckDB 候選 "
                    f"{archive_candidates:,} 筆，命中 {archive_matched:,} 筆，"
                    f"寫入 {archive_stored:,} 筆。"
                ),
                current=archive_scanned,
                total=archive_candidates,
                percent=100.0,
                overall_percent=(
                    round(scanned / candidate_total_all * 100, 1)
                    if candidate_total_all
                    else 0.0
                ),
                month_stages={
                    "filter": "complete",
                    "postgres": "complete",
                },
                month_overall="complete",
                extra={
                    "archive_index": archive_index + 1,
                    "archive_count": len(archive_paths),
                },
            )
            if not dry_run and snapshot_id:
                try:
                    version_removed += finalize_snapshot(
                        session_factory,
                        snapshot_id=snapshot_id,
                        issue_month=issue_month,
                        seen_jids=archive_seen_jids,
                        allow_removals=(
                            limit is None and not stopped_early
                        ),
                    )
                    delta_path = str(
                        (snapshot_info.get("delta") or {}).get("path") or ""
                    )
                    previous_raw = snapshot_info.get("previous_raw")
                    if (
                        delta_path
                        and previous_raw
                        and not settings.judgment_raw_parquet_keep_versions
                        and not stopped_early
                    ):
                        prune_raw_parquet(previous_raw)
                except Exception:
                    logger.exception(
                        "無法完成 %s 的版本收尾；保留舊 raw snapshot",
                        archive.name,
                    )
            if stopped_early:
                break

        if state is not None and state_run_id is not None:
            state.update_run(
                state_run_id,
                meta={"current_archive": "", "current_phase": ""},
            )
            filter_total = scanned if stopped_early else candidate_total_all
            state.finish_stage(
                state_run_id,
                "filter",
                current=scanned,
                total=filter_total or scanned,
                message=f"DuckDB 候選 {scanned:,} 筆，Python 命中 {matched:,} 筆。",
            )
            state.finish_stage(
                state_run_id,
                "postgres",
                current=stored,
                total=stored or matched,
                message=f"寫入 {stored:,} 筆判決 metadata。",
            )
            state.finish_run(
                state_run_id,
                status="success",
                message=(
                    f"完成 {len(archive_paths)} 個壓縮檔：原始 Parquet {raw_total_rows:,} 筆、"
                    f"DuckDB 候選 {scanned:,} 筆、Python 命中 {matched:,} 筆、"
                    f"寫入 {stored:,} 筆。"
                ),
                counts={
                    "raw_parquet_rows": raw_total_rows,
                    "raw_parquet_count": len(raw_results),
                    "candidate_count": scanned,
                    "scanned_count": raw_total_rows,
                    "matched_count": matched,
                    "stored_count": stored,
                    "failed_count": failed,
                    "archive_count": len(archive_paths),
                    "version_added": version_added,
                    "version_modified": version_modified,
                    "version_removed": version_removed,
                    "version_unchanged": version_unchanged,
                    "delta_count": delta_count,
                },
            )
            publish_event(
                "run_finished",
                run_id=state_run_id,
                status="success",
                message=(
                    f"完成 {len(archive_paths)} 個壓縮檔："
                    f"原始 Parquet {raw_total_rows:,} 筆、"
                    f"DuckDB 候選 {scanned:,} 筆、"
                    f"Python 命中 {matched:,} 筆、寫入 {stored:,} 筆。"
                ),
                current=scanned,
                total=scanned,
                percent=100.0,
                month_overall="complete",
            )

        if not dry_run and run_id is not None:
            with session_factory() as session:
                run = session.get(JudgmentImportRun, run_id)
                if run is None:
                    raise RuntimeError("判決匯入紀錄遺失")
                if replace:
                    session.execute(
                        delete(JudgmentDocument).where(
                            JudgmentDocument.import_run_id != run_id
                        )
                    )
                duration_ms = int((time.perf_counter() - started_perf) * 1000)
                run.status = "success"
                run.scanned_count = raw_total_rows
                run.matched_count = matched
                run.stored_count = stored
                run.failed_count = failed
                run.citation_count = citation_total
                run.duration_ms = duration_ms
                run.finished_at = datetime.now(timezone.utc)
                session.commit()
                record_performance(
                    session_factory,
                    process="判決匯入",
                    module="judgment.judgment_import.import_judgments",
                    status="success",
                    started_at=run_started_at,
                    finished_at=run.finished_at,
                    duration_ms=duration_ms,
                    params={
                        "data_dir": str(source_dir),
                        "law_list": str(law_list.path),
                        "archives": len(archive_paths),
                        "limit": limit,
                        "replace": replace,
                    },
                    details={
                        "run_id": run_id,
                        "raw_parquet_rows": raw_total_rows,
                        "raw_parquet_count": len(raw_results),
                        "candidate_count": scanned,
                        "scanned_count": raw_total_rows,
                        "matched_count": matched,
                        "stored_count": stored,
                        "failed_count": failed,
                        "citation_count": citation_total,
                        "version_added": version_added,
                        "version_modified": version_modified,
                        "version_removed": version_removed,
                        "version_unchanged": version_unchanged,
                        "delta_count": delta_count,
                    },
                )
    except KeyboardInterrupt:
        if state is not None and state_run_id is not None:
            if current_archive is not None:
                state.update_archive(
                    state_run_id,
                    current_archive.name,
                    status="interrupted",
                    error="使用者中止",
                )
                for key in (
                    ("extract", "raw_parquet")
                    if current_phase == "raw"
                    else ("filter", "postgres")
                ):
                    state.update_archive_stage(
                        state_run_id,
                        current_archive.name,
                        key,
                        status="interrupted",
                        message="使用者中止；已完成的原始備份與批次會保留。",
                    )
            state.update_run(
                state_run_id,
                meta={"current_archive": "", "current_phase": ""},
            )
            state.finish_run(
                state_run_id,
                status="interrupted",
                message="判決匯入已中止；原始 Parquet 與已寫入批次會保留，下次可接續。",
                counts={
                    "raw_parquet_rows": raw_total_rows,
                    "raw_parquet_count": len(raw_results),
                    "candidate_count": scanned,
                    "scanned_count": raw_total_rows,
                    "matched_count": matched,
                    "stored_count": stored,
                    "failed_count": failed,
                    "archive_count": len(archive_paths),
                },
            )
            publish_event(
                "run_finished",
                run_id=state_run_id,
                status="interrupted",
                message="判決匯入已中止；已完成進度與原始備份會保留。",
            )
        if not dry_run and run_id is not None:
            with session_factory() as session:
                run = session.get(JudgmentImportRun, run_id)
                if run is not None:
                    run.status = "failed"
                    run.scanned_count = raw_total_rows
                    run.matched_count = matched
                    run.stored_count = stored
                    run.failed_count = failed
                    run.citation_count = citation_total
                    run.duration_ms = int((time.perf_counter() - started_perf) * 1000)
                    run.finished_at = datetime.now(timezone.utc)
                    run.error_message = "KeyboardInterrupt"
                    session.commit()
        raise
    except Exception as exc:
        if state is not None and state_run_id is not None:
            if current_archive is not None:
                state.update_archive(
                    state_run_id,
                    current_archive.name,
                    status="failed",
                    error=f"{exc.__class__.__name__}: {exc}",
                )
                for key in (
                    ("extract", "raw_parquet")
                    if current_phase == "raw"
                    else ("filter", "postgres")
                ):
                    state.update_archive_stage(
                        state_run_id,
                        current_archive.name,
                        key,
                        status="failed",
                        message=f"{exc.__class__.__name__}: {exc}",
                    )
            state.update_run(
                state_run_id,
                meta={"current_archive": "", "current_phase": ""},
            )
            state.finish_run(
                state_run_id,
                status="failed",
                message=f"{exc.__class__.__name__}: {exc}",
                counts={
                    "raw_parquet_rows": raw_total_rows,
                    "raw_parquet_count": len(raw_results),
                    "candidate_count": scanned,
                    "scanned_count": raw_total_rows,
                    "matched_count": matched,
                    "stored_count": stored,
                    "failed_count": failed,
                    "archive_count": len(archive_paths),
                },
            )
            publish_event(
                "run_finished",
                run_id=state_run_id,
                status="failed",
                message=f"{exc.__class__.__name__}: {exc}",
            )
        if not dry_run and run_id is not None:
            with session_factory() as session:
                run = session.get(JudgmentImportRun, run_id)
                if run is not None:
                    run.status = "failed"
                    run.scanned_count = raw_total_rows
                    run.matched_count = matched
                    run.stored_count = stored
                    run.failed_count = failed
                    run.citation_count = citation_total
                    run.duration_ms = int((time.perf_counter() - started_perf) * 1000)
                    run.finished_at = datetime.now(timezone.utc)
                    run.error_message = f"{exc.__class__.__name__}: {exc}"
                    session.commit()
                    record_performance(
                        session_factory,
                        process="判決匯入",
                        module="judgment.judgment_import.import_judgments",
                        status="failed",
                        started_at=run_started_at,
                        finished_at=run.finished_at,
                        duration_ms=run.duration_ms,
                        params={
                            "data_dir": str(source_dir),
                            "law_list": str(law_list.path),
                            "archives": len(archive_paths),
                            "limit": limit,
                            "replace": replace,
                        },
                        details={
                            "run_id": run_id,
                            "scanned_count": scanned,
                            "matched_count": matched,
                            "stored_count": stored,
                            "failed_count": failed,
                        },
                        error_message=run.error_message,
                    )
        raise
    finally:
        if temp_raw_dir is not None:
            temp_raw_dir.cleanup()
        if engine_to_dispose is not None:
            engine_to_dispose.dispose()

    duration_ms = int((time.perf_counter() - started_perf) * 1000)
    if dry_run:
        record_performance(
            session_factory,
            process="判決匯入（試跑）",
            module="judgment.judgment_import.import_judgments",
            status="success",
            started_at=run_started_at,
            finished_at=datetime.now(timezone.utc),
            duration_ms=duration_ms,
            params={
                "data_dir": str(source_dir),
                "law_list": str(law_list.path),
                "archives": len(archive_paths),
                "limit": limit,
            },
            details={
                "candidate_count": scanned,
                "scanned_count": raw_total_rows,
                "matched_count": matched,
                "stored_count": stored,
                "failed_count": failed,
                "citation_count": citation_total,
                "raw_parquet_rows": raw_total_rows,
                "raw_parquet_count": len(raw_results),
            },
        )
    return {
        "status": "dry_run" if dry_run else "success",
        "run_id": run_id,
        "data_dir": str(source_dir),
        "law_list": str(law_list.path),
        "law_list_sha256": law_list.sha256,
        "law_list_count": len(law_list.names),
        "archive_count": len(archive_paths),
        "raw_parquet_count": len(raw_results),
        "raw_parquet_rows": raw_total_rows,
        "raw_parquet_bytes": sum(
            int(item.get("size_bytes") or 0) for item in raw_results.values()
        ),
        "raw_parquet_reused": raw_reused,
        "raw_parquet_paths": (
            []
            if dry_run
            else [
                str(item.get("path"))
                for item in raw_results.values()
                if item.get("path")
            ]
        ),
        "candidate_count": scanned,
        "scanned_count": raw_total_rows,
        "matched_count": matched,
        "stored_count": stored,
        "failed_count": failed,
        "citation_count": citation_total,
        "version_added": version_added,
        "version_modified": version_modified,
        "version_removed": version_removed,
        "version_unchanged": version_unchanged,
        "delta_count": delta_count,
        "duration_ms": duration_ms,
        "replace": replace,
        "limited": stopped_early,
    }


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stderr,
    )


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="將 /data/judgments 中引用金融法規清單的判決匯入 PostgreSQL。"
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=None,
        help="判決 .rar／.7z／.zip 所在目錄（預設 JUDGMENT_DATA_DIR 或 /data/judgments；也會讀取 raw_rar/）",
    )
    parser.add_argument(
        "--law-list",
        type=Path,
        default=None,
        help="金融法規清單（預設 documents/金融法規.md）",
    )
    parser.add_argument(
        "--archive",
        type=Path,
        action="append",
        default=None,
        help="只匯入指定 .rar；可重複指定",
    )
    parser.add_argument("--limit", type=int, default=None, help="最多掃描筆數（測試用）")
    parser.add_argument(
        "--batch-size", type=int, default=500, help="每批寫入筆數（預設 500）"
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="成功後刪除本次未命中的舊判決資料，讓資料庫與目前清單一致",
    )
    parser.add_argument("--dry-run", action="store_true", help="只掃描與統計，不寫入資料庫")
    parser.add_argument(
        "--raw-only",
        action="store_true",
        help="只建立原始 Parquet 備份，不進行金融法規篩選或寫入 PostgreSQL",
    )
    parser.add_argument(
        "--database-url",
        default=None,
        help="SQLAlchemy database URL（預設 DATABASE_URL）",
    )
    parser.add_argument("--log-level", default=None, help="DEBUG, INFO, WARNING, ERROR")
    parser.add_argument(
        "--skip-init-db", action="store_true", help="不要自動建立缺少的資料表"
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    if args.raw_only and args.dry_run:
        logger.error("--raw-only 與 --dry-run 不能同時使用")
        return 2
    settings = Settings.from_env().with_overrides(
        database_url=args.database_url,
        judgment_data_dir=args.data_dir,
        judgment_law_list=args.law_list,
        log_level=args.log_level,
    )
    configure_logging(settings.log_level)

    engine = None
    session_factory = None
    if not args.raw_only:
        engine = build_engine(settings.database_url)
        if settings.auto_create_schema and not args.skip_init_db:
            init_db(engine)
        session_factory = build_session_factory(engine)
    try:
        summary = import_judgments(
            settings=settings,
            data_dir=settings.judgment_data_dir,
            law_list_path=settings.judgment_law_list,
            archives=args.archive,
            limit=args.limit,
            batch_size=args.batch_size,
            replace=args.replace,
            dry_run=args.dry_run,
            raw_only=args.raw_only,
            session_factory=session_factory,
            track_state=not args.dry_run,
        )
    finally:
        if engine is not None:
            engine.dispose()
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
