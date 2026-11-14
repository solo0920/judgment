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
from .index_versions import active_version
from .judgment_import import import_judgments
from .judgment_index import build_index_version, index_staleness
from .legal_index import build_legal_article_index
from .vector_store import QdrantStore
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


def _run_legal_index(
    store: ProcessingStateStore,
    run_id: str,
    *,
    settings: Settings,
    session_factory,
) -> Dict[str, Any]:
    started = time.perf_counter()
    store.start_stage(
        run_id,
        "legal_qdrant",
        message="比對法規／命令條文與目前索引版本；必要時增量重建。",
    )
    qdrant = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=120.0,
    )
    last_progress_write = [0.0]

    def report_progress(indexed: int, total: int) -> None:
        current = max(0, int(indexed))
        total = max(0, int(total))
        now = time.monotonic()
        if current < total and now - last_progress_write[0] < 1.0:
            return
        last_progress_write[0] = now
        store.update_stage(
            run_id,
            "legal_qdrant",
            current=current,
            total=total,
            message=f"索引建置中：{current:,} / {total:,} 條。",
        )

    try:
        summary = build_legal_article_index(
            session_factory=session_factory,
            settings=settings,
            store=qdrant,
            mode="incremental",
            auto_activate=True,
            if_changed=True,
            on_progress=report_progress,
        )
    except KeyboardInterrupt:
        _stage_finish(
            store,
            run_id,
            "legal_qdrant",
            started,
            status="interrupted",
            message="法規／命令索引已中止；舊 alias 保持不動。",
        )
        raise
    except Exception as exc:
        _stage_finish(
            store,
            run_id,
            "legal_qdrant",
            started,
            status="failed",
            message=f"{exc.__class__.__name__}: {exc}",
        )
        logger.exception("legal article index failed")
        return {"ok": False, "error": str(exc)}

    status = str(summary.get("status") or "")
    snapshot = summary.get("snapshot") or {}
    version = summary.get("version") or {}
    if status == "unchanged":
        _stage_finish(
            store,
            run_id,
            "legal_qdrant",
            started,
            status="skipped",
            message="法規／命令條文與 active 索引版本相同，無需重建。",
        )
    else:
        _stage_finish(
            store,
            run_id,
            "legal_qdrant",
            started,
            current=int(snapshot.get("article_count") or 0),
            total=int(snapshot.get("article_count") or 0),
            message=(
                f"法規／命令索引 {status or 'success'}："
                f"v{int(version.get('version_id') or 0):03d}、"
                f"{int(version.get('article_count') or snapshot.get('article_count') or 0):,} 條。"
            ),
        )
    return {
        "ok": True,
        "status": status or "success",
        "summary": summary,
    }


def _run_index(
    store: ProcessingStateStore,
    run_id: str,
    *,
    settings: Settings,
    session_factory,
    enabled: bool,
) -> Dict[str, Any]:
    active = active_version(
        session_factory,
        alias_name=settings.judgment_vector_alias,
    )
    version_id = int(active["version_id"]) if active else None
    collection = (
        str(active["physical_collection"])
        if active
        else settings.judgment_vector_collection
    )
    staleness = index_staleness(
        session_factory,
        collection=collection,
        model=settings.embedding_model,
        version_id=version_id,
    )
    pending = int(staleness.get("pending_judgments") or 0)
    if not enabled:
        store.finish_stage(
            run_id,
            "qdrant",
            status="skipped",
            message=f"未勾選接續向量索引；目前待處理 {pending:,} 筆。",
        )
        return {"indexed": False, "remaining": pending, "staleness": staleness}
    if pending <= 0:
        store.finish_stage(
            run_id,
            "qdrant",
            status="skipped",
            current=0,
            total=0,
            message="向量索引已完整且無變更，無需重建。",
        )
        return {"indexed": False, "remaining": 0, "staleness": staleness}
    started = time.perf_counter()
    store.start_stage(
        run_id,
        "qdrant",
        total=pending,
        message=(
            f"偵測到 {pending:,} 筆待處理判決"
            f"（缺漏 {staleness.get('missing_judgments', 0):,}、"
            f"變更 {staleness.get('changed_judgments', 0):,}、"
            f"移除 {staleness.get('stale_judgments', 0):,}）；"
            "建立新索引版本並驗證後切換 alias。"
        ),
    )
    try:
        summary = build_index_version(
            session_factory=session_factory,
            settings=settings,
            batch_size=64,
            max_chars=settings.judgment_index_max_chars,
            auto_activate=True,
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
            message="向量索引版本建置已中止；舊 alias 保持不動。",
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
        logger.exception("vector index version failed")
        return {
            "indexed": False,
            "error": str(exc),
            "remaining": pending,
            "staleness": staleness,
        }
    indexed = int(summary.get("indexed_count") or 0)
    validation = summary.get("validation") or {}
    activated = summary.get("activated") or {}
    ok = (
        summary.get("status") == "success"
        and validation.get("status") == "ready"
        and bool(activated)
    )
    _stage_finish(
        store,
        run_id,
        "qdrant",
        started,
        current=indexed,
        total=pending,
        status="success" if ok else "failed",
        message=(
            f"索引版本 v{int(summary.get('version_id') or 0):03d}："
            f"本次 {indexed:,} 筆、重用 {int(summary.get('reused_count') or 0):,} 筆；"
            + (
                f"alias 已切換到 v{int(activated.get('version_id') or 0):03d}。"
                if activated
                else "alias 未切換。"
            )
        ),
    )
    return {
        "indexed": ok,
        "indexed_count": indexed,
        "remaining": 0 if ok else pending,
        "summary": summary,
        "staleness": staleness,
        **(
            {}
            if ok
            else {
                "error": (
                    "索引版本驗證或 alias 切換失敗："
                    f"{validation.get('status') or summary.get('status') or 'unknown'}"
                )
            }
        ),
    }


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
            stages=["download", "legal_qdrant", "postgres", "qdrant"],
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

        logger.info("update %s: refreshing legal article index", root_id)
        legal_index = _run_legal_index(
            store,
            root_id,
            settings=settings,
            session_factory=session_factory,
        )
        result["legal_index"] = legal_index

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

        problems = []
        if not legal_index.get("ok"):
            problems.append(
                f"法規索引失敗：{legal_index.get('error') or 'unknown'}"
            )
        if indexing.get("error"):
            problems.append(f"判決索引失敗：{indexing.get('error')}")
        message = (
            f"資料更新{'部分完成' if problems else '完成'}：未處理壓縮檔 "
            f"{imported.get('pending', 0)} 個、寫入判決 "
            f"{imported.get('stored_count', 0):,} 筆。"
        )
        if legal_index.get("ok"):
            message += (
                f" 法規索引 {legal_index.get('status') or 'success'}。"
            )
        if indexing.get("indexed"):
            message += f" 本次判決索引 {indexing.get('indexed_count', 0):,} 筆。"
        if problems:
            message += " " + "；".join(problems)
        store.finish_run(
            root_id,
            status="partial" if problems else "success",
            message=message,
            counts={
                "imported_archives": imported.get("pending", 0),
                "stored_count": imported.get("stored_count", 0),
                "indexed_count": indexing.get("indexed_count", 0),
                "legal_indexed": (
                    (legal_index.get("summary") or {}).get("snapshot") or {}
                ).get("article_count", 0),
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
