# Specification Quality Checklist: 判決下載與月分下載狀態

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-10
**Updated**: 2026-11-11
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details leak into user-facing requirements
- [x] Focused on user value and business needs
- [x] Written for semi-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria describe user-observable outcomes
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- The API was originally assumed to serve only 00:00–06:00 (Asia/Taipei); on 2026-11-11 the authenticated file GET, resources, and metadata were confirmed to work off-hours, so off-hours downloads are on by default (`JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=true`) with one file at a time. Set it to `false` to restore the strict window.
- The official FilesetLists endpoint returns HTTP 405 for HEAD; the specification allows a header-only GET stream fallback. It currently ignores Range requests and returns 200, so interrupted downloads restart from zero.
- `Delete-Infor.csv` and any non-`YYYYMM`/non-archive fileset are classified as non-judgment files and excluded from the month table.
- The monthly table scope and counts are derived from the resources snapshot at run time (the current snapshot is 1996-01 through 2026-08), with green/gray/red status and future months blank.
- The default download mode is the complete month list; `--incremental` is only for quick checks.
- The month table refresh must re-scan `raw_rar`; manually downloaded files are detected without rerunning the download workflow.
- Month hover downloads use an authenticated backend proxy keyed by fileset ID; passwords and Tokens are never exposed to the browser.
- While a run is active, the current month is highlighted and the action area shows its filename, progress bar, percentage, and bytes written / total.
- Progress updates patch only the month cells and progress DOM nodes, so polling does not re-render the workflow panel or reset table scroll.
- Stale progress is hidden when the downloader process is gone or the progress file is too old.
- Delete-Infor application to existing judgments is explicitly out of scope.
