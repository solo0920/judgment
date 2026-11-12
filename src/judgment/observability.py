from __future__ import annotations

import contextvars
import functools
import inspect
import json
import logging
import os
import time
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, Iterator, List, Optional
from uuid import uuid4

from sqlalchemy import delete, select

from .models import PerformanceRecord

logger = logging.getLogger(__name__)
_write_count = 0
_current_flow: contextvars.ContextVar[Optional["FlowTrace"]] = contextvars.ContextVar(
    "judgment_performance_flow", default=None
)

MAX_FLOW_SEGMENTS = 500


def _json_safe(value: Any) -> Any:
    try:
        return json.loads(json.dumps(value or {}, ensure_ascii=False, default=str))
    except (TypeError, ValueError):
        return {}


def _trim_json(value: Any, depth: int = 0) -> Any:
    """Keep flow payloads bounded; this is metadata, not a data store."""
    if depth > 5:
        return "…"
    if isinstance(value, str):
        return value if len(value) <= 4000 else f"{value[:3997]}…"
    if value is None or isinstance(value, (bool, int, float)):
        return value
    if isinstance(value, dict):
        items = list(value.items())[:40]
        return {
            str(key)[:100]: _trim_json(item, depth + 1)
            for key, item in items
        }
    if isinstance(value, (list, tuple, set)):
        return [_trim_json(item, depth + 1) for item in list(value)[:40]]
    return {"_type": type(value).__name__, "_repr": repr(value)[:200]}


