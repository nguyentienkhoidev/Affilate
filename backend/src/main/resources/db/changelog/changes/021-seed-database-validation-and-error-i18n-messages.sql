-- liquibase formatted sql

-- changeset heygoodly:021-seed-database-validation-and-error-i18n-messages runOnChange:true
-- validCheckSum: ANY
INSERT INTO i18n_messages (message_key, message_en, message_vi, category)
VALUES
-- Common & Auth Validation
('validation.field.required', 'This field is required.', 'Trường này là bắt buộc.', 'VALIDATION'),
('validation.name.required', 'Name is required.', 'Tên là bắt buộc không được để trống.', 'VALIDATION'),
('validation.name.size', 'Name must be between 2 and 150 characters.', 'Tên phải có độ dài từ 2 đến 150 ký tự.', 'VALIDATION'),
('validation.title.required', 'Title is required.', 'Tiêu đề là bắt buộc.', 'VALIDATION'),
('validation.title.size.200', 'Title must not exceed 200 characters.', 'Tiêu đề không được vượt quá 200 ký tự.', 'VALIDATION'),
('validation.title.size.255', 'Title must not exceed 255 characters.', 'Tiêu đề không được vượt quá 255 ký tự.', 'VALIDATION'),
('validation.content.required', 'Content is required.', 'Nội dung là bắt buộc.', 'VALIDATION'),
('validation.slug.required', 'Slug is required.', 'Đường dẫn tĩnh (slug) là bắt buộc.', 'VALIDATION'),
('validation.slug.invalid', 'Slug must only contain lowercase alphanumeric characters and hyphens.', 'Slug chỉ được chứa chữ cái thường không dấu, số và dấu gạch ngang (a-z, 0-9, -).', 'VALIDATION'),
('validation.slug.letters_numbers_hyphens', 'Slug must contain only lowercase letters, numbers, and hyphens.', 'Slug chỉ được chứa chữ cái thường không dấu, số và dấu gạch ngang.', 'VALIDATION'),
('validation.slug.size.160', 'Slug must not exceed 160 characters.', 'Slug không được vượt quá 160 ký tự.', 'VALIDATION'),
('validation.slug.size.255', 'Slug must not exceed 255 characters.', 'Slug không được vượt quá 255 ký tự.', 'VALIDATION'),
('validation.slug.size.120', 'Slug must be at most 120 characters', 'Slug tối đa 120 ký tự.', 'VALIDATION'),

('validation.email.required', 'Email address is required.', 'Địa chỉ email là bắt buộc.', 'VALIDATION'),
('validation.email.is_required', 'Email is required.', 'Email là bắt buộc.', 'VALIDATION'),
('validation.email.invalid', 'Please enter a valid email address.', 'Vui lòng nhập địa chỉ email hợp lệ (ví dụ: user@company.com).', 'VALIDATION'),
('validation.email.format_invalid', 'Email format is invalid.', 'Định dạng email không hợp lệ.', 'VALIDATION'),
('validation.email.provide_valid', 'Please provide a valid email address.', 'Vui lòng cung cấp một địa chỉ email hợp lệ.', 'VALIDATION'),

('validation.password.required', 'Password is required.', 'Mật khẩu là bắt buộc.', 'VALIDATION'),
('validation.password.size', 'Password must be at least 6 characters.', 'Mật khẩu phải có ít nhất 6 ký tự.', 'VALIDATION'),
('validation.password.current_required', 'Current password is required.', 'Mật khẩu hiện tại là bắt buộc.', 'VALIDATION'),
('validation.password.new_required', 'New password is required.', 'Mật khẩu mới là bắt buộc.', 'VALIDATION'),
('validation.password.new_min_8', 'New password must be at least 8 characters long.', 'Mật khẩu mới phải có ít nhất 8 ký tự.', 'VALIDATION'),
('validation.password.confirm_required', 'Password confirmation is required.', 'Xác nhận mật khẩu là bắt buộc.', 'VALIDATION'),

