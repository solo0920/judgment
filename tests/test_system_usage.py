from __future__ import annotations

from judgment.web.system_usage import (
    _parse_bytes,
    _parse_mem_usage,
    _parse_percent,
)


def test_parse_docker_percent() -> None:
    assert _parse_percent("0.15%") == 0.15
    assert _parse_percent("12.5 %") == 12.5
    assert _parse_percent("—") is None
    assert _parse_percent(None) is None


def test_parse_docker_byte_sizes() -> None:
    assert _parse_bytes("512B") == 512
    assert _parse_bytes("1.5MiB") == int(1.5 * 1024**2)
    assert _parse_bytes("2GB") == 2 * 1000**3
    assert _parse_bytes("unknown") is None


def test_parse_docker_memory_usage() -> None:
    assert _parse_mem_usage("45.3MiB / 7.65GiB") == (
        int(45.3 * 1024**2),
        int(7.65 * 1024**3),
    )
    assert _parse_mem_usage("not available") == (None, None)
