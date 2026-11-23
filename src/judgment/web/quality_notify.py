"""Deliver the aggregate RAG quality report to Slack or email.

The report contains aggregate counts and alert messages only.  This module
never reads visitor comments, review notes, prompts, paths, or hostnames.
"""

from __future__ import annotations

import json
import logging
import re
import smtplib
import ssl
from email.message import EmailMessage
from typing import Any, Dict, Mapping, Optional, Sequence
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from judgment.config import Settings

LOGGER = logging.getLogger(__name__)

ALERT_LEVELS = {"info": 0, "warn": 1, "danger": 2}
SLACK_HOSTS = frozenset({"hooks.slack.com", "hooks.slack-gov.com"})
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def report_message(
    report: Mapping[str, Any], *, console_url: str = ""
) -> Dict[str, str]:
    period = report.get("period") or {}
    totals = report.get("totals") or {}
    days = period.get("days", 7)
    rate = totals.get("unsatisfied_rate")
    rate_text = "—" if rate is None else f"{float(rate):.1f}%"
    subject = f"[RAG 品質週報] 最近 {days} 天"
    header = (
        f"回饋 {int(totals.get('feedback') or 0)} · "
        f"不滿意 {int(totals.get('unsatisfied') or 0)}（{rate_text}） · "
        f"可行動待處理 {int(totals.get('untriaged_actionable') or 0)} · "
        f"未結案 Issue {int(totals.get('open_issues') or 0)} · "
        f"待審抽樣 {int(totals.get('unreviewed_reviews') or 0)}"
    )
    alerts = list(report.get("alerts") or [])
    lines = [subject, header, "", "警示："]
    if alerts:
        for alert in alerts:
            lines.append(
                f"- [{alert.get('level')}] {alert.get('message')}"
            )
    else:
        lines.append("- 無")
    if console_url:
        lines.extend(["", f"詳細報告：{console_url}"])
    text = "\n".join(lines)
    return {"subject": subject, "text": text, "slack": text}


def actionable_alerts(
    report: Mapping[str, Any], *, threshold: str = "warn"
) -> list[Mapping[str, Any]]:
    minimum = ALERT_LEVELS.get(str(threshold or "warn"), 1)
    return [
        alert
        for alert in (report.get("alerts") or [])
        if ALERT_LEVELS.get(str(alert.get("level") or "info"), 0) >= minimum
    ]


def _send_slack(webhook_url: str, text: str) -> None:
    parsed = urlparse(webhook_url)
    if parsed.scheme != "https" or parsed.hostname not in SLACK_HOSTS:
        raise ValueError("Slack webhook 必須是 https://hooks.slack.com/ 位址。")
    body = json.dumps({"text": text}, ensure_ascii=False).encode("utf-8")
    request = Request(
        webhook_url,
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    with urlopen(request, timeout=10) as response:  # noqa: S310
        if getattr(response, "status", 200) >= 400:
            raise RuntimeError(f"Slack webhook 回應 {response.status}")


def _send_email(settings: Settings, subject: str, text: str) -> None:
    recipients = [item for item in settings.rag_quality_report_email_to if item]
    if not recipients:
        raise ValueError("未設定收件者。")
    invalid = [item for item in recipients if not _EMAIL_RE.match(item)]
    if invalid:
        raise ValueError("收件者格式不正確。")
    sender = settings.rag_quality_report_email_from or (
        settings.rag_quality_report_smtp_user
    )
    if not sender:
        raise ValueError("未設定寄件者。")
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = ", ".join(recipients)
    message.set_content(text)
    host = settings.rag_quality_report_smtp_host
    if not host:
        raise ValueError("未設定 SMTP host。")
    port = int(settings.rag_quality_report_smtp_port or 587)
    context = ssl.create_default_context()
    if port == 465:
        client: smtplib.SMTP = smtplib.SMTP_SSL(
            host, port, timeout=15, context=context
        )
    else:
        client = smtplib.SMTP(host, port, timeout=15)
    try:
        if port != 465:
            client.starttls(context=context)
        if settings.rag_quality_report_smtp_user:
            client.login(
                settings.rag_quality_report_smtp_user,
                settings.rag_quality_report_smtp_password,
            )
        client.send_message(message)
    finally:
        try:
            client.quit()
        except Exception:  # pragma: no cover - best effort close
            client.close()


def notify_quality_report(
    report: Mapping[str, Any],
    settings: Settings,
    *,
    dry_run: bool = False,
    only_alerts: bool = False,
    alert_threshold: str = "warn",
    channels: Optional[Sequence[str]] = None,
) -> Dict[str, Any]:
    enabled = {
        "slack": bool(settings.rag_quality_report_slack_webhook),
        "email": bool(settings.rag_quality_report_email_to),
    }
    requested = [
        name
        for name in (channels or ("slack", "email"))
        if enabled.get(name)
    ]
    message = report_message(
        report, console_url=settings.rag_quality_report_console_url
    )
    alerts = actionable_alerts(report, threshold=alert_threshold)
    skipped = ""
    if only_alerts and not alerts:
        skipped = "no_actionable_alerts"
    results = []
    for name in requested:
        if skipped:
            results.append(
                {"channel": name, "sent": False, "reason": skipped}
            )
            continue
        if dry_run:
            results.append(
                {"channel": name, "sent": False, "reason": "dry_run"}
            )
            continue
        try:
            if name == "slack":
                _send_slack(
                    settings.rag_quality_report_slack_webhook,
                    message["slack"],
                )
            else:
                _send_email(
                    settings, message["subject"], message["text"]
                )
            results.append({"channel": name, "sent": True, "reason": ""})
        except Exception as exc:  # noqa: BLE001 - report delivery is best effort
            LOGGER.warning("quality report delivery failed: %s", name)
            results.append(
                {
                    "channel": name,
                    "sent": False,
                    "reason": type(exc).__name__,
                }
            )
    return {
        "subject": message["subject"],
        "channels_configured": [
            name for name, ready in enabled.items() if ready
        ],
        "results": results,
        "actionable_alerts": len(alerts),
        "skipped": skipped,
    }
