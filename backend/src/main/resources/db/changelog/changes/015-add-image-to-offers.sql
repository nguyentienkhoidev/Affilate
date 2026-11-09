-- liquibase formatted sql
-- changeset heygoodly:015-add-image-to-offers splitStatements:true endDelimiter:;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS image VARCHAR(500);

