from __future__ import annotations

from types import SimpleNamespace

from judgment.web import system_usage
from judgment.web.system_usage import (
    _parse_bytes,
    _parse_mem_usage,
    _parse_percent,
    _path_bytes,
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


def test_docker_usage_reads_qdrant_mount_and_volume(monkeypatch) -> None:
    monkeypatch.setattr(system_usage.shutil, "which", lambda name: "/usr/bin/docker")

    def fake_run(command, timeout=8.0):
        joined = " ".join(command)
        if joined.startswith("docker version"):
            return SimpleNamespace(returncode=0, stdout="27.0\n")
        if joined.startswith("docker ps"):
            return SimpleNamespace(
                returncode=0,
                stdout='{"ID":"abc123","Names":"judgment-qdrant","Image":"qdrant/qdrant:v1.19.1","State":"running","Status":"Up"}\n',
            )
        if joined.startswith("docker stats"):
            return SimpleNamespace(
                returncode=0,
                stdout='{"Name":"judgment-qdrant","CPUPerc":"1.0%","MemUsage":"10MiB / 1GiB","MemPerc":"1.0%","NetIO":"","BlockIO":"","PIDs":"5"}\n',
            )
        if joined.startswith("docker system df -v"):
            return SimpleNamespace(
                returncode=0,
                stdout=(
                    '{"Containers":[],"Images":[],"BuildCache":[],'
                    '"Volumes":[{"Name":"judgment_qdrant","Size":"1.5GB"}]}'
                ),
            )
        if joined.startswith("docker system df"):
            return SimpleNamespace(
                returncode=0,
                stdout='{"Type":"Images","TotalCount":"1","Active":"1","Size":"1GB","Reclaimable":"0B"}\n',
            )
        if joined.startswith("docker context show"):
            return SimpleNamespace(returncode=0, stdout="orbstack\n")
        if joined.startswith("docker inspect"):
            return SimpleNamespace(
                returncode=0,
                stdout=(
                    '[{"Config":{"WorkingDir":"/qdrant"},"Mounts":[{'
                    '"Type":"volume","Name":"judgment_qdrant",'
                    '"Source":"/var/lib/docker/volumes/judgment_qdrant/_data",'
                    '"Destination":"/qdrant/storage","RW":true}]}]'
                ),
            )
        return SimpleNamespace(returncode=1, stdout="")

    monkeypatch.setattr(system_usage, "_run", fake_run)
    result = system_usage._docker_usage()
    container = next(
        item for item in result["containers"] if item["name"] == "judgment-qdrant"
    )
    assert result["context"] == "orbstack"
    assert container["storage_path"] == "/qdrant/storage"
    assert container["volume_name"] == "judgment_qdrant"
    assert container["volume_source"] == (
        "/var/lib/docker/volumes/judgment_qdrant/_data"
    )
    assert container["mounts"][0]["destination"] == "/qdrant/storage"
    assert result["judgment_volumes"]["qdrant"]["size_bytes"] == int(1.5 * 1000**3)


def test_path_bytes_sums_nested_files(tmp_path) -> None:
    (tmp_path / "a").mkdir()
    (tmp_path / "a" / "one.txt").write_bytes(b"1234")
    (tmp_path / "two.txt").write_bytes(b"123456")
    assert _path_bytes(tmp_path) == 10
