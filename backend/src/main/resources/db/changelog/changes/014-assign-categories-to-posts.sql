-- liquibase formatted sql

-- changeset heygoodly:014-assign-categories-to-posts splitStatements:true endDelimiter:; runOnChange:true
-- validCheckSum: ANY

-- Assign categories to existing posts dynamically based on category slug and post slugs
UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug = 'tech' LIMIT 1)
WHERE category_id IS NULL AND slug IN (
    'qidi-tech-review',
    'nuphy-keyboard-review',
    'best-noise-cancelling-headphones-under-100',
    'anker-prime-power-bank-review',
    'google-ai-hardware-ecosystem-review-2026',
    'neo-sabers-xenopixel-review'
);

UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug IN ('automotive-accessories', 'automotive') ORDER BY id ASC LIMIT 1)
WHERE category_id IS NULL AND slug IN (
    'nilight-led-light-bar-review',
    'nilight-led-light-bar-review-buying-guide',
    'auxito-led-headlight-bulbs-review',
    'youcanic-review-2026'
);

UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug IN ('lifestyle', 'lifestyle-living') ORDER BY id ASC LIMIT 1)
WHERE category_id IS NULL AND slug IN (
    'vesla-copper-review-2026',
    'nebuleuse-bijoux-review',
    'philly-goat-review',
    'luumun-sleep-review'
);

UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug IN ('business', 'business-economy') ORDER BY id ASC LIMIT 1)
WHERE category_id IS NULL AND slug IN (
    'ecommerce-growth-fintech-checkout-conversion-2026'
);

UPDATE posts 
SET category_id = (SELECT id FROM categories WHERE slug IN ('us-politics', 'us-politics-global') ORDER BY id ASC LIMIT 1)
WHERE category_id IS NULL AND slug IN (
    'trump-tariffs-ecommerce-consumer-goods-impact-2026'
);

