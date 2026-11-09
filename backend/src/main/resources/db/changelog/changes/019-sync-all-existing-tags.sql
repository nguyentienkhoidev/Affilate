--liquibase formatted sql
--changeset khoinguyen:019-sync-all-existing-tags-into-tags-table
--description: Consolidate and sync all existing tags from posts and media_items into the central tags table

INSERT INTO tags (name, slug, color, is_featured, is_active, description, created_at, updated_at)
SELECT 
    INITCAP(TRIM(raw_tag)) AS name,
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(raw_tag), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')) AS slug,
    CASE 
      WHEN LOWER(raw_tag) IN ('tech', 'apple', 'gadgets', 'laptops') THEN '#3b82f6'
      WHEN LOWER(raw_tag) IN ('reviews', 'review', 'tested') THEN '#10b981'
      WHEN LOWER(raw_tag) IN ('deals', 'sale', 'promo') THEN '#ef4444'
      WHEN LOWER(raw_tag) IN ('audio', 'headphones') THEN '#8b5cf6'
      WHEN LOWER(raw_tag) IN ('automotive', 'headlights', 'led') THEN '#ec4899'
      WHEN LOWER(raw_tag) IN ('accessories', 'charger') THEN '#f59e0b'
      WHEN LOWER(raw_tag) IN ('smart-home', 'iot') THEN '#06b6d4'
      ELSE '#6366f1'
    END AS color,
    CASE 
      WHEN LOWER(raw_tag) IN ('tech', 'reviews', 'deals', 'apple', 'audio', 'smart-home') THEN true
      ELSE false
    END AS is_featured,
    true AS is_active,
    CONCAT('Taxonomy tag for ', INITCAP(TRIM(raw_tag))) AS description,
    NOW(),
    NOW()
FROM (
  SELECT DISTINCT jsonb_array_elements_text(p.tags) AS raw_tag FROM posts p WHERE p.tags IS NOT NULL AND p.is_deleted = false
  UNION
  SELECT DISTINCT jsonb_array_elements_text(m.tags) AS raw_tag FROM media_items m WHERE m.tags IS NOT NULL
) sub
WHERE TRIM(raw_tag) <> ''
ON CONFLICT (slug) DO NOTHING;

