-- liquibase formatted sql
-- changeset heygoodly:027-add-offer-start-at-and-validity

ALTER TABLE offers
    ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;

ALTER TABLE offers
    ADD COLUMN IF NOT EXISTS has_expiration BOOLEAN NOT NULL DEFAULT false;

UPDATE offers
SET has_expiration = true
WHERE start_at IS NOT NULL OR expire_at IS NOT NULL;
