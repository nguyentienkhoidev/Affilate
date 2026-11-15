--liquibase formatted sql

--changeset heygoodly:031-sync-offer-exclusive-and-post-author
ALTER TABLE offers
    ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS author_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS author_role VARCHAR(150);
