-- liquibase formatted sql
-- changeset heygoodly:028-seed-custom-head-code-setting

INSERT INTO system_settings (setting_key, setting_value, category)
VALUES ('custom_head_code', '', 'seo')
ON CONFLICT (setting_key) DO NOTHING;
