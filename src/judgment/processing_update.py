from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional, Sequence

from .config import Settings
from .db import build_engine, build_session_factory, init_db
from .judgment_import import import_judgments
from .judgment_index import index_coverage, index_judgments
from .processing_state import (
    ProcessingStateError,
    ProcessingStateStore,
    default_state_path,
)
from .web.processing import scan_local_archives

logger = logging.getLogger(__name__)


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stdout,
    )


def _stage_finish(
    store: ProcessingStateStore,
    run_id: str,
    key: str,
    started: float,
    *,
    status: str = "success",
    current: Optional[int] = None,
    total: Optional[int] = None,
    message: str = "",
) -> None:
    store.finish_stage(
        run_id,
        key,
        status=status,
        current=current,
        total=total,
        message=message,
        duration_ms=int((time.perf_counter() - started) * 1000),
    )


def _run_law_download(store: ProcessingStateStore, run_id: str) -> bool:
    started = time.perf_counter()
    store.start_stage(
        run_id,
        "download",
        message="抓取法規與命令 ZIP，比對版本與內容雜湊。",
    )
    try:
        from .law_download.cli import main as law_download_main

        code = int(law_download_main(["--source", "all"]) or 0)
    except KeyboardInterrupt:
        _stage_finish(
            store,
            run_id,
            "download",
            started,
            status="interrupted",
            message="法規／命令下載已中止。",
        )
        raise
    except Exception as exc:
        _stage_finish(
            store,
            run_id,
            "download",
            started,
            status="failed",
            message=f"{exc.__class__.__name__}: {exc}",
        )
        logger.exception("law/order download failed")
        return False
    if code != 0:
        _stage_finish(
            store,
            run_id,
            "download",
            started,
            status="failed",
            message=f"法規／命令下載失敗（exit {code}）。",
        )
        return False
    _stage_finish(
        store,
        run_id,
        "download",
        started,
        message="法規與命令已完成線上比對；內容未變更時不會建立新版本。",
    )
    return True


def _run_imports(
    store: ProcessingStateStore,
    run_id: str,
    *,
    settings: Settings,
    session_factory,
) -> Dict[str, Any]:
    scan = scan_local_archives(
        settings=settings,
        session_factory=session_factory,
    )
    pending = [item for item in scan.get("items") or [] if not item.get("processed")]
    if not pending:
        store.finish_stage(
            run_id,
            "postgres",
            status="skipped",
            current=0,
            total=0,
            message="沒有未處理的 .rar 壓縮檔。",
        )
        return {"pending": 0, "stored_count": 0, "scan": scan}
    archives = [
        Path(str(scan.get("data_dir") or settings.judgment_data_dir)) / item["path"]
        for item in pending
    ]
    started = time.perf_counter()
    store.start_stage(
        run_id,
        "postgres",
        total=len(archives),
        message=f"開始匯入 {len(archives)} 個未處理壓縮檔。",
    )
    try:
        summary = import_judgments(
            settings=settings,
            session_factory=session_factory,
            archives=archives,
            replace=False,
            track_state=True,
            state_parent_run_id=run_id,
        )
    except KeyboardInterrupt:
        _stage_finish(
            store,
            run_id,
            "postgres",
            started,
            status="interrupted",
            message="判決匯入已中止；下次會自動接續未處理的壓縮檔。",
        )
        raise
    except Exception as exc:
        _stage_finish(
            store,
            run_id,
            "postgres",
            started,
            status="failed",
            message=f"{exc.__class__.__name__}: {exc}",
        )
        logger.exception("judgment import failed")
        return {"pending": len(archives), "stored_count": 0, "error": str(exc), "scan": scan}
    _stage_finish(
        store,
        run_id,
        "postgres",
        started,
        current=len(archives),
        total=len(archives),
        message=(
            f"匯入 {len(archives)} 個壓縮檔：掃描 {summary.get('scanned_count', 0):,} 筆、"
            f"命中 {summary.get('matched_count', 0):,} 筆、寫入 {summary.get('stored_count', 0):,} 筆。"
        ),
    )
    return {
        "pending": len(archives),
        "stored_count": int(summary.get("stored_count") or 0),
        "summary": summary,
        "scan": scan,
    }


