-- Enable required PostgreSQL extensions for Ratlist.gg
-- Run this in Supabase SQL Editor with appropriate permissions

-- Extension 1: pg_trgm (Trigram matching for fuzzy text search)
-- Used for: Fuzzy player name searching (typo-tolerant)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Extension 2: pgcrypto (Cryptographic functions)
-- Used for: UUID generation with gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify extensions are enabled
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pg_trgm', 'pgcrypto');
