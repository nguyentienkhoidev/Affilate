-- liquibase formatted sql
-- changeset heygoodly:023-fix-post-category-and-tag-mappings runOnChange:true
-- validCheckSum: ANY
-- comment: Fix category assignments and standardize tag names for editorial articles

-- 1. Correct Category Assignments for all editorial posts by exact slugs
UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug = 'tech' LIMIT 1)
WHERE slug IN (
    'qidi-tech-review',
    'nuphy-keyboard-review',
    'best-noise-cancelling-headphones-under-100',
    'anker-prime-power-bank-review',
    'google-ai-hardware-ecosystem-review-2026',
    'neo-sabers-xenopixel-review'
);

UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug IN ('automotive-accessories', 'automotive') ORDER BY id ASC LIMIT 1)
WHERE slug IN (
    'nilight-led-light-bar-review',
    'nilight-led-light-bar-review-buying-guide',
    'auxito-led-headlight-bulbs-review',
    'youcanic-review-2026'
);

UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug IN ('lifestyle', 'lifestyle-living') ORDER BY id ASC LIMIT 1)
WHERE slug IN (
    'vesla-copper-review-2026',
    'nebuleuse-bijoux-review',
    'philly-goat-review',
    'luumun-sleep-review'
);

UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug IN ('business', 'business-economy') ORDER BY id ASC LIMIT 1)
WHERE slug IN (
    'ecommerce-growth-fintech-checkout-conversion-2026'
);

UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug IN ('us-politics', 'us-politics-global') ORDER BY id ASC LIMIT 1)
WHERE slug IN (
    'trump-tariffs-ecommerce-consumer-goods-impact-2026'
);

-- 2. Standardize tags jsonb on posts to match centralized tag names
UPDATE posts 
SET tags = '["Anker Innovation", "Audio & Acoustics", "Tech & Gadgets", "Consumer Tech", "Headphones"]'::jsonb
WHERE slug = 'best-noise-cancelling-headphones-under-100';

UPDATE posts 
SET tags = '["Anker Innovation", "Fast Charging", "GaN", "Tech & Gadgets", "Consumer Tech", "Deals & Coupons"]'::jsonb
WHERE slug = 'anker-prime-power-bank-review';

UPDATE posts 
SET tags = '["Automotive & EV", "Diagnostic Scanners", "Tech & Gadgets", "Reviews"]'::jsonb
WHERE slug = 'youcanic-review-2026';

UPDATE posts 
SET tags = '["Automotive & EV", "Off-Road", "LED Lights", "Deals & Coupons"]'::jsonb
WHERE slug IN ('nilight-led-light-bar-review', 'nilight-led-light-bar-review-buying-guide');

UPDATE posts 
SET tags = '["Automotive & EV", "Auxito", "LED Headlights", "Safety", "Deals & Coupons"]'::jsonb
WHERE slug = 'auxito-led-headlight-bulbs-review';

UPDATE posts 
SET tags = '["3D Printing", "Tech & Gadgets", "Hardware", "Smart Home & IoT"]'::jsonb
WHERE slug = 'qidi-tech-review';

UPDATE posts 
SET tags = '["Keyboards", "Mechanical Keyboards", "Tech & Gadgets", "Consumer Tech"]'::jsonb
WHERE slug = 'nuphy-keyboard-review';

UPDATE posts 
SET tags = '["Smart Home & IoT", "Sleep Tech", "Wellness", "Reviews"]'::jsonb
WHERE slug = 'luumun-sleep-review';

UPDATE posts 
SET tags = '["Deals & Coupons", "Business & Economy", "Fintech", "E-Commerce"]'::jsonb
WHERE slug = 'ecommerce-growth-fintech-checkout-conversion-2026';

UPDATE posts 
SET tags = '["Tech & Gadgets", "Consumer Tech", "Collectibles", "Reviews", "Deals & Coupons"]'::jsonb
WHERE slug = 'neo-sabers-xenopixel-review';

UPDATE posts 
SET tags = '["Google", "AI", "Tech & Gadgets", "Consumer Tech", "Smart Home & IoT", "Productivity"]'::jsonb
WHERE slug = 'google-ai-hardware-ecosystem-review-2026';

-- 3. Resync entity_tags junction table for all posts
DELETE FROM entity_tags WHERE entity_type = 'POST';

INSERT INTO entity_tags (entity_type, entity_id, tag_id)
SELECT DISTINCT 'POST', p.id, t.id
FROM posts p, jsonb_array_elements_text(p.tags) raw_tag
JOIN tags t ON LOWER(t.slug) = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(raw_tag), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
   OR LOWER(TRIM(t.name)) = LOWER(TRIM(raw_tag))
   OR (LENGTH(TRIM(raw_tag)) >= 3 AND LOWER(TRIM(t.name)) LIKE '%' || LOWER(TRIM(raw_tag)) || '%')
   OR (LENGTH(TRIM(t.name)) >= 3 AND LOWER(TRIM(raw_tag)) LIKE '%' || LOWER(TRIM(t.name)) || '%')
   OR (LENGTH(t.slug) >= 3 AND LOWER(TRIM(raw_tag)) LIKE '%' || LOWER(t.slug) || '%')
   OR (LENGTH(TRIM(raw_tag)) >= 3 AND LOWER(t.slug) LIKE '%' || LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(raw_tag), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')) || '%')
WHERE p.is_deleted = false AND p.tags IS NOT NULL
ON CONFLICT (entity_type, entity_id, tag_id) DO NOTHING;