def _run_index(
    store: ProcessingStateStore,
    run_id: str,
    *,
    settings: Settings,
    session_factory,
    enabled: bool,
) -> Dict[str, Any]:
    coverage = index_coverage(
        session_factory,
        collection=settings.judgment_vector_collection,
        model=settings.embedding_model,
    )
    remaining = int(coverage.get("remaining_judgments") or 0)
    if not enabled:
        store.finish_stage(
            run_id,
            "qdrant",
            status="skipped",
            message=f"未勾選接續向量索引；目前尚餘 {remaining:,} 筆。",
        )
        return {"indexed": False, "remaining": remaining}
    if remaining <= 0:
        store.finish_stage(
            run_id,
            "qdrant",
            status="skipped",
            current=0,
            total=0,
            message="向量索引已完整，無需執行。",
        )
        return {"indexed": False, "remaining": 0}
    started = time.perf_counter()
    store.start_stage(
        run_id,
        "qdrant",
        total=remaining,
        message=f"接續 Qdrant 向量索引，尚餘 {remaining:,} 筆。",
    )
    try:
        summary = index_judgments(
            session_factory=session_factory,
            settings=settings,
            limit=remaining,
            batch_size=128,
            max_chars=settings.judgment_index_max_chars,
            run_label="auto",
            track_state=True,
            state_parent_run_id=run_id,
        )
    except KeyboardInterrupt:
        _stage_finish(
            store,
            run_id,
            "qdrant",
            started,
            status="interrupted",
            message="向量索引已中止；下次執行會自動接續。",
        )
        raise
    except Exception as exc:
        _stage_finish(
            store,
            run_id,
            "qdrant",
            started,
            status="failed",
            message=f"{exc.__class__.__name__}: {exc}",
        )
        logger.exception("vector index failed")
        return {"indexed": False, "error": str(exc), "remaining": remaining}
    indexed = int(summary.get("indexed_count") or 0)
    _stage_finish(
        store,
        run_id,
        "qdrant",
        started,
        current=indexed,
        total=remaining,
        message=f"本次索引 {indexed:,} 筆；總進度請見覆蓋率。",
    )
    return {"indexed": True, "indexed_count": indexed, "summary": summary}


def run_update(*, run_id: Optional[str], index: bool) -> int:
    settings = Settings.from_env()
    state_path = default_state_path()
    store = ProcessingStateStore(state_path)
    if run_id:
        root_id = run_id
        store.update_run(
            root_id,
            pid=os.getpid(),
            meta={"pid_pending": False},
            message="資料更新程序已啟動。",
        )
    else:
        root_id = store.start_run(
            branch="system",
            kind="update",
            title="資料更新",
            stages=["download", "postgres", "qdrant"],
            pid=os.getpid(),
            meta={"index": bool(index), "manual": True},
            message="手動執行資料更新。",
        )

    engine = build_engine(settings.database_url)
    if settings.auto_create_schema:
        init_db(engine)
    session_factory = build_session_factory(engine)
    result: Dict[str, Any] = {}
    try:
        logger.info("update %s: checking law/order sources", root_id)
        laws_ok = _run_law_download(store, root_id)
        if not laws_ok:
            store.finish_run(
                root_id,
                status="failed",
                message="法規／命令下載失敗；未繼續處理判決壓縮檔。",
            )
            return 1

        logger.info("update %s: scanning judgement archives", root_id)
        imported = _run_imports(
            store,
            root_id,
            settings=settings,
            session_factory=session_factory,
        )
        if imported.get("error"):
            store.finish_run(
                root_id,
                status="failed",
                message=f"判決匯入失敗：{imported.get('error')}",
            )
            return 1
        result["import"] = imported

        logger.info("update %s: resumable vector index", root_id)
        indexing = _run_index(
            store,
            root_id,
            settings=settings,
            session_factory=session_factory,
            enabled=index,
        )
        result["index"] = indexing

        message = (
            f"資料更新完成：未處理壓縮檔 {imported.get('pending', 0)} 個、"
            f"寫入判決 {imported.get('stored_count', 0):,} 筆。"
        )
        if indexing.get("indexed"):
            message += f" 本次索引 {indexing.get('indexed_count', 0):,} 筆。"
        store.finish_run(
            root_id,
            status="success",
            message=message,
            counts={
                "imported_archives": imported.get("pending", 0),
                "stored_count": imported.get("stored_count", 0),
                "indexed_count": indexing.get("indexed_count", 0),
            },
        )
        logger.info("update %s: finished", root_id)
        return 0
    except KeyboardInterrupt:
        logger.warning("update %s interrupted", root_id)
        store.finish_run(
            root_id,
            status="interrupted",
            message="資料更新已中止；已完成的批次會保留，下次可接續。",
        )
        return 130
    except Exception as exc:
        logger.exception("update %s failed", root_id)
        store.finish_run(
            root_id,
            status="failed",
            message=f"{exc.__class__.__name__}: {exc}",
        )
        return 1
    finally:
        engine.dispose()


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="檢查線上法規／命令與本機判決壓縮檔，並自動接續處理。"
    )
    parser.add_argument("--run-id", default="", help="由 Web API 建立的更新 run id")
    parser.add_argument(
        "--index",
        action="store_true",
        help="完成匯入後接續 Qdrant 向量索引",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    configure_logging(os.getenv("LOG_LEVEL", "INFO"))
    try:
        return run_update(run_id=args.run_id.strip() or None, index=bool(args.index))
    except ProcessingStateError as exc:
        logger.error("processing state error: %s", exc)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
