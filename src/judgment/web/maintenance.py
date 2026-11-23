from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Dict

from sqlalchemy import delete

from ..models import RagShareSnapshot
from ..observability import prune_performance_records
from .feedback import (
    prune_rag_feedback,
    prune_rag_feedback_issues,
    prune_rag_interactions,
)
from .security_audit import prune_security_events

logger = logging.getLogger(__name__)


def prune_expired_rag_shares(session_factory) -> int:
    if session_factory is None:
        return 0
    now = datetime.now(timezone.utc)
    try:
        with session_factory() as session:
            result = session.execute(
                delete(RagShareSnapshot).where(
                    RagShareSnapshot.expires_at < now
                )
            )
            session.commit()
            return int(result.rowcount or 0)
    except Exception:
        logger.warning("failed to prune expired RAG shares", exc_info=True)
        return 0


def run_retention_maintenance(session_factory) -> Dict[str, int]:
    """Apply the documented retention windows in one daily pass."""

    return {
        "performance_records": prune_performance_records(session_factory),
        "security_events": prune_security_events(session_factory),
        "rag_shares": prune_expired_rag_shares(session_factory),
        "rag_interactions": prune_rag_interactions(session_factory),
        "rag_feedback": prune_rag_feedback(session_factory),
        "rag_feedback_issues": prune_rag_feedback_issues(session_factory),
    }
