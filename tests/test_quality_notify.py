from __future__ import annotations

from dataclasses import replace
from pathlib import Path

import pytest

from judgment.config import Settings
from judgment.web import quality_notify


def _settings(**overrides) -> Settings:
    base = Settings(
        database_url="sqlite://",
        law_data_dir=Path("."),
        law_api_url="",
        order_api_url="",
    )
    return replace(base, **overrides)


def _report(alerts=None) -> dict:
    return {
        "period": {"days": 7, "start": "2026-11-17", "end": "2026-11-24"},
        "generated_at": "2026-11-24T09:00:00+00:00",
        "totals": {
            "feedback": 12,
            "unsatisfied": 5,
            "unsatisfied_rate": 41.7,
            "untriaged_actionable": 2,
            "open_issues": 3,
            "unreviewed_reviews": 4,
        },
        "alerts": alerts
        if alerts is not None
        else [
            {
                "level": "danger",
                "code": "unsatisfied_rate_high",
                "message": "不滿意率 41.7% 偏高。",
            },
            {
                "level": "info",
                "code": "small_sample",
                "message": "樣本數不足 10。",
            },
        ],
    }


def test_report_message_contains_only_aggregates() -> None:
    message = quality_notify.report_message(
        _report(), console_url="https://judgment.ragdemo.win/"
    )
    assert "[RAG 品質週報]" in message["subject"]
    assert "不滿意 5（41.7%）" in message["text"]
    assert "可行動待處理 2" in message["text"]
    assert "[danger] 不滿意率 41.7% 偏高。" in message["text"]
    assert "詳細報告：https://judgment.ragdemo.win/" in message["text"]
    assert "原始留言" not in message["text"]
    assert "review_comment" not in message["text"]


def test_actionable_alerts_respects_threshold() -> None:
    report = _report()
    assert [row["level"] for row in quality_notify.actionable_alerts(report)] == [
        "danger"
    ]
    assert len(
        quality_notify.actionable_alerts(report, threshold="info")
    ) == 2
    assert (
        quality_notify.actionable_alerts(report, threshold="danger")[0][
            "code"
        ]
        == "unsatisfied_rate_high"
    )
    quiet = quality_notify.actionable_alerts(
        _report(alerts=[{"level": "info", "message": "no feedback"}])
    )
    assert quiet == []


def test_notify_skips_unconfigured_and_dry_run() -> None:
    result = quality_notify.notify_quality_report(
        _report(), _settings()
    )
    assert result["channels_configured"] == []
    assert result["results"] == []

    configured = _settings(
        rag_quality_report_slack_webhook="https://hooks.slack.com/services/x",
        rag_quality_report_email_to=("admin@example.test",),
    )
    result = quality_notify.notify_quality_report(
        _report(), configured, dry_run=True
    )
    assert result["channels_configured"] == ["slack", "email"]
    assert {row["reason"] for row in result["results"]} == {"dry_run"}
    assert all(row["sent"] is False for row in result["results"])


def test_notify_delivers_to_configured_channels(monkeypatch) -> None:
    calls = []
    monkeypatch.setattr(
        quality_notify,
        "_send_slack",
        lambda url, text: calls.append(("slack", url, text)),
    )
    monkeypatch.setattr(
        quality_notify,
        "_send_email",
        lambda settings, subject, text: calls.append(
            ("email", subject, text)
        ),
    )
    settings = _settings(
        rag_quality_report_slack_webhook="https://hooks.slack.com/services/x",
        rag_quality_report_email_to=("admin@example.test",),
    )
    result = quality_notify.notify_quality_report(_report(), settings)
    assert [row["channel"] for row in result["results"]] == ["slack", "email"]
    assert all(row["sent"] is True for row in result["results"])
    assert calls[0][1] == "https://hooks.slack.com/services/x"
    assert "不滿意" in calls[1][2]
    assert "secret-token" not in str(result)


def test_notify_only_alerts_skips_quiet_week(monkeypatch) -> None:
    monkeypatch.setattr(
        quality_notify,
        "_send_slack",
        lambda url, text: pytest.fail("should not send"),
    )
    settings = _settings(
        rag_quality_report_slack_webhook="https://hooks.slack.com/services/x"
    )
    result = quality_notify.notify_quality_report(
        _report(alerts=[]), settings, only_alerts=True
    )
    assert result["skipped"] == "no_actionable_alerts"
    assert result["results"] == [
        {"channel": "slack", "sent": False, "reason": "no_actionable_alerts"}
    ]


def test_slack_webhook_rejects_non_slack_hosts() -> None:
    with pytest.raises(ValueError):
        quality_notify._send_slack("https://example.test/hook", "text")
    with pytest.raises(ValueError):
        quality_notify._send_slack("http://hooks.slack.com/services/x", "text")
