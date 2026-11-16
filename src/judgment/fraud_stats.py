from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Iterable, List, Sequence, Tuple


def _log_comb(n: int, k: int) -> float:
    if k < 0 or k > n:
        return float("-inf")
    return math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)


def _log_sum_exp(values: Iterable[float]) -> float:
    items = list(values)
    if not items:
        return float("-inf")
    maximum = max(items)
    if maximum == float("-inf"):
        return float("-inf")
    return maximum + math.log(sum(math.exp(value - maximum) for value in items))


def hypergeom_logpmf(x: int, population: int, successes: int, draws: int) -> float:
    """P(X=x) for sampling ``draws`` without replacement."""

    if population <= 0 or draws < 0 or draws > population:
        return float("-inf")
    if successes < 0 or successes > population:
        return float("-inf")
    return (
        _log_comb(successes, x)
        + _log_comb(population - successes, draws - x)
        - _log_comb(population, draws)
    )


def hypergeom_cdf(
    x: int, population: int, successes: int, draws: int
) -> float:
    """P(X <= x) for sampling without replacement."""

    if x < 0:
        return 0.0
    upper = min(x, successes, draws)
    logs = [
        hypergeom_logpmf(value, population, successes, draws)
        for value in range(upper + 1)
    ]
    return min(1.0, math.exp(_log_sum_exp(logs)))


def hypergeom_upper_bound(
    population: int,
    draws: int,
    observed: int = 0,
    *,
    alpha: float = 0.025,
) -> int:
    """Largest population count K with P(X <= observed | K) >= alpha.

    For ``observed=0`` and two-sided 95% this is the exact finite-population
    upper confidence bound: if the true K were larger, the probability of
    observing this few relevant cases would be below alpha.
    """

    if not 0 <= observed <= draws <= population:
        raise ValueError("require 0 <= observed <= draws <= population")
    if not 0 < alpha < 1:
        raise ValueError("alpha must be between 0 and 1")

    maximum = population - draws + observed
    best = 0
    for successes in range(0, maximum + 1):
        if hypergeom_cdf(observed, population, successes, draws) >= alpha:
            best = successes
        else:
            break
    return best


def _betacf(a: float, b: float, x: float) -> float:
    """Continued fraction for the incomplete beta function."""

    max_iterations = 300
    epsilon = 3.0e-14
    tiny = 1.0e-300

    qab = a + b
    qap = a + 1.0
    qam = a - 1.0
    c = 1.0
    d = 1.0 - qab * x / qap
    if abs(d) < tiny:
        d = tiny
    d = 1.0 / d
    h = d
    for m in range(1, max_iterations + 1):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        if abs(d) < tiny:
            d = tiny
        c = 1.0 + aa / c
        if abs(c) < tiny:
            c = tiny
        d = 1.0 / d
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        if abs(d) < tiny:
            d = tiny
        c = 1.0 + aa / c
        if abs(c) < tiny:
            c = tiny
        d = 1.0 / d
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < epsilon:
            break
    return h


def regularized_beta(x: float, a: float, b: float) -> float:
    """Regularized incomplete beta I_x(a, b)."""

    if x <= 0.0:
        return 0.0
    if x >= 1.0:
        return 1.0
    log_beta = (
        math.lgamma(a + b)
        - math.lgamma(a)
        - math.lgamma(b)
        + a * math.log(x)
        + b * math.log1p(-x)
    )
    beta = math.exp(log_beta)
    if x < (a + 1.0) / (a + b + 2.0):
        return beta * _betacf(a, b, x) / a
    return 1.0 - beta * _betacf(b, a, 1.0 - x) / b


def beta_ppf(probability: float, a: float, b: float) -> float:
    """Inverse regularized beta by bisection."""

    if not 0.0 < probability < 1.0:
        if probability <= 0.0:
            return 0.0
        if probability >= 1.0:
            return 1.0
        raise ValueError("probability must be between 0 and 1")
    low, high = 0.0, 1.0
    for _ in range(200):
        middle = (low + high) / 2.0
        if regularized_beta(middle, a, b) < probability:
            low = middle
        else:
            high = middle
    return (low + high) / 2.0


def clopper_pearson(
    successes: int, trials: int, *, alpha: float = 0.05
) -> Tuple[float, float]:
    """Exact two-sided Clopper-Pearson interval."""

    if trials <= 0:
        raise ValueError("trials must be positive")
    if not 0 <= successes <= trials:
        raise ValueError("require 0 <= successes <= trials")
    if not 0.0 < alpha < 1.0:
        raise ValueError("alpha must be between 0 and 1")

    lower = (
        0.0
        if successes == 0
        else beta_ppf(alpha / 2.0, successes, trials - successes + 1)
    )
    upper = (
        1.0
        if successes == trials
        else beta_ppf(1.0 - alpha / 2.0, successes + 1, trials - successes)
    )
    return lower, upper


