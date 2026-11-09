from __future__ import annotations

from typing import Any, Callable, Dict, Iterator, List, Optional, Sequence

import httpx


class QdrantError(RuntimeError):
    """Raised when Qdrant cannot satisfy a request."""


class QdrantStore:
    def __init__(
        self,
        base_url: str,
        *,
        api_key: str = "",
        timeout: float = 30.0,
    ) -> None:
        self.base_url = str(base_url or "").rstrip("/")
        self.api_key = str(api_key or "")
        self.timeout = float(timeout)

    @property
    def configured(self) -> bool:
        return bool(self.base_url)

    def _headers(self) -> Dict[str, str]:
        return {"api-key": self.api_key} if self.api_key else {}

    def _request(
        self,
        method: str,
        path: str,
        *,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        timeout: Optional[float] = None,
    ) -> Dict[str, Any]:
        if not self.configured:
            raise QdrantError("QDRANT_URL 未設定")
        try:
            response = httpx.request(
                method,
                f"{self.base_url}{path}",
                json=json,
                params=params,
                headers=self._headers(),
                timeout=timeout or self.timeout,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text[:400]
            raise QdrantError(
                f"Qdrant HTTP {exc.response.status_code}: {detail}"
            ) from exc
        except Exception as exc:
            raise QdrantError(
                f"Qdrant 無法連線：{exc.__class__.__name__}: {exc}"
            ) from exc

    def health(self) -> Dict[str, Any]:
        return self._request("GET", "/collections", timeout=5.0)

    def list_collections(self) -> List[str]:
        payload = self.health()
        return [str(item.get("name")) for item in payload.get("result", {}).get("collections", [])]

    def collection_info(self, collection: str) -> Optional[Dict[str, Any]]:
        if not collection:
            raise QdrantError("collection 不可為空")
        try:
            payload = self._request("GET", f"/collections/{collection}", timeout=10.0)
        except QdrantError as exc:
            if "HTTP 404" in str(exc):
                return None
            raise
        return payload.get("result") or {}

    def collection_count(self, collection: str) -> Optional[int]:
        info = self.collection_info(collection)
        if info is None:
            return None
        count = info.get("points_count")
        if count is None:
            return None
        return int(count)

    def exact_count(self, collection: str) -> int:
        payload = self._request(
            "POST",
            f"/collections/{collection}/points/count",
            json={"exact": True},
            timeout=max(self.timeout, 60.0),
        )
        return int((payload.get("result") or {}).get("count") or 0)

    def collection_dimension(self, collection: str) -> Optional[int]:
        info = self.collection_info(collection)
        if info is None:
            return None
        vectors = (
            ((info.get("config") or {}).get("params") or {}).get("vectors") or {}
        )
        size = vectors.get("size") if isinstance(vectors, dict) else None
        try:
            return int(size) if size is not None else None
        except (TypeError, ValueError):
            return None

    def list_aliases(self) -> List[Dict[str, str]]:
        payload = self._request("GET", "/aliases", timeout=5.0)
        return [
            {
                "alias_name": str(item.get("alias_name") or ""),
                "collection_name": str(item.get("collection_name") or ""),
            }
            for item in (payload.get("result") or {}).get("aliases") or []
            if isinstance(item, dict)
        ]

    def get_alias(self, alias: str) -> Optional[str]:
        for item in self.list_aliases():
            if item.get("alias_name") == alias:
                return item.get("collection_name") or None
        return None

    def switch_alias(self, alias: str, collection: str) -> None:
        if not alias or not collection:
            raise QdrantError("alias 與 collection 不可為空")
        current = self.get_alias(alias)
        if current == collection:
            return
        actions: List[Dict[str, Any]] = []
        if current:
            actions.append({"delete_alias": {"alias_name": alias}})
        actions.append(
            {
                "create_alias": {
                    "collection_name": collection,
                    "alias_name": alias,
                }
            }
        )
        self._request(
            "POST",
            "/collections/aliases",
            json={"actions": actions},
            timeout=max(self.timeout, 30.0),
        )

    def delete_alias(self, alias: str) -> None:
        if not alias:
            return
        if self.get_alias(alias) is None:
            return
        self._request(
            "POST",
            "/collections/aliases",
            json={"actions": [{"delete_alias": {"alias_name": alias}}]},
            timeout=max(self.timeout, 30.0),
        )

    def scroll_points(
        self,
        collection: str,
        *,
        batch_size: int = 256,
        with_payload: bool = True,
        with_vector: bool = True,
    ) -> Iterator[List[Dict[str, Any]]]:
        offset: Any = None
        while True:
            body: Dict[str, Any] = {
                "limit": max(1, int(batch_size)),
                "with_payload": bool(with_payload),
                "with_vector": bool(with_vector),
            }
            if offset is not None:
                body["offset"] = offset
            payload = self._request(
                "POST",
                f"/collections/{collection}/points/scroll",
                json=body,
                timeout=max(self.timeout, 120.0),
            )
            result = payload.get("result") or {}
            points = [item for item in result.get("points") or [] if isinstance(item, dict)]
            if points:
                yield points
            offset = result.get("next_page_offset")
            if offset is None:
                break

    def copy_collection(
        self,
        source: str,
        target: str,
        *,
        batch_size: int = 256,
        on_progress: Optional[Callable[[int, int], None]] = None,
    ) -> int:
        if not source or not target or source == target:
            return 0
        dimension = self.collection_dimension(source)
        if dimension is None:
            raise QdrantError(f"無法讀取來源 collection 維度：{source}")
        info = self.collection_info(source) or {}
        total = int(info.get("points_count") or 0)
        self.ensure_collection(target, size=dimension)
        copied = 0
        for points in self.scroll_points(source, batch_size=batch_size):
            body = [
                {
                    "id": point.get("id"),
                    "vector": point.get("vector"),
                    "payload": point.get("payload") or {},
                }
                for point in points
                if point.get("id") is not None
            ]
            if body:
                self.upsert(target, body)
                copied += len(body)
                if on_progress is not None:
                    on_progress(copied, total)
        return copied

    def delete_points(
        self,
        collection: str,
        point_ids: Sequence[str],
        *,
        wait: bool = True,
        batch_size: int = 512,
    ) -> int:
        deleted = 0
        ids = [str(point_id) for point_id in point_ids if point_id]
        for start in range(0, len(ids), max(1, int(batch_size))):
            batch = ids[start : start + batch_size]
            if not batch:
                continue
            self._request(
                "POST",
                f"/collections/{collection}/points/delete",
                params={"wait": "true" if wait else "false"},
                json={"points": batch},
                timeout=max(self.timeout, 120.0),
            )
            deleted += len(batch)
        return deleted

    def retrieve_points(
        self,
        collection: str,
        point_ids: Sequence[str],
        *,
        with_payload: bool = True,
        with_vector: bool = False,
    ) -> List[Dict[str, Any]]:
        ids = [str(point_id) for point_id in point_ids if point_id]
        if not ids:
            return []
        payload = self._request(
            "POST",
            f"/collections/{collection}/points",
            json={
                "ids": ids,
                "with_payload": bool(with_payload),
                "with_vector": bool(with_vector),
            },
            timeout=max(self.timeout, 60.0),
        )
        return [
            item
            for item in payload.get("result") or []
            if isinstance(item, dict)
        ]

    def ensure_collection(
        self,
        collection: str,
        *,
        size: int,
        distance: str = "Cosine",
    ) -> bool:
        info = self.collection_info(collection)
        if info is not None:
            configured_size = (
                ((info.get("config") or {}).get("params") or {})
                .get("vectors", {})
                .get("size")
            )
            if configured_size is not None and int(configured_size) != int(size):
                raise QdrantError(
                    f"Collection {collection} 向量維度為 {configured_size}，"
                    f"與目前模型維度 {size} 不一致；請使用 --recreate。"
                )
            return False
        self._request(
            "PUT",
            f"/collections/{collection}",
            json={"vectors": {"size": int(size), "distance": distance}},
        )
        return True

    def ensure_payload_index(
        self,
        collection: str,
        field_name: str,
        field_schema: str = "keyword",
    ) -> None:
        self._request(
            "PUT",
            f"/collections/{collection}/index",
            params={"wait": "true"},
            json={"field_name": field_name, "field_schema": field_schema},
        )

    def delete_collection(self, collection: str) -> None:
        try:
            self._request("DELETE", f"/collections/{collection}")
        except QdrantError as exc:
            if "HTTP 404" not in str(exc):
                raise

    def upsert(
        self,
        collection: str,
        points: Sequence[Dict[str, Any]],
        *,
        wait: bool = True,
    ) -> None:
        if not points:
            return
        self._request(
            "PUT",
            f"/collections/{collection}/points",
            params={"wait": "true" if wait else "false"},
            json={"points": list(points)},
            timeout=max(self.timeout, 120.0),
        )

    def search(
        self,
        collection: str,
        vector: Sequence[float],
        *,
        limit: int = 10,
        offset: int = 0,
        score_threshold: Optional[float] = None,
        query_filter: Optional[Dict[str, Any]] = None,
        with_payload: bool = True,
    ) -> List[Dict[str, Any]]:
        body: Dict[str, Any] = {
            "vector": [float(value) for value in vector],
            "limit": max(1, int(limit)),
            "with_payload": bool(with_payload),
        }
        if offset:
            body["offset"] = max(0, int(offset))
        if score_threshold is not None:
            body["score_threshold"] = float(score_threshold)
        if query_filter:
            body["filter"] = query_filter
        payload = self._request(
            "POST",
            f"/collections/{collection}/points/search",
            json=body,
            timeout=max(self.timeout, 60.0),
        )
        return list(payload.get("result") or [])
