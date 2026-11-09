-- liquibase formatted sql
-- changeset heygoodly:022-seed-menu-and-user-validation-i18n runOnChange:true
-- validCheckSum: ANY
-- comment: Seed validation i18n messages for Menu, Page, and User modules

INSERT INTO i18n_messages (message_key, message_en, message_vi, category) VALUES
('validation.menu.position.required', 'Position is required (main, header, footer).', 'Vị trí hiển thị menu là bắt buộc (main, header, footer).', 'VALIDATION'),
('validation.menu.position.size', 'Position must not exceed 50 characters.', 'Vị trí không được vượt quá 50 ký tự.', 'VALIDATION'),
('validation.menu.title.required', 'Menu title is required.', 'Tiêu đề menu là bắt buộc.', 'VALIDATION'),
('validation.menu.title.size', 'Menu title must not exceed 150 characters.', 'Tiêu đề menu không được vượt quá 150 ký tự.', 'VALIDATION'),
('validation.menu.target_type.required', 'Target type is required (page, category, url).', 'Loại đích điều hướng là bắt buộc (page, category, url).', 'VALIDATION'),
('validation.menu.target_type.size', 'Target type must not exceed 50 characters.', 'Loại đích không được vượt quá 50 ký tự.', 'VALIDATION'),
('validation.menu.target_value.required', 'Target value is required.', 'Giá trị liên kết đích là bắt buộc.', 'VALIDATION'),
('validation.menu.target_value.size', 'Target value must not exceed 500 characters.', 'Giá trị liên kết không được vượt quá 500 ký tự.', 'VALIDATION'),
('validation.phone.size', 'Phone number must not exceed 50 characters.', 'Số điện thoại không được vượt quá 50 ký tự.', 'VALIDATION'),
('validation.phone.invalid', 'Invalid phone number format.', 'Định dạng số điện thoại không hợp lệ.', 'VALIDATION'),
('validation.content.size', 'Content exceeds maximum allowable length.', 'Nội dung vượt quá độ dài tối đa cho phép.', 'VALIDATION'),
('validation.email.size', 'Email must not exceed 150 characters.', 'Email không được vượt quá 150 ký tự.', 'VALIDATION'),
('validation.avatar.size', 'Avatar URL must not exceed 500 characters.', 'Đường dẫn ảnh đại diện không được vượt quá 500 ký tự.', 'VALIDATION'),
('validation.department.size', 'Department must not exceed 150 characters.', 'Phòng ban không được vượt quá 150 ký tự.', 'VALIDATION'),
('validation.timezone.size', 'Timezone must not exceed 100 characters.', 'Múi giờ không được vượt quá 100 ký tự.', 'VALIDATION'),
('validation.social_x.size', 'Social X URL must not exceed 255 characters.', 'Đường dẫn tài khoản X (Twitter) không được vượt quá 255 ký tự.', 'VALIDATION'),
('validation.social_linkedin.size', 'Social LinkedIn URL must not exceed 255 characters.', 'Đường dẫn tài khoản LinkedIn không được vượt quá 255 ký tự.', 'VALIDATION'),
('validation.auth.temp_token.required', 'Temporary token is required.', 'Mã xác thực tạm thời là bắt buộc.', 'VALIDATION'),
('validation.auth.otp.required', 'OTP code is required.', 'Mã OTP xác thực là bắt buộc.', 'VALIDATION'),
('validation.auth.refresh_token.required', 'Refresh token is required.', 'Mã refresh token là bắt buộc.', 'VALIDATION'),
('validation.password.current.required', 'Current password is required.', 'Mật khẩu hiện tại là bắt buộc.', 'VALIDATION'),
('validation.password.new.required', 'New password is required.', 'Mật khẩu mới là bắt buộc.', 'VALIDATION'),
('validation.password.new.size', 'New password must be at least 8 characters long.', 'Mật khẩu mới phải có ít nhất 8 ký tự.', 'VALIDATION'),
('validation.password.confirm.required', 'Password confirmation is required.', 'Xác nhận mật khẩu là bắt buộc.', 'VALIDATION')
ON CONFLICT (message_key) DO UPDATE 
SET message_en = EXCLUDED.message_en,
    message_vi = EXCLUDED.message_vi,
    category = EXCLUDED.category,
    updated_at = CURRENT_TIMESTAMP;

