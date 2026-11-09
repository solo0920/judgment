from __future__ import annotations

import json
import sys
from pathlib import Path

from sqlalchemy import select

from judgment.config import Settings
from judgment.db import build_engine, build_session_factory, init_db
from judgment.models import QuestionBankItem
from judgment.question_bank import (
    QuestionBankError,
    create_item,
    create_suite,
    list_suites,
    question_fingerprint,
    review_item,
    update_suite,
)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    seed_path = root / "data" / "benchmarks" / "pilot_30.json"
    payload = json.loads(seed_path.read_text(encoding="utf-8"))
    settings = Settings.from_env()
    engine = build_engine(settings.database_url)
    init_db(engine)
    session_factory = build_session_factory(engine)
    created = skipped = failed = 0
    item_ids: list[int] = []
    failures: list[dict] = []
    try:
        for entry in payload.get("items") or []:
            question = str(entry.get("question") or "").strip()
            fingerprint = question_fingerprint(question)
            with session_factory() as session:
                existing = session.scalars(
                    select(QuestionBankItem).where(
                        QuestionBankItem.fingerprint == fingerprint,
                        QuestionBankItem.deleted_at.is_(None),
                    )
                ).first()
            if existing is not None:
                skipped += 1
                if existing.status == "accepted" and not existing.stale:
                    item_ids.append(int(existing.id))
                continue
            try:
                item = create_item(
                    session_factory,
                    {**entry, "status": "pending_review", "source": "pilot_30"},
                    actor="pilot-seed",
                )
                item = review_item(
                    session_factory,
                    item["id"],
                    decision="approved",
                    reviewer="pilot-seed",
                    rubric_scores={"seed": True},
                    comment="Pilot 30 初始題庫，待人工覆核。",
                )
                item_ids.append(int(item["id"]))
                created += 1
            except QuestionBankError as exc:
                failed += 1
                failures.append(
                    {
                        "question": question,
                        "errors": exc.errors,
                        "warnings": exc.warnings,
                    }
                )
            except Exception as exc:
                failed += 1
                failures.append(
                    {
                        "question": question,
                        "errors": [f"{exc.__class__.__name__}: {exc}"],
                    }
                )
        suites = {suite["name"]: suite for suite in list_suites(session_factory)}
        suite = suites.get("Pilot 30")
        if suite is None:
            suite = create_suite(
                session_factory,
                name="Pilot 30",
                tier="core",
                description=str(payload.get("description") or ""),
                item_ids=item_ids,
                actor="pilot-seed",
            )
        if suite.get("status") != "frozen":
            suite = update_suite(
                session_factory,
                int(suite["id"]),
                item_ids=item_ids,
                freeze=True,
            )
        print(
            json.dumps(
                {
                    "created": created,
                    "skipped": skipped,
                    "failed": failed,
                    "suite_id": suite["id"],
                    "suite_items": suite["item_count"],
                    "failures": failures,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 1 if failed else 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    sys.exit(main())
