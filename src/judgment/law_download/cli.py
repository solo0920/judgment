from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Sequence

from ..config import Settings
from ..db import build_engine, build_session_factory, init_db
from ..observability import record_performance
from .client import LawApiClient
from .repository import LawRepository
from .service import LawDownloadService
from .storage import LawStorage
from .types import RunResult, SourceSpec, SourceType

logger = logging.getLogger(__name__)


def build_sources(settings: Settings) -> List[SourceSpec]:
    return [
        SourceSpec(
            source_type=SourceType.LAW,
            url=settings.law_api_url,
            json_filename="ChLaw.json",
            label="中文法規",
        ),
        SourceSpec(
            source_type=SourceType.ORDER,
            url=settings.order_api_url,
            json_filename="ChOrder.json",
            label="中文命令",
        ),
    ]


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stderr,
    )


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download 全國法規資料庫 law/order archives, detect new versions, "
        "write raw data to Parquet and metadata to PostgreSQL."
    )
    parser.add_argument(
        "--source",
        choices=["all", "law", "order"],
        default="all",
        help="which dataset to download (default: all)",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=None,
        help="artifact root (default: LAW_DATA_DIR or /data/laws)",
    )
    parser.add_argument(
        "--database-url",
        default=None,
        help="SQLAlchemy database URL (default: DATABASE_URL)",
    )
    parser.add_argument(
        "--log-level",
        default=None,
        help="DEBUG, INFO, WARNING, ERROR (default: LOG_LEVEL)",
    )
    parser.add_argument(
        "--skip-init-db",
        action="store_true",
        help="do not create missing tables before running",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    settings = Settings.from_env().with_overrides(
        database_url=args.database_url,
        law_data_dir=args.data_dir,
        log_level=args.log_level,
    )
    configure_logging(settings.log_level)

    engine = build_engine(settings.database_url)
    if settings.auto_create_schema and not args.skip_init_db:
        init_db(engine)

    session_factory = build_session_factory(engine)
    repository = LawRepository(session_factory)
    data_dir = settings.law_data_dir.expanduser().resolve()
    storage = LawStorage(data_dir)
    client = LawApiClient(
        temp_dir=data_dir / "tmp",
        timeout_seconds=settings.http_timeout_seconds,
        retries=settings.http_retries,
        user_agent=settings.user_agent,
        max_uncompressed_bytes=settings.max_uncompressed_bytes,
    )
    service = LawDownloadService(
        client=client,
        storage=storage,
        repository=repository,
        track_state=True,
    )

    sources = build_sources(settings)
    if args.source != "all":
        sources = [s for s in sources if s.source_type.value == args.source]

    results: List[RunResult] = []
    failed = False
    for source in sources:
        logger.info("processing %s from %s", source.label, source.url)
        started_at = datetime.now(timezone.utc)
        started = time.perf_counter()
        try:
            result = service.run(source)
            results.append(result)
            duration_ms = result.duration_ms or int(
                (time.perf_counter() - started) * 1000
            )
            record_performance(
                session_factory,
                process="法規下載",
                module="judgment.law_download.service.LawDownloadService.run",
                status=result.status,
                started_at=started_at,
                finished_at=datetime.now(timezone.utc),
                duration_ms=duration_ms,
                params={
                    "source_type": source.source_type.value,
                    "source_url": source.url,
                },
                details=asdict(result),
            )
        except Exception as exc:
            failed = True
            logger.exception("failed to process %s", source.label)
            duration_ms = int((time.perf_counter() - started) * 1000)
            record_performance(
                session_factory,
                process="法規下載",
                module="judgment.law_download.service.LawDownloadService.run",
                status="failed",
                started_at=started_at,
                finished_at=datetime.now(timezone.utc),
                duration_ms=duration_ms,
                params={
                    "source_type": source.source_type.value,
                    "source_url": source.url,
                },
                error_message=f"{exc.__class__.__name__}: {exc}",
            )
            results.append(
                RunResult(
                    source_type=source.source_type.value,
                    status="failed",
                    message=str(exc),
                )
            )

    print(json.dumps([asdict(result) for result in results], ensure_ascii=False, indent=2))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
