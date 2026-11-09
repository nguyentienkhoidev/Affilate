-- liquibase formatted sql

-- changeset heygoodly:009-seed-token-error-messages
INSERT INTO i18n_messages (message_key, message_en, message_vi, category)
VALUES
('error.token_expired', 'Session token has expired. Please refresh your session.', 'Phiên đăng nhập đã hết hạn. Vui lòng làm mới phiên làm việc.', 'AUTH'),
('error.token_invalid', 'Invalid authentication token. Please sign in again.', 'Mã xác thực không hợp lệ. Vui lòng đăng nhập lại.', 'AUTH'),
('error.token_missing', 'Authentication token is required to access this resource.', 'Yêu cầu mã xác thực để truy cập tài nguyên này.', 'AUTH')
ON CONFLICT (message_key) DO UPDATE
SET message_en = EXCLUDED.message_en,
    message_vi = EXCLUDED.message_vi,
    updated_at = NOW();

