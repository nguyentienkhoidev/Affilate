-- liquibase formatted sql

-- changeset heygoodly:011-add-is-featured-and-json-metadata-to-stores splitStatements:true endDelimiter:;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS popular_searches JSONB;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS faqs JSONB;

CREATE INDEX IF NOT EXISTS idx_stores_featured ON stores(is_featured);

-- Update featured status for top merchant partners
UPDATE stores SET is_featured = true WHERE slug IN ('nilight', 'neo-sabers', 'anker', 'hostinger', 'lasfit', 'ugreen', 'nuphy');

