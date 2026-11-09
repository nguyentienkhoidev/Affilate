-- liquibase formatted sql
-- changeset heygoodly:024-seed-article-cover-images.sql splitStatements:true endDelimiter:;

-- Set high-resolution cover photos for all articles that currently have no image
UPDATE posts
SET image = 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'nilight-led-light-bar-review' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'vesla-copper-review-2026' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'nilight-led-light-bar-review-buying-guide' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'nebuleuse-bijoux-review' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'philly-goat-review' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'qidi-tech-review' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'nuphy-keyboard-review' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'neo-sabers-review' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'youcanic-review-2026' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'luumun-sleep-review' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'best-noise-cancelling-headphones-under-100' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'google-ai-hardware-ecosystem-review-2026' AND (image IS NULL OR image = '');

UPDATE posts
SET image = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80'
WHERE slug = 'trump-tariffs-ecommerce-consumer-goods-impact-2026' AND (image IS NULL OR image = '');

