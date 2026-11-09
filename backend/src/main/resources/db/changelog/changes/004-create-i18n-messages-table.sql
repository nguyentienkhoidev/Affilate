-- liquibase formatted sql

-- changeset heygoodly:004-create-i18n-messages-table
CREATE TABLE IF NOT EXISTS i18n_messages (
    id BIGSERIAL PRIMARY KEY,
    message_key VARCHAR(150) NOT NULL UNIQUE,
    message_en TEXT NOT NULL,
    message_vi TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'ERROR', -- 'ERROR', 'COMMON', 'AUTH', 'VALIDATION'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_i18n_messages_key ON i18n_messages(message_key);
CREATE INDEX IF NOT EXISTS idx_i18n_messages_category ON i18n_messages(category);

-- Seed Initial Bilingual System Translations (EN / VI)
INSERT INTO i18n_messages (message_key, message_en, message_vi, category)
VALUES
-- Common & Success
('common.success', 'Operation completed successfully.', 'Thao tác thực hiện thành công.', 'COMMON'),
('common.created', 'Resource created successfully.', 'Tạo mới dữ liệu thành công.', 'COMMON'),
('common.updated', 'Resource updated successfully.', 'Cập nhật dữ liệu thành công.', 'COMMON'),
('common.deleted', 'Resource deleted successfully.', 'Xóa dữ liệu thành công.', 'COMMON'),

-- Auth & Security Errors
('error.unauthorized', 'Authentication is required to access this resource.', 'Vui lòng đăng nhập để truy cập tài nguyên này.', 'AUTH'),
('error.access_denied', 'You do not have permission to perform this action.', 'Bạn không có quyền thực hiện thao tác này.', 'AUTH'),
('error.invalid_credentials', 'Invalid email or password.', 'Email hoặc mật khẩu không chính xác.', 'AUTH'),
('error.two_factor_required', 'Two-factor authentication code is required.', 'Yêu cầu nhập mã xác thực 2 bước (2FA).', 'AUTH'),
('error.invalid_otp_code', 'Invalid or expired 2FA verification code.', 'Mã xác thực 2FA không hợp lệ hoặc đã hết hạn.', 'AUTH'),
('error.account_locked', 'Account is temporarily locked due to too many failed attempts. Try again later.', 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau.', 'AUTH'),

-- Entity & Resource Errors
('error.resource_not_found', 'Requested resource was not found.', 'Không tìm thấy dữ liệu yêu cầu.', 'ERROR'),
('error.store_not_found', 'The requested store does not exist.', 'Cửa hàng không tồn tại trong hệ thống.', 'ERROR'),
('error.offer_not_found', 'The requested coupon or deal offer does not exist.', 'Mã giảm giá hoặc ưu đãi không tồn tại.', 'ERROR'),
('error.post_not_found', 'The requested article review does not exist.', 'Bài viết đánh giá không tồn tại.', 'ERROR'),
('error.duplicate_resource', 'A record with this identifier already exists.', 'Dữ liệu với định danh này đã tồn tại trong hệ thống.', 'ERROR'),

-- Validation & System Errors
('error.validation_failed', 'Validation failed for one or more fields.', 'Dữ liệu nhập vào không hợp lệ hoặc bị thiếu trường bắt buộc.', 'VALIDATION'),
('error.internal_server_error', 'An unexpected system error occurred. Please contact the administrator.', 'Đã xảy ra lỗi hệ thống. Vui lòng liên hệ quản trị viên.', 'ERROR'),
('error.file_upload_failed', 'Failed to upload media file to storage.', 'Tải lên tập tin thất bại.', 'ERROR'),
('error.invalid_file_type', 'The uploaded file format is not supported.', 'Định dạng tệp tải lên không được hỗ trợ.', 'ERROR')
ON CONFLICT (message_key) DO UPDATE
SET message_en = EXCLUDED.message_en,
    message_vi = EXCLUDED.message_vi,
    updated_at = NOW();

