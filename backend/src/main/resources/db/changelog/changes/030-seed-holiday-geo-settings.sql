--liquibase formatted sql

--changeset heygoodly:030-seed-holiday-geo-settings
INSERT INTO system_settings (setting_key, setting_value, category)
VALUES
  ('holiday_country_overrides', '{}', 'general'),
  ('holiday_custom_rules', '[]', 'general')
ON CONFLICT (setting_key) DO NOTHING;
