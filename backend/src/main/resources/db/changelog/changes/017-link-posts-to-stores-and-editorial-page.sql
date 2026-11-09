-- liquibase formatted sql

-- changeset heygoodly:017-link-posts-to-stores-and-editorial-page splitStatements:true endDelimiter:; runOnChange:true

-- 1. Link store review articles to their matching merchant store_id where not yet linked
UPDATE posts
SET store_id = (SELECT id FROM stores WHERE slug = 'nilight' AND is_deleted = false LIMIT 1)
WHERE store_id IS NULL AND slug IN ('nilight-led-light-bar-review', 'nilight-led-light-bar-review-buying-guide');

UPDATE posts
SET store_id = (SELECT id FROM stores WHERE slug = 'nuphy' AND is_deleted = false LIMIT 1)
WHERE store_id IS NULL AND slug IN ('nuphy-keyboard-review');

UPDATE posts
SET store_id = (SELECT id FROM stores WHERE slug = 'neo-sabers' AND is_deleted = false LIMIT 1)
WHERE store_id IS NULL AND slug IN ('neo-sabers-review', 'neo-sabers-xenopixel-review');

UPDATE posts
SET store_id = (SELECT id FROM stores WHERE slug = 'youcanic' AND is_deleted = false LIMIT 1)
WHERE store_id IS NULL AND slug IN ('youcanic-review-2026');

UPDATE posts
SET store_id = (SELECT id FROM stores WHERE slug = 'anker' AND is_deleted = false LIMIT 1)
WHERE store_id IS NULL AND slug IN ('anker-prime-power-bank-review');

UPDATE posts
SET store_id = (SELECT id FROM stores WHERE slug = 'auxito' AND is_deleted = false LIMIT 1)
WHERE store_id IS NULL AND slug IN ('auxito-led-headlight-bulbs-review');

UPDATE posts
SET store_id = (SELECT id FROM stores WHERE slug = 'hostinger' AND is_deleted = false LIMIT 1)
WHERE store_id IS NULL AND slug IN ('hostinger-cloud-hosting-review');

-- 2. Backfill author_id on seeded posts to primary editorial user when author_id is NULL
UPDATE posts
SET author_id = (SELECT id FROM users WHERE is_deleted = false ORDER BY id ASC LIMIT 1)
WHERE author_id IS NULL;

-- 3. Seed Editorial Guidelines page into pages table if missing
INSERT INTO pages (title, slug, content, is_active, sort_order, meta_title, meta_description, created_at, updated_at)
VALUES (
  'Editorial Guidelines',
  'editorial-guidelines',
  '<h2>Editorial Independence & Laboratory Testing Standards</h2><p>Every hardware review, software benchmark, and merchant coupon assessment published on HeyGoodly follows strict editorial independence protocols. Commercial partnerships and affiliate networks have zero influence over product scores, pros and cons lists, or editorial verdicts.</p><h3>Hands-On Verification Methodology</h3><p>Products undergo multi-week real-world durability and performance testing before publication. Promotional codes are verified directly against live merchant checkouts and audited continuously.</p>',
  true,
  5,
  'Editorial Guidelines & Testing Methodology - HeyGoodly',
  'Learn how HeyGoodly editors independently test products, verify merchant coupon codes, and maintain strict editorial integrity.',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

