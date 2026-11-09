-- liquibase formatted sql

-- changeset heygoodly:010-seed-token-revoked-message
INSERT INTO i18n_messages (message_key, message_en, message_vi, category)
VALUES
('error.token_revoked', 'This session has been logged out or revoked. Please sign in again.', 'Phiên đăng nhập đã bị đăng xuất hoặc thu hồi. Vui lòng đăng nhập lại.', 'AUTH')
ON CONFLICT (message_key) DO UPDATE
SET message_en = EXCLUDED.message_en,
    message_vi = EXCLUDED.message_vi,
    updated_at = NOW();