('validation.auth.temp_token_required', 'Temporary token is required.', 'Mã xác thực tạm thời là bắt buộc.', 'VALIDATION'),
('validation.auth.otp_required', 'OTP code is required.', 'Mã xác thực 2FA OTP là bắt buộc.', 'VALIDATION'),
('validation.auth.refresh_token_required', 'Refresh token is required.', 'Mã làm mới phiên đăng nhập (Refresh token) là bắt buộc.', 'VALIDATION'),
('validation.phone.invalid', 'Invalid phone number format.', 'Định dạng số điện thoại không hợp lệ.', 'VALIDATION'),
('validation.color.hex', 'Invalid HEX color code (e.g. #e11d48).', 'Mã màu HEX không hợp lệ (ví dụ: #e11d48 hoặc #fff).', 'VALIDATION'),
('validation.color.size.30', 'Color code must be at most 30 characters', 'Mã màu tối đa 30 ký tự.', 'VALIDATION'),

-- Store Validation
('validation.store.name.required', 'Store name is required.', 'Tên thương hiệu là bắt buộc.', 'VALIDATION'),
('validation.store.name.size', 'Store name must not exceed 150 characters.', 'Tên thương hiệu không được vượt quá 150 ký tự.', 'VALIDATION'),
('validation.store.slug.required', 'Store slug is required.', 'Đường dẫn tĩnh thương hiệu (slug) là bắt buộc.', 'VALIDATION'),
('validation.store.rating.min', 'Rating must be at least 0.0.', 'Điểm đánh giá phải từ 0.0 trở lên.', 'VALIDATION'),
('validation.store.rating.max', 'Rating must not exceed 5.0.', 'Điểm đánh giá tối đa là 5.0.', 'VALIDATION'),
('validation.store.rating.range', 'Rating score must be between 0.0 and 5.0.', 'Điểm đánh giá phải nằm trong khoảng từ 0.0 đến 5.0.', 'VALIDATION'),
('validation.store.rating_count.min', 'Rating count cannot be negative.', 'Số lượt đánh giá không được là số âm.', 'VALIDATION'),
('validation.store.rating_count.non_negative', 'Rating count must be non-negative.', 'Số lượt đánh giá phải là số không âm.', 'VALIDATION'),
('validation.store.max_offer.min', 'Max offers must be at least 1.', 'Số lượng ưu đãi tối thiểu là 1.', 'VALIDATION'),
('validation.store.max_offer.max', 'Max offers must not exceed 500.', 'Số lượng ưu đãi không được vượt quá 500.', 'VALIDATION'),
('validation.store.max_offer.range', 'Maximum active offers must be between 1 and 500.', 'Số lượng ưu đãi hiển thị tối đa phải từ 1 đến 500.', 'VALIDATION'),
('validation.store.url.invalid', 'Store website URL must start with http:// or https://.', 'Website thương hiệu phải bắt đầu bằng http:// hoặc https://.', 'VALIDATION'),

-- Offer / Coupon Validation
('validation.offer.store_id.required', 'Store ID is required.', 'Mã thương hiệu đối tác là bắt buộc.', 'VALIDATION'),
('validation.offer.title.required', 'Offer title is required.', 'Tiêu đề ưu đãi là bắt buộc.', 'VALIDATION'),
('validation.offer.title.size', 'Offer title must be between 3 and 255 characters.', 'Tiêu đề ưu đãi phải từ 3 đến 255 ký tự.', 'VALIDATION'),
('validation.offer.discount_value.required', 'Discount value is required.', 'Giá trị giảm giá là bắt buộc.', 'VALIDATION'),
('validation.offer.affiliate_url.required', 'Affiliate tracking URL is required.', 'Liên kết tiếp thị (Affiliate URL) là bắt buộc.', 'VALIDATION'),
('validation.offer.store.required', 'Please select an associated merchant store.', 'Vui lòng chọn thương hiệu đối tác cho ưu đãi này.', 'VALIDATION'),
('validation.offer.coupon_code.required', 'Coupon promo code is required for coupon offers.', 'Mã giảm giá là bắt buộc đối với loại ưu đãi Mã Voucher / Coupon.', 'VALIDATION'),
('validation.offer.discount.min', 'Discount amount must be greater than 0.', 'Giá trị giảm giá phải lớn hơn 0.', 'VALIDATION'),
('validation.offer.discount_percentage.max', 'Discount percentage cannot exceed 100%.', 'Mức giảm giá phần trăm không được vượt quá 100%.', 'VALIDATION'),
('validation.offer.affiliate_url.invalid', 'Affiliate destination URL must start with http:// or https://.', 'Liên kết tiếp thị (Affiliate URL) phải bắt đầu bằng http:// hoặc https://.', 'VALIDATION'),

