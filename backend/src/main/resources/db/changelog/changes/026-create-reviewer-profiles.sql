-- liquibase formatted sql
-- changeset heygoodly:026-create-reviewer-profiles

-- 1. Create reusable reviewer_profiles directory table
CREATE TABLE IF NOT EXISTS reviewer_profiles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    avatar_url VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_lower_name
    ON reviewer_profiles(LOWER(name));

-- 2. Optional link column on store_reviews (no JPA relationship annotation)
ALTER TABLE store_reviews
    ADD COLUMN IF NOT EXISTS reviewer_profile_id BIGINT REFERENCES reviewer_profiles(id) ON DELETE SET NULL;

-- 3. Backfill existing custom reviewers from store_reviews
INSERT INTO reviewer_profiles (name, avatar_url, is_verified, created_by)
SELECT DISTINCT ON (LOWER(TRIM(reviewer_name)))
    TRIM(reviewer_name),
    NULLIF(TRIM(reviewer_avatar), ''),
    is_verified,
    'system'
FROM store_reviews
WHERE is_deleted = false
  AND TRIM(reviewer_name) <> ''
  AND LOWER(TRIM(reviewer_name)) <> 'verified shopper'
ORDER BY LOWER(TRIM(reviewer_name)), id DESC
ON CONFLICT (name) DO NOTHING;

UPDATE store_reviews sr
SET reviewer_profile_id = rp.id
FROM reviewer_profiles rp
WHERE sr.reviewer_profile_id IS NULL
  AND LOWER(TRIM(sr.reviewer_name)) = LOWER(rp.name);
