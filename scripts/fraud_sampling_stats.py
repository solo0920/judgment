#!/usr/bin/env python3
"""Exact statistics for the fraud-relevance sampling specification.

Examples:
    uv run python scripts/fraud_sampling_stats.py c2 \
      --population 1266 --sample 50 --observed 0

    uv run python scripts/fraud_sampling_stats.py cp \
      --successes 0 --trials 30

    uv run python scripts/fraud_sampling_stats.py coverage \
      --title-loose 0 30 --title-strict 0 30 \
      --c2-loose 0 50 1266 --c2-strict 0 50 1266 \
      --fixed-loose 0 --fixed-strict 0
"""

from __future__ import annotations

import argparse
import json

from judgment.fraud_stats import (
    clopper_pearson,
    coverage_monte_carlo,
    hypergeom_upper_bound,
)


def _c2(args: argparse.Namespace) -> dict:
    upper = hypergeom_upper_bound(
        args.population,
        args.sample,
        args.observed,
        alpha=args.alpha,
    )
    return {
        "population": args.population,
        "sample": args.sample,
        "observed": args.observed,
        "alpha": args.alpha,
        "upper_count": upper,
        "upper_ratio": round(upper / args.population, 6),
    }


def _cp(args: argparse.Namespace) -> dict:
    lower, upper = clopper_pearson(
        args.successes, args.trials, alpha=args.alpha
    )
    return {
        "successes": args.successes,
        "trials": args.trials,
        "alpha": args.alpha,
        "lower": round(lower, 6),
        "upper": round(upper, 6),
    }


def _coverage(args: argparse.Namespace) -> dict:
    result = coverage_monte_carlo(
        title_loose=(args.title_loose[0], args.title_loose[1]),
        title_strict=(args.title_strict[0], args.title_strict[1]),
        c2_loose=(args.c2_loose[0], args.c2_loose[1], args.c2_loose[2]),
        c2_strict=(args.c2_strict[0], args.c2_strict[1], args.c2_strict[2]),
        fixed_loose=args.fixed_loose,
        fixed_strict=args.fixed_strict,
        title_hits=args.title_hits,
        draws=args.draws,
        seed=args.seed,
    )
    return {
        "loose": {
            "lower": round(result.loose_lower, 6),
            "upper": round(result.loose_upper, 6),
        },
        "strict": {
            "lower": round(result.strict_lower, 6),
            "upper": round(result.strict_upper, 6),
        },
        "draws": result.draws,
        "seed": result.seed,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    c2 = subparsers.add_parser("c2", help="exact hypergeometric upper bound")
    c2.add_argument("--population", type=int, required=True)
    c2.add_argument("--sample", type=int, required=True)
    c2.add_argument("--observed", type=int, default=0)
    c2.add_argument("--alpha", type=float, default=0.025)
    c2.set_defaults(func=_c2)

    cp = subparsers.add_parser("cp", help="Clopper-Pearson interval")
    cp.add_argument("--successes", type=int, required=True)
    cp.add_argument("--trials", type=int, required=True)
    cp.add_argument("--alpha", type=float, default=0.05)
    cp.set_defaults(func=_cp)

    coverage = subparsers.add_parser(
        "coverage", help="Bayesian Monte Carlo coverage interval"
    )
    coverage.add_argument(
        "--title-loose", type=int, nargs=2, metavar=("X", "N"), required=True
    )
    coverage.add_argument(
        "--title-strict", type=int, nargs=2, metavar=("X", "N"), required=True
    )
    coverage.add_argument(
        "--c2-loose",
        type=int,
        nargs=3,
        metavar=("X", "N", "POPULATION"),
        required=True,
    )
    coverage.add_argument(
        "--c2-strict",
        type=int,
        nargs=3,
        metavar=("X", "N", "POPULATION"),
        required=True,
    )
    coverage.add_argument("--fixed-loose", type=int, required=True)
    coverage.add_argument("--fixed-strict", type=int, required=True)
    coverage.add_argument("--title-hits", type=int, default=210)
    coverage.add_argument("--draws", type=int, default=10_000)
    coverage.add_argument("--seed", type=int, default=42)
    coverage.set_defaults(func=_coverage)

    args = parser.parse_args()
    print(json.dumps(args.func(args), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