-- Post / Article Validation
('validation.post.title.required', 'Article title is required.', 'Tiêu đề bài viết là bắt buộc.', 'VALIDATION'),
('validation.post.title.size', 'Article title must be at least 5 characters.', 'Tiêu đề bài viết phải có ít nhất 5 ký tự.', 'VALIDATION'),
('validation.post.category.required', 'Please select a category for this article.', 'Vui lòng chọn chuyên mục cho bài viết này.', 'VALIDATION'),
('validation.post.content.required', 'Article content cannot be empty.', 'Nội dung bài viết không được để trống.', 'VALIDATION'),
('validation.post.rating.range', 'Editorial rating score must be between 0.0 and 5.0.', 'Điểm đánh giá biên tập phải từ 0.0 đến 5.0.', 'VALIDATION'),
('validation.post.schedule.future', 'Scheduled publishing date must be in the future.', 'Thời gian lên lịch xuất bản phải lớn hơn thời gian hiện tại.', 'VALIDATION'),

-- Category & Tag Validation
('validation.category.name.required', 'Category name is required.', 'Tên chuyên mục là bắt buộc.', 'VALIDATION'),
('validation.category.name.size', 'Category name must be between 2 and 100 characters.', 'Tên chuyên mục phải từ 2 đến 100 ký tự.', 'VALIDATION'),
('validation.category.name.size.150', 'Category name must not exceed 150 characters.', 'Tên chuyên mục không được vượt quá 150 ký tự.', 'VALIDATION'),
('validation.category.type.invalid', 'Category type must be post, store, or offer.', 'Loại chuyên mục phải là post, store hoặc offer.', 'VALIDATION'),
('validation.category.type.one_of', 'Type must be one of: ''post'', ''store'', ''offer''.', 'Loại chuyên mục phải là một trong các giá trị: ''post'', ''store'', ''offer''.', 'VALIDATION'),

('validation.tag.name.required', 'Tag name is required.', 'Tên thẻ tag là bắt buộc.', 'VALIDATION'),
('validation.tag.name.blank', 'Tag name cannot be blank', 'Tên thẻ tag không được để trống.', 'VALIDATION'),
('validation.tag.name.size', 'Tag name must be between 2 and 100 characters.', 'Tên thẻ tag phải từ 2 đến 100 ký tự.', 'VALIDATION'),
('validation.tag.name.size.100', 'Tag name must be at most 100 characters', 'Tên thẻ tag tối đa 100 ký tự.', 'VALIDATION'),

-- User / Role / Setting Validation
('validation.user.name.required', 'Full name is required.', 'Họ và tên nhân sự là bắt buộc.', 'VALIDATION'),
('validation.user.name.size', 'Full name must be between 2 and 150 characters.', 'Họ và tên nhân sự phải từ 2 đến 150 ký tự.', 'VALIDATION'),
('validation.role.name.required', 'Role name is required.', 'Tên vai trò là bắt buộc.', 'VALIDATION'),
('validation.setting.empty', 'Settings map cannot be empty.', 'Danh sách cấu hình không được để trống.', 'VALIDATION'),

-- Unique & Conflict Errors
('error.store.duplicate_slug', 'A merchant store with this slug already exists.', 'Đã tồn tại thương hiệu đối tác với đường dẫn tĩnh (slug) này.', 'ERROR'),
('error.post.duplicate_slug', 'An article with this slug already exists.', 'Đã tồn tại bài viết với đường dẫn tĩnh (slug) này.', 'ERROR'),
('error.category.duplicate_slug', 'A category with this slug already exists.', 'Đã tồn tại chuyên mục với đường dẫn tĩnh (slug) này.', 'ERROR'),
('error.tag.duplicate_slug', 'A tag with this slug already exists.', 'Đã tồn tại thẻ tag với đường dẫn tĩnh (slug) này.', 'ERROR'),
('error.user.duplicate_email', 'An account with this email address already exists.', 'Đã tồn tại tài khoản với địa chỉ email này.', 'ERROR'),
('error.resource_conflict', 'A record with this identifier or unique attribute already exists.', 'Dữ liệu với định danh hoặc thuộc tính duy nhất này đã tồn tại trong hệ thống.', 'ERROR')

ON CONFLICT (message_key) DO UPDATE
SET message_en = EXCLUDED.message_en,
    message_vi = EXCLUDED.message_vi,
    category = EXCLUDED.category,
    updated_at = NOW();
