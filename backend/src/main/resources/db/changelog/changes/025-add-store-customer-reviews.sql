-- liquibase formatted sql
-- changeset heygoodly:025-add-store-customer-reviews

-- 1. Add custom rating breakdown percentages (5..1 star) JSONB column to stores
ALTER TABLE stores
    ADD COLUMN IF NOT EXISTS rating_breakdown JSONB;

-- 2. Create store_reviews table for customizable, database-backed customer reviews per store
CREATE TABLE IF NOT EXISTS store_reviews (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(120) NOT NULL,
    reviewer_avatar VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT true,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    review_date_label VARCHAR(80),
    comment TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_store_reviews_store_id
    ON store_reviews(store_id, is_deleted, is_active, sort_order, id);
