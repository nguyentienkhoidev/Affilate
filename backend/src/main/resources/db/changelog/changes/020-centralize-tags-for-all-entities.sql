--liquibase formatted sql
--changeset khoinguyen:020-centralize-tags-for-all-entities
--description: Add tags to stores and offers, create centralized entity_tags table, and populate mappings

-- 1. Add tags column to stores and offers
ALTER TABLE stores ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS tags JSONB;

-- 2. Create polymorphic junction table for centralized entity tagging
CREATE TABLE IF NOT EXISTS entity_tags (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL, -- 'POST', 'STORE', 'OFFER', 'MEDIA'
    entity_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_entity_tags UNIQUE (entity_type, entity_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_tags_tag ON entity_tags(tag_id, entity_type);

-- 3. Seed tags for existing stores based on their category and name
UPDATE stores SET tags = '["Tech & Gadgets", "Accessories", "Anker Innovation"]'::jsonb 
WHERE LOWER(slug) LIKE '%anker%' AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE stores SET tags = '["Tech & Gadgets", "Apple Ecosystem", "Brand Partners"]'::jsonb 
WHERE LOWER(slug) LIKE '%apple%' AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE stores SET tags = '["Lifestyle & Daily", "Brand Partners"]'::jsonb 
WHERE LOWER(slug) LIKE '%nike%' AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE stores SET tags = '["Tech & Gadgets", "Smart Home & IoT", "Brand Partners"]'::jsonb 
WHERE LOWER(slug) LIKE '%samsung%' AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE stores SET tags = '["Audio & Acoustics", "Brand Partners"]'::jsonb 
WHERE LOWER(slug) LIKE '%sony%' OR LOWER(slug) LIKE '%bose%' AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE stores SET tags = '["Deals & Coupons", "Tech & Gadgets"]'::jsonb 
WHERE (tags IS NULL OR tags = '[]'::jsonb);

-- 4. Seed tags for existing offers based on store and discount
UPDATE offers SET tags = '["Deals & Coupons", "Tech & Gadgets"]'::jsonb 
WHERE tags IS NULL OR tags = '[]'::jsonb;

-- 5. Backfill entity_tags for all entities
-- 5a. Posts
INSERT INTO entity_tags (entity_type, entity_id, tag_id)
SELECT DISTINCT 'POST', p.id, t.id
FROM posts p, jsonb_array_elements_text(p.tags) raw_tag
JOIN tags t ON LOWER(t.slug) = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(raw_tag), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
   OR LOWER(TRIM(t.name)) = LOWER(TRIM(raw_tag))
WHERE p.is_deleted = false AND p.tags IS NOT NULL
ON CONFLICT (entity_type, entity_id, tag_id) DO NOTHING;

-- 5b. Media Items
INSERT INTO entity_tags (entity_type, entity_id, tag_id)
SELECT DISTINCT 'MEDIA', m.id, t.id
FROM media_items m, jsonb_array_elements_text(m.tags) raw_tag
JOIN tags t ON LOWER(t.slug) = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(raw_tag), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
   OR LOWER(TRIM(t.name)) = LOWER(TRIM(raw_tag))
WHERE m.tags IS NOT NULL
ON CONFLICT (entity_type, entity_id, tag_id) DO NOTHING;

-- 5c. Stores
INSERT INTO entity_tags (entity_type, entity_id, tag_id)
SELECT DISTINCT 'STORE', s.id, t.id
FROM stores s, jsonb_array_elements_text(s.tags) raw_tag
JOIN tags t ON LOWER(t.slug) = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(raw_tag), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
   OR LOWER(TRIM(t.name)) = LOWER(TRIM(raw_tag))
WHERE s.is_deleted = false AND s.tags IS NOT NULL
ON CONFLICT (entity_type, entity_id, tag_id) DO NOTHING;

-- 5d. Offers
INSERT INTO entity_tags (entity_type, entity_id, tag_id)
SELECT DISTINCT 'OFFER', o.id, t.id
FROM offers o, jsonb_array_elements_text(o.tags) raw_tag
JOIN tags t ON LOWER(t.slug) = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(raw_tag), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
   OR LOWER(TRIM(t.name)) = LOWER(TRIM(raw_tag))
WHERE o.is_deleted = false AND o.tags IS NOT NULL
ON CONFLICT (entity_type, entity_id, tag_id) DO NOTHING;

