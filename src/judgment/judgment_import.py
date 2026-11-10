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

from sqlalchemy import delete, insert

from .config import Settings
from .courts import normalize_court
from .db import build_engine, build_session_factory, init_db
from .judgment_duckdb import candidate_count, iter_candidate_batches
from .judgment_raw_parquet import (
    find_reusable_raw_parquet,
    write_archive_raw_parquet,
)
from .models import JudgmentDocument, JudgmentImportRun
from .observability import record_performance
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


def _flush_batch(session_factory, rows: List[Dict[str, Any]]) -> int:
    if not rows:
        return 0
    jids = [row["jid"] for row in rows]
    with session_factory() as session:
        session.execute(delete(JudgmentDocument).where(JudgmentDocument.jid.in_(jids)))
        session.execute(insert(JudgmentDocument), rows)
        session.commit()
    return len(rows)


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
    archive_totals: Dict[Path, Optional[int]] = {}
    extract_grand_total: Optional[int] = None
    if track_state and not dry_run:
        try:
            state = ProcessingStateStore()
            run_meta = {
                "data_dir": str(source_dir),
                "law_list": str(law_list.path),
                "archive_count": len(archive_paths),
                "limit": limit,
                "replace": replace,
                "raw_only": raw_only,
                "parent_run_id": parent_run_id() or state_parent_run_id,
            }
            for archive in archive_paths:
                archive_totals[archive] = archive_uncompressed_bytes(archive)
            if archive_totals and all(
                value is not None for value in archive_totals.values()
            ):
                extract_grand_total = sum(
                    int(value or 0) for value in archive_totals.values()
                )
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
            for archive in archive_paths:
                try:
                    size_bytes = archive.stat().st_size
                except OSError:
                    size_bytes = 0
                state.add_archive(
                    state_run_id,
                    archive.name,
                    path=str(archive),
                    size_bytes=size_bytes,
                )
            state.start_stage(
                state_run_id,
                "extract",
                total=extract_grand_total,
                message=f"共 {len(archive_paths)} 個壓縮檔；逐檔解壓縮。",
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
                message="將解壓縮後的原始 JSON 寫入 Parquet 備份。",
            )
        for archive_index, archive in enumerate(archive_paths):
            current_archive = archive
            archive_total_bytes = archive_totals.get(archive)
            if archive_total_bytes is None:
                archive_total_bytes = archive_uncompressed_bytes(archive)
            reusable = find_reusable_raw_parquet(raw_data_dir, archive)
            if reusable is not None:
                raw_result = dict(reusable)
                raw_result["bytes_read"] = int(archive_total_bytes or 0)
                raw_result["extract_ms"] = 0
                raw_result["write_ms"] = 0
                if state is not None and state_run_id is not None:
                    state.update_archive(
                        state_run_id,
                        archive.name,
                        status="running",
                        current_stage="raw_parquet",
                        scanned=int(raw_result["rows"]),
                        matched=0,
                        stored=0,
                    )
                    state.update_archive_stage(
                        state_run_id,
                        archive.name,
                        "extract",
                        status="skipped",
                        current=int(raw_result["bytes_read"]),
                        total=archive_total_bytes or raw_result["bytes_read"],
                        message="沿用既有原始 Parquet 備份，略過重新解壓縮。",
                    )
                    state.update_archive_stage(
                        state_run_id,
                        archive.name,
                        "raw_parquet",
                        status="success",
                        current=int(raw_result["rows"]),
                        total=int(raw_result["rows"]),
                        message=f"沿用原始 Parquet 備份（{int(raw_result['rows']):,} 筆）。",
                    )
                logger.info(
                    "reusing raw parquet for %s (%s rows)",
                    archive.name,
                    raw_result["rows"],
                )
            else:
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
                        message="寫入不含篩選、未修改內容的原始 Parquet。",
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
                        total=extract_grand_total,
                        duration_ms=extract_total_ms,
                        message=f"{archive.name}（{archive_index + 1}/{len(archive_paths)}）",
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
                        message=f"已寫入 {written_rows:,} 筆原始 JSON。",
                    )
                    state.update_stage(
                        state_run_id,
                        "raw_parquet",
                        current=raw_total_rows + written_rows,
                        duration_ms=raw_total_ms,
                        message=f"已寫入 {raw_total_rows + written_rows:,} 筆原始 JSON。",
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
                        message=message,
                    )
                    state.update_stage(
                        state_run_id,
                        "raw_parquet",
                        duration_ms=raw_total_ms,
                        message=f"{archive.name}：{message}",
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
                        message=f"原始 Parquet 備份 {int(raw_result['rows']):,} 筆。",
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
            if raw_result.get("reused"):
                raw_reused += 1
            if state is not None and state_run_id is not None:
                state.update_stage(
                    state_run_id,
                    "extract",
                    current=raw_total_bytes,
                    total=extract_grand_total or raw_total_bytes,
                    duration_ms=extract_total_ms,
                    message=f"已完成 {archive_index + 1}/{len(archive_paths)} 個壓縮檔的解壓縮。",
                )
                state.update_stage(
                    state_run_id,
                    "raw_parquet",
                    current=raw_total_rows,
                    duration_ms=raw_total_ms,
                    message=f"已完成 {archive_index + 1}/{len(archive_paths)} 個原始 Parquet 備份。",
                )
        if state is not None and state_run_id is not None:
            state.finish_stage(
                state_run_id,
                "extract",
                current=raw_total_bytes,
                total=extract_grand_total or raw_total_bytes,
                duration_ms=extract_total_ms,
                message=f"完成 {len(archive_paths)} 個壓縮檔的解壓縮。",
            )
            state.finish_stage(
                state_run_id,
                "raw_parquet",
                current=raw_total_rows,
                total=raw_total_rows,
                duration_ms=raw_total_ms,
                message=f"原始 Parquet 備份完成：{raw_total_rows:,} 筆。",
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
                        f"原始 Parquet 備份完成：{raw_total_rows:,} 筆、"
                        f"{len(raw_results)} 個壓縮檔。"
                    ),
                    counts={
                        "raw_parquet_rows": raw_total_rows,
                        "raw_parquet_count": len(raw_results),
                        "archive_count": len(archive_paths),
                    },
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
                    str(item.get("path")) for item in raw_results.values()
                ],
                "scanned_count": 0,
                "matched_count": 0,
                "stored_count": 0,
                "citation_count": 0,
                "duration_ms": duration_ms,
            }
        candidate_totals: Dict[Path, int] = {}
        for archive in archive_paths:
            raw_path = Path(str(raw_results[archive]["path"]))
            candidate_totals[archive] = candidate_count(raw_path)
        candidate_total_all = sum(candidate_totals.values())
        logger.info(
            "duckdb candidates=%s raw_rows=%s",
            candidate_total_all,
            raw_total_rows,
        )
        if state is not None and state_run_id is not None:
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
        current_phase = "filter"
        for archive_index, archive in enumerate(archive_paths):
            current_archive = archive
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
                state.update_archive(
                    state_run_id,
                    archive.name,
                    status="running",
                    current_stage="filter",
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
                    "filter",
                    status="running",
                    current=0,
                    total=archive_candidates,
                    message=f"DuckDB 選出 {archive_candidates:,} 筆候選；Python 組裝 metadata。",
                )
                state.update_archive_stage(
                    state_run_id,
                    archive.name,
                    "postgres",
                    status="running",
                    current=0,
                    total=None,
                    message="等待符合條件的判決。",
                )
                state.set_current_stage(state_run_id, "filter")

            def candidate_rows():
                for batch in iter_candidate_batches(
                    raw_path,
                    batch_size=max(1, int(batch_size)),
                ):
                    yield from batch

            iterator = candidate_rows()
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
                    continue
                matched += 1
                archive_matched += 1
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
                    stored += _flush_batch(session_factory, batch)
                    archive_stored += len(batch)
                    db_elapsed = time.perf_counter() - db_started
                    db_total_s += db_elapsed
                    archive_db_s += db_elapsed
                    batch = []
                    batch_jids = set()
                if scanned % 10000 == 0:
                    logger.info(
                        "scanned=%s matched=%s stored=%s", scanned, matched, stored
                    )
                if state is not None and state_run_id is not None and scanned % 10000 == 0:
                    state.update_stage(
                        state_run_id,
                        "filter",
                        current=scanned,
                        total=candidate_total_all,
                        duration_ms=int(filter_total_s * 1000),
                        message=f"已處理 {scanned:,} 筆 DuckDB 候選，命中 {matched:,} 筆。",
                    )
                    state.update_stage(
                        state_run_id,
                        "postgres",
                        current=stored,
                        duration_ms=int(db_total_s * 1000),
                        message=f"已寫入 {stored:,} 筆。",
                    )
                    state.update_archive_stage(
                        state_run_id,
                        archive.name,
                        "filter",
                        current=archive_scanned,
                        total=archive_candidates,
                        status="running",
                        message=f"已處理 {archive_scanned:,} 筆候選，命中 {archive_matched:,} 筆。",
                    )
                    state.update_archive(
                        state_run_id,
                        archive.name,
                        scanned=archive_scanned,
                        matched=archive_matched,
                        stored=archive_stored,
                    )
            if not dry_run and batch:
                db_started = time.perf_counter()
                flushed = _flush_batch(session_factory, batch)
                stored += flushed
                archive_stored += flushed
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
                        f"DuckDB 候選 {archive_candidates:,} 筆；"
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
                    message=f"寫入 {archive_stored:,} 筆（命中 {archive_matched:,} 筆）。",
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
                    message=f"已處理 {scanned:,} 筆 DuckDB 候選，命中 {matched:,} 筆。",
                )
                state.update_stage(
                    state_run_id,
                    "postgres",
                    current=stored,
                    duration_ms=int(db_total_s * 1000),
                    message=f"已寫入 {stored:,} 筆。",
                )
            if stopped_early:
                break

        if state is not None and state_run_id is not None:
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
                },
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
            state.finish_run(
                state_run_id,
                status="interrupted",
                message="判決匯入已中止；原始 Parquet 備份與已寫入批次會保留，下次可接續。",
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
            else [str(item.get("path")) for item in raw_results.values()]
        ),
        "candidate_count": scanned,
        "scanned_count": raw_total_rows,
        "matched_count": matched,
        "stored_count": stored,
        "failed_count": failed,
        "citation_count": citation_total,
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
