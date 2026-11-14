from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

TAIPEI = ZoneInfo("Asia/Taipei")


def version_code_for_datetime(value: Optional[datetime]) -> str:
    """Return a compact local-time version code, e.g. 202611131821."""

    moment = value or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(TAIPEI).strftime("%Y%m%d%H%M")
