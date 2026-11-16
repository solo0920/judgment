from __future__ import annotations

import re
from collections import defaultdict
from typing import Any, Dict, List, Sequence, Set, Tuple


def length_bucket(term: str) -> str:
    length = len(term)
    if length <= 2:
        return "2"
    if length == 3:
        return "3"
    if length <= 5:
        return "4-5"
    if length <= 8:
        return "6-8"
    return "9+"


def build_variant_index(
    terms: Sequence[Any],
) -> Tuple[Dict[str, str], Dict[str, Tuple[str, ...]], re.Pattern[str]]:
    """Map every exact variant to its canonical term and containment closure."""

    variant_to_term: Dict[str, str] = {}
    for term in terms:
        variants = tuple(
            value
            for value in dict.fromkeys(term.phrases or (term.key,))
            if str(value).strip()
        )
        for variant in variants:
            existing = variant_to_term.get(variant)
            if existing is not None and existing != term.key:
                raise RuntimeError(
                    f"Variant {variant!r} maps to both {existing!r} "
                    f"and {term.key!r}"
                )
            variant_to_term[variant] = term.key

    variants = sorted(variant_to_term, key=lambda value: (-len(value), value))
    direct_children: Dict[str, List[str]] = defaultdict(list)
    for outer in variants:
        for inner in variants:
            if outer == inner:
                continue
            if len(inner) >= len(outer):
                continue
            if inner in outer:
                direct_children[outer].append(inner)

    closure_cache: Dict[str, Tuple[str, ...]] = {}

    def descendants(value: str) -> Tuple[str, ...]:
        cached = closure_cache.get(value)
        if cached is not None:
            return cached
        found: Set[str] = set(direct_children.get(value, ()))
        for child in list(found):
            found.update(descendants(child))
        result = tuple(sorted(found, key=lambda item: (-len(item), item)))
        closure_cache[value] = result
        return result

    closure = {variant: descendants(variant) for variant in variants}
    pattern = re.compile("|".join(re.escape(value) for value in variants))
    return variant_to_term, closure, pattern


def match_term_counts(
    matched_variant: str,
    variant_to_term: Dict[str, str],
    closure: Dict[str, Tuple[str, ...]],
) -> Dict[str, int]:
    """Count canonical terms in one matched variant without double counting."""

    counts: Dict[str, int] = {variant_to_term[matched_variant]: 1}
    for contained in closure.get(matched_variant, ()):
        canonical = variant_to_term[contained]
        count = matched_variant.count(contained)
        if count > counts.get(canonical, 0):
            counts[canonical] = count
    return counts
