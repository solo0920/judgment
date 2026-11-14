from __future__ import annotations

from datetime import datetime, timezone

from judgment.version_codes import version_code_for_datetime


def test_version_code_uses_taipei_local_minute() -> None:
    moment = datetime(2026, 11, 13, 10, 21, 45, tzinfo=timezone.utc)
    assert version_code_for_datetime(moment) == "202611131821"


def test_version_code_treats_naive_datetime_as_utc() -> None:
    moment = datetime(2026, 11, 13, 10, 21, 45)
    assert version_code_for_datetime(moment) == "202611131821"
