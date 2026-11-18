#!/usr/bin/env python3
"""Benchmark raw Parquet writers on one judgment archive.

Usage:
    uv run python scripts/benchmark_raw_parquet.py \
        --archive data/judgments/raw_rar/200212--(20261015Update).rar --runs 3

Run this while the import pipeline is idle.  Each combination uses a fresh
output directory and the same archive/law list.
"""

from __future__ import annotations

import argparse
import shutil
import statistics
import time
from pathlib import Path
from typing import Callable, Dict, List

from judgment.config import Settings
from judgment.judgment_import import (
    _raw_base_fields,
    _raw_match_fields,
    build_candidate_regex,
    build_citation_pattern,
    iter_archive_json_with_raw,
    load_law_list,
)
from judgment.judgment_raw_parquet import (
    _write_archive_raw_parquet_pyarrow,
    write_archive_raw_parquet,
)


def _run_once(
    writer: Callable[..., Dict[str, object]],
    archive: Path,
    out_dir: Path,
    *,
    pattern,
    candidate_regex: str,
    runs: int,
) -> Dict[str, object]:
    samples: List[Dict[str, object]] = []
    for index in range(runs):
        target = out_dir / f"run-{index + 1}"
        shutil.rmtree(target, ignore_errors=True)
        started = time.perf_counter()
        result = writer(
            archive,
            target,
            iter_archive_json_with_raw(archive),
            run_token=f"bench-{index + 1}",
            entry_transform=lambda obj: _raw_base_fields(
                obj, archive=archive
            ),
            match_transform=lambda obj: _raw_match_fields(
                obj, pattern=pattern
            ),
            candidate_regex=candidate_regex,
        )
        elapsed = time.perf_counter() - started
        samples.append(
            {
                "seconds": elapsed,
                "bytes": int(result["size_bytes"]),
                "rows": int(result["rows"]),
            }
        )
    return {
        "seconds_median": statistics.median(
            sample["seconds"] for sample in samples
        ),
        "bytes_median": int(
            statistics.median(sample["bytes"] for sample in samples)
        ),
        "rows": samples[0]["rows"],
        "samples": samples,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--law-list", type=Path)
    parser.add_argument("--runs", type=int, default=2)
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("/tmp/judgment-raw-parquet-bench"),
    )
    args = parser.parse_args()
    if not args.archive.is_file():
        raise SystemExit(f"找不到 archive：{args.archive}")
    if args.runs < 1:
        raise SystemExit("--runs 必須 >= 1")

    settings = Settings.from_env()
    law_list = load_law_list(args.law_list or settings.judgment_law_list)
    pattern = build_citation_pattern(law_list)
    candidate_regex = build_candidate_regex(law_list)
    if args.output_root.exists():
        shutil.rmtree(args.output_root)
    args.output_root.mkdir(parents=True)

    combinations = [
        (
            "pyarrow-snappy",
            _write_archive_raw_parquet_pyarrow,
            {},
        ),
        (
            "duckdb-snappy",
            write_archive_raw_parquet,
            {"compression": "snappy"},
        ),
        (
            "duckdb-zstd-1",
            write_archive_raw_parquet,
            {"compression": "zstd", "compression_level": 1},
        ),
        (
            "duckdb-zstd-default",
            write_archive_raw_parquet,
            {"compression": "zstd"},
        ),
    ]
    results: Dict[str, Dict[str, object]] = {}
    for name, writer, options in combinations:
        def run_writer(*writer_args, _writer=writer, _options=options, **kwargs):
            kwargs.update(_options)
            return _writer(*writer_args, **kwargs)

        print(f"== {name} ==", flush=True)
        result = _run_once(
            run_writer,
            args.archive,
            args.output_root / name,
            pattern=pattern,
            candidate_regex=candidate_regex,
            runs=args.runs,
        )
        results[name] = result
        print(
            f"median {result['seconds_median']:.2f}s · "
            f"{result['bytes_median']:,} bytes · {result['rows']:,} rows",
            flush=True,
        )

    print("\n== summary ==")
    for name, result in results.items():
        print(
            f"{name:22s} {result['seconds_median']:8.2f}s "
            f"{result['bytes_median']:12,d} bytes"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