def _safe_params(params: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not isinstance(params, dict):
        return {}
    return _json_safe(_trim_json(params))


def _summarize_value(value: Any) -> Any:
    if value is None or isinstance(value, (bool, int, float)):
        return value
    if isinstance(value, str):
        return value if len(value) <= 120 else f"{value[:117]}…"
    if isinstance(value, dict):
        keys = [str(key) for key in list(value.keys())[:12]]
        return {"_type": "dict", "size": len(value), "keys": keys}
    if isinstance(value, (list, tuple, set)):
        return {"_type": type(value).__name__, "size": len(value)}
    return {"_type": type(value).__name__}


def _auto_params(func: Callable[..., Any], args: tuple, kwargs: dict) -> Dict[str, Any]:
    try:
        bound = inspect.signature(func).bind_partial(*args, **kwargs)
    except (TypeError, ValueError):
        return {}
    params: Dict[str, Any] = {}
    for name, value in bound.arguments.items():
        if name in {"self", "cls"}:
            continue
        params[name] = _summarize_value(value)
    return params


def _extract_models(params: Any) -> List[str]:
    models: List[str] = []
    if not isinstance(params, dict):
        return models
    for key in ("model", "embedding_model", "llm_model", "model_name"):
        value = params.get(key)
        if isinstance(value, str) and value.strip():
            models.append(value.strip())
    nested = params.get("models")
    if isinstance(nested, (list, tuple)):
        models.extend(
            str(value).strip()
            for value in nested
            if str(value).strip()
        )
    return models


def summarize_flow(
    segments: List[Dict[str, Any]],
    *,
    client: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    by_name: Dict[str, Dict[str, Any]] = {}
    by_module: Dict[str, Dict[str, Any]] = {}
    models: List[str] = []
    slowest: Optional[Dict[str, Any]] = None

    for segment in segments:
        name = str(segment.get("name") or "unnamed")
        module = str(segment.get("module") or "unknown")
        duration = float(segment.get("duration_ms") or 0)
        bucket = by_name.setdefault(
            name, {"count": 0, "total_ms": 0.0, "max_ms": 0.0}
        )
        bucket["count"] += 1
        bucket["total_ms"] += duration
        bucket["max_ms"] = max(bucket["max_ms"], duration)
        module_bucket = by_module.setdefault(
            module, {"count": 0, "total_ms": 0.0, "max_ms": 0.0}
        )
        module_bucket["count"] += 1
        module_bucket["total_ms"] += duration
        module_bucket["max_ms"] = max(module_bucket["max_ms"], duration)

        for model in _extract_models(segment.get("params")):
            if model not in models:
                models.append(model)
        for model in (segment.get("metadata") or {}).get("models") or []:
            model = str(model).strip()
            if model and model not in models:
                models.append(model)

        if slowest is None or duration > float(slowest.get("duration_ms") or 0):
            slowest = {
                "seq": segment.get("seq"),
                "name": name,
                "module": module,
                "function": segment.get("function"),
                "duration_ms": round(duration, 2),
            }

    for bucket in by_name.values():
        bucket["total_ms"] = round(bucket["total_ms"], 2)
        bucket["avg_ms"] = round(
            bucket["total_ms"] / bucket["count"], 2
        ) if bucket["count"] else 0
        bucket["max_ms"] = round(bucket["max_ms"], 2)
    for bucket in by_module.values():
        bucket["total_ms"] = round(bucket["total_ms"], 2)
        bucket["avg_ms"] = round(
            bucket["total_ms"] / bucket["count"], 2
        ) if bucket["count"] else 0
        bucket["max_ms"] = round(bucket["max_ms"], 2)

    result = {
        "segment_count": len(segments),
        "modules": sorted(by_module),
        "functions": sorted(
            {
                str(segment.get("function"))
                for segment in segments
                if segment.get("function")
            }
        ),
        "models": sorted(models),
        "by_name": by_name,
        "by_module": by_module,
        "slowest": slowest,
    }
    if client:
        result["client"] = client
    return result


class FlowTrace:
    """One request-scoped flow: root timing plus nested function segments."""

    def __init__(
        self,
        *,
        request_id: Optional[str] = None,
        entrypoint: str = "",
        method: str = "",
        path: str = "",
        params: Optional[Dict[str, Any]] = None,
        client_started_at_ms: Optional[float] = None,
        listener: Optional[Callable[[Dict[str, Any]], None]] = None,
    ) -> None:
        self.request_id = (request_id or uuid4().hex)[:64]
        self.entrypoint = str(entrypoint or "")[:300]
        self.method = str(method or "")[:16]
        self.path = str(path or "")
        self.params = _safe_params(params)
        self.started_at = datetime.now(timezone.utc)
        self.finished_at: Optional[datetime] = None
        self._started = time.perf_counter()
        self._seq = 0
        self._stack: List[int] = []
        self._segments: List[Dict[str, Any]] = []
        self.metadata: Dict[str, Any] = {}
        self.status = "success"
        self.error_message: Optional[str] = None
        self.client: Optional[Dict[str, Any]] = None
        self.listener = listener
        if client_started_at_ms:
            received_at_ms = time.time() * 1000
            self.client = {
                "started_at_ms": round(float(client_started_at_ms), 2),
                "received_at": self.started_at.isoformat(),
                "request_ms": round(
                    max(0.0, received_at_ms - float(client_started_at_ms)), 2
                ),
                "source": "header",
            }

    @property
    def segments(self) -> List[Dict[str, Any]]:
        return self._segments

    def set_metadata(self, key: str, value: Any) -> None:
        self.metadata[str(key)] = _trim_json(value)

    def _notify(self, event: Dict[str, Any]) -> None:
        listener = self.listener
        if listener is None:
            return
        try:
            listener(event)
        except Exception:
            logger.warning("flow listener failed", exc_info=True)

    def _begin_segment(
        self,
        name: str,
        *,
        module: str = "",
        function: str = "",
        params: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        if len(self._segments) >= MAX_FLOW_SEGMENTS:
            return None
        self._seq += 1
        now = time.perf_counter()
        segment = {
            "seq": self._seq,
            "parent_seq": self._stack[-1] if self._stack else None,
            "depth": len(self._stack),
            "name": str(name or "unnamed")[:200],
            "module": str(module or "")[:300],
            "function": str(function or "")[:300],
            "params": _safe_params(params),
            "param_names": sorted(str(key) for key in params.keys())
            if isinstance(params, dict)
            else [],
            "started_at": datetime.now(timezone.utc).isoformat(),
            "offset_ms": round(max(0.0, now - self._started) * 1000, 2),
            "duration_ms": 0.0,
            "status": "ok",
            "error": None,
            "metadata": _safe_params(metadata),
        }
        self._segments.append(segment)
        self._stack.append(self._seq)
        self._notify(
            {
                "type": "segment_start",
                "segment": dict(segment),
            }
        )
        return segment

    def _end_segment(
        self,
        segment: Optional[Dict[str, Any]],
        *,
        error: Optional[BaseException] = None,
    ) -> None:
        if segment is None:
            return
        segment["duration_ms"] = round(
            max(
                0.0,
                (time.perf_counter() - self._started) * 1000
                - float(segment.get("offset_ms") or 0),
            ),
            2,
        )
        finish_offset = round(
            float(segment.get("offset_ms") or 0)
            + float(segment.get("duration_ms") or 0),
            2,
        )
        segment["finished_at"] = datetime.now(timezone.utc).isoformat()
        segment["end_offset_ms"] = finish_offset
        if error is not None:
            segment["status"] = "error"
            segment["error"] = f"{error.__class__.__name__}: {error}"[:1000]
        try:
            self._stack.remove(segment["seq"])
        except ValueError:
            pass
        self._notify(
            {
                "type": "segment_end",
                "segment": dict(segment),
            }
        )

    @contextmanager
    def segment(
        self,
        name: str,
        *,
        module: str = "",
        function: str = "",
        params: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Iterator[Optional[Dict[str, Any]]]:
        segment = self._begin_segment(
            name,
            module=module,
            function=function,
            params=params,
            metadata=metadata,
        )
        try:
            yield segment
        except Exception as exc:
            self._end_segment(segment, error=exc)
            raise
        else:
            self._end_segment(segment)

    def finish(
        self,
        *,
        status: str = "success",
        error_message: Optional[str] = None,
    ) -> Dict[str, Any]:
        self.finished_at = datetime.now(timezone.utc)
        self.status = str(status or "success")[:16]
        self.error_message = str(error_message)[:4000] if error_message else None
        return self.to_dict()

    def to_dict(self) -> Dict[str, Any]:
        total_ms = round(max(0.0, time.perf_counter() - self._started) * 1000, 2)
        if self.finished_at is not None:
            total_ms = round(
                max(
                    0.0,
                    (
                        self.finished_at - self.started_at
                    ).total_seconds()
                    * 1000,
                ),
                2,
            )
        flow = {
            "version": 1,
            "request_id": self.request_id,
            "entrypoint": self.entrypoint,
            "method": self.method,
            "path": self.path,
            "started_at": self.started_at.isoformat(),
            "finished_at": (
                self.finished_at.isoformat()
                if self.finished_at is not None
                else None
            ),
            "total_ms": total_ms,
            "status": self.status,
            "params": self.params,
            "metadata": self.metadata,
            "client": self.client,
            "summary": summarize_flow(self._segments, client=self.client),
            "segments": self._segments,
        }
        if self.error_message:
            flow["error_message"] = self.error_message
        return flow


def start_flow(
    *,
    request_id: Optional[str] = None,
    entrypoint: str = "",
    method: str = "",
    path: str = "",
    params: Optional[Dict[str, Any]] = None,
    client_started_at_ms: Optional[float] = None,
    listener: Optional[Callable[[Dict[str, Any]], None]] = None,
) -> FlowTrace:
    flow = FlowTrace(
        request_id=request_id,
        entrypoint=entrypoint,
        method=method,
        path=path,
        params=params,
        client_started_at_ms=client_started_at_ms,
        listener=listener,
    )
    _current_flow.set(flow)
    return flow


def current_flow() -> Optional[FlowTrace]:
    return _current_flow.get()


def clear_flow() -> None:
    _current_flow.set(None)


@contextmanager
def trace_segment(
    name: str,
    *,
    module: str = "",
    function: str = "",
    params: Optional[Dict[str, Any]] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Iterator[Optional[Dict[str, Any]]]:
    flow = _current_flow.get()
    if flow is None:
        yield None
        return
    with flow.segment(
        name,
        module=module,
        function=function,
        params=params,
        metadata=metadata,
    ) as segment:
        yield segment


def traced(
    name: str,
    *,
    module: Optional[str] = None,
    params_fn: Optional[Callable[..., Dict[str, Any]]] = None,
):
    """Decorate a sync function so each call becomes a flow segment."""

    def decorator(func: Callable[..., Any]):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            flow = _current_flow.get()
            if flow is None:
                return func(*args, **kwargs)
            if params_fn is not None:
                try:
                    params = params_fn(*args, **kwargs) or {}
                except Exception:
                    params = {}
            else:
                params = _auto_params(func, args, kwargs)
            with flow.segment(
                name,
                module=module or func.__module__,
                function=func.__qualname__,
                params=params,
            ):
                return func(*args, **kwargs)

        return wrapper

    return decorator


def record_client_timing(
    session_factory,
    *,
    request_id: str,
    route: str = "",
    total_ms: int = 0,
    render_ms: int = 0,
    status: str = "success",
) -> bool:
    """Merge browser-side timing into the flow created by the middleware."""
    if session_factory is None or not request_id:
        return False
    try:
        with session_factory() as session:
            record = session.scalars(
                select(PerformanceRecord)
                .where(PerformanceRecord.request_id == request_id)
                .order_by(PerformanceRecord.id.desc())
                .limit(1)
            ).first()
            if record is None:
                return False
            flow = dict(record.flow or {})
            segments = [
                dict(segment)
                for segment in (flow.get("segments") or [])
                if isinstance(segment, dict)
            ]
            segments = [
                segment
                for segment in segments
                if segment.get("name") != "client.render"
            ]
            seq = max(
                [int(segment.get("seq") or 0) for segment in segments] + [0]
            ) + 1
            client = dict(flow.get("client") or {})
            client.update(
                {
                    "route": str(route or "")[:300],
                    "total_ms": max(0, int(total_ms or 0)),
                    "render_ms": max(0, int(render_ms or 0)),
                    "reported_at": datetime.now(timezone.utc).isoformat(),
                    "status": str(status or "success")[:16],
                }
            )
            segments.append(
                {
                    "seq": seq,
                    "parent_seq": None,
                    "depth": 0,
                    "name": "client.render",
                    "module": "judgment.web.static",
                    "function": "render",
                    "params": {
                        "route": str(route or "")[:300],
                        "total_ms": max(0, int(total_ms or 0)),
                        "render_ms": max(0, int(render_ms or 0)),
                    },
                    "param_names": ["render_ms", "route", "total_ms"],
                    "started_at": datetime.now(timezone.utc).isoformat(),
                    "finished_at": datetime.now(timezone.utc).isoformat(),
                    "offset_ms": max(
                        0, int(total_ms or 0) - int(render_ms or 0)
                    ),
                    "end_offset_ms": max(0, int(total_ms or 0)),
                    "duration_ms": max(0, int(render_ms or 0)),
                    "status": "ok",
                    "error": None,
                    "metadata": {"phase": "client"},
                }
            )
            flow["segments"] = segments
            flow["client"] = client
            flow["summary"] = summarize_flow(segments, client=client)
            record.flow = flow
            session.commit()
            return True
    except Exception as exc:  # pragma: no cover - browser telemetry is best-effort
        logger.warning("failed to merge client timing: %s", exc)
        return False


def _summary_flow(
    *,
    request_id: str,
    process: str,
    module: str,
    method: str,
    path: str,
    status: str,
    started_at: datetime,
    finished_at: datetime,
    duration_ms: int,
    params: Optional[Dict[str, Any]],
    details: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a one-segment flow for CLI records without instrumentation."""
    safe_params = _json_safe(params)
    safe_details = _json_safe(details)
    segment = {
        "seq": 1,
        "parent_seq": None,
        "depth": 0,
        "name": str(process or module or "process")[:200],
        "module": str(module or "")[:300],
        "function": str(module or "").rsplit(".", 1)[-1][:300],
        "params": safe_params,
        "param_names": sorted(str(key) for key in safe_params),
        "started_at": started_at.isoformat(),
        "finished_at": finished_at.isoformat(),
        "offset_ms": 0.0,
        "end_offset_ms": float(max(0, int(duration_ms or 0))),
        "duration_ms": float(max(0, int(duration_ms or 0))),
        "status": "error"
        if str(status or "").lower() in {"failed", "error"}
        else "ok",
        "error": str(error_message)[:1000] if error_message else None,
        "metadata": {"source": "summary"},
    }
    return {
        "version": 1,
        "request_id": request_id,
        "entrypoint": str(process or "")[:300],
        "method": str(method or "")[:16],
        "path": str(path or ""),
        "started_at": started_at.isoformat(),
        "finished_at": finished_at.isoformat(),
        "total_ms": float(max(0, int(duration_ms or 0))),
        "status": str(status or "success")[:16],
        "params": safe_params,
        "details": safe_details,
        "metadata": {"source": "summary"},
        "client": None,
        "summary": summarize_flow([segment]),
        "segments": [segment],
    }


def record_performance(
    session_factory,
    *,
    process: str,
    module: str,
    status: str = "success",
    started_at: Optional[datetime] = None,
    finished_at: Optional[datetime] = None,
    duration_ms: int = 0,
    method: str = "",
    path: str = "",
    status_code: Optional[int] = None,
    request_id: Optional[str] = None,
    params: Optional[Dict[str, Any]] = None,
    details: Optional[Dict[str, Any]] = None,
    flow: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
) -> Optional[int]:
    if session_factory is None:
        return None
    started = started_at or datetime.now(timezone.utc)
    finished = finished_at or datetime.now(timezone.utc)
    resolved_request_id = (request_id or uuid4().hex)[:64]
    if not flow:
        flow = _summary_flow(
            request_id=resolved_request_id,
            process=process,
            module=module,
            method=method,
            path=path,
            status=status,
            started_at=started,
            finished_at=finished,
            duration_ms=duration_ms,
            params=params,
            details=details,
            error_message=error_message,
        )
    try:
        with session_factory() as session:
            record = PerformanceRecord(
                request_id=resolved_request_id,
                process=str(process or "")[:200],
                module=str(module or "")[:300],
                method=str(method or "")[:16],
                path=str(path or ""),
                status=str(status or "success")[:16],
                status_code=int(status_code) if status_code is not None else None,
                started_at=started,
                finished_at=finished,
                duration_ms=max(0, int(duration_ms or 0)),
                params=_json_safe(params),
                details=_json_safe(details),
                flow=_json_safe(flow),
                error_message=str(error_message)[:4000] if error_message else None,
            )
            session.add(record)
            session.commit()
            session.refresh(record)
            record_id = int(record.id)

        global _write_count
        _write_count += 1
        if _write_count % 200 == 0:
            try:
                days = max(
                    90, int(os.getenv("PERFORMANCE_RETENTION_DAYS", "90"))
                )
                cutoff = datetime.now(timezone.utc) - timedelta(days=days)
                with session_factory() as session:
                    session.execute(
                        delete(PerformanceRecord).where(
                            PerformanceRecord.started_at < cutoff
                        )
                    )
                    session.commit()
            except Exception as exc:  # pragma: no cover - maintenance only
                logger.warning("failed to prune performance records: %s", exc)
        return record_id
    except Exception as exc:  # observability must never break the request
        logger.warning("failed to write performance record: %s", exc)
        return None

