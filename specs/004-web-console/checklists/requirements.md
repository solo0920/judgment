# Specification Quality Checklist: Web 主控台與查詢報表

**Purpose**: Verify that the specification matches the current implementation and contains no stale or contradictory requirements
**Created**: 2026-11-06
**Updated**: 2026-11-15
**Feature**: [spec.md](../spec.md)

## Code Alignment

- [x] `Source of Truth` states that current code wins over stale prose.
- [x] `Implementation Map` lists all eight routes and their frontend/backend modules.
- [x] All current `#/status` categories are documented: 服務總覽、系統測試、系統資料使用、Model Provider、前後端架構、資料版本、API 端點、最近下載.
- [x] Service overview load pipeline, architecture SVG, data version cards and dynamic API endpoint catalog are covered.
- [x] Processing overview, judgment import, index versions, law/order index timelines and download timelines match current UI behavior.
- [x] Homepage live summary (`/api/home`), 99-law 11-column checklist, RAG capability/provenance and homepage pipeline waterfall match current UI/API behavior.
- [x] P0 security controls are documented: explicit CORS, admin-token middleware, SSE ticket, Ollama SSRF allowlist, loopback-only Docker ports, PostgreSQL/Qdrant credentials and `.env`/log permissions.
- [x] RAG, reranker, test mode, question bank, benchmark, settings sidebar and standalone frontend behavior are covered.
- [x] SSE topics, IndexedDB stores, SQLite state/event journal and current deployment scripts are documented.
- [x] Current data/UI snapshot records today's counts and marks API responses as authoritative when values change.

## Requirement Completeness

- [x] No `[NEEDS CLARIFICATION]` markers remain.
- [x] Requirements are testable against the current UI or API.
- [x] Success criteria are measurable and use current route/component names.
- [x] Acceptance scenarios cover all primary pages and both light/dark themes.
- [x] Edge cases cover missing services, unsupported browser storage, empty results and SSE reconnects.
- [x] Scope boundaries identify read-only query surfaces and write-capable admin surfaces.
- [x] Legacy or removed UI requirements are not retained as MUST.

## Implementation Detail Policy

- [x] Current code paths, endpoints, component classes and storage names are allowed because this specification is explicitly code-aligned.
- [x] All implementation details reflect the current repository, not an earlier design.
- [x] Any future code change that alters routes, APIs, workflows or visible behavior must update this specification in the same change.

## Notes

- The specification intentionally references concrete modules and CSS classes so implementation and acceptance tests use the same vocabulary.
- Data counts are time-sensitive; the current snapshot is dated and API responses remain authoritative.
- `pipeline-waterfall.md` remains the canonical component contract for all timeline waterfall views.