def _log_beta_prior(point: float, a: float = 0.5, b: float = 0.5) -> float:
    point = min(max(point, 1.0e-12), 1.0 - 1.0e-12)
    return (
        (a - 1.0) * math.log(point)
        + (b - 1.0) * math.log1p(-point)
        - (math.lgamma(a) + math.lgamma(b) - math.lgamma(a + b))
    )


def hypergeom_posterior_weights(
    population: int,
    draws: int,
    observed: int,
    *,
    prior_a: float = 0.5,
    prior_b: float = 0.5,
) -> List[float]:
    """Posterior weights over K=0..population under a Beta prior.

    Likelihood is X | K ~ Hypergeometric(population, K, draws).  The Beta
    prior is placed on p=K/population, so the posterior over the finite
    population count K is computed on its integer grid.
    """

    if not 0 <= observed <= draws <= population:
        raise ValueError("require 0 <= observed <= draws <= population")
    logs = []
    for successes in range(population + 1):
        point = successes / population
        log_prior = _log_beta_prior(point, prior_a, prior_b)
        log_likelihood = hypergeom_logpmf(
            observed, population, successes, draws
        )
        logs.append(log_prior + log_likelihood)
    normalizer = _log_sum_exp(logs)
    return [math.exp(value - normalizer) for value in logs]


def _weighted_draw(
    rng: random.Random, values: Sequence[int], weights: Sequence[float]
) -> int:
    return rng.choices(values, weights=weights, k=1)[0]


@dataclass(frozen=True)
class CoverageResult:
    loose_lower: float
    loose_upper: float
    strict_lower: float
    strict_upper: float
    draws: int
    seed: int


def coverage_monte_carlo(
    *,
    title_loose: Tuple[int, int],
    title_strict: Tuple[int, int],
    c2_loose: Tuple[int, int, int],
    c2_strict: Tuple[int, int, int],
    fixed_loose: int,
    fixed_strict: int,
    title_hits: int = 210,
    draws: int = 10_000,
    seed: int = 42,
) -> CoverageResult:
    """Propagate title-precision and C2 uncertainty into Coverage.

    ``title_*`` is (successes, trials); ``c2_*`` is
    (observed successes, sample size, population).  Fixed strata are
    supplied as already-annotated relevant counts.
    """

    title_loose_x, title_loose_n = title_loose
    title_strict_x, title_strict_n = title_strict
    c2_loose_x, c2_loose_n, c2_loose_population = c2_loose
    c2_strict_x, c2_strict_n, c2_strict_population = c2_strict
    if not 0 < draws:
        raise ValueError("draws must be positive")

    rng = random.Random(seed)
    loose_weights = hypergeom_posterior_weights(
        c2_loose_population, c2_loose_n, c2_loose_x
    )
    strict_weights = hypergeom_posterior_weights(
        c2_strict_population, c2_strict_n, c2_strict_x
    )
    loose_values = list(range(c2_loose_population + 1))
    strict_values = list(range(c2_strict_population + 1))

    loose_scores: List[float] = []
    strict_scores: List[float] = []
    for _ in range(draws):
        loose_title = rng.betavariate(
            title_loose_x + 0.5, title_loose_n - title_loose_x + 0.5
        )
        strict_title = rng.betavariate(
            title_strict_x + 0.5, title_strict_n - title_strict_x + 0.5
        )
        loose_k = _weighted_draw(rng, loose_values, loose_weights)
        strict_k = _weighted_draw(rng, strict_values, strict_weights)
        loose_missing = fixed_loose + loose_k
        strict_missing = fixed_strict + strict_k
        loose_numerator = title_hits * loose_title
        strict_numerator = title_hits * strict_title
        loose_scores.append(
            loose_numerator / (loose_numerator + loose_missing)
            if loose_numerator + loose_missing
            else 0.0
        )
        strict_scores.append(
            strict_numerator / (strict_numerator + strict_missing)
            if strict_numerator + strict_missing
            else 0.0
        )

    loose_scores.sort()
    strict_scores.sort()

    def percentile(values: Sequence[float], probability: float) -> float:
        index = min(
            len(values) - 1,
            max(0, int(round(probability * (len(values) - 1)))),
        )
        return values[index]

    return CoverageResult(
        loose_lower=percentile(loose_scores, 0.025),
        loose_upper=percentile(loose_scores, 0.975),
        strict_lower=percentile(strict_scores, 0.025),
        strict_upper=percentile(strict_scores, 0.975),
        draws=draws,
        seed=seed,
    )
