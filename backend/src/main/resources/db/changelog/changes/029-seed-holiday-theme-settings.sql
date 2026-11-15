--liquibase formatted sql

--changeset heygoodly:029-seed-holiday-theme-settings
INSERT INTO system_settings (setting_key, setting_value, category)
VALUES
  ('holiday_theme_mode', 'off', 'general'),
  ('holiday_theme_manual', 'none', 'general'),
  ('holiday_effects_enabled', 'true', 'general')
ON CONFLICT (setting_key) DO NOTHING;
