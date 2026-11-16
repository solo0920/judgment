from __future__ import annotations

import hashlib
import random
from typing import Any, Dict, Iterable, List, Sequence


def sort_by_jid(items: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(items, key=lambda item: str(item.get("jid") or ""))


def jid_digest(jids: Iterable[str]) -> str:
    payload = "\n".join(sorted(str(jid) for jid in jids))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def sample_sorted(
    items: Sequence[Dict[str, Any]],
    count: int,
    *,
    seed: int,
) -> List[Dict[str, Any]]:
    """Sample without replacement after sorting by JID.

    Sorting first makes the result independent of SQL row order.  When
    ``count`` covers the whole stratum, the sorted census is returned.
    """

    ordered = sort_by_jid(items)
    if count < 0:
        raise ValueError("count must be non-negative")
    if count >= len(ordered):
        return ordered
    return random.Random(seed).sample(ordered, count)


def pilot_sample(
    strata: Dict[str, Sequence[Dict[str, Any]]],
    allocation: Dict[str, int],
    *,
    seed: int,
) -> List[Dict[str, Any]]:
    """Draw the pilot from census strata only (A/B/C1)."""

    selected: List[Dict[str, Any]] = []
    for index, stratum in enumerate(sorted(allocation)):
        items = strata.get(stratum, ())
        count = allocation[stratum]
        if count > len(items):
            raise ValueError(
                f"pilot allocation {stratum}={count} exceeds {len(items)}"
            )
        selected.extend(
            sample_sorted(items, count, seed=seed + index)
        )
    return sort_by_jid(selected)


def assign_case_ids(
    items: Sequence[Dict[str, Any]],
    *,
    seed: int,
    prefix: str = "case",
    start: int = 1,
) -> List[Dict[str, Any]]:
    """Shuffle a mixed queue and attach opaque, sequential case IDs.

    The queue is sorted by JID before shuffling so the assignment is
    reproducible and does not depend on the input order.
    """

    ordered = sort_by_jid(items)
    random.Random(seed).shuffle(ordered)
    result: List[Dict[str, Any]] = []
    for offset, item in enumerate(ordered):
        record = dict(item)
        record["case_id"] = f"{prefix}_{start + offset:04d}"
        result.append(record)
    return result


def manifest_payload(
    *,
    strata: Dict[str, Sequence[Dict[str, Any]]],
    selected: Dict[str, Sequence[Dict[str, Any]]],
    title_sample: Sequence[Dict[str, Any]],
    pilot: Sequence[Dict[str, Any]],
    seed: int,
) -> Dict[str, Any]:
    """Build the reproducibility part of the sampling manifest."""

    return {
        "seed": seed,
        "strata": {
            name: {
                "population": len(items),
                "jid_sha256": jid_digest(
                    str(item.get("jid") or "") for item in items
                ),
            }
            for name, items in sorted(strata.items())
        },
        "selected": {
            name: {
                "count": len(items),
                "weight": (
                    round(len(strata.get(name, [])) / len(items), 4)
                    if items
                    else None
                ),
                "sample_source": sorted(
                    {
                        str(item.get("sample_source") or "")
                        for item in items
                        if item.get("sample_source")
                    }
                ),
                "jids": [str(item.get("jid") or "") for item in items],
            }
            for name, items in sorted(selected.items())
        },
        "title_precision": {
            "count": len(title_sample),
            "jids": [str(item.get("jid") or "") for item in title_sample],
        },
        "pilot": {
            "count": len(pilot),
            "jids": [str(item.get("jid") or "") for item in pilot],
        },
    }
