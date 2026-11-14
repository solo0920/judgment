from __future__ import annotations

import json
from pathlib import Path

from judgment.processing_state import ProcessingStateStore


def test_state_store_migrates_legacy_json_to_sqlite(
    tmp_path: Path,
) -> None:
    db_path = tmp_path / "processing_state.db"
    legacy = db_path.with_suffix(".json")
    legacy.write_text(
        json.dumps(
            {
                "version": 1,
                "updated_at": "2026-01-01T00:00:00+00:00",
                "runs": [
                    {
                        "id": "legacy-run",
                        "branch": "judgment",
                        "kind": "import",
                        "title": "舊 run",
                        "status": "interrupted",
                        "pid": 1,
                        "started_at": "2026-01-01T00:00:00+00:00",
                        "finished_at": "2026-01-01T00:01:00+00:00",
                        "duration_ms": 60000,
                        "current_stage": "filter",
                        "message": "舊狀態",
                        "stages": {
                            "filter": {
                                "status": "interrupted",
                                "message": "舊篩選",
                            }
                        },
                        "archives": {},
                        "counts": {},
                        "meta": {},
                        "updated_at": "2026-01-01T00:01:00+00:00",
                    }
                ],
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    store = ProcessingStateStore(db_path)
    payload = store.read()

    assert db_path.exists()
    assert not legacy.exists()
    assert legacy.with_name(legacy.name + ".migrated").exists()
    assert payload["runs"][0]["id"] == "legacy-run"
    assert payload["runs"][0]["stages"]["filter"]["message"] == "舊篩選"

    store.update_stage(
        "legacy-run",
        "filter",
        status="running",
        current=5,
        total=10,
        message="新進度",
    )
    updated = store.read()["runs"][0]["stages"]["filter"]
    assert updated["status"] == "running"
    assert updated["current"] == 5
    assert updated["message"] == "新進度"
