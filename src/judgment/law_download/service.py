from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import List, Optional

from ..models import LawDatasetVersion
from ..processing_state import ProcessingStateStore, parent_run_id
from .client import LawApiClient
from .parser import parse_dataset
from .repository import LawRepository
from .storage import LawStorage
from .types import (
    FetchedArchive,
    ParsedDataset,
    RunResult,
    SourceSpec,
)

logger = logging.getLogger(__name__)


class LawDownloadService:
    def __init__(
        self,
        *,
        client: LawApiClient,
        storage: LawStorage,
        repository: LawRepository,
        track_state: bool = False,
    ) -> None:
        self.client = client
        self.storage = storage
        self.repository = repository
        self.track_state = track_state

    def run(self, source: SourceSpec) -> RunResult:
        started = time.perf_counter()
        run_id = self.repository.start_run(source)
        temp_zip: Optional[Path] = None
        fetched: Optional[FetchedArchive] = None
        parsed: Optional[ParsedDataset] = None
        created_paths: List[Path] = []
        applied = False
        state: Optional[ProcessingStateStore] = None
        state_run_id: Optional[str] = None
        current_stage = ""

        if self.track_state:
            try:
                state = ProcessingStateStore()
                state_run_id = state.start_run(
                    branch=source.source_type.value,
                    kind="download",
                    title=f"{source.label}資料下載",
                    stages=["download", "raw_parquet", "parse", "postgres"],
                    meta={
                        "url": source.url,
                        "source_type": source.source_type.value,
                        "parent_run_id": parent_run_id(),
                    },
                    message=f"檢查 {source.label} 線上資料。",
                )
            except Exception:
                logger.warning("無法建立%s下載的處理狀態", source.label, exc_info=True)
                state = None
                state_run_id = None

        def start_stage(
            key: str,
            *,
            total: Optional[int] = None,
            message: str = "",
        ) -> None:
            nonlocal current_stage
            current_stage = key
            if state is not None and state_run_id is not None:
                state.start_stage(state_run_id, key, total=total, message=message)

        def update_stage(key: str, **fields) -> None:
            if state is not None and state_run_id is not None:
                state.update_stage(state_run_id, key, **fields)

        def finish_stage(
            key: str,
            *,
            status: str = "success",
            current: Optional[int] = None,
            total: Optional[int] = None,
            message: str = "",
        ) -> None:
            nonlocal current_stage
            if state is not None and state_run_id is not None:
                state.finish_stage(
                    state_run_id,
                    key,
                    status=status,
                    current=current,
                    total=total,
                    message=message,
                )
            if current_stage == key:
                current_stage = ""

        def skip_remaining(*keys: str, message: str) -> None:
            for key in keys:
                finish_stage(key, status="skipped", message=message)

        def finish_run(status: str, message: str, counts: Optional[dict] = None) -> None:
            if state is not None and state_run_id is not None:
                state.finish_run(
                    state_run_id,
                    status=status,
                    message=message,
                    counts=counts,
                )

        try:
            start_stage(
                "download",
                message=f"下載 {source.url}（{source.label}）。",
            )
            last_progress_at = 0.0

            def on_download(downloaded: int, total: Optional[int]) -> None:
                nonlocal last_progress_at
                now = time.perf_counter()
                if downloaded and now - last_progress_at < 0.5:
                    return
                last_progress_at = now
                size_text = f"{downloaded / (1024 * 1024):.1f} MB"
                if total:
                    message = f"已下載 {size_text} / {total / (1024 * 1024):.1f} MB。"
                else:
                    message = f"已下載 {size_text}。"
                update_stage(
                    "download",
                    current=downloaded,
                    total=total,
                    status="running",
                    message=message,
                )

            fetched = self.client.fetch(source, progress=on_download)
            temp_zip = fetched.temp_zip_path
            try:
                zip_size = temp_zip.stat().st_size
            except OSError:
                zip_size = 0
            finish_stage(
                "download",
                current=zip_size,
                total=zip_size or None,
                message=f"已下載並驗證 {source.label} ZIP。",
            )
            start_stage(
                "raw_parquet",
                message=f"將 {source.label} 原始 JSON 寫入未經正規化的 Parquet 備份。",
            )
            self.storage.ensure_layout()
            raw_path, raw_rows, _raw_created = self.storage.write_raw_parquet(fetched)
            finish_stage(
                "raw_parquet",
                current=raw_rows,
                total=raw_rows,
                message=f"原始 Parquet 備份 {raw_rows:,} 筆（{raw_path.name}）。",
            )
            latest = self.repository.get_latest_version(source.source_type.value)

            if latest is not None and latest.raw_json_sha256 == fetched.raw_json_sha256:
                duration_ms = _elapsed_ms(started)
                skip_remaining(
                    "parse",
                    "postgres",
                    message="raw JSON 與目前版本相同，略過後續階段。",
                )
                finish_run(
                    "no_change",
                    f"{source.label}線上內容未變更（raw JSON 相同）。",
                    counts={
                        "law_count": int(latest.law_count),
                        "article_count": int(latest.article_count),
                    },
                )
                self._safe_finish_run(
                    run_id,
                    status="no_change",
                    duration_ms=duration_ms,
                    fetched=fetched,
                    version_id=int(latest.id),
                    parquet_path=latest.parquet_path,
                    law_count=int(latest.law_count),
                    article_count=int(latest.article_count),
                    content_sha256=latest.content_sha256,
                )
                return RunResult(
                    source_type=source.source_type.value,
                    status="no_change",
                    message="raw JSON is unchanged from the current version",
                    version_id=int(latest.id),
                    law_count=int(latest.law_count),
                    article_count=int(latest.article_count),
                    parquet_path=latest.parquet_path,
                    duration_ms=duration_ms,
                )

            start_stage(
                "parse",
                message=f"解析 {source.label} JSON 並建立正規化記錄。",
            )
            parsed = parse_dataset(fetched.payload, source)
            for warning in parsed.warnings:
                logger.warning("%s: %s", source.label, warning)
            finish_stage(
                "parse",
                current=parsed.law_count,
                total=parsed.law_count,
                message=(
                    f"解析 {parsed.law_count:,} 筆、{parsed.article_count:,} 條條文。"
                ),
            )

            if latest is not None and latest.content_sha256 == parsed.semantic_sha256:
                duration_ms = _elapsed_ms(started)
                skip_remaining(
                    "postgres",
                    message="語意內容與目前版本相同，略過後續階段。",
                )
                finish_run(
                    "no_change",
                    f"{source.label}語意內容未變更。",
                    counts={
                        "law_count": int(latest.law_count),
                        "article_count": int(latest.article_count),
                    },
                )
                self._safe_finish_run(
                    run_id,
                    status="no_change",
                    duration_ms=duration_ms,
                    fetched=fetched,
                    parsed=parsed,
                    version_id=int(latest.id),
                    parquet_path=latest.parquet_path,
                    law_count=int(latest.law_count),
                    article_count=int(latest.article_count),
                    content_sha256=latest.content_sha256,
                )
                return RunResult(
                    source_type=source.source_type.value,
                    status="no_change",
                    message="semantic content is unchanged from the current version",
                    version_id=int(latest.id),
                    law_count=int(latest.law_count),
                    article_count=int(latest.article_count),
                    parquet_path=latest.parquet_path,
                    duration_ms=duration_ms,
                )

            self.storage.ensure_layout()
            zip_path, zip_created = self.storage.save_zip(fetched)
            if zip_created:
                created_paths.append(zip_path)

            manifest_path, manifest_created = self.storage.write_manifest(
                parsed, fetched, zip_path, raw_path
            )
            if manifest_created:
                created_paths.append(manifest_path)
            parquet_path = raw_path

            start_stage(
                "postgres",
                total=parsed.law_count,
                message=f"寫入 {source.label} PostgreSQL 版本與條文。",
            )
            apply_result = self.repository.apply_dataset(
                source=source,
                parsed=parsed,
                fetched=fetched,
                zip_path=str(zip_path),
                parquet_path=str(parquet_path),
            )
            applied = True
            duration_ms = _elapsed_ms(started)

            if apply_result.status == "no_change":
                finish_stage(
                    "postgres",
                    status="no_change",
                    current=apply_result.law_count,
                    total=apply_result.law_count,
                    message="另一個執行已寫入相同版本。",
                )
                self._cleanup_unreferenced(
                    created_paths, self.repository.get_latest_version(source.source_type.value)
                )
                finish_run(
                    "no_change",
                    f"{source.label}版本已由其他執行寫入。",
                    counts={
                        "law_count": int(apply_result.law_count),
                        "article_count": int(apply_result.article_count),
                    },
                )
                self._safe_finish_run(
                    run_id,
                    status="no_change",
                    duration_ms=duration_ms,
                    fetched=fetched,
                    parsed=parsed,
                    version_id=apply_result.version_id,
                    law_count=apply_result.law_count,
                    article_count=apply_result.article_count,
                    content_sha256=parsed.semantic_sha256,
                )
                return RunResult(
                    source_type=source.source_type.value,
                    status="no_change",
                    message="another run already applied this version",
                    version_id=apply_result.version_id,
                    law_count=apply_result.law_count,
                    article_count=apply_result.article_count,
                    duration_ms=duration_ms,
                )

            finish_stage(
                "postgres",
                current=apply_result.law_count,
                total=apply_result.law_count,
                message=(
                    f"版本 #{apply_result.version_id}：新增 {apply_result.added:,}、"
                    f"修改 {apply_result.modified:,}、移除 {apply_result.removed:,}。"
                ),
            )
            finish_run(
                "success",
                (
                    f"{source.label}已更新為版本 #{apply_result.version_id}："
                    f"+{apply_result.added} ~{apply_result.modified} "
                    f"-{apply_result.removed} ={apply_result.unchanged}。"
                ),
                counts={
                    "law_count": int(apply_result.law_count),
                    "article_count": int(apply_result.article_count),
                    "added": int(apply_result.added),
                    "modified": int(apply_result.modified),
                    "removed": int(apply_result.removed),
                },
            )
            self._safe_finish_run(
                run_id,
                status="success",
                duration_ms=duration_ms,
                fetched=fetched,
                parsed=parsed,
                version_id=apply_result.version_id,
                parquet_path=str(parquet_path),
                law_count=apply_result.law_count,
                article_count=apply_result.article_count,
                content_sha256=parsed.semantic_sha256,
            )
            return RunResult(
                source_type=source.source_type.value,
                status="success",
                message=(
                    f"new version {apply_result.version_id}: "
                    f"+{apply_result.added} ~{apply_result.modified} "
                    f"-{apply_result.removed} ={apply_result.unchanged}"
                ),
                version_id=apply_result.version_id,
                law_count=apply_result.law_count,
                article_count=apply_result.article_count,
                added=apply_result.added,
                modified=apply_result.modified,
                removed=apply_result.removed,
                unchanged=apply_result.unchanged,
                parquet_path=str(parquet_path),
                duration_ms=duration_ms,
            )

        except KeyboardInterrupt:
            if current_stage and state is not None and state_run_id is not None:
                finish_stage(
                    current_stage,
                    status="interrupted",
                    message="使用者中止；已完成的產物會保留。",
                )
            finish_run(
                "interrupted",
                f"{source.label}下載已中止。",
            )
            raise
        except Exception as exc:
            duration_ms = _elapsed_ms(started)
            if current_stage and state is not None and state_run_id is not None:
                finish_stage(
                    current_stage,
                    status="failed",
                    message=f"{exc.__class__.__name__}: {exc}",
                )
            finish_run(
                "failed",
                f"{source.label}下載失敗：{exc.__class__.__name__}: {exc}",
            )
            if not applied:
                for path in reversed(created_paths):
                    try:
                        self.storage.remove_file_and_empty_dirs(path)
                    except OSError:
                        logger.exception("failed to clean up %s", path)
            self._safe_finish_run(
                run_id,
                status="failed",
                duration_ms=duration_ms,
                fetched=fetched,
                parsed=parsed,
                error_message=str(exc),
            )
            raise

        finally:
            if temp_zip is not None and temp_zip.exists():
                try:
                    temp_zip.unlink()
                except OSError:
                    logger.exception("failed to remove temporary archive %s", temp_zip)

    def _safe_finish_run(self, run_id: int, **kwargs) -> None:
        try:
            self.repository.finish_run(run_id, **kwargs)
        except Exception:
            logger.exception("failed to update download run %s", run_id)

    def _cleanup_unreferenced(
        self, created_paths: List[Path], latest: Optional[LawDatasetVersion]
    ) -> None:
        referenced = set()
        if latest is not None:
            referenced.add(str(latest.zip_path))
            referenced.add(str(latest.parquet_path))
        for path in reversed(created_paths):
            if str(path) in referenced:
                continue
            try:
                self.storage.remove_file_and_empty_dirs(path)
            except OSError:
                logger.exception("failed to clean up unreferenced artifact %s", path)


def _elapsed_ms(started: float) -> int:
    return int((time.perf_counter() - started) * 1000)
