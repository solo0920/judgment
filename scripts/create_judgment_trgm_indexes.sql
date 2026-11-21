-- Trigram indexes for the judgment keyword filter.
--
-- The API searches these five columns with ILIKE '%term%' in
-- src/judgment/web/query.py (TABLE_SEARCH_COLUMNS). The unique btree on jid
-- and the low-cardinality btree on court cannot serve a leading wildcard.
--
-- Run outside a transaction (CREATE INDEX CONCURRENTLY), e.g.:
--   docker exec -i judgment-postgres psql -U judgment -d judgment \
--     -v ON_ERROR_STOP=1 < scripts/create_judgment_trgm_indexes.sql
--
-- These indexes target the search columns, not full_text. A full-text trigram
-- index is intentionally excluded: the keyword filter does not read full_text,
-- and the earlier benchmark estimated a very large index for that column.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

SET maintenance_work_mem = '1GB';
SET max_parallel_maintenance_workers = 2;

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_judgment_documents_jid_trgm
    ON public.judgment_documents USING GIN (jid gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_judgment_documents_court_trgm
    ON public.judgment_documents USING GIN (court gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_judgment_documents_court_normalized_trgm
    ON public.judgment_documents USING GIN (court_normalized gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_judgment_documents_title_trgm
    ON public.judgment_documents USING GIN (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_judgment_documents_matched_laws_text_trgm
    ON public.judgment_documents USING GIN (matched_laws_text gin_trgm_ops);

ANALYZE public.judgment_documents;
