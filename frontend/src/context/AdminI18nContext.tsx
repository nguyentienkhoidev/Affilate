'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { usePathname } from 'next/navigation';

export type AdminLocale = 'en' | 'vi';

interface AdminI18nContextValue {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  toggleLocale: () => void;
  t: (text: string) => string;
}

const STORAGE_KEY = 'admin:locale';

/** Exact English -> Vietnamese dictionary for Admin ProCMS UI */
const EXACT_VI_MAP: Record<string, string> = {
  'Category name is required': 'Tên chuyên mục là bắt buộc',
  'Please review highlighted form errors.': 'Vui lòng kiểm tra các trường bị lỗi được đánh dấu.',
  'Please fill out all required fields': 'Vui lòng điền đầy đủ các trường bắt buộc',
  'Failed to save category.': 'Lưu chuyên mục thất bại.',
  'Store name is required': 'Tên cửa hàng là bắt buộc',
  'Offer title is required': 'Tiêu đề ưu đãi là bắt buộc',
  'Post title is required': 'Tiêu đề bài viết là bắt buộc',
  'Tag name is required': 'Tên thẻ tag là bắt buộc',
  'Executive Operations Dashboard': 'Bảng điều khiển Vận hành Cấp cao',
  'Real-time affiliate performance, conversion telemetry, and operational health.': 'Hiệu năng tiếp thị liên kết thời gian thực, đo lường chuyển đổi và trạng thái vận hành.',
  'Write Review': 'Viết bài Review',
  'Operational Alerts & Action Items': 'Cảnh báo Vận hành & Cần xử lý',
  'User Reports Pending': 'Báo cáo mã lỗi chờ xử lý',
  'Deals Expire in < 48h': 'Ưu đãi hết hạn trong < 48h',
  'Unread Inquiries': 'Tin nhắn độc giả chưa đọc',
  'Verified Success Rate': 'Tỷ lệ coupon hợp lệ',
  'Top Performing Merchants': 'Thương hiệu Hiệu quả Nhất',
  'Highest referral volume and merchant performance': 'Thương hiệu có lượt click và chuyển đổi cao nhất',
  'Top Converting Offers': 'Ưu đãi Được Dùng Nhiều Nhất',
  'Most redeemed discount promo codes and exclusive deals': 'Mã giảm giá và ưu đãi độc quyền được sao chép nhiều nhất',
  'View All Stores →': 'Xem tất cả thương hiệu →',
  'View All Offers →': 'Xem tất cả ưu đãi →',
  'Redis Fast Redirect': 'Chuyển hướng Redis siêu tốc',
  'Cache Hit': 'Tỷ lệ trúng Cache',
  'Peak Clicks': 'Đỉnh điểm Click',
  'Average Daily': 'Trung bình ngày',
  'Projected Growth': 'Dự kiến tăng trưởng',
  'High Converting': 'Chuyển đổi cao',
  'Exclusive Deal': 'Ưu đãi độc quyền',
  'Verified Code': 'Mã đã kiểm duyệt',
  'Active Deals': 'Ưu đãi hoạt động',

  // ============================================================================
  // 1. SIDEBAR GROUPS, NAVIGATION & HEADER CHROME
  // ============================================================================
  'OPERATIONS': 'VẬN HÀNH',
  'CMS & CHANNELS': 'NỘI DUNG & KÊNH',
  'SECURITY & SYSTEM': 'BẢO MẬT & HỆ THỐNG',
  'Dashboard': 'Bảng điều khiển',
  'Stores Directory': 'Danh bạ Thương hiệu',
  'Offers & Coupons': 'Mã giảm giá & Ưu đãi',
  'Articles & Reviews': 'Bài viết & Đánh giá',
  'Categories': 'Chuyên mục',
  'Tags': 'Thẻ Tag',
  'Tag Management': 'Quản lý Thẻ Tag',
  'Manage Tags': 'Quản lý Thẻ Tag',
  'Add New Tag': 'Thêm thẻ tag mới',
  'Edit Tag': 'Chỉnh sửa thẻ tag',
  'Tag Name': 'Tên thẻ tag',
  'Tag Slug': 'Đường dẫn tĩnh (Slug)',
  'Tag Color': 'Màu đại diện',
  'Tag Description': 'Mô tả thẻ tag',
  'Featured Tag': 'Thẻ tag nổi bật',
  'All Tags': 'Tất cả thẻ tag',
  'Total Tags': 'Tổng số thẻ tag',
  'Featured Tags': 'Thẻ nổi bật',
  'Regular Tags': 'Thẻ thông thường',
  'Active Tags': 'Thẻ đang hoạt động',
  'Delete Tag': 'Xóa thẻ tag',
  'Confirm Tag Deletion': 'Xác nhận xóa thẻ tag',
  'Organize, categorize and index articles and media assets with high-performance taxonomy tags.': 'Tổ chức, phân loại và lập chỉ mục bài viết, cửa hàng, ưu đãi và media với thẻ tag hiệu năng cao.',
  'Tags Total': 'thẻ tag',
  'All Entities': 'Tất cả thực thể',
  'Posts & Reviews': 'Bài viết & Đánh giá',
  'Merchant Stores': 'Cửa hàng đối tác',
  'Offers & Deals': 'Mã giảm giá & Ưu đãi',
  'Media Assets': 'Tài nguyên Media',
  'Unused Tags': 'Thẻ chưa dùng',
  'Unused / Standalone': 'Chưa dùng / Độc lập',
  'Search tags by name, slug...': 'Tìm thẻ tag theo tên, slug...',
  'Tag Name & Badge': 'Tên thẻ & Huy hiệu',
  'Connected Entities (Usage)': 'Thực thể liên kết (Lượt dùng)',
  'Name: A → Z': 'Tên: A → Z',
  'Name: Z → A': 'Tên: Z → A',
  'Copy slug': 'Sao chép slug',
  'Media Library': 'Thư viện Media',
  'Navigation Menus': 'Menu Điều hướng',
  'Static & Policy Pages': 'Trang tĩnh & Chính sách',
  'Customer Inquiries': 'Liên hệ Khách hàng',
  'Newsletter Subscribers': 'Đăng ký Bản tin',
  'Staff Accounts': 'Tài khoản Nhân sự',
  'Roles & RBAC Matrix': 'Phân quyền & Vai trò',
  'Action Tracing & Audit': 'Nhật ký Hoạt động',
  'Action Tracing & Audit Logs': 'Nhật ký Hoạt động & Kiểm toán',
  'System Settings': 'Cấu hình Hệ thống',

  'Editorial CMS & Ops': 'Hệ thống Quản trị & Biên tập',
  'Role:': 'Vai trò:',
  '2FA & Profile': '2FA & Hồ sơ',
  'Live Site': 'Xem Trang Chủ',
  '2FA Active': 'Đã bật 2FA',
  'Sign Out': 'Đăng xuất',
  'Collapse Sidebar': 'Thu gọn thanh bên',
  'Expand Sidebar': 'Mở rộng thanh bên',
  'Control Panel': 'Bảng điều khiển',
  'Create New': 'Tạo mới',
  'Edit Record': 'Chỉnh sửa',
  'Store Details': 'Chi tiết Thương hiệu',
  'Article Editor': 'Trình biên tập Bài viết',
  'Switch Active RBAC Role': 'Chuyển đổi vai trò kiểm thử RBAC',
  'View My Profile & 2FA': 'Xem hồ sơ & Bảo mật 2FA',

  // ============================================================================
  // 2. COMMON BUTTONS, ACTIONS & FORM CONTROLS
  // ============================================================================
  'Save': 'Lưu lại',
  'Save Changes': 'Lưu thay đổi',
  'Save All Settings': 'Lưu toàn bộ cấu hình',
  'Save Permissions': 'Lưu Phân quyền',
  'Cancel': 'Hủy bỏ',
  'Delete': 'Xóa',
  'Clone': 'Nhân bản',
  'Edit': 'Sửa',
  'Preview': 'Xem trước',
  'Editor': 'Trình soạn thảo',
  'Live Preview': 'Xem trước trực tiếp',
  'View Live': 'Xem thực tế',
  'Live Journal': 'Xem Chuyên trang',
  'Back to list': 'Quay lại danh sách',
  'Back to stores': 'Quay lại danh sách hãng',
  'Back to offers': 'Quay lại danh sách ưu đãi',
  'Back to articles': 'Quay lại danh sách bài viết',
  'Back to categories': 'Quay lại chuyên mục',
  'Back to menus': 'Quay lại menu',
  'Back to pages': 'Quay lại trang tĩnh',
  'Back to users': 'Quay lại nhân sự',
  'Back to roles': 'Quay lại phân quyền',
  'Back to Roles Matrix': 'Quay lại Ma trận Phân quyền',
  'Back to Edit': 'Quay lại chỉnh sửa',
  'Reset filters': 'Đặt lại bộ lọc',
  'Reset Filters': 'Đặt lại bộ lọc',
  'Clear all filters': 'Xóa tất cả bộ lọc',
  'Export CSV': 'Xuất file CSV',
  'Export CSV Report': 'Xuất Báo cáo CSV',
  'Clear All': 'Xóa tất cả',
  'Select All': 'Chọn tất cả',
  'Deselect All': 'Bỏ chọn tất cả',
  'Close': 'Đóng',
  'Apply': 'Áp dụng',
  'Replace': 'Thay ảnh',
  'Desktop (1000px)': 'Máy tính (1000px)',
  'Tablet (768px)': 'Máy tính bảng (768px)',
  'Mobile (390px)': 'Điện thoại (390px)',

  // ============================================================================
  // 3. IMAGE UPLOAD, MEDIA LIBRARY MODAL & WORD STUDIO EDITOR
  // ============================================================================
  'Upload File': 'Tải tệp lên',
  'Image Link': 'Dán Link Ảnh',
  'Library': 'Thư viện',
  'Browse Library': 'Chọn từ Thư viện',
  'Open Media Library': 'Mở Thư viện Media',
  'Or select from': 'Hoặc chọn ảnh có sẵn từ',
  'Click to upload image': 'Nhấn để tải ảnh từ máy tính',
  'Converts to WebP automatically • Tag required': 'Tự động tối ưu sang WebP • Bắt buộc gắn Tag',
  'Optimizing & converting to WebP...': 'Đang tối ưu & chuyển đổi sang WebP...',
  'Remove Image': 'Xóa hình ảnh',
  'Failed to upload image': 'Tải hình ảnh thất bại',
  'Add Search Tags Before Uploading': 'Gắn Thẻ Tìm Kiếm Trước Khi Tải Lên',
  'Every image in the Media Library must have at least 1 tag for instant filtering.': 'Mỗi hình ảnh trong Thư viện Media bắt buộc có ít nhất 1 thẻ (tag) để tìm kiếm nhanh.',
  'Cancel Upload': 'Hủy tải lên',
  'Confirm & Upload': 'Xác nhận & Tải lên',
  'Confirm & Upload Image': 'Xác nhận & Tải ảnh lên',
  'Media & Asset Library': 'Thư viện Media & Tài nguyên',
  'Select an image from the library or upload a new WebP asset': 'Chọn hình ảnh từ thư viện hoặc tải lên ảnh WebP mới',
  'Insert Selected Image': 'Chèn Ảnh Đã Chọn',
  'Copy Image URL': 'Sao chép URL ảnh',
  'Copied!': 'Đã sao chép!',
  'Word Studio 100%': 'Word Studio 100%',
  'Microsoft Word Studio': 'Microsoft Word Studio',

  // ============================================================================
  // 4. DASHBOARD (`/admin/dashboard`)
  // ============================================================================
  'Operational Overview': 'Tổng quan Vận hành Hệ thống',
  'Enterprise analytics, coupon verification health, and referral telemetry.': 'Phân tích hiệu suất toàn diện, tình trạng mã giảm giá và số liệu chuyển hướng.',
  'Executive Operations Center': 'Trung tâm Điều hành Hệ thống',
  'Real-time affiliate performance, editorial publishing velocity, and ProCMS telemetry.': 'Hiệu suất tiếp thị liên kết thời gian thực, tốc độ xuất bản bài viết và số liệu hệ thống.',
  'Add Merchant': 'Thêm Thương hiệu',
  'New Coupon': 'Thêm Mã Giảm Giá',
  'Active Stores Directory': 'Thương hiệu Đang hoạt động',
  'Active Coupons & Deals': 'Mã giảm giá & Ưu đãi',
  'Live in CMS': 'Đang hiển thị trên CMS',
  'Recorded Store Clicks': 'Tổng Lượt Click Thương hiệu',
  'Published Articles': 'Bài viết Đã xuất bản',
  'Affiliate Outbound Referrals & Growth': 'Biểu đồ Lượt Click & Tăng trưởng Affiliate',
  'Daily referral clicks and conversion trends across all stores': 'Xu hướng lượt click chuyển hướng hàng ngày trên toàn bộ thương hiệu',
  'Referral Clicks': 'Lượt click chuyển hướng',
  'Network Distribution': 'Phân bổ Mạng lưới Affiliate',
  'Share of traffic by affiliate partner network': 'Tỷ trọng lưu lượng theo mạng lưới đối tác tiếp thị liên kết',
  'Direct Redirect: HTTP 307': 'Chuyển hướng trực tiếp: HTTP 307',
  'Anti-Bot Active': 'Đã bật Chống Bot',
  'Recent Administrative Actions': 'Hoạt động Quản trị Gần đây',
  'View Activity Audit →': 'Xem Nhật ký Kiểm toán →',
  'View Activity Audit': 'Xem Nhật ký Kiểm toán',
  'Infrastructure Telemetry': 'Trạng thái Hạ tầng Hệ thống',
  'Database Engine': 'Hệ quản trị Cơ sở dữ liệu',
  'Operational': 'Hoạt động tốt',
  'Authentication': 'Xác thực Bảo mật',
  'Secured': 'Đã bảo mật',
  'SEO IndexNow': 'Chỉ mục SEO IndexNow',
  'Standby': 'Sẵn sàng',
  '7 Days': '7 ngày',
  '30 Days': '30 ngày',
  '90 Days': '90 ngày',
  'New Article': 'Viết bài mới',
  'Published Reviews': 'Bài đánh giá đã đăng',
  'Active Stores': 'Thương hiệu hoạt động',
  'Tracked Outbound Clicks': 'Lượt click Affiliate',
  'Click & Traffic Velocity': 'Biểu đồ Lưu lượng & Lượt Click',
  'Pageviews': 'Lượt xem trang',
  'Affiliate Clicks': 'Lượt click Affiliate',
  'By store count': 'Theo số lượng hãng',
  'Top Performing Stores': 'Thương hiệu Hiệu suất Cao',
  'View All Stores': 'Xem tất cả hãng',
  'Recent Audit Trail': 'Nhật ký Hoạt động Gần đây',
  'Full Audit Log': 'Xem toàn bộ nhật ký',
  'Quick Operations': 'Thao tác Nhanh',

  // ============================================================================
  // 5. STORES DIRECTORY & STORE FORM (`/admin/stores`, `StoreForm.tsx`)
  // ============================================================================
  'Merchant Stores Directory': 'Danh bạ Thương hiệu Đối tác',
  'Partner Stores Directory': 'Danh bạ Thương hiệu Đối tác',
  'Manage merchant brand profiles, logos, and discount coupons.': 'Quản lý hồ sơ thương hiệu, logo và mã giảm giá.',
  'Manage merchant brand profiles, logos, and verified discount coupons.': 'Quản lý hồ sơ thương hiệu, logo và mã giảm giá đã kiểm duyệt.',
  'Add New Store': 'Thêm Thương hiệu Mới',
  'Add Store': 'Thêm Thương hiệu',
  'Create New Partner Store': 'Tạo Thương hiệu Đối tác Mới',
  'Configure brand identity, referral links, and promotional metrics.': 'Cấu hình nhận diện thương hiệu, liên kết giới thiệu và chỉ số khuyến mãi.',
  'Save Store': 'Lưu Thương hiệu',
  'Publish Store': 'Xuất bản Thương hiệu',
  'Brand Identity & Links': 'Nhận diện Thương hiệu & Liên kết',
  'Store Name *': 'Tên Thương hiệu *',
  'URL Slug *': 'Đường dẫn tĩnh (Slug) *',
  'Website Domain *': 'Tên miền Website *',
  'Category *': 'Chuyên mục *',
  'Direct Affiliate Destination URL *': 'Đường dẫn đích Affiliate (Tracking URL) *',
  'Store Brand Logo & Cover Banner': 'Logo Thương hiệu & Ảnh Bìa (Banner)',
  'Store Logo (Square)': 'Logo Thương hiệu (Vuông)',
  'Upload or select a square brand logo from the Media Library (requires tags).': 'Tải lên hoặc chọn logo vuông từ Thư viện Media (bắt buộc gắn thẻ tag).',
  'Store Cover Banner (Optional)': 'Ảnh bìa Thương hiệu (Tùy chọn)',
  'Wide cover banner displayed at the top of the store detail page.': 'Ảnh bìa ngang hiển thị ở đầu trang chi tiết thương hiệu.',
  'Short Store Summary': 'Tóm tắt Ngắn gọn về Thương hiệu',
  'Displayed under the store name in the left sidebar of the client store page (clamped to 2–3 lines).': 'Hiển thị dưới tên thương hiệu ở cột trái trang cửa hàng (tối đa 2–3 dòng).',
  'Short Summary (2–3 sentences)': 'Mô tả ngắn (2–3 câu)',
  '💡 Tip: Enter 2–3 concise sentences so shoppers quickly grasp the brand highlights. Clamped to 3 lines on the client store page.': '💡 Mẹo: Nhập 2–3 câu ngắn gọn nêu bật ưu điểm của hãng. Hiển thị tối đa 3 dòng trên trang khách.',
  'Status & Visibility': 'Trạng thái & Hiển thị',
  'Active Status': 'Trạng thái Hoạt động',
  'Publicly visible on website': 'Hiển thị công khai trên website',
  'Featured Store': 'Thương hiệu Nổi bật',
  'Pin to top store directory': 'Ghim lên đầu danh bạ thương hiệu',
  'Affiliate Configuration': 'Cấu hình Tiếp thị Liên kết (Affiliate)',
  'Direct Merchant': 'Đối tác Trực tiếp (Direct)',
  'Max Discount Display': 'Mức giảm Tối đa Hiển thị',
  'Rating Score (1.0 - 5.0)': 'Điểm Đánh giá (1.0 - 5.0)',
  'Live Card Preview': 'Xem trước Thẻ Thương hiệu',
  'Store Name Preview': 'Xem trước Tên Thương hiệu',
  'Editorial Overview & Description': 'Bài giới thiệu & Đánh giá Thương hiệu',
  'Compose the brand overview and promo code redemption guide in Word Studio (100% Full-Width Canvas)': 'Soạn thảo bài giới thiệu thương hiệu và hướng dẫn nhập mã giảm giá trong Word Studio (Toàn màn hình 100%)',
  'Popular Searches Pills': 'Từ khóa Tìm kiếm Phổ biến (SEO Pills)',
  'Quick-search keyword pills displayed above the store review section for SEO and shopper convenience.': 'Các thẻ từ khóa tìm kiếm nhanh hiển thị trên trang thương hiệu giúp tối ưu SEO.',
  'Search Keywords (Comma- or newline-separated)': 'Danh sách Từ khóa (Phân cách bằng dấu phẩy hoặc xuống dòng)',
  'Tag Pills Preview:': 'Xem trước Thẻ từ khóa:',
  'Store FAQs & Schema Q&A': 'Câu hỏi Thường gặp (FAQ & Schema Q&A)',
  'Configure frequently asked questions and answers displayed at the bottom of the store page.': 'Cấu hình danh sách câu hỏi và trả lời thường gặp hiển thị ở cuối trang thương hiệu.',
  'Add FAQ': 'Thêm FAQ',
  'No custom FAQs added for this store yet.': 'Chưa có câu hỏi FAQ tùy chỉnh nào cho thương hiệu này.',
  'The store page automatically displays 5 default FAQs (how to redeem codes, return policy, coupon stacking, free shipping). Click below to add custom questions.': 'Trang thương hiệu tự động hiển thị 5 câu hỏi FAQ mặc định. Nhấn nút bên dưới để thêm câu hỏi riêng.',
  'Add First Question': 'Thêm Câu hỏi Đầu tiên',
  'Question *': 'Câu hỏi *',
  'Answer *': 'Câu trả lời *',
  'Add Another Question': 'Thêm Câu hỏi Khác',
  'Remove FAQ': 'Xóa câu hỏi này',
  'Client Store Landing Page Preview': 'Xem trước Trang Thương hiệu (Client)',
  'All Categories': 'Tất cả chuyên mục',
  'All Networks': 'Tất cả mạng lưới',
  'All Statuses': 'Tất cả trạng thái',
  'Active Only': 'Chỉ đang hoạt động',
  'Inactive Only': 'Chỉ ngừng hoạt động',
  'Featured Directory Only': 'Chỉ thương hiệu nổi bật',
  'Featured Only': 'Chỉ hãng nổi bật',
  'Sort: Name (A to Z)': 'Sắp xếp: Tên (A đến Z)',
  'Sort: Name (A–Z)': 'Sắp xếp: Tên (A–Z)',
  'Sort: Highest Rating': 'Sắp xếp: Điểm đánh giá cao nhất',
  'Sort: Most Coupons': 'Sắp xếp: Nhiều mã giảm giá nhất',
  'Sort: Highest Traffic / Clicks': 'Sắp xếp: Nhiều lượt click nhất',
  'Sort: Highest Clicks': 'Sắp xếp: Nhiều lượt click nhất',
  'Network:': 'Mạng lưới:',
  'All Stores': 'Tất cả hãng',
  'Store / Brand': 'Thương hiệu',
  'Merchant Brand': 'Thương hiệu',
  'Category': 'Chuyên mục',
  'Network': 'Mạng lưới',
  'Offers': 'Ưu đãi',
  'Coupons / Offers': 'Mã giảm giá / Ưu đãi',
  'Rating': 'Đánh giá',
  'Clicks': 'Lượt click',
  'Traffic': 'Lượt truy cập',
  'Status': 'Trạng thái',
  'Actions': 'Thao tác',
  'Active': 'Hoạt động',
  'Paused': 'Tạm dừng',
  'Inactive': 'Ngừng hoạt động',
  'Featured': 'Nổi bật',
  'No merchant stores match your current filters.': 'Không có thương hiệu nào khớp với bộ lọc hiện tại.',

  // ============================================================================
  // 6. OFFERS PAGE & OFFER FORM (`/admin/offers`, `OfferForm.tsx`)
  // ============================================================================
  'Coupons, Promo Codes & Deals': 'Mã Giảm Giá, Voucher & Ưu Đãi',
  'Manage discount vouchers, promo codes, and merchant affiliate offers.': 'Quản lý mã giảm giá, voucher khuyến mãi và ưu đãi tiếp thị liên kết.',
  'Create Offer': 'Tạo Ưu đãi',
  'Create First Offer': 'Tạo Ưu đãi Đầu tiên',
  'Manage in Offers': 'Quản lý trong mục Ưu đãi',
  'Create New Promotional Offer': 'Tạo Ưu đãi Khuyến mãi Mới',
  'Configure discount voucher codes, merchant affiliate URLs, and offer visibility.': 'Cấu hình mã giảm giá, đường dẫn tiếp thị liên kết và trạng thái hiển thị.',
  'Save Offer': 'Lưu Ưu đãi',
  'Publish Offer': 'Xuất bản Ưu đãi',
  'All Merchant Stores': 'Tất cả thương hiệu',
  'Sort: Newly Created': 'Sắp xếp: Mới tạo gần đây',
  'Sort: Most Used & Redeemed': 'Sắp xếp: Dùng nhiều nhất',
  'Sort: Highest Discount': 'Sắp xếp: Giảm giá cao nhất',
  'Sort: Title (A to Z)': 'Sắp xếp: Tiêu đề (A đến Z)',
  'Type:': 'Loại:',
  'All Offers': 'Tất cả ưu đãi',
  'Coupons (Code)': 'Mã giảm giá (Code)',
  'Deals (Direct Link)': 'Khuyến mãi (Link trực tiếp)',
  '★ Exclusive Only': '★ Chỉ ưu đãi Độc quyền',
  '★ Exclusive': '★ Độc quyền',
  'Direct Deal': 'Deal Trực tiếp',
  'Promo Code': 'Mã Giảm Giá',
  'Image': 'Hình ảnh',
  'Store & Offer': 'Thương hiệu & Ưu đãi',
  'Voucher Code': 'Mã Voucher',
  'Discount': 'Mức giảm',
  'Uses': 'Lượt dùng',
  'No code (Auto-apply)': 'Không cần mã (Tự động áp dụng)',
  'No code needed': 'Không cần nhập mã',
  'Offer Information': 'Thông tin Ưu đãi',
  'Merchant Store *': 'Thương hiệu *',
  'Offer Type *': 'Loại Ưu đãi *',
  'Coupon Code (Requires promo code)': 'Mã giảm giá (Cần nhập mã khi thanh toán)',
  'Direct Deal (Auto-applied at checkout)': 'Khuyến mãi trực tiếp (Tự động giảm trên web)',
  'Offer Title *': 'Tiêu đề Ưu đãi *',
  'Coupon Promo Code *': 'Mã Code Giảm Giá *',
  'Discount & Destination URL': 'Mức giảm & Đường dẫn Đích',
  'Discount Amount *': 'Giá trị giảm *',
  'Discount Unit': 'Đơn vị giảm',
  '% Percentage Off': '% Phần trăm giảm',
  '$ Fixed USD Off': '$ Số tiền cố định (USD)',
  'Destination URL (Tracking Link) *': 'Đường dẫn đích (Link Affiliate) *',
  'Terms & Exclusions': 'Điều khoản & Điều kiện áp dụng',
  'Offer Status': 'Trạng thái Ưu đãi',
  'Exclusive Code': 'Ưu đãi Độc quyền',
  'Exclusive HeyGoodly partner deal': 'Ưu đãi độc quyền dành riêng cho đối tác HeyGoodly',
  'Offer Active': 'Kích hoạt hiển thị',
  'Display in store coupon list': 'Hiển thị trên trang mã giảm giá của hãng',
  'Product / Offer Image': 'Hình ảnh Sản phẩm / Ưu đãi',
  'Promotional Image / Product Photo': 'Ảnh Khuyến mãi / Ảnh Sản phẩm',
  'Upload product photo or choose from Media Library (must include tags).': 'Tải ảnh sản phẩm lên hoặc chọn từ Thư viện Media (bắt buộc có tag).',
  'Customer Voucher Preview': 'Xem trước Thẻ Ưu đãi',
  'Special discount offer on selected products': 'Ưu đãi giảm giá đặc biệt cho các sản phẩm chọn lọc',
  'Get Deal →': 'Nhận Ưu đãi →',
  'No promotional offers match your current filters.': 'Không có ưu đãi nào khớp với bộ lọc hiện tại.',

  // ============================================================================
  // 7. ARTICLES & REVIEWS + POST FORM (`/admin/posts`, `PostForm.tsx`)
  // ============================================================================
  'Editorial Articles & Reviews': 'Bài viết & Đánh giá Chuyên sâu',
  'Articles & Editorial Reviews': 'Bài viết & Đánh giá Chuyên sâu',
  'Author and publish independent product tests, buying guides, and breaking editorial dispatches.': 'Biên soạn và xuất bản các bài đánh giá sản phẩm độc lập, cẩm nang mua sắm và tin tức chuyên sâu.',
  'Write New Article': 'Viết Bài Mới',
  'Write Article': 'Viết bài mới',
  'Write New Article & Review': 'Viết Bài Đánh Giá & Tin Tức Mới',
  'Craft in-depth product reviews, buyer guides, and industry news with live preview.': 'Soạn thảo bài đánh giá sản phẩm chuyên sâu, cẩm nang mua sắm và tin tức kèm chế độ xem trước trực tiếp.',
  'Create New Article': 'Tạo Bài viết Mới',
  'Publish Article': 'Xuất bản Bài viết',
  'Schedule Release': 'Lên lịch Xuất bản',
  'Save Draft': 'Lưu Bản nháp',
  'Save Article': 'Lưu Bài viết',
  'Headline & Summary': 'Tiêu đề & Tóm tắt Bài viết',
  'Headline / Title *': 'Tiêu đề Bài viết *',
  'Article URL Slug *': 'Đường dẫn tĩnh (Slug) *',
  'Summary / Lead Excerpt *': 'Tóm tắt / Đoạn mở đầu (Sapo) *',
  'Publishing & Scheduled Release': 'Xuất bản & Hẹn giờ Đăng bài',
  'Control article visibility, schedule publication time, and placement': 'Kiểm soát trạng thái hiển thị, hẹn giờ xuất bản tự động và vị trí nổi bật',
  'Publication Mode': 'Chế độ Xuất bản',
  'Publish Live': 'Đăng ngay',
  'Live immediately': 'Hiển thị công khai ngay',
  'Schedule': 'Hẹn giờ',
  'Set time & date': 'Chọn ngày & giờ đăng',
  'Internal review': 'Lưu nội bộ để duyệt',
  'Scheduled Publish Time *': 'Thời gian Hẹn giờ Đăng *',
  'Quick Presets': 'Chọn nhanh Thời gian',
  '+1 Hour': '+1 Giờ tới',
  '+3 Hours': '+3 Giờ tới',
  'Tomorrow Morning (09:00)': 'Sáng mai (09:00)',
  'Tomorrow Evening (20:00)': 'Tối mai (20:00)',
  '💡 This article will be automatically published to the homepage and category pages at the scheduled time.': '💡 Bài viết này sẽ tự động xuất bản lên trang chủ và chuyên mục đúng vào thời điểm đã hẹn.',
  'Public Display Date': 'Ngày hiển thị công khai',
  'Default: Today': 'Mặc định: Hôm nay',
  'Feature on Homepage Hero / Spotlight': 'Ghim nổi bật trên Trang chủ (Hero / Spotlight)',
  'Article Body Content': 'Nội dung Chi tiết Bài viết',
  'Microsoft Word Studio Editor • Full support for Font Family, Font Size, Data Tables, Alignment, A4 Paper View & Affiliate Blocks': 'Trình soạn thảo Microsoft Word Studio • Hỗ trợ đầy đủ Phông chữ, Cỡ chữ, Bảng biểu, Căn lề, Khổ giấy A4 & Khối Affiliate',
  'Category & Media': 'Chuyên mục & Ảnh đại diện',
  'Editorial Category *': 'Chuyên mục Bài viết *',
  'Featured Cover Image': 'Ảnh bìa Đại diện (Cover Image)',
  'Author & Benchmarks': 'Tác giả & Chỉ số Đánh giá',
  'Author Name': 'Tên Tác giả',
  'Author Role / Beat': 'Chức danh / Chuyên trách',
  'Lab Score (0 - 5.0)': 'Điểm Đánh giá Lab (0 - 5.0)',
  'Read Time': 'Thời lượng đọc',
  'Tags (Comma-separated)': 'Thẻ Tags (Phân cách bằng dấu phẩy)',
  'Right Sidebar & Affiliate Store Configuration': 'Cấu hình Thanh bên Phải (Right Sidebar) & Thương hiệu Affiliate',
  'Configure the partner store, active promo codes, related reviews, and editorial guarantee displayed in the article right sidebar': 'Cấu hình thương hiệu đối tác, mã giảm giá đang hoạt động, bài đánh giá liên quan và hộp cam kết hiển thị ở cột phải bài viết',
  'Right Sidebar Config': 'Cấu hình Cột phải',
  'Target Partner Store': 'Thương hiệu Đối tác Đích',
  '✨ Auto-detect from title / slug': '✨ Tự động nhận diện từ tiêu đề / slug',
  'Store Display Name (Optional Override)': 'Tên Hiển thị Thương hiệu (Tùy chọn ghi đè)',
  'CTA Button Text': 'Nội dung Nút Kêu gọi (CTA Button)',
  'Short Description Under Store Name': 'Mô tả Ngắn dưới Tên Thương hiệu',
  'Right Sidebar Widget Visibility': 'Hiển thị các Khối Tiện ích (Widgets) ở Cột phải',
  '1. Brand Deals Card': '1. Thẻ Thương hiệu & Ưu đãi',
  'Store logo, rating stars, summary, and promo code CTA button.': 'Hiển thị logo hãng, điểm sao, mô tả ngắn và nút lấy mã giảm giá.',
  '2. Active Promo Codes': '2. Danh sách Mã giảm giá Đang mở',
  'Displays up to 3 active coupons for the selected store.': 'Hiển thị tối đa 3 mã giảm giá đang hoạt động của thương hiệu được chọn.',
  '3. Related Lab Reviews': '3. Bài Đánh giá Liên quan',
  'Recommends related reviews in the same category with thumbnails.': 'Gợi ý các bài đánh giá cùng chuyên mục kèm ảnh thu nhỏ.',
  '4. Testing Guarantee & Tags': '4. Cam kết Đánh giá Độc lập & Tags',
  'Independent testing guarantee box with #tag pills.': 'Hộp cam kết kiểm nghiệm độc lập kèm danh sách thẻ #tag.',
  'Guarantee Box Title': 'Tiêu đề Hộp Cam kết',
  'Guarantee Description': 'Nội dung Mô tả Cam kết',
  'Right Sidebar Preview': 'Xem trước Cột Phải',
  'Live Sync': 'Đồng bộ Trực tiếp',
  'Published Stories': 'Bài đã xuất bản',
  'Scheduled Releases': 'Bài hẹn giờ đăng',
  'Pending Drafts': 'Bản nháp đang chờ',
  'Total Reader Views': 'Tổng lượt đọc',
  'All Editorial Categories': 'Tất cả chuyên mục bài viết',
  'All Publishing Statuses': 'Tất cả trạng thái xuất bản',
  'Published Only': 'Chỉ bài đã đăng',
  'Scheduled Only': 'Chỉ bài hẹn giờ',
  'Drafts Only': 'Chỉ bản nháp',
  'Sort: Highest Reader Views': 'Sắp xếp: Lượt xem cao nhất',
  'Published': 'Đã xuất bản',
  'PUBLISHED': 'ĐÃ XUẤT BẢN',
  'Scheduled': 'Hẹn giờ',
  'SCHEDULED': 'HẸN GIỜ',
  'Draft': 'Bản nháp',
  'DRAFT': 'BẢN NHÁP',
  'Article / Headline': 'Tiêu đề Bài viết',
  'Author': 'Tác giả',
  'Brand Store': 'Thương hiệu gắn kèm',
  'Views': 'Lượt xem',
  'Updated': 'Cập nhật',
  'No editorial articles match your current filters.': 'Không có bài viết nào khớp với bộ lọc hiện tại.',

  // ============================================================================
  // 8. CATEGORIES & CATEGORY FORM (`/admin/categories`, `CategoryForm.tsx`)
  // ============================================================================
  'Editorial Categories Management': 'Quản lý Chuyên mục Nội dung',
  'Editorial Categories': 'Chuyên mục Nội dung',
  'Configure editorial taxonomy matching client navigation bars: Tech, Business, Entertainment, US Politics, Reviews, and Lifestyle.': 'Cấu hình phân loại chuyên mục đồng bộ với thanh điều hướng trang chủ.',
  'Create New Editorial Category': 'Tạo Chuyên mục Nội dung Mới',
  'Configure category taxonomy, navigation order, and public URL routing.': 'Cấu hình phân loại chuyên mục, thứ tự hiển thị trên menu và đường dẫn URL công khai.',
  'Add Category': 'Thêm Chuyên mục',
  'Create Category': 'Tạo Chuyên mục',
  'Save Category': 'Lưu Chuyên mục',
  'Category Details': 'Thông tin Chi tiết Chuyên mục',
  'Category Name *': 'Tên Chuyên mục *',
  'Navigation Order *': 'Thứ tự Hiển thị trên Menu *',
  'Category Description *': 'Mô tả Chuyên mục *',
  'Visibility & Metrics': 'Trạng thái Hiển thị & Thống kê',
  'Show in Navigation': 'Hiển thị trên Thanh điều hướng',
  'Display on client top nav bar': 'Hiển thị trên menu chính của trang chủ',
  'Published Articles Count': 'Số lượng Bài viết Đã xuất bản',
  'Order': 'Thứ tự',
  'Category Name': 'Tên Chuyên mục',
  'Public URL': 'Đường dẫn Công khai',
  'Articles': 'Bài viết',
  'Active in Nav': 'Hiển thị trên Menu',
  'Inactive / Hidden': 'Đang ẩn',
  'Sort: Navigation Order': 'Sắp xếp: Thứ tự hiển thị',
  'Sort: Most Published Articles': 'Sắp xếp: Nhiều bài viết nhất',
  'No categories match the active filters.': 'Không có chuyên mục nào khớp với bộ lọc.',

  // ============================================================================
  // 9. MEDIA LIBRARY (`/admin/media`)
  // ============================================================================
  'Media Library & Asset Management': 'Thư viện Media & Quản lý Tài nguyên',
  'Media Library & Digital Assets': 'Thư viện Media & Tài nguyên số',
  'Centralized image repository. Mandatory tag indexing is enforced on upload for instant search and reuse.': 'Kho lưu trữ hình ảnh tập trung. Bắt buộc gắn thẻ (tag) khi tải lên để tìm kiếm và tái sử dụng nhanh chóng.',
  'Upload Image (Tag Required)': 'Tải ảnh lên (Bắt buộc gắn Tag)',
  'Upload Media': 'Tải ảnh lên',
  'Open Drag & Drop Upload Zone': 'Mở khung Kéo & Thả tải ảnh nhanh',
  'Hide Drag & Drop Upload Zone': 'Đóng khung Kéo & Thả tải ảnh',
  'Upload & Optimize New Image': 'Tải lên & Tối ưu Hình ảnh Mới',
  'Automatically converts to optimized WebP. You will be prompted to add at least one search tag.': 'Tự động chuyển đổi sang chuẩn WebP tối ưu. Bạn sẽ được yêu cầu gắn ít nhất 1 thẻ tìm kiếm.',
  'Target Folder:': 'Thư mục lưu:',
  'Promotional Banners': 'Banner Khuyến mãi',
  'Logos & Icons': 'Logo & Biểu tượng',
  'Click to select an image or drag and drop files here': 'Nhấn để chọn ảnh hoặc kéo thả tệp vào đây',
  'PNG, JPG, WEBP, SVG up to 10MB': 'PNG, JPG, WEBP, SVG tối đa 10MB',
  'Tags:': 'Thẻ (Tags):',
  'All Assets': 'Tất cả tài nguyên',
  'Stores': 'Cửa hàng',
  'Banners': 'Biểu ngữ',
  'Icons': 'Biểu tượng',
  'All tags': 'Tất cả thẻ',
  'Search by file name, tag (#review, #apple, #tech)...': 'Tìm theo tên tệp, thẻ (#review, #apple, #tech)...',
  'All Formats': 'Tất cả định dạng',
  'Newest Uploaded': 'Mới tải lên nhất',
  'Largest Size': 'Dung lượng lớn nhất',
  'File Name (A → Z)': 'Tên tệp (A → Z)',
  'Grid View': 'Dạng lưới',
  'Table View': 'Dạng bảng',
  'No matching media files found': 'Không tìm thấy tệp media phù hợp',
  'Try changing your search query or clearing tag filters.': 'Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc thẻ.',
  'Optimized': 'Đã tối ưu',
  'Untagged': 'Chưa gắn thẻ',
  'View Details & Tags': 'Xem chi tiết & Thẻ',
  'Copied image URL to clipboard': 'Đã sao chép liên kết ảnh vào bộ nhớ tạm',
  'Delete image': 'Xóa ảnh',
  'Delete file': 'Xóa tệp',
  'Delete Media Asset': 'Xóa tệp Media',
  'Are you sure you want to delete this image permanently? This action cannot be undone.': 'Bạn có chắc chắn muốn xóa vĩnh viễn hình ảnh này? Thao tác này không thể hoàn tác.',
  'Delete Image': 'Xóa ảnh',
  'Image deleted from media library': 'Đã xóa ảnh khỏi thư viện media',
  'Failed to delete media asset.': 'Không thể xóa tệp media.',
  'Please add at least 1 tag to categorize and index this image!': 'Vui lòng thêm ít nhất 1 thẻ (tag) để phân loại và lập chỉ mục cho ảnh này!',
  'Image uploaded and saved to PostgreSQL library!': 'Hình ảnh đã được tải lên và lưu vào thư viện!',
  'Failed to upload image.': 'Không thể tải lên hình ảnh.',
  'Failed to update tags.': 'Không thể cập nhật thẻ.',
  'Failed to remove tag.': 'Không thể xóa thẻ.',
  'File Name': 'Tên tệp',
  'Search Tags': 'Thẻ tìm kiếm',
  'Folder': 'Thư mục',
  'Dimensions': 'Kích thước',
  'Size': 'Dung lượng',
  'Format': 'Định dạng',
  'Uploaded': 'Ngày tải lên',
  'Copy URL': 'Sao chép URL',
  'View Details & Manage Tags': 'Xem chi tiết & Quản lý thẻ',
  'Tag Uploaded Image': 'Gắn thẻ hình ảnh tải lên',
  'Tags are required for fast indexing and reuse across the CMS.': 'Bắt buộc gắn thẻ để lập chỉ mục tìm kiếm và tái sử dụng nhanh chóng trong CMS.',
  'Folder:': 'Thư mục:',
  'Articles (articles)': 'Bài viết (articles)',
  'Stores (stores)': 'Cửa hàng (stores)',
  'Banners (banners)': 'Biểu ngữ (banners)',
  'Icons / Logos (icons)': 'Biểu tượng / Logo (icons)',
  'Classification Tags (Minimum 1 required)': 'Thẻ phân loại (Bắt buộc ít nhất 1 thẻ)',
  'Type a tag and press Enter (e.g. review, tech, m3...)': 'Nhập thẻ và nhấn Enter (ví dụ: review, tech, m3...)',
  'Tags enable instant filtering and search in the Media Library.': 'Thẻ giúp lọc và tìm kiếm tức thì trong Thư viện Media.',
  'Optimizing & saving...': 'Đang tối ưu & lưu...',
  'Complete Upload & Save': 'Hoàn tất tải lên & Lưu',
  'Manage Search Tags': 'Quản lý thẻ tìm kiếm',
  'Click "x" to remove or type a new tag': 'Nhấn "x" để xóa hoặc nhập thẻ mới',
  'No tags assigned yet': 'Chưa có thẻ nào được gán',
  'Enter a new tag for this image...': 'Nhập thẻ mới cho hình ảnh này...',
  '+ Add Tag': '+ Thêm thẻ',
  'Suggested tags (click to quick-add):': 'Thẻ gợi ý (nhấn để thêm nhanh):',
  'File Size': 'Dung lượng tệp',
  'Public / CDN URL': 'Liên kết CDN / Công khai',
  'Copy Link': 'Sao chép liên kết',
  'Open Original': 'Mở ảnh gốc',
  'Category Tags (Required)': 'Thẻ danh mục (Bắt buộc)',
  'Added:': 'Đã thêm:',
  'Type a tag and press Enter or comma (e.g., review, tech, m3...)': 'Nhập thẻ và nhấn Enter hoặc dấu phẩy (vd: review, tech, m3...)',
  'Add Tag': 'Thêm thẻ',
  'No tags yet:': 'Chưa có thẻ nào:',
  'Please enter or select at least 1 tag below to categorize this image.': 'Vui lòng nhập hoặc chọn ít nhất 1 thẻ dưới đây để phân loại hình ảnh này.',
  'Popular tag suggestions (click to quick-add):': 'Gợi ý thẻ phổ biến (nhấn để thêm nhanh):',
  'Adding tags helps images remain easily searchable and organized in the library.': 'Gắn thẻ giúp hình ảnh dễ dàng tìm kiếm và sắp xếp ngăn nắp trong thư viện.',

  // ============================================================================
  // 10. NAVIGATION MENUS & MENU FORM (`/admin/menus`, `MenuForm.tsx`)
  // ============================================================================
  'Navigation Menus Manager': 'Quản lý Menu Điều hướng',
  'Configure primary header links, footer sitemaps, category drop-downs, and custom affiliate routes.': 'Cấu hình liên kết thanh điều hướng chính, menu chân trang, danh mục thả xuống và đường dẫn tùy chỉnh.',
  'Add Navigation Menu Item': 'Thêm Mục Menu Điều Hướng Mới',
  'Configure link destination, navigation placement, and display order.': 'Cấu hình đường dẫn đích, vị trí hiển thị trên menu và thứ tự sắp xếp.',
  'Add Menu Item': 'Thêm mục Menu',
  'Save Menu Item': 'Lưu mục Menu',
  'Menu Item Details': 'Chi tiết Mục Menu',
  'Menu Label *': 'Nhãn Hiển thị trên Menu *',
  'Navigation Placement *': 'Vị trí Hiển thị *',
  'Header Main Navigation': 'Thanh Điều hướng Chính (Header)',
  'Footer Sitemap Links': 'Liên kết Chân trang (Footer)',
  'Destination Type *': 'Loại Đích đến *',
  'Editorial Category': 'Chuyên mục Bài viết',
  'Display Order *': 'Thứ tự Hiển thị *',
  'Target Category Slug *': 'Đường dẫn (Slug) Chuyên mục Đích *',
  'Target Store Slug *': 'Đường dẫn (Slug) Thương hiệu Đích *',
  'Target Page Route *': 'Đường dẫn Trang tĩnh Đích *',
  'Target URL *': 'Đường dẫn URL Đích *',
  'Status & Preview': 'Trạng thái & Xem trước Đường dẫn',
  'Active in Navigation': 'Kích hoạt trên Menu',
  'Visible on public website': 'Hiển thị công khai trên website',
  'Resolved URL Preview': 'Đường dẫn URL Thực tế',
  'Menu Label': 'Nhãn Menu',
  'Placement': 'Vị trí hiển thị',
  'Destination Type': 'Loại đích đến',
  'Target Destination': 'Đường dẫn đích',
  'All Destination Types': 'Tất cả loại đích đến',
  'Custom External URL': 'Đường dẫn tùy chỉnh (URL)',
  'Static Page': 'Trang tĩnh',
  'Merchant Store': 'Thương hiệu đối tác',
  'Order (1 → 99)': 'Thứ tự (1 → 99)',
  'Order (99 → 1)': 'Thứ tự (99 → 1)',
  'Label (A → Z)': 'Tên nhãn (A → Z)',
  'Label (Z → A)': 'Tên nhãn (Z → A)',

  // ============================================================================
  // 11. STATIC PAGES & PAGE FORM (`/admin/pages`, `PageForm.tsx`)
  // ============================================================================
  'Static Pages & Legal Compliance': 'Trang Tĩnh & Pháp Lý Tuân Thủ',
  'Manage legal disclosures, affiliate compliance statements, terms of service, and editorial guidelines.': 'Quản lý tuyên bố miễn trừ trách nhiệm tiếp thị liên kết, điều khoản dịch vụ, chính sách bảo mật và nguyên tắc biên tập.',
  'Create Static / Policy Page': 'Tạo Trang Tĩnh / Chính Sách Mới',
  'Manage legal policies, affiliate disclosures, editorial standards, and custom pages.': 'Quản lý trang chính sách pháp lý, tuyên bố affiliate, tiêu chuẩn biên tập và trang tùy chỉnh.',
  'Create Static Page': 'Tạo Trang Tĩnh Mới',
  'Create Page': 'Tạo Trang mới',
  'Save Page': 'Lưu Trang tĩnh',
  'Publish Page': 'Xuất bản Trang tĩnh',
  'Page Identity & Route': 'Định danh Trang & Đường dẫn URL',
  'Page Title *': 'Tiêu đề Trang *',
  'Public Route Preview': 'Xem trước Đường dẫn Công khai',
  'Summary / Subtitle *': 'Tóm tắt / Tiêu đề phụ *',
  'Publishing & Navigation': 'Xuất bản & Thứ tự Điều hướng',
  'Published Status': 'Trạng thái Xuất bản',
  'Publicly accessible via URL': 'Cho phép truy cập công khai qua URL',
  'Navigation Sort Order': 'Thứ tự Sắp xếp trên Menu',
  'SEO & Meta Tags': 'Cấu hình SEO & Thẻ Meta',
  'Meta Title (50–60 chars)': 'Tiêu đề SEO (Meta Title • 50–60 ký tự)',
  'Meta Description (150–160 chars)': 'Mô tả SEO (Meta Description • 150–160 ký tự)',
  'Page Body Content (Word Studio)': 'Nội dung Chi tiết Trang (Word Studio)',
  'Compose full legal disclosures, editorial policies, or landing page content with live formatting': 'Soạn thảo toàn bộ nội dung chính sách pháp lý, quy chuẩn biên tập hoặc trang giới thiệu với định dạng trực quan',
  'Client Static Page Preview': 'Xem trước Trang Tĩnh (Client)',
  'Page Title': 'Tiêu đề Trang',
  'Live URL': 'Đường dẫn Trực tiếp',
  'Last Modified': 'Cập nhật Lần cuối',
  'Status: All': 'Trạng thái: Tất cả',
  'Status: Published Only': 'Trạng thái: Đã xuất bản',
  'Status: Drafts Only': 'Trạng thái: Bản nháp',
  'Navigation Order (1 → 99)': 'Thứ tự điều hướng (1 → 99)',
  'Navigation Order (99 → 1)': 'Thứ tự điều hướng (99 → 1)',
  'Page Title (A → Z)': 'Tiêu đề trang (A → Z)',
  'No static pages found. Try adjusting your keyword search or status filter.': 'Không tìm thấy trang tĩnh nào khớp với bộ lọc.',

  // ============================================================================
  // 12. FEEDBACK & SUBSCRIBERS (`/admin/feedback`, `/admin/subscribers`)
  // ============================================================================
  'Customer Inquiries & Feedback': 'Liên hệ & Phản hồi Khách hàng',
  'Review user coupon reports, merchant listing applications, and partnership proposals.': 'Xem xét báo cáo mã giảm giá từ độc giả, đăng ký hợp tác thương hiệu và yêu cầu hỗ trợ.',
  'Sender': 'Người gửi',
  'Message Snippet': 'Nội dung tóm tắt',
  'Date': 'Ngày gửi',
  'Unread': 'Chưa đọc',
  'Read': 'Đã đọc',
  'Mark as Read': 'Đánh dấu đã đọc',
  'Newest First': 'Mới nhất trước',
  'Oldest First': 'Cũ nhất trước',
  'Sender (A → Z)': 'Người gửi (A → Z)',
  'No customer inquiries found. Try adjusting your keyword query or clear active filters.': 'Không tìm thấy liên hệ nào từ khách hàng.',

  'Readers who signed up via the homepage Dispatch block. Configure the block content in System Settings → Newsletter.': 'Danh sách độc giả đăng ký nhận bản tin từ trang chủ. Cấu hình nội dung hộp đăng ký tại Cấu hình Hệ thống → Bản tin.',
  'Email': 'Địa chỉ Email',
  'Source': 'Nguồn đăng ký',
  'Subscribed At': 'Thời gian đăng ký',
  'Unsubscribed': 'Đã hủy đăng ký',
  'Email (A → Z)': 'Email (A → Z)',
  'Add Subscriber': 'Thêm người đăng ký',
  'No subscribers found. Signups from the homepage newsletter block will appear here.': 'Chưa có người đăng ký bản tin nào.',

  // ============================================================================
  // 13. STAFF ACCOUNTS & USER FORM (`/admin/users`, `UserForm.tsx`)
  // ============================================================================
  'Staff & Administrator Accounts': 'Tài khoản Nhân sự & Quản trị viên',
  'Staff Accounts & 2FA Security': 'Tài khoản Nhân sự & Bảo mật 2FA',
  'Manage admin users, granular RBAC privilege tiers, and RFC 6238 TOTP two-factor security status.': 'Quản lý tài khoản nhân sự, cấp bậc phân quyền RBAC và trạng thái xác thực hai lớp (2FA TOTP).',
  'Provision New Staff Account': 'Khởi Tạo Tài Khoản Nhân Sự Mới',
  'Configure staff identity, RBAC role tier, and 2FA security settings.': 'Cấu hình thông tin nhân sự, cấp bậc phân quyền RBAC và thiết lập bảo mật 2FA.',
  'Save Account': 'Lưu Tài khoản',
  'Create Account': 'Tạo Tài khoản',
  'Staff Identity': 'Thông tin Định danh Nhân sự',
  'Full Name *': 'Họ và Tên *',
  'Email Address *': 'Địa chỉ Email *',
  'Initial Password *': 'Mật khẩu Khởi tạo *',
  'Reset Password (leave blank to keep current)': 'Đặt lại Mật khẩu (Để trống nếu giữ nguyên)',
  'Role & Security': 'Vai trò RBAC & Bảo mật 2FA',
  'Assigned RBAC Role *': 'Vai trò Phân quyền RBAC *',
  'Super Administrator': 'Quản trị viên Cấp cao (Super Admin)',
  'Senior Editor': 'Biên tập viên Chính (Senior Editor)',
  'Affiliate Manager': 'Quản lý Affiliate (Affiliate Manager)',
  'Account Active': 'Kích hoạt Tài khoản',
  'Allow sign-in to backoffice': 'Cho phép đăng nhập vào hệ thống quản trị',
  '2FA TOTP Status': 'Trạng thái Bảo mật 2FA TOTP',
  'RFC 6238 Authenticator enabled': 'Đã kích hoạt xác thực qua ứng dụng Authenticator',
  'Add Staff User': 'Thêm Nhân sự Mới',
  'Add Staff Member': 'Thêm Nhân sự',
  'User': 'Nhân sự',
  'Role Tier': 'Vai trò',
  'Two-Factor Auth': 'Bảo mật 2FA',
  'Created Date': 'Ngày tạo',
  'All Roles': 'Tất cả vai trò',
  '2FA: All Security Tiers': '2FA: Tất cả trạng thái',
  '2FA: Active Only': '2FA: Đã kích hoạt',
  '2FA: Not Configured': '2FA: Chưa thiết lập',
  'Full Name (A → Z)': 'Họ tên (A → Z)',
  'Full Name (Z → A)': 'Họ tên (Z → A)',
  'Created Date (Newest)': 'Ngày tạo (Mới nhất)',

  // ============================================================================
  // 14. ROLES & RBAC MATRIX + CREATE ROLE (`/admin/roles`, `roles/create/page.tsx`)
  // ============================================================================
  'Role-Based Access Control (Dynamic RBAC)': 'Kiểm soát Truy cập theo Vai trò (RBAC Động)',
  'Roles & RBAC Permission Matrix': 'Ma trận Phân quyền & Vai trò (RBAC)',
  'Configure operational privileges for each staff role. Core system permissions are granted by default and locked across all roles.': 'Cấu hình quyền hạn chi tiết cho từng vai trò nhân sự. Các quyền cốt lõi của hệ thống được cấp mặc định và khóa bảo vệ.',
  'Create Custom Role': 'Tạo Vai trò Tùy chỉnh',
  'Create Custom RBAC Role': 'Tạo Vai Trò Phân Quyền (RBAC) Mới',
  'Define role metadata and select granular permissions. Core baseline permissions are automatically granted and locked.': 'Định nghĩa thông tin vai trò và chọn quyền hạn chi tiết. Các quyền cốt lõi được cấp tự động và khóa cố định.',
  'Create Role': 'Tạo Vai trò Mới',
  'Role Identity': 'Thông tin Định danh Vai trò',
  'Role Name *': 'Tên Vai trò *',
  'Role Slug *': 'Mã định danh (Slug) *',
  'Core Baseline Included': 'Đã bao gồm Quyền Cốt lõi Mặc định',
  'Access Admin ProCMS, Dashboard Overview, Personal Profile & 2FA, and Media Library Upload are enabled by default and locked.': 'Quyền Truy cập ProCMS, Xem Bảng điều khiển, Hồ sơ cá nhân & 2FA, và Thư viện Media được bật mặc định và khóa cố định.',
  'Permission Selection Matrix': 'Ma trận Lựa chọn Quyền hạn Chi tiết',
  'Configured Roles': 'Danh sách Vai trò',
  'Select a role to manage its permissions': 'Chọn một vai trò để cấu hình quyền hạn',
  'System': 'Hệ thống',
  'Full Superuser Authorization': 'Toàn quyền Quản trị Tối cao',
  'Default • Locked for All Roles': 'Mặc định • Khóa cố định cho mọi vai trò',
  'Always Granted (Cannot Disable)': 'Luôn được cấp (Không thể tắt)',

  // Permission Catalog Modules, Labels & Descriptions (`roles/_lib/data.ts`)
  'Core System Privileges (Mandatory)': 'Quyền Hệ thống Cốt lõi (Bắt buộc)',
  'Minimum baseline permissions granted to all roles by default and locked against modification.': 'Các quyền cơ bản tối thiểu được cấp mặc định cho mọi vai trò và được khóa để tránh tắt nhầm.',
  'Access Admin ProCMS': 'Truy cập Hệ thống Quản trị ProCMS',
  'Sign in to the admin console and access core workspace features': 'Đăng nhập vào bảng điều khiển quản trị và sử dụng các tính năng làm việc cơ bản',
  'View Dashboard Overview': 'Xem Tổng quan Bảng điều khiển',
  'View operational KPIs, performance charts, and system notifications': 'Xem chỉ số KPI vận hành, biểu đồ hiệu suất và thông báo hệ thống',
  'Personal Profile & 2FA': 'Hồ sơ Cá nhân & Bảo mật 2FA',
  'View own account profile, change password, and manage two-factor authentication': 'Xem hồ sơ cá nhân, đổi mật khẩu và quản lý xác thực hai lớp (2FA)',
  'Media Library & Image Upload': 'Thư viện Media & Tải ảnh lên',
  'Open the shared Media Library to browse and insert images while editing': 'Mở Thư viện Media dùng chung để duyệt và chèn hình ảnh khi biên tập nội dung',

  'Stores Directory Management': 'Quản lý Danh bạ Thương hiệu',
  'View Stores': 'Xem Thương hiệu',
  'Browse and inspect partner merchant profiles': 'Duyệt và xem chi tiết hồ sơ các thương hiệu đối tác',
  'Create Stores': 'Tạo Thương hiệu Mới',
  'Add new merchant brands and affiliate domain links': 'Thêm thương hiệu đối tác mới và cấu hình liên kết tên miền affiliate',
  'Update Stores': 'Cập nhật Thương hiệu',
  'Edit store logos, star ratings, and merchant descriptions': 'Chỉnh sửa logo thương hiệu, điểm đánh giá sao và bài mô tả hãng',
  'Delete Stores': 'Xóa Thương hiệu',
  'Archive or remove merchants from the store directory': 'Lưu trữ hoặc xóa thương hiệu khỏi danh bạ đối tác',
  'Clone Stores': 'Nhân bản Thương hiệu',
  'Duplicate an existing merchant configuration as a draft': 'Nhân bản nhanh cấu hình của một thương hiệu sẵn có',
  'Commission & Affiliate Intel': 'Thông tin Hoa hồng & Đối tác Affiliate',
  'View affiliate commission rates and direct manager contacts': 'Xem tỷ lệ hoa hồng tiếp thị liên kết và thông tin liên hệ quản lý đối tác',

  'Coupons & Deals Management': 'Quản lý Mã giảm giá & Ưu đãi',
  'View Offers': 'Xem Ưu đãi & Mã giảm giá',
  'Browse coupon vouchers and promotional deals': 'Duyệt danh sách mã voucher và các chương trình khuyến mãi',
  'Create Offers': 'Tạo Ưu đãi Mới',
  'Add new promo codes or promotional campaigns': 'Thêm mã giảm giá mới hoặc chiến dịch khuyến mãi trực tiếp',
  'Update Offers': 'Cập nhật Ưu đãi',
  'Modify discount amounts, expiration dates, and terms': 'Chỉnh sửa mức giảm giá, đường dẫn đích và điều khoản áp dụng',
  'Delete Offers': 'Xóa Ưu đãi',
  'Remove expired or invalid coupons': 'Xóa các mã giảm giá đã hết hạn hoặc không còn hiệu lực',
  'Clone Offers': 'Nhân bản Ưu đãi',
  'Duplicate existing coupons with a single click': 'Nhân bản nhanh mã giảm giá hiện có chỉ với một cú nhấp chuột',

  'Articles & Reviews Management': 'Quản lý Bài viết & Đánh giá',
  'View Articles': 'Xem Bài viết',
  'Read product review drafts and buying guides': 'Xem danh sách bài đánh giá sản phẩm, bản nháp và cẩm nang mua sắm',
  'Create Articles': 'Viết Bài mới',
  'Compose reviews, deal boxes, and pros/cons tables': 'Soạn thảo bài đánh giá, chèn hộp ưu đãi và bảng ưu/nhược điểm',
  'Update Articles': 'Chỉnh sửa Bài viết',
  'Edit article content, sidebar config, and lab benchmark scores': 'Chỉnh sửa nội dung bài viết, cấu hình cột phải và điểm chấm Lab',
  'Delete Articles': 'Xóa Bài viết',
  'Archive or permanently delete review articles': 'Lưu trữ hoặc xóa vĩnh viễn bài viết đánh giá',
  'Publish & Schedule': 'Xuất bản & Hẹn giờ Đăng',
  'Publish articles live or schedule future release times': 'Xuất bản bài viết công khai ngay hoặc hẹn giờ tự động đăng',
  'Clone Articles': 'Nhân bản Bài viết',
  'Duplicate an article as a draft for re-editing': 'Nhân bản bài viết thành bản nháp để biên tập lại',

  'CMS & Content Channels': 'Quản lý Chuyên mục & Kênh Nội dung',
  'View Categories': 'Xem Chuyên mục',
  'View editorial taxonomy and category hierarchy': 'Xem danh sách phân loại chuyên mục nội dung',
  'Manage Categories': 'Quản lý Chuyên mục',
  'Create, edit, and reorder editorial categories': 'Tạo mới, chỉnh sửa và sắp xếp thứ tự các chuyên mục',
  'Configure header, footer, and portal navigation menus': 'Cấu hình menu thanh điều hướng đầu trang và chân trang',
  'Manage terms of service, privacy policy, and about pages': 'Quản lý trang điều khoản dịch vụ, chính sách bảo mật và giới thiệu',
  'View and respond to reader inquiries and feedback': 'Xem và phản hồi các tin nhắn liên hệ từ độc giả',

  'Staff Accounts & Security': 'Tài khoản Nhân sự & Bảo mật',
  'View Staff Accounts': 'Xem Tài khoản Nhân sự',
  'Browse staff accounts and assigned roles': 'Xem danh sách tài khoản nhân sự và vai trò được phân công',
  'Create Staff Accounts': 'Tạo Tài khoản Nhân sự',
  'Provision new backoffice accounts for team members': 'Khởi tạo tài khoản quản trị mới cho thành viên trong đội ngũ',
  'Update Staff Accounts': 'Cập nhật Tài khoản Nhân sự',
  'Change staff roles, email addresses, or account status': 'Thay đổi vai trò nhân sự, địa chỉ email hoặc trạng thái hoạt động',
  'Emergency 2FA Reset': 'Khôi phục Khẩn cấp 2FA',
  'Reset 2FA when a staff member loses their authenticator device': 'Đặt lại bảo mật 2FA khi nhân sự mất thiết bị xác thực',

  'View Role Matrix': 'Xem Ma trận Phân quyền',
  'Inspect role definitions and detailed permission mappings': 'Xem định nghĩa các vai trò và bảng ánh xạ quyền hạn chi tiết',
  'Manage Roles & Permissions': 'Quản lý Vai trò & Phân quyền',
  'Create custom roles and update the RBAC permission matrix': 'Tạo vai trò tùy chỉnh mới và cập nhật ma trận phân quyền RBAC',
  'View Action Tracing & Audit': 'Xem Nhật ký Hoạt động & Kiểm toán',
  'Access immutable audit logs of all user actions and data diffs': 'Truy cập nhật ký kiểm toán ghi lại mọi thao tác và thay đổi dữ liệu',

  'System Settings & SEO': 'Cấu hình Hệ thống & SEO',
  'General Configuration': 'Cấu hình Thông tin Chung',
  'Update site name, brand logos, and contact details': 'Cập nhật tên website, logo thương hiệu và thông tin liên hệ',
  'SEO & Verification Meta': 'Thẻ Meta SEO & Xác minh Mạng lưới',
  'Configure PartnerBoost, Impact, and Google Search Console tags': 'Cấu hình thẻ xác minh PartnerBoost, Impact và Google Search Console',
  'Manage Google Tag Manager and Google Analytics IDs': 'Quản lý mã theo dõi Google Tag Manager và Google Analytics 4',
  'Monetization & Banners': 'Quảng cáo & Banner Tài trợ',
  'Manage sponsored banner placements across the site': 'Quản lý banner quảng cáo tài trợ hiển thị trên website',

  // ============================================================================
  // 15. ACTION TRACING & AUDIT (`/admin/tracing`)
  // ============================================================================
  'Action Tracing & Comprehensive Audit Trail': 'Nhật ký Truy vết & Kiểm toán Hệ thống',
  'Immutable audit log tracking all system changes: editorial reviews, promo code updates, RBAC permission changes, and 2FA sign-ins.': 'Nhật ký kiểm toán bất biến ghi nhận mọi thay đổi: bài đánh giá, cập nhật mã giảm giá, thay đổi phân quyền RBAC và đăng nhập 2FA.',
  'Total Events': 'Tổng Sự kiện',
  'Immutable system audit records': 'Bản ghi kiểm toán hệ thống bất biến',
  'Sensitive Actions': 'Thao tác Nhạy cảm',
  'Data deletions & RBAC changes': 'Xóa dữ liệu & thay đổi quyền RBAC',
  'Active Operators': 'Quản trị viên Hoạt động',
  'Staff accounts with recorded actions': 'Tài khoản nhân sự có thao tác được ghi nhận',
  'Last 24 Hours': '24 Giờ Qua',
  'Events recorded today': 'Sự kiện được ghi nhận hôm nay',
  'All Action Types': 'Tất cả loại thao tác',
  'CREATE (New Record)': 'CREATE (Tạo mới bản ghi)',
  'UPDATE (Modified)': 'UPDATE (Cập nhật dữ liệu)',
  'DELETE (Removed)': 'DELETE (Xóa bản ghi)',
  'PUBLISH (Published)': 'PUBLISH (Xuất bản)',
  'RBAC MATRIX (Role Permissions)': 'RBAC MATRIX (Thay đổi phân quyền)',
  'LOGIN (2FA Sign-In)': 'LOGIN (Đăng nhập 2FA)',
  'All Modules': 'Tất cả phân hệ',
  'Coupons & Deals': 'Mã giảm giá & Ưu đãi',
  'Partner Stores': 'Thương hiệu đối tác',
  'RBAC Roles & Permissions': 'Vai trò & Phân quyền RBAC',
  'Staff Accounts & 2FA': 'Tài khoản nhân sự & 2FA',
  'Authentication & Security': 'Xác thực & Bảo mật',
  'All Staff Members': 'Tất cả nhân sự',
  'Time Range:': 'Khoảng thời gian:',
  'All Time': 'Toàn thời gian',
  'Last 24h': '24 giờ qua',
  'Last 7 Days': '7 ngày qua',
  'Last 30 Days': '30 ngày qua',
  'Timestamp': 'Thời gian',
  'Operator': 'Người thực hiện',
  'Action Type': 'Loại thao tác',
  'Module': 'Phân hệ',
  'Target & Summary': 'Đối tượng & Chi tiết',
  'IP / Client': 'Địa chỉ IP / Thiết bị',
  'Inspect': 'Chi tiết',

  // ============================================================================
  // 16. SYSTEM SETTINGS (`/admin/settings`) & PROFILE (`/admin/profile`)
  // ============================================================================
  'System & Platform Configuration': 'Cấu hình Hệ thống & Nền tảng',
  'System Settings & Configuration': 'Cấu hình Hệ thống & Tích hợp',
  'Global metadata, search engine ownership verification tags, and third-party telemetry.': 'Thông tin định danh chung, thẻ xác minh công cụ tìm kiếm và mã theo dõi bên thứ ba.',
  'Brand & Identity': 'Thương hiệu & Định danh',
  'SEO & Verification': 'SEO & Thẻ xác minh',
  'Telemetry & GTM': 'Đo lường & GTM',
  'Monetization & Ads': 'Quảng cáo & Kiếm tiền',
  'Newsletter': 'Bản tin (Newsletter)',
  'General & Branding': 'Thông tin chung & Thương hiệu',
  'Tracking & Analytics': 'Theo dõi & Phân tích (GA4/GTM)',
  'Site Identity & Branding': 'Định danh Website & Thương hiệu',
  'Primary public branding displayed in headers and email footers': 'Thông tin thương hiệu hiển thị trên thanh đầu trang và chân trang email',
  'Platform Public Name': 'Tên công khai của Nền tảng',
  'Tagline (SEO Title Suffix)': 'Khẩu hiệu (Hậu tố tiêu đề SEO)',
  'Brand Logo': 'Logo Thương hiệu Website',
  'Upload or select a brand logo from the Media Library (must include tags).': 'Tải lên hoặc chọn logo thương hiệu từ Thư viện Media (bắt buộc gắn tag).',
  'Contact Support Email': 'Email liên hệ hỗ trợ',
  'Editorial Support Hotline': 'Số điện thoại đường dây nóng',
  'Search Engine Ownership Meta Tags': 'Thẻ Meta Xác minh Quyền sở hữu Công cụ Tìm kiếm',
  'Injected into the public <head> for automated search engine verification': 'Được chèn tự động vào thẻ <head> công khai để xác minh quyền sở hữu với công cụ tìm kiếm',
  'PartnerBoost Verification Meta Tag': 'Thẻ Meta Xác minh PartnerBoost',
  'Impact.com Site Verification Meta Tag': 'Thẻ Meta Xác minh Impact.com',
  'Google Search Console Verification Meta Tag': 'Thẻ Meta Xác minh Google Search Console',
  'Bing Webmaster Verification Meta Tag': 'Thẻ Meta Xác minh Bing Webmaster',
  'Telemetry & Event Tracking': 'Mã Đo lường & Theo dõi Sự kiện',
  'Container IDs for Google Tag Manager, GA4, and conversion pixels': 'Mã định danh cho Google Tag Manager, Google Analytics 4 và Pixel chuyển đổi',
  'Google Tag Manager (GTM) Container ID': 'Mã Google Tag Manager (GTM Container ID)',
  'Google Analytics 4 (GA4) Measurement ID': 'Mã Đo lường Google Analytics 4 (GA4 ID)',
  'Meta / Facebook Pixel ID': 'Mã Meta / Facebook Pixel ID',
  'Desktop Header Banner 728x90': 'Banner Quảng cáo Đầu trang (728x90)',
  'Configure promotional sponsorship banner shown on the public desktop header': 'Cấu hình banner tài trợ hiển thị trên thanh đầu trang máy tính',
  'Show on public header': 'Hiển thị trên đầu trang chủ',
  'Banner Creative Image URL (728x90 px)': 'Đường dẫn Ảnh Banner (728x90 px)',
  'Destination Sponsor URL': 'Đường dẫn Đích của Nhà tài trợ',
  'Live Banner Preview': 'Xem trước Banner Quảng cáo',
  'Homepage Newsletter Block': 'Khối Đăng ký Bản tin Trang chủ (Dispatch)',
  'Show on homepage': 'Hiển thị trên trang chủ',
  'Eyebrow Label': 'Nhãn Phụ phía trên (Eyebrow)',
  'Headline': 'Tiêu đề Chính',
  'Description': 'Mô tả Chi tiết',
  'Email Input Placeholder': 'Chữ gợi ý trong Ô nhập Email',
  'Button Text': 'Chữ trên Nút Đăng ký',
  'Success Message': 'Thông báo Khi Đăng ký Thành công',
  'Reset Banner Defaults': 'Khôi phục Mặc định Banner',
  'Live 728x90 Header Banner Preview': 'Xem trước Trực tiếp Banner Đầu trang (728x90)',
  'Real-time preview of the public client masthead unit': 'Mô phỏng trực tiếp giao diện banner quảng cáo trên đầu trang chủ',
  'Banner Eyebrow Badge': 'Nhãn Nổi bật (Badge)',
  'Banner Subtitle Tag': 'Nhãn Phụ (Subtitle)',
  'Banner Headline Title': 'Tiêu đề Chính của Banner',
  'Banner Supporting Description': 'Mô tả Chi tiết dưới Tiêu đề',
  'Upload a 728x90 banner background image, choose from Media Library, or paste an image URL.':
    'Tải ảnh nền banner 728x90 từ máy tính, chọn từ Thư viện Media hoặc dán liên kết URL ảnh.',

  // Extended System Configuration & Settings
  'Corporate Office Address': 'Địa chỉ Văn phòng Doanh nghiệp',
  'Browser Favicon': 'Favicon Trình duyệt',
  'Upload or select a 32x32 favicon icon from Media Library.': 'Tải lên hoặc chọn biểu tượng favicon 32x32 từ Thư viện Media.',
  'Footer Copyright Notice': 'Bản quyền Chân trang (Footer Copyright)',
  'Default Meta Title': 'Tiêu đề Meta Mặc định (SEO Title)',
  'Default Meta Description': 'Mô tả Meta Mặc định (SEO Description)',
  'Canonical Website URL': 'Đường dẫn Gốc (Canonical URL)',
  'Social Sharing Open Graph Image': 'Ảnh Chia sẻ Mạng xã hội (Open Graph Image)',
  'Search Engine Indexing': 'Lập Chỉ mục Tìm kiếm (Robots Indexing)',
  'Allow Search Engines (index, follow)': 'Cho phép Công cụ Tìm kiếm lập chỉ mục (index, follow)',
  'Block Search Crawlers (noindex, nofollow)': 'Chặn Công cụ Tìm kiếm (noindex, nofollow)',
  'Cloudflare Web Analytics Token': 'Mã Token Cloudflare Web Analytics',
  'Affiliate Link Cloaking & Network Settings': 'Thiết lập Tiếp thị Liên kết & Rút gọn Link',
  'Configure outgoing affiliate link prefixes, partner tags, and FTC compliance disclosures.': 'Cấu hình tiền tố link chuyển hướng affiliate, mã đối tác và tuyên bố miễn trừ trách nhiệm FTC.',
  'Outbound Redirect Prefix': 'Tiền tố Chuyển hướng Tiếp thị Liên kết',
  'Amazon Associate Tag': 'Mã Đối tác Amazon Associates',
  'Impact Radius Publisher ID': 'Mã Nhà xuất bản Impact.com',
  'CJ Affiliate Publisher ID': 'Mã Nhà xuất bản CJ Affiliate (Commission Junction)',
  'ShareASale Affiliate ID': 'Mã Nhà xuất bản ShareASale',
  'FTC Affiliate Disclosure Statement': 'Tuyên bố Tuân thủ & Miễn trừ Hoa hồng Tiếp thị (FTC Disclosure)',
  'Displayed prominently across public reviews, buying guides, and coupon modals.': 'Hiển thị minh bạch trên các bài đánh giá, cẩm nang mua sắm và popup coupon công khai.',
  'Subscriber Welcome Email Subject': 'Tiêu đề Email Chào mừng Độc giả Mới',
  'Double Opt-In Verification': 'Xác thực Đăng ký 2 bước (Double Opt-in)',
  'Security & Access Policies': 'Chính sách Bảo mật & Truy cập',
  'Global login lockout windows, TOTP authenticator tolerances, and developer bypass modes.': 'Quy tắc khóa tài khoản đăng nhập sai, độ trễ mã TOTP và chế độ thử nghiệm nhà phát triển.',
  'Max Failed Login Attempts': 'Số lần Đăng nhập Sai Tối đa trước khi Khóa',
  'Account Lockout Duration (Seconds)': 'Thời gian Khóa Tài khoản (Giây)',
  '2FA Authenticator Issuer Name': 'Tên Đơn vị Phát hành Mã 2FA (Issuer Name)',
  '2FA TOTP Window Size Tolerance': 'Độ lệch Bước thời gian TOTP (Window Tolerance)',
  'Developer 2FA Bypass Mode': 'Chế độ Bỏ qua 2FA khi Thử nghiệm (Dev Bypass)',
  'Developer Test OTP Passcode': 'Mã OTP Cố định Thử nghiệm (Dev Test OTP)',
  'Reset to Defaults': 'Khôi phục Mặc định',
  'Reset All Settings?': 'Khôi phục Toàn bộ Cấu hình Mặc định?',
  'Reset all system settings across all tabs to baseline factory defaults? This action will overwrite your current configuration in PostgreSQL.': 'Khôi phục toàn bộ cài đặt hệ thống trên mọi tab về mặc định ban đầu? Thao tác này sẽ ghi đè cấu hình hiện tại trong PostgreSQL.',
  'Discard Changes': 'Hủy Thay đổi',
  'You have unsaved changes': 'Bạn có thay đổi chưa được lưu',
  'Remember to save your configuration changes to persist them to the database.': 'Hãy bấm Lưu để cập nhật các thay đổi vào cơ sở dữ liệu.',
  'Saving...': 'Đang lưu...',
  'Valid GTM format': 'Định dạng GTM hợp lệ',
  'Valid GA4 format': 'Định dạng GA4 hợp lệ',
  'System configuration saved successfully in PostgreSQL!': 'Đã lưu cấu hình hệ thống thành công vào PostgreSQL!',
  'System configuration restored to factory defaults!': 'Đã khôi phục cấu hình hệ thống về mặc định ban đầu!',

  // ============================================================================
  // 16B. USER PROFILE VIEW/EDIT & ADMIN PASSWORD RESET + ALL FORM SECTIONS
  // ============================================================================
  'View and edit complete staff profile details, contact information, RBAC role privileges, 2FA security, and default or custom password resets.':
    'Xem và chỉnh sửa toàn bộ thông tin hồ sơ nhân sự, liên hệ, phân quyền RBAC, bảo mật 2FA và đặt lại mật khẩu mặc định hoặc tùy chỉnh.',
  'Save Profile & Account': 'Lưu Hồ sơ & Tài khoản',
  'User Profile & Contact Information': 'Thông tin Hồ sơ & Liên hệ Nhân sự',
  'Complete personal identity, department title, contact details, and regional timezone.':
    'Thông tin định danh cá nhân, chức danh phòng ban, thông tin liên hệ và múi giờ làm việc.',
  'Phone Number': 'Số điện thoại',
  'Department / Job Title': 'Phòng ban / Chức danh',
  'Regional Timezone': 'Múi giờ Khu vực',
  'Staff Avatar / Profile Photo': 'Ảnh đại diện Nhân sự (Avatar)',
  'Square profile photo displayed on editorial author bylines and ProCMS header.':
    'Ảnh đại diện vuông hiển thị trên thẻ tác giả bài viết và thanh công cụ quản trị.',
  'Editorial Biography & Social Profiles': 'Tiểu sử Biên tập viên & Mạng xã hội',
  'Public author biography and professional social links shown on review articles.':
    'Tiểu sử tác giả và liên kết mạng xã hội chuyên nghiệp hiển thị trên các bài viết đánh giá.',
  'Editorial Author Bio': 'Tiểu sử Tác giả (Bio)',
  'X (Twitter) Profile URL': 'Liên kết Hồ sơ X (Twitter)',
  'LinkedIn Profile URL': 'Liên kết Hồ sơ LinkedIn',
  'Password Management & Admin Reset': 'Quản lý & Đặt lại Mật khẩu (Admin Reset)',
  "Administrators can reset this user's password back to the system default password or assign a custom password at any time.":
    'Quản trị viên có thể đặt lại mật khẩu của nhân sự về mật khẩu mặc định hệ thống hoặc thiết lập mật khẩu tùy chỉnh bất cứ lúc nào.',
  'Set Custom Password': 'Đặt Mật khẩu Tùy chỉnh',
  'Copy Password': 'Sao chép Mật khẩu',
  'System Default Password': 'Mật khẩu Mặc định Hệ thống',
  'Standard temporary credential for new or reset staff accounts.':
    'Mật khẩu mặc định tiêu chuẩn dùng khi cấp mới hoặc khôi phục tài khoản nhân sự.',
  'Copy default password': 'Sao chép mật khẩu mặc định',
  'Copied': 'Đã chép',
  'Click to immediately reset this user account password to the default system password.':
    'Nhấn để đặt lại ngay mật khẩu của tài khoản này về mật khẩu mặc định của hệ thống.',
  'This new user account will be initialized with the default password above.':
    'Tài khoản mới này sẽ được khởi tạo với mật khẩu mặc định ở trên.',
  'Reset to Default Password': 'Đặt lại về Mật khẩu Mặc định',
  'Use Default Password': 'Dùng Mật khẩu Mặc định',
  'Custom Password *': 'Mật khẩu Tùy chỉnh *',
  'Generate Strong Password': 'Tạo Mật khẩu Mạnh Ngẫu nhiên',
  'Hide password': 'Ẩn mật khẩu',
  'Show password': 'Hiện mật khẩu',
  'Copy custom password': 'Sao chép mật khẩu tùy chỉnh',
  'Enter any custom password or click “Generate Strong Password”.':
    'Nhập mật khẩu tùy ý hoặc nhấn "Tạo Mật khẩu Mạnh Ngẫu nhiên".',
  'Apply Custom Password': 'Áp dụng Mật khẩu Tùy chỉnh',
  'Set as Initial Password': 'Đặt làm Mật khẩu Khởi tạo',
  'Require Password Change on Next Sign-In': 'Yêu cầu Đổi mật khẩu ở Lần đăng nhập tiếp theo',
  'Force user to choose a new personal password the next time they log in.':
    'Bắt buộc nhân sự phải đặt lại mật khẩu cá nhân mới trong lần đăng nhập kế tiếp.',
  'User Profile Overview': 'Tổng quan Hồ sơ Nhân sự',
  'Unnamed Staff User': 'Nhân sự Chưa đặt tên',
  'Suspended': 'Đã đình chỉ',
  '2FA Enabled': 'Đã bật 2FA',
  '2FA Pending': 'Chưa bật 2FA',
  'Phone': 'Điện thoại',
  'Not provided': 'Chưa cập nhật',
  'Timezone': 'Múi giờ',
  'Last Login': 'Đăng nhập gần nhất',
  'Never': 'Chưa từng',
  'Never signed in': 'Chưa từng đăng nhập',
  'Password Reset': 'Đặt lại MK gần nhất',
  'Just now (Default Reset)': 'Vừa xong (Đặt về Mặc định)',
  'Just now (Custom Admin Reset)': 'Vừa xong (Admin đặt tùy chỉnh)',
  'Set on creation': 'Đặt khi tạo tài khoản',
  'Updated today': 'Cập nhật hôm nay',
  'Role & Security Controls': 'Phân quyền & Kiểm soát Bảo mật',
  'Two-Factor Authentication (2FA)': 'Xác thực Hai lớp (2FA)',
  'TOTP Authenticator active (uncheck to reset)': 'Đang bật TOTP Authenticator (bỏ chọn để đặt lại)',
  'Not enrolled in 2FA yet': 'Chưa đăng ký xác thực 2FA',
  'Reset to Default Password?': 'Đặt lại về Mật khẩu Mặc định?',
  'Reset to Default': 'Đặt về Mặc định',
  'Set Custom Password?': 'Đặt Mật khẩu Tùy chỉnh?',
  'Password copied to clipboard': 'Đã sao chép mật khẩu vào bộ nhớ tạm',
  'Custom password must be at least 6 characters long.': 'Mật khẩu tùy chỉnh phải có ít nhất 6 ký tự.',
  'Custom initial password applied to form.': 'Đã áp dụng mật khẩu khởi tạo tùy chỉnh.',
  'Reset password to default (HeyGoodly@2026)': 'Đặt lại mật khẩu về mặc định (HeyGoodly@2026)',
  'Edit profile, account details & custom password': 'Chỉnh sửa hồ sơ, tài khoản & đặt mật khẩu tùy chỉnh',
  'Role': 'Vai trò',
  'Login History & Session Trace': 'Lịch sử Đăng nhập & Truy vết Phiên',
  'Chronological audit trail of sign-in timestamps, IP addresses, browser devices, and authentication methods for this user.':
    'Nhật ký truy vết chi tiết theo thời gian các lần đăng nhập, địa chỉ IP, trình duyệt/thiết bị và phương thức xác thực của nhân sự này.',
  'Last Login & Trace': 'Đăng nhập Gần nhất & Truy vết',
  'Last Sign-In Time': 'Thời điểm Đăng nhập Gần nhất',
  'Last IP & Location': 'IP & Vị trí Gần nhất',
  'Total Recorded Logins': 'Tổng số Phiên Đăng nhập',
  'Total Logins & Created': 'Tổng Đăng nhập & Ngày tạo',
  'Total Logins': 'Tổng số lần đăng nhập',
  'Record Live Sign-In': 'Ghi nhận Đăng nhập Hiện tại',
  'Login Timestamp': 'Thời điểm Đăng nhập',
  'Device & Browser': 'Thiết bị & Trình duyệt',
  'IP & Location': 'Địa chỉ IP & Vị trí',
  'Auth Method': 'Phương thức Xác thực',
  'Status / Duration': 'Trạng thái / Thời lượng',
  'No login sessions recorded for this user yet.': 'Chưa có phiên đăng nhập nào được ghi nhận cho nhân sự này.',
  'View full login timestamp history for this user': 'Xem toàn bộ lịch sử thời gian đăng nhập của nhân sự này',
  'Edit Full User Profile & Password': 'Chỉnh sửa Toàn bộ Hồ sơ & Mật khẩu',
  'Active now': 'Đang trực tuyến',
  'Invalid password': 'Sai mật khẩu',
  'Success': 'Thành công',
  'Failed': 'Thất bại',
  'Password': 'Mật khẩu',
  'Highlights:': 'Nổi bật:',
  '★ Featured Editor Picks': '★ Bài viết Chọn lọc Nổi bật',
  'Article Headline': 'Tiêu đề Bài viết',
  'Score & Rating': 'Điểm & Đánh giá',
  'Hero': 'Tiêu điểm',
  'Live Reader Mode:': 'Chế độ Đọc thử Trực tiếp:',
  'Simulating reader experience on the public portal (including Right Sidebar).':
    'Mô phỏng giao diện đọc bài thực tế trên trang khách (bao gồm cả Cột bên phải).',
  'Untitled Article': 'Bài viết Chưa đặt tiêu đề',
  'Your Article Headline Will Appear Here': 'Tiêu đề Bài viết Sẽ Hiển thị Tại Đây',
  'Editorial Testing & Lab Benchmarks': 'Kiểm thử Độc lập & Đánh giá Thực tế',
  'Independent Evaluation': 'Đánh giá Độc lập',
  'HeyGoodly Lab Score & Verdict': 'Điểm Đánh giá & Kết luận từ HeyGoodly Lab',
  'Based on durability benchmarks, pricing accuracy, and hands-on testing.':
    'Dựa trên tiêu chuẩn độ bền, đối chiếu giá thực tế và kiểm thử trực tiếp.',

  // Exact FormSection Titles & Labels from StoreForm, CategoryForm, MenuForm, PageForm, Roles
  'Add New Merchant Store': 'Thêm Thương hiệu Đối tác Mới',
  'Configure merchant credentials, logos, referral URLs, and SEO taxonomy.':
    'Cấu hình thông tin thương hiệu, logo, liên kết giới thiệu và phân loại SEO.',
  'Store Identity & Domain': 'Định danh Thương hiệu & Tên miền',
  'URL Slug': 'Đường dẫn Tĩnh (URL Slug)',
  'Official Domain *': 'Tên miền Chính thức *',
  'Affiliate Tracking URL *': 'Liên kết Tiếp thị Liên kết (Affiliate URL) *',
  'Visual Assets': 'Hình ảnh Nhận diện Thương hiệu',
  'Store Brand Logo *': 'Logo Thương hiệu *',
  'Square logo (PNG or JPG). Recommended 200x200.': 'Logo hình vuông (PNG hoặc JPG). Khuyên dùng 200x200px.',
  'Store Banner / Cover (Optional)': 'Ảnh bìa / Banner Thương hiệu (Tùy chọn)',
  'Wide banner for store coupon landing page.': 'Banner ngang hiển thị ở đầu trang mã giảm giá của thương hiệu.',
  'Store Short Summary': 'Tóm tắt Ngắn về Thương hiệu',
  "Concise summary paragraph (clamped to 2–3 lines on client) displayed right above the 'Get Coupon Alerts' button.":
    "Đoạn mô tả ngắn gọn (hiển thị 2–3 dòng trên trang chủ) nằm ngay phía trên nút 'Nhận thông báo mã giảm giá'.",
  'Short Summary (2–3 Lines)': 'Tóm tắt Ngắn (2–3 dòng)',

  'Create New Category': 'Tạo Chuyên mục Mới',
  'Configure editorial taxonomy shown in client navigation bars and category landing pages.':
    'Cấu hình chuyên mục hiển thị trên thanh điều hướng và trang danh mục bài viết.',
  'Category Information': 'Thông tin Chuyên mục',
  'Category Media & Cover': 'Hình ảnh & Ảnh bìa Chuyên mục',
  'Category Header Banner (Optional)': 'Banner Đầu trang Chuyên mục (Tùy chọn)',
  'Wide cover banner displayed at the top of category landing page.':
    'Ảnh bìa ngang hiển thị ở đầu trang chuyên mục.',
  'Display & Taxonomy': 'Hiển thị & Sắp xếp',
  'Order shown in header nav': 'Thứ tự trên thanh menu',
  'Category Active': 'Kích hoạt Chuyên mục',
  'Visible in navigation bar': 'Hiển thị trên thanh điều hướng',
  'Quick Card Preview': 'Xem trước Thẻ Chuyên mục',
  'No banner uploaded': 'Chưa tải ảnh banner',
  'Description & Editorial Notes': 'Mô tả & Ghi chú Biên tập',
  'Microsoft Word Studio Editor • 100% full-width canvas with full Ribbon support for Font Family, Font Size, Data Tables & Affiliate Blocks':
    'Trình soạn thảo Microsoft Word Studio • Khung soạn thảo toàn màn hình hỗ trợ đầy đủ Phông chữ, Cỡ chữ, Bảng biểu & Khối tiếp thị',
  'Manage All': 'Quản lý tất cả',
  'No articles currently assigned to this category.': 'Hiện chưa có bài viết nào thuộc chuyên mục này.',

  'Add New Navigation Menu Item': 'Thêm Mục Menu Điều hướng Mới',
  'Configure navigation link title, target URL, and preview live client layout in real time.':
    'Cấu hình tiêu đề liên kết, đường dẫn đích và xem trước trực tiếp bố cục menu trên trang khách.',
  'Add to Navigation': 'Thêm vào Menu',
  'Quick Link Presets': 'Mẫu Liên kết Nhanh',
  'Menu Item Configuration': 'Cấu hình Mục Menu',
  'Menu Label / Title *': 'Nhãn / Tiêu đề Menu *',
  'Visible link text in the public website navigation bar.': 'Chữ hiển thị trên thanh điều hướng của trang chủ.',
  'Target Link Type': 'Loại Liên kết Đích',
  'Custom Path / External URL': 'Đường dẫn Tùy chỉnh / URL Ngoài',
  'Category Landing Page': 'Trang Chuyên mục',
  'CMS Content Page': 'Trang Nội dung Tĩnh (CMS)',
  'Destination Target *': 'Đích đến của Liên kết *',
  'Placement & Priority': 'Vị trí & Thứ tự Ưu tiên',
  'Navigation Bar Position': 'Vị trí Thanh Điều hướng',
  'Top sticky masthead menu': 'Menu cố định đầu trang',
  'Footer Sitemap': 'Sơ đồ Chân trang (Footer)',
  'Bottom footer column': 'Cột liên kết cuối trang',
  'Display Sort Order': 'Thứ tự Sắp xếp Hiển thị',
  'Lower numbers appear further to the left (Header) or top (Footer).':
    'Số nhỏ hơn sẽ ưu tiên hiển thị bên trái (Đầu trang) hoặc phía trên (Chân trang).',
  'Link Active (Visible to Public)': 'Kích hoạt Liên kết (Hiển thị Công khai)',
  'Uncheck to hide without deleting': 'Bỏ chọn để tạm ẩn mà không cần xóa',
  'Live Client Website Preview': 'Xem trước Trực tiếp trên Trang chủ',
  'Real-time Sync': 'Đồng bộ Thời gian thực',
  'Header Nav': 'Menu Đầu trang',
  'Desktop': 'Máy tính',
  'Mobile': 'Di động',

  'Publish or update legal disclosures, about information, and compliance policy pages.':
    'Xuất bản hoặc cập nhật các trang pháp lý, giới thiệu và chính sách bảo mật.',
  'Page Content & Details': 'Nội dung & Thông tin Trang',
  'Search Engine Optimization (SEO)': 'Tối ưu hóa Công cụ Tìm kiếm (SEO)',
  'Meta Title': 'Tiêu đề SEO (Meta Title)',
  'Meta Description': 'Mô tả SEO (Meta Description)',
  'Publishing Status': 'Trạng thái Xuất bản',
  'Published & Active': 'Đã xuất bản & Hoạt động',
  'Accessible on live site': 'Có thể truy cập công khai',
  'Position in footer / legal list': 'Vị trí ở chân trang / danh sách pháp lý',
  'Google Search Preview': 'Xem trước Kết quả Tìm kiếm Google',
  'Document Content (Microsoft Word Studio)': 'Nội dung Tài liệu (Microsoft Word Studio)',
  'Word-style document editor • Full support for Font Family, Font Size, Data Tables, Alignment & A4 Paper View':
    'Trình soạn thảo chuẩn Word • Hỗ trợ đầy đủ Phông chữ, Cỡ chữ, Bảng dữ liệu, Căn lề & Khổ giấy A4',

  'Create Custom Operational Role': 'Tạo Vai trò Vận hành Tùy chỉnh',
  'Define a new operational role and configure granular module permissions. Core system permissions are granted by default and locked.':
    'Định nghĩa vai trò vận hành mới và cấu hình quyền hạn chi tiết theo từng phân hệ. Các quyền hệ thống cốt lõi được cấp mặc định và khóa cố định.',
  'Role Information': 'Thông tin Vai trò',
  'Module Permissions': 'Quyền hạn theo Phân hệ',
  'Locked • Required for All Roles': 'Đã khóa • Bắt buộc cho Mọi Vai trò',
  'Mandatory baseline permissions required to sign in and operate':
    'Các quyền nền tảng bắt buộc để đăng nhập và vận hành hệ thống',
  'Always Granted': 'Luôn được cấp',
  'Required': 'Bắt buộc',

  // Toasts, Confirm & Alert Dialog Titles/Messages & Tooltips across Admin
  'Confirm': 'Xác nhận',
  'Got it': 'Đã hiểu',
  'Close notification': 'Đóng thông báo',
  'Action Not Permitted': 'Thao tác Không được phép',
  'Cannot deactivate the Super Administrator account.': 'Không thể tạm khóa tài khoản Quản trị viên Cấp cao (Super Administrator).',
  'Cannot delete the Super Administrator account.': 'Không thể xóa tài khoản Quản trị viên Cấp cao (Super Administrator).',
  'Confirm Account Activation': 'Xác nhận Kích hoạt Tài khoản',
  'Confirm Account Deactivation': 'Xác nhận Tạm khóa Tài khoản',
  'Activate Now': 'Kích hoạt Ngay',
  'Deactivate': 'Tạm khóa',
  'Enable Two-Factor Authentication (2FA)': 'Bật Xác thực Hai lớp (2FA)',
  'Disable Two-Factor Authentication (2FA)': 'Tắt Xác thực Hai lớp (2FA)',
  'Enable 2FA': 'Bật 2FA',
  'Confirm Disable': 'Xác nhận Tắt',
  'Confirm Permanent Account Deletion': 'Xác nhận Xóa Vĩnh viễn Tài khoản',
  'Delete Account': 'Xóa Tài khoản',
  'Are you sure you want to': 'Bạn có chắc chắn muốn',
  'reactivate': 'kích hoạt lại',
  'deactivate': 'tạm khóa',
  'enable': 'bật',
  'disable': 'tắt',
  'the account for': 'tài khoản của',
  'This account will be temporarily locked and unable to sign in.': 'Tài khoản này sẽ bị tạm khóa và không thể đăng nhập.',
  'two-factor authentication (TOTP) for': 'xác thực hai lớp (TOTP) cho',
  'Account security will be reduced to password-only sign-in.': 'Mức độ bảo mật tài khoản sẽ giảm xuống chỉ dùng mật khẩu.',
  'The user will be required to enter a 6-digit verification code (Google Authenticator / Authy) upon sign-in.':
    'Người dùng sẽ được yêu cầu nhập mã xác thực 6 chữ số (Google Authenticator / Authy) khi đăng nhập.',
  'Are you sure you want to delete the account': 'Bạn có chắc chắn muốn xóa tài khoản',
  'All associated operational privileges and records will be permanently removed.':
    'Toàn bộ quyền hạn vận hành và dữ liệu liên quan sẽ bị xóa vĩnh viễn.',
  'Are you sure you want to reset the password for': 'Bạn có chắc chắn muốn đặt lại mật khẩu cho',
  'back to the system default password': 'về mật khẩu mặc định của hệ thống',
  '? You can also set a custom password on the Edit Profile screen.':
    '? Bạn cũng có thể đặt mật khẩu tùy chỉnh tại màn hình Chỉnh sửa Hồ sơ.',
  'Click to toggle status': 'Nhấn để chuyển đổi trạng thái',
  '2FA is ENABLED. Click to disable 2FA for this account': 'Đang BẬT 2FA. Nhấn để tắt 2FA cho tài khoản này',
  '2FA is DISABLED. Click to enable 2FA for this account': 'Đang TẮT 2FA. Nhấn để bật 2FA cho tài khoản này',
  'Cannot deactivate Super Administrator': 'Không thể tạm khóa Super Administrator',
  'Active. Click to DEACTIVATE this account': 'Đang hoạt động. Nhấn để TẠM KHÓA tài khoản này',
  'Deactivated. Click to REACTIVATE this account': 'Đã tạm khóa. Nhấn để KÍCH HOẠT LẠI tài khoản này',
  'Cannot delete Super Administrator account': 'Không thể xóa tài khoản Super Administrator',
  'Permanently delete account': 'Xóa vĩnh viễn tài khoản',
  'Edit account details': 'Chỉnh sửa thông tin tài khoản',
  'Delete subscriber?': 'Xóa người đăng ký?',
  'Subscriber removed': 'Đã xóa người đăng ký',
  'Copied email to clipboard': 'Đã sao chép địa chỉ email',
  'No subscribers to export': 'Không có người đăng ký nào để xuất',
  'Copy email': 'Sao chép email',
  'Delete subscriber': 'Xóa người đăng ký',
  'Saved system configuration changes!': 'Đã lưu các thay đổi cấu hình hệ thống!',
  'Reset unsaved changes to last saved values': 'Đã khôi phục các thay đổi chưa lưu về giá trị đã lưu gần nhất',
  'Role is Protected': 'Vai trò được Bảo vệ Hệ thống',
  'System Administrator role is locked and cannot be deleted.': 'Vai trò Quản trị viên Hệ thống đã được khóa bảo vệ và không thể xóa.',
  'Cannot Delete Active Role': 'Không thể Xóa Vai trò Đang sử dụng',
  'Delete Role?': 'Xóa Vai trò?',
  'Delete Role': 'Xóa Vai trò',
  'System Locked — All permissions permanently enabled': 'Hệ thống đã khóa — Toàn bộ quyền hạn luôn được bật cố định',
  'Save Permission Matrix': 'Lưu Ma trận Phân quyền',
  'Delete this custom role': 'Xóa vai trò tùy chỉnh này',
  'Required for all roles (cannot be disabled)': 'Bắt buộc cho mọi vai trò (không thể tắt)',
  'Copied asset URL to clipboard': 'Đã sao chép đường dẫn URL tệp vào bộ nhớ tạm',
  'Delete Media Asset?': 'Xóa Tệp Media?',
  'Media asset deleted': 'Đã xóa tệp Media',
  'Updated asset metadata': 'Đã cập nhật thông tin chi tiết tệp Media',
  'View live store page': 'Xem trang thương hiệu thực tế',
  'Edit store': 'Sửa thương hiệu',
  'Delete store': 'Xóa thương hiệu',
  'Preview offer details': 'Xem trước chi tiết ưu đãi',
  'Duplicate offer': 'Nhân bản ưu đãi',
  'Edit offer': 'Sửa ưu đãi',
  'Delete offer': 'Xóa ưu đãi',
  'View live article': 'Xem bài viết thực tế',
  'Edit article': 'Sửa bài viết',
  'Delete article': 'Xóa bài viết',
  'View category page': 'Xem trang chuyên mục',
  'Edit category': 'Sửa chuyên mục',
  'Delete category': 'Xóa chuyên mục',
  'Edit menu item': 'Sửa mục menu',
  'Delete menu item': 'Xóa mục menu',
  'View live page': 'Xem trang tĩnh thực tế',
  'Edit page': 'Sửa trang tĩnh',
  'Delete page': 'Xóa trang tĩnh',
  'View inquiry details': 'Xem chi tiết liên hệ',
  'Delete inquiry': 'Xóa liên hệ',
  'Profile & security settings saved successfully!': 'Đã lưu cài đặt hồ sơ & bảo mật thành công!',
  'Password updated successfully!': 'Đã cập nhật mật khẩu thành công!',
  'Two-factor authentication (2FA) enabled successfully!': 'Đã kích hoạt xác thực hai lớp (2FA) thành công!',
  'Two-factor authentication (2FA) has been disabled.': 'Đã tắt xác thực hai lớp (2FA).',
  'Recovery codes copied to clipboard!': 'Đã sao chép mã khôi phục vào bộ nhớ tạm!',
  'Terminated all other active sessions.': 'Đã đăng xuất toàn bộ các phiên hoạt động khác.',
  'Session terminated.': 'Đã kết thúc phiên đăng nhập.',

  // ============================================================================
  // 17. PAGINATION & COMMON STATUS MESSAGES
  // ============================================================================
  'Rows per page:': 'Số dòng mỗi trang:',
  'First Page': 'Trang đầu',
  'Previous Page': 'Trang trước',
  'Next Page': 'Trang tiếp',
  'Last Page': 'Trang cuối',
  'Loading offers...': 'Đang tải danh sách ưu đãi...',
  'Loading record...': 'Đang tải dữ liệu...',
  '0 offers': '0 ưu đãi',
  'No records match your current filters.': 'Không có dữ liệu nào khớp với bộ lọc hiện tại.',
  'Offers Total': 'ưu đãi tổng cộng',
  'Stores Total': 'thương hiệu tổng cộng',
  'Articles Total': 'bài viết tổng cộng',
  'Categories Total': 'chuyên mục tổng cộng',
  'Found': 'Tìm thấy',
  'matching offers': 'ưu đãi phù hợp',
  'matching stores': 'thương hiệu phù hợp',
  'matching articles': 'bài viết phù hợp',
  'matching categories': 'chuyên mục phù hợp',
  'matching results': 'kết quả phù hợp',
  'Showing': 'Hiển thị',
  'of': 'trên',
  'records': 'bản ghi',

  // ============================================================================
  // 17. ACCOUNT & SECURITY PROFILE (`/admin/profile`)
  // ============================================================================
  'Admin Workspace': 'Không gian Quản trị',
  'Security & Identity': 'Bảo mật & Danh tính',
  'Administrator Command Center': 'Trung tâm Chỉ huy Quản trị',
  'Account & Security Profile': 'Hồ sơ Tài khoản & Bảo mật',
  'Tier-1 Clearance': 'Bảo mật Cấp 1',
  'Manage cryptographic TOTP authenticators, editorial author bylines, active device audit logs, and account-wide security telemetry.': 'Quản lý xác thực TOTP mật mã, bút danh biên tập, nhật ký thiết bị hoạt động và đo từ xa bảo mật toàn tài khoản.',
  'Emergency Lockdown': 'Khóa Khẩn cấp',
  'Back to Dashboard': 'Quay lại Bảng điều khiển',
  'Session Online': 'Phiên trực tuyến',
  'Edit Photo': 'Đổi ảnh đại diện',
  '2FA Inactive': '2FA Chưa bật',
  'Security Health': 'Tình trạng Bảo mật',
  'Optimal': 'Tối ưu',
  'Action Needed': 'Cần xử lý',
  'Argon2id + TOTP Active': 'Argon2id + 2FA Đang bật',
  'Argon2id Active (No 2FA)': 'Argon2id Đang bật (Chưa có 2FA)',
  'Root Level 5': 'Cấp độ Gốc 5',
  'Clearance': 'Cấp độ Truy cập',
  'Level 5 (Root)': 'Cấp 5 (Gốc)',
  'Devices': 'Thiết bị',
  'Command Sections': 'Mục Điều hành',
  '2FA Authenticator': 'Xác thực 2FA',
  'Personal Information': 'Thông tin Cá nhân',
  'Password & Auth': 'Mật khẩu & Xác thực',
  'Active Devices': 'Thiết bị Hoạt động',
  'Security Audit Log': 'Nhật ký Bảo mật',
  'Alert Preferences': 'Cài đặt Thông báo',
  'Verified': 'Đã xác minh',
  'Live': 'Trực tiếp',
  'Setup Now': 'Cài đặt ngay',

  // 2FA & Password Challenge Gates
  'Password Verification Required': 'Yêu cầu Xác thực Mật khẩu',
  'To view and manage Two-Factor Authentication credentials, secret keys, and backup recovery codes, please verify your account master password.': 'Để xem và quản lý chứng chỉ Xác thực Hai yếu tố, khóa bí mật và mã khôi phục dự phòng, vui lòng xác thực mật khẩu chính của tài khoản.',
  'Enter Account Password': 'Nhập Mật khẩu Tài khoản',
  'Unlock 2FA Settings': 'Mở khóa Cài đặt 2FA',
  'Lock 2FA': 'Khóa Cài đặt 2FA',
  'Security Verification Required': 'Yêu cầu Xác thực Bảo mật',
  'To update your master password or manage sensitive authentication mechanisms, please authenticate with your master password or 2FA passcode.': 'Để cập nhật mật khẩu chính hoặc quản lý các cơ chế xác thực nhạy cảm, vui lòng xác thực bằng mật khẩu chính hoặc mã 2FA.',
  'Verify with Password': 'Xác thực bằng Mật khẩu',
  'Verify with 2FA TOTP': 'Xác thực bằng Mã 2FA TOTP',
  'Verify & Unlock': 'Xác thực & Mở khóa',
  'Lock Credentials': 'Khóa Quản lý Mật khẩu',
  'Enter 6-digit TOTP code': 'Nhập mã TOTP 6 chữ số',

  // 2FA Tab (Unlocked)
  'Authenticator App (RFC 6238 TOTP)': 'Ứng dụng Xác thực (RFC 6238 TOTP)',
  'Hardware and software two-factor authentication compatible with Google Authenticator, Authy, and 1Password.': 'Xác thực hai yếu tố phần mềm và phần cứng tương thích với Google Authenticator, Authy và 1Password.',
  'Two-Factor Authentication Methods': 'Phương thức Xác thực Hai yếu tố',
  'Choose your primary or secondary two-factor authentication mechanism.': 'Chọn cơ chế xác thực hai yếu tố chính hoặc dự phòng của bạn.',
  'Authenticator App': 'Ứng dụng Xác thực',
  'Work Email OTP': 'Mã OTP qua Email Công việc',
  'Hardware Security Key': 'Khóa Bảo mật Phần cứng',
  'SMS Verification': 'Xác thực qua SMS',
  'Rotating 6-digit codes generated by Google Authenticator, Authy, or 1Password.': 'Mã 6 chữ số luân phiên được tạo bởi Google Authenticator, Authy hoặc 1Password.',
  'Single-use passcodes dispatched to your verified administrator email.': 'Mã sử dụng một lần được gửi đến email quản trị viên đã xác minh của bạn.',
  'FIDO2 / WebAuthn physical security tokens (YubiKey, Touch ID, Passkey).': 'Mã thông báo bảo mật vật lý FIDO2 / WebAuthn (YubiKey, Touch ID, Passkey).',
  'Emergency cellular SMS passcode sent to registered mobile device.': 'Mật mã SMS gửi đến thiết bị di động đã đăng ký trong trường hợp khẩn cấp.',
  'Primary Method': 'Phương thức Chính',
  'Backup Method': 'Phương thức Dự phòng',
  'Enterprise Standard': 'Tiêu chuẩn Doanh nghiệp',
  'Emergency': 'Khẩn cấp',
  'Send Verification Email': 'Gửi Email Xác minh',
  'Test Email Passcode': 'Kiểm tra Mã qua Email',
  'Register Hardware Key': 'Đăng ký Khóa Phần cứng',
  'FIDO2 / WebAuthn Keys Configured': 'Khóa FIDO2 / WebAuthn Đã cấu hình',
  'No hardware keys enrolled yet': 'Chưa có khóa phần cứng nào được liên kết',
  'Connect YubiKey or Touch ID': 'Kết nối YubiKey hoặc Touch ID',
  'Disable 2FA': 'Tắt 2FA',
  'Enable 2FA Now': 'Bật 2FA Ngay',
  'Your Account is Guarded by Two-Factor Authentication': 'Tài khoản của bạn được bảo vệ bởi Xác thực Hai yếu tố',
  'Every sign-in to HeyGoodly ProCMS requires your master password plus a rotating 6-digit numeric passcode from your authenticator app.': 'Mỗi lần đăng nhập vào HeyGoodly ProCMS đều yêu cầu mật khẩu chính cộng với mã số 6 chữ số luân phiên từ ứng dụng xác thực của bạn.',
  '2FA Is Currently Disabled': '2FA Hiện Đang Bị Tắt',
  'We strongly advise enabling 2FA for all administrative accounts to safeguard commission links, partner credentials, and merchant integrations.': 'Chúng tôi khuyến nghị kích hoạt 2FA cho tất cả tài khoản quản trị để bảo vệ liên kết tiếp thị, thông tin đối tác và tích hợp người bán.',
  'Test your authenticator app sync right now to ensure your clock and passcode match.': 'Kiểm tra đồng bộ ứng dụng xác thực của bạn ngay bây giờ để đảm bảo đồng hồ và mật mã khớp nhau.',
  'Passcode Verified (Sync OK)': 'Mật mã Đã Xác minh (Đồng bộ OK)',
  'Entering 6 digits...': 'Đang nhập 6 chữ số...',
  'Invalid Passcode': 'Mật mã Không hợp lệ',
  'Type 6 digits (e.g. 123456)': 'Nhập 6 chữ số (VD: 123456)',
  'Autofill Test Code': 'Điền mã Thử nghiệm',
  'Clear': 'Xóa',
  'Emergency Backup Recovery Codes (8)': 'Mã Khôi phục Dự phòng Khẩn cấp (8)',
  'Keep these single-use codes in a safe place. They allow emergency access if you lose your mobile phone.': 'Lưu giữ các mã sử dụng một lần này ở nơi an toàn. Chúng cho phép truy cập khẩn cấp nếu bạn bị mất điện thoại di động.',
  'Reveal': 'Hiện mã',
  'Hide': 'Ẩn mã',
  'Copy All': 'Sao chép Tất cả',
  'Download .txt': 'Tải xuống .txt',
  'Each code becomes invalid immediately after one use.': 'Mỗi mã sẽ mất hiệu lực ngay sau một lần sử dụng.',
  'Regenerate 8 New Codes': 'Tạo lại 8 Mã mới',

  // Personal Information
  'Personal Information & Editorial Bio': 'Thông tin Cá nhân & Bút danh Biên tập',
  'Your identity and credentials displayed across product review bylines and audit records.': 'Danh tính và thông tin của bạn hiển thị trên các bài đánh giá sản phẩm và nhật ký hệ thống.',
  'Profile Saved': 'Đã Lưu Hồ Sơ',
  'Official Work Email *': 'Email Công việc Chính thức *',
  'Contact Phone Number': 'Số Điện thoại Liên hệ',
  'Department / Role Title': 'Phòng ban / Chức danh',
  'Preferred Timezone': 'Múi giờ Ưu tiên',
  'Author Bio & Reviewer Profile': 'Tiểu sử Tác giả & Hồ sơ Đánh giá',
  'This bio is appended to your hands-on product reviews and shopping guides.': 'Tiểu sử này được gắn vào các bài đánh giá sản phẩm thực tế và hướng dẫn mua sắm của bạn.',
  'Twitter / X Handle or URL': 'Tài khoản Twitter / X hoặc Đường dẫn',
  'Avatar Photo (Media Library or Direct Upload)': 'Ảnh Đại diện (Thư viện Media hoặc Tải lên Trực tiếp)',
  'Save Profile Changes': 'Lưu Thay đổi Hồ sơ',

  // Password & Auth Tab
  'Password & Authentication Security': 'Bảo mật Mật khẩu & Xác thực',
  'Update your administrative account password and review cryptographic hashing standards.': 'Cập nhật mật khẩu tài khoản quản trị và xem xét các tiêu chuẩn băm mật mã.',
  'Password Updated': 'Đã Cập nhật Mật khẩu',
  'Current Password *': 'Mật khẩu Hiện tại *',
  'Enter current password': 'Nhập mật khẩu hiện tại',
  'New Strong Password *': 'Mật khẩu Mới Đủ mạnh *',
  'At least 8 characters': 'Tối thiểu 8 ký tự',
  'Strong Password': 'Mật khẩu Mạnh',
  'Moderate Strength': 'Độ mạnh Trung bình',
  'Weak': 'Yếu',
  '8+ Characters': 'Từ 8 ký tự trở lên',
  'Uppercase Letter': 'Chữ hoa',
  'Number (0-9)': 'Chữ số (0-9)',
  'Special Symbol': 'Ký tự đặc biệt',
  'Confirm New Password *': 'Xác nhận Mật khẩu Mới *',
  'Re-type new password': 'Nhập lại mật khẩu mới',
  'Passwords do not match.': 'Mật khẩu xác nhận không khớp.',
  'Sign out of all other devices and terminate remote sessions': 'Đăng xuất khỏi tất cả các thiết bị khác và chấm dứt các phiên từ xa',
  'Update Master Password': 'Cập nhật Mật khẩu Chính',
  'Cryptographic Hashing Architecture': 'Kiến trúc Băm Mật mã',
  'HeyGoodly ProCMS utilizes the Argon2id memory-hard password hashing algorithm with unique salt per record, protecting against GPU and ASIC cracking attempts.': 'HeyGoodly ProCMS sử dụng thuật toán băm mật khẩu kháng bộ nhớ Argon2id với salt duy nhất cho từng bản ghi, bảo vệ chống lại các cuộc tấn công bẻ khóa bằng GPU và ASIC.',
  'Password Last Changed:': 'Mật khẩu Thay đổi Lần cuối:',

  // Active Devices Tab
  'Authorized Device Sessions': 'Phiên Thiết bị Đã Ủy quyền',
  'Hardware devices and geographic locations currently holding authenticated ProCMS tokens.': 'Các thiết bị phần cứng và vị trí địa lý hiện đang lưu trữ mã thông báo ProCMS đã xác thực.',
  'Revoke All Other Sessions': 'Hủy Tất cả Phiên khác',
  'Loading authorized device sessions...': 'Đang tải các phiên thiết bị đã ủy quyền...',
  'Active Now': 'Đang hoạt động',
  'Current Device': 'Thiết bị Hiện tại',
  'Revoke': 'Chấm dứt',
  'No authorized device sessions found.': 'Không tìm thấy phiên thiết bị đã ủy quyền nào.',

  // Security Audit Log Tab
  'Security Audit & Activity Log': 'Nhật ký Hoạt động & Kiểm tra Bảo mật',
  'Immutable chronological record of authentication attempts, credential changes, and clearance events.': 'Bản ghi thời gian bất biến về các lần xác thực, thay đổi thông tin xác thực và sự kiện cấp quyền.',
  'Retention: 90 Days': 'Thời hạn lưu: 90 Ngày',
  'Loading security audit records...': 'Đang tải nhật ký kiểm tra bảo mật...',
  'No security audit logs recorded yet.': 'Chưa có nhật ký kiểm tra bảo mật nào được ghi lại.',
  'All Event Types': 'Tất cả loại sự kiện',
  'Sign-Ins & Authentication': 'Đăng nhập & Xác thực',
  '2FA & Recovery Codes': '2FA & Mã Khôi phục',
  'Password Modifications': 'Thay đổi Mật khẩu',
  'Profile & Details Updates': 'Cập nhật Thông tin Hồ sơ',
  'Roles & Permissions': 'Vai trò & Phân quyền',
  'Filter by Event Type': 'Lọc theo Loại sự kiện',
  'Search audit records...': 'Tìm kiếm nhật ký bảo mật...',
  'Remote Session': 'Phiên từ xa',
  'Revoke Session': 'Chấm dứt Phiên',

  // Alert Preferences Tab
  'System Alerts & Notifications': 'Cảnh báo Hệ thống & Thông báo',
  'Choose which critical security and affiliate telemetry triggers dispatch an instant alert.': 'Chọn các cảnh báo bảo mật quan trọng và chỉ số tiếp thị liên kết sẽ gửi thông báo tức thì.',
  'Preferences Saved': 'Đã Lưu Tùy Chọn',
  'New Device Sign-In Alerts': 'Cảnh báo Đăng nhập Thiết bị Mới',
  'Receive immediate email notifications whenever a sign-in occurs from an unrecognized IP or browser.': 'Nhận thông báo qua email ngay lập tức khi phát hiện đăng nhập từ IP hoặc trình duyệt lạ.',
  '2FA & Credential Modification Warnings': 'Cảnh báo Sửa đổi 2FA & Thông tin Xác thực',
  'High-priority alert if 2FA status, master password, or recovery codes are regenerated.': 'Cảnh báo ưu tiên cao nếu trạng thái 2FA, mật khẩu chính hoặc mã khôi phục được tạo lại.',
  'Affiliate Click Surge / Commission Alert': 'Cảnh báo Đột biến Lượt click / Hoa hồng Tiếp thị Liên kết',
  'Get notified when an offer experiences high volume traffic or reaches commission payout thresholds.': 'Nhận thông báo khi ưu đãi có lượng truy cập tăng vọt hoặc đạt ngưỡng thanh toán hoa hồng.',
  'Expiring Coupon & Dead Offer Warnings': 'Cảnh báo Coupon Hết hạn & Ưu đãi Ngừng hoạt động',
  'Daily digest of merchant coupon codes that will expire within the next 48 hours.': 'Bản tin tổng hợp hàng ngày về các mã coupon của người bán sẽ hết hạn trong vòng 48 giờ tới.',
  'Customer Feedback & Partnership Leads': 'Phản hồi Khách hàng & Cơ hội Hợp tác',
  'Instant alert when a reader submits feedback or a merchant requests affiliate partnership.': 'Cảnh báo tức thì khi độc giả gửi phản hồi hoặc thương hiệu yêu cầu hợp tác tiếp thị liên kết.',
  'Save Notification Rules': 'Lưu Quy tắc Thông báo',

  // Wizard Modal
  'Set Up Two-Factor Authentication': 'Thiết lập Xác thực Hai yếu tố',
  'RFC 6238 TOTP Standard': 'Tiêu chuẩn RFC 6238 TOTP',
  '1. Open Google Authenticator, Microsoft Authenticator, or Authy on your mobile phone.': '1. Mở ứng dụng Google Authenticator, Microsoft Authenticator hoặc Authy trên điện thoại của bạn.',
  '2. Scan this QR Code or manually type the Secret Key below:': '2. Quét mã QR này hoặc nhập Khóa bí mật thủ công bên dưới:',
  'Manual Secret Key': 'Khóa Bí mật Thủ công',
  'Next: Verify Passcode': 'Tiếp theo: Xác minh Mật mã',
  'Enter the 6-digit confirmation code generated by your authenticator app:': 'Nhập mã xác nhận 6 chữ số được tạo bởi ứng dụng xác thực của bạn:',
  'Verifying Code...': 'Đang xác minh mã...',
  'Confirm & Activate 2FA': 'Xác nhận & Kích hoạt 2FA',
  '2FA Protection Activated!': 'Bảo vệ 2FA Đã Kích hoạt!',
  'Your administrator account is now guarded by multi-factor authentication. Store your emergency recovery backup codes in a safe place.': 'Tài khoản quản trị của bạn hiện đã được bảo vệ bởi xác thực đa yếu tố. Hãy lưu trữ các mã khôi phục dự phòng khẩn cấp ở nơi an toàn.',
  'Done & Close': 'Hoàn tất & Đóng',

  // Device & Audit Pagination
  'to': 'đến',
  'device sessions': 'phiên thiết bị',
  'audit records': 'bản ghi nhật ký',

  // ============================================================================
  // 18. ACTION BUTTONS & UI TOOLTIPS (title attributes)
  // ============================================================================
  'View on public store coupon page': 'Xem trên trang mã giảm giá thương hiệu',
  'Clone Coupon': 'Nhân bản mã giảm giá',
  'Edit Coupon': 'Chỉnh sửa mã giảm giá',
  'Delete Coupon': 'Xóa mã giảm giá',
  'View Live on Client Website': 'Xem trực tiếp trên website',
  'Clone Article': 'Nhân bản bài viết',
  'Edit Article & Content': 'Chỉnh sửa bài viết & nội dung',
  'Delete Article': 'Xóa bài viết',
  'View Live Store Page': 'Xem trang thương hiệu thực tế',
  'Clone Store': 'Nhân bản thương hiệu',
  'Edit Store & Logo': 'Chỉnh sửa thương hiệu & Logo',
  'Delete Store': 'Xóa thương hiệu',
  'View Coupons, Promo Codes & Deals in this store': 'Xem mã giảm giá & ưu đãi của cửa hàng này',
  'Click to view all coupons, promo codes & deals in this store': 'Xem tất cả mã giảm giá & ưu đãi của cửa hàng này',
  'Click to view all articles in this category': 'Xem tất cả bài viết trong danh mục này',
  'View articles in this category': 'Xem bài viết trong danh mục này',
  'Edit Category': 'Chỉnh sửa chuyên mục',
  'Delete Category': 'Xóa chuyên mục',
  'View Live Page': 'Xem trang thực tế',
  'Edit Page': 'Chỉnh sửa trang tĩnh',
  'Delete Page': 'Xóa trang tĩnh',
  'Edit Item': 'Chỉnh sửa mục',
  'Delete Item': 'Xóa mục',
  'Read Message': 'Xem nội dung tin nhắn',
  'Delete Inquiry': 'Xóa tin nhắn liên hệ',
  'First page': 'Trang đầu',
  'Previous page': 'Trang trước',
  'Next page': 'Trang tiếp',
  'Last page': 'Trang cuối',
  'Copy full event JSON': 'Sao chép toàn bộ JSON sự kiện',
  'Manage all tags centrally': 'Quản lý tất cả thẻ tag tập trung',
  'Clear search': 'Xóa tìm kiếm',
  'Click to toggle active status': 'Bấm để bật/tắt hoạt động',
  'Clear all login sessions for this user': 'Hủy toàn bộ phiên đăng nhập của người dùng này',
  'Desktop Preview (1200px)': 'Xem trước Desktop (1200px)',
  'Mobile Viewport (375px)': 'Xem trước Mobile (375px)',
  'Tablet viewport (768px)': 'Xem trước Tablet (768px)',
  'Desktop viewport (1100px)': 'Xem trước Desktop (1100px)',
  'Mobile viewport (375px)': 'Xem trước Mobile (375px)',
  'Close preview window': 'Đóng cửa sổ xem trước',
  'Terminate all other sessions immediately': 'Chấm dứt tất cả các phiên đăng nhập khác ngay lập tức',
  'Sign out of current active session': 'Đăng xuất khỏi phiên hoạt động hiện tại',
  'Revoke and sign out this remote device session': 'Thu hồi và đăng xuất phiên thiết bị này',
  'Click to copy promo code': 'Bấm để sao chép mã ưu đãi',
  'Preview offer on store page': 'Xem trước ưu đãi trên trang cửa hàng',
  'Exclusive Offer': 'Ưu đãi độc quyền',
  'Preview on live site': 'Xem trước trên website thực tế',
  'Delete login record': 'Xóa bản ghi đăng nhập',
  'Edit login record': 'Chỉnh sửa bản ghi đăng nhập',
  'Save changes': 'Lưu thay đổi',
  'Click to edit profile photo': 'Bấm để đổi ảnh đại diện',
  'View on client website': 'Xem trên website',
  'View store page on client website': 'Xem trang thương hiệu trên website',
  'Featured Article': 'Bài viết nổi bật',
  'Open Tag Management in new tab': 'Mở Quản lý Thẻ Tag trong tab mới',
  'Clear tag filter': 'Bỏ lọc thẻ tag',
  'Clear tag': 'Bỏ chọn thẻ',
  'Open Digital Media Library': 'Mở Thư viện Media số',
  'Open original image': 'Mở ảnh gốc',
  'Remove image': 'Xóa ảnh',
  'Items per page': 'Số dòng mỗi trang',
  'Undo (Ctrl+Z)': 'Hoàn tác (Ctrl+Z)',
  'Redo (Ctrl+Y)': 'Làm lại (Ctrl+Y)',
  'Fullscreen Mode': 'Chế độ toàn màn hình',
  'Exit Fullscreen': 'Thoát toàn màn hình',
  'Bold (Ctrl+B)': 'In đậm (Ctrl+B)',
  'Italic (Ctrl+I)': 'In nghiêng (Ctrl+I)',
  'Underline (Ctrl+U)': 'Gạch chân (Ctrl+U)',
  'Strikethrough': 'Gạch ngang',
  'Subscript (X₂)': 'Chỉ số dưới (X₂)',
  'Superscript (X²)': 'Chỉ số trên (X²)',
  'Font Color': 'Màu chữ',
  'Text Highlight Color': 'Màu nền tô sáng chữ',
  'Bullet List': 'Danh sách đầu dòng',
  'Numbered List': 'Danh sách đánh số',
  'Decrease Indent (Outdent)': 'Giảm lùi lề',
  'Increase Indent': 'Tăng lùi lề',
  'Line Spacing': 'Giãn cách dòng',
  'Align Left (Ctrl+L)': 'Căn trái (Ctrl+L)',
  'Align Center (Ctrl+E)': 'Căn giữa (Ctrl+E)',
  'Align Right (Ctrl+R)': 'Căn phải (Ctrl+R)',
  'Justify (Ctrl+J)': 'Căn đều hai bên (Ctrl+J)',
  'Normal Paragraph': 'Đoạn văn bình thường',
  'Main Section Heading (H2)': 'Tiêu đề chính (H2)',
  'Sub-Heading (H3)': 'Tiêu đề phụ (H3)',
  'Blockquote': 'Trích dẫn',
  'Insert Data Table': 'Chèn bảng dữ liệu',
  'Upload image from computer': 'Tải ảnh từ máy tính',
  'Shared Media Library': 'Thư viện Media dùng chung',
  'Insert Hyperlink (Ctrl+K)': 'Chèn liên kết (Ctrl+K)',
  'Insert CTA Button': 'Chèn nút kêu gọi hành động (CTA)',
  'Horizontal Divider Line': 'Đường phân cách ngang',
  'Insert Promo Deal Box': 'Chèn hộp ưu đãi khuyến mãi',
  'Pros & Cons Comparison Grid': 'Bảng so sánh Ưu & Nhược điểm',
  'Lab Editorial Verdict Box': 'Hộp kết luận & Đánh giá chuyên sâu',
  'Pre-designed Article Section Templates': 'Mẫu khung phần bài viết được thiết kế sẵn',
  'Move block up': 'Di chuyển khối lên trên',
  'Move block down': 'Di chuyển khối xuống dưới',
  'Duplicate this block': 'Nhân bản khối này',
  'Duplicate block': 'Nhân bản khối',
  'Change block border & background style': 'Đổi kiểu viền & nền khối',
  'Change block style': 'Đổi kiểu khối',
  'Insert image into this block': 'Chèn ảnh vào khối này',
  'Choose image from Media Library': 'Chọn ảnh từ Thư viện Media',
  'Delete selected block/component': 'Xóa khối/thành phần đã chọn',
  'Delete this block from article': 'Xóa khối này khỏi bài viết',
  'Zoom out (-10%)': 'Thu nhỏ (-10%)',
  'Zoom in (+10%)': 'Phóng to (+10%)',
  'Full width 100%': 'Toàn chiều rộng 100%',
};

/** Reverse Vietnamese -> English lookup map */
const EXACT_EN_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(EXACT_VI_MAP).map(([en, vi]) => [vi, en])
);

const ITEM_NAME_VI: Record<string, string> = {
  results: 'kết quả',
  stores: 'thương hiệu',
  offers: 'ưu đãi',
  articles: 'bài viết',
  categories: 'chuyên mục',
  'menu items': 'mục menu',
  pages: 'trang tĩnh',
  inquiries: 'liên hệ',
  subscribers: 'người đăng ký',
  users: 'nhân sự',
  records: 'bản ghi',
  media: 'tệp media',
  'media files': 'tệp media',
};

/** Pattern-based dynamic string translation (English -> Vietnamese) */
export function translateAdminStringToVi(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return raw;

  // Direct exact match
  if (EXACT_VI_MAP[trimmed]) {
    return raw.replace(trimmed, EXACT_VI_MAP[trimmed]);
  }

  let m: RegExpMatchArray | null = null;

  // Dynamic Create/Edit Page Titles & Modals
  if ((m = trimmed.match(/^Edit Offer:\s*(.+)$/i))) return `Sửa ưu đãi: ${m[1]}`;
  if ((m = trimmed.match(/^Edit Store:\s*(.+)$/i))) return `Sửa thương hiệu: ${m[1]}`;
  if ((m = trimmed.match(/^Edit Article:\s*(.+)$/i))) return `Sửa bài viết: ${m[1]}`;
  if ((m = trimmed.match(/^Edit Category:\s*(.+)$/i))) return `Sửa chuyên mục: ${m[1]}`;
  if ((m = trimmed.match(/^Edit Menu Item:\s*(.+)$/i))) return `Sửa mục menu: ${m[1]}`;
  if ((m = trimmed.match(/^Edit Page:\s*(.+)$/i))) return `Sửa trang tĩnh: ${m[1]}`;
  if ((m = trimmed.match(/^Edit Staff Account:\s*(.+)$/i))) return `Sửa tài khoản nhân sự: ${m[1]}`;
  if ((m = trimmed.match(/^Edit Staff Profile & Account:\s*(.+)$/i))) {
    return `Chỉnh sửa Hồ sơ & Tài khoản Nhân sự: ${m[1]}`;
  }
  if ((m = trimmed.match(/^Login History & Session Trace:\s*(.+)$/i))) {
    return `Lịch sử Đăng nhập & Truy vết Phiên: ${m[1]}`;
  }
  if ((m = trimmed.match(/^Trace\s*\((\d+)\)$/i))) {
    return `Truy vết (${m[1]})`;
  }
  if ((m = trimmed.match(/^(\d+)\s+sessions\s+recorded$/i))) {
    return `Đã ghi nhận ${m[1]} phiên đăng nhập`;
  }
  if ((m = trimmed.match(/^(\d+)\s+sessions$/i))) {
    return `${m[1]} phiên`;
  }
  if ((m = trimmed.match(/^Recorded new login timestamp for "(.+)"\.$/i))) {
    return `Đã ghi nhận thời điểm đăng nhập mới cho "${m[1]}".`;
  }
  if ((m = trimmed.match(/^Default Password\s*\((.+)\)$/i))) {
    return `Mật khẩu Mặc định (${m[1]})`;
  }
  if ((m = trimmed.match(/^Password reset to default:\s*(.+)$/i))) {
    return `Đã đặt lại về mật khẩu mặc định: ${m[1]}`;
  }
  if ((m = trimmed.match(/^Custom password applied:\s*(.+)$/i))) {
    return `Đã áp dụng mật khẩu tùy chỉnh: ${m[1]}`;
  }
  if ((m = trimmed.match(/^Initial password set to default\s*\((.+)\)$/i))) {
    return `Đã đặt mật khẩu khởi tạo về mặc định (${m[1]})`;
  }
  if ((m = trimmed.match(/^Reset password for "(.+)" \((.+)\) back to the system default password \((.+)\)\?$/i))) {
    return `Bạn có chắc muốn đặt lại mật khẩu của "${m[1]}" (${m[2]}) về mật khẩu mặc định hệ thống (${m[3]}) không?`;
  }
  if ((m = trimmed.match(/^Update password for "(.+)" \((.+)\) to your custom password\?$/i))) {
    return `Bạn có chắc muốn cập nhật mật khẩu của "${m[1]}" (${m[2]}) sang mật khẩu tùy chỉnh vừa nhập không?`;
  }
  if ((m = trimmed.match(/^Password for "(.+)" has been reset to default \((.+)\)\.$/i))) {
    return `Mật khẩu của "${m[1]}" đã được đặt lại về mặc định (${m[2]}).`;
  }
  if ((m = trimmed.match(/^Password for "(.+)" reset to default \((.+)\) and copied to clipboard!$/i))) {
    return `Mật khẩu của "${m[1]}" đã đặt về mặc định (${m[2]}) và sao chép vào bộ nhớ tạm!`;
  }
  if ((m = trimmed.match(/^Custom password updated for "(.+)"\.$/i))) {
    return `Đã cập nhật mật khẩu tùy chỉnh cho "${m[1]}".`;
  }
  if ((m = trimmed.match(/^Saved profile & account settings for "(.+)"\.$/i))) {
    return `Đã lưu thông tin hồ sơ & tài khoản cho "${m[1]}".`;
  }
  if ((m = trimmed.match(/^Created staff account "(.+)"\.$/i))) {
    return `Đã tạo tài khoản nhân sự "${m[1]}".`;
  }
  if ((m = trimmed.match(/^Account "(.+)" reactivated successfully!$/i))) {
    return `Đã kích hoạt lại tài khoản "${m[1]}" thành công!`;
  }
  if ((m = trimmed.match(/^Account "(.+)" has been deactivated\.$/i))) {
    return `Tài khoản "${m[1]}" đã bị tạm khóa.`;
  }
  if ((m = trimmed.match(/^2FA enabled for "(.+)"!$/i))) {
    return `Đã bật xác thực 2 lớp (2FA) cho "${m[1]}"!`;
  }
  if ((m = trimmed.match(/^2FA disabled for "(.+)"\.$/i))) {
    return `Đã tắt xác thực 2 lớp (2FA) cho "${m[1]}".`;
  }
  if ((m = trimmed.match(/^Account "(.+)" permanently deleted!$/i))) {
    return `Đã xóa vĩnh viễn tài khoản "${m[1]}"!`;
  }
  if ((m = trimmed.match(/^Role "(.+)" has been deleted\.$/i))) {
    return `Đã xóa vai trò "${m[1]}".`;
  }
  if ((m = trimmed.match(/^Saved permission matrix for role "(.+)"!$/i))) {
    return `Đã lưu ma trận phân quyền cho vai trò "${m[1]}"!`;
  }
  if ((m = trimmed.match(/^Reset (.+) to default permissions\.$/i))) {
    return `Đã khôi phục quyền mặc định cho vai trò ${m[1]}.`;
  }
  if ((m = trimmed.match(/^Switched active test role to:\s*(.+)$/i))) {
    return `Đã chuyển vai trò kiểm thử sang: ${m[1]}`;
  }
  if ((m = trimmed.match(/^Cannot delete "(.+)" because (\d+) staff account\(s\) are currently assigned to this role\.$/i))) {
    return `Không thể xóa vai trò "${m[1]}" vì đang có ${m[2]} tài khoản nhân sự giữ vai trò này.`;
  }
  if ((m = trimmed.match(/^Are you sure you want to delete the custom role "(.+)"\? This action cannot be undone\.$/i))) {
    return `Bạn có chắc chắn muốn xóa vai trò tùy chỉnh "${m[1]}"? Thao tác này không thể hoàn tác.`;
  }
  if ((m = trimmed.match(/^Uploaded (\d+) file\(s\) to Media Library$/i))) {
    return `Đã tải lên ${m[1]} tệp vào Thư viện Media`;
  }
  if ((m = trimmed.match(/^Exported (\d+) subscriber\(s\) to CSV$/i))) {
    return `Đã xuất ${m[1]} người đăng ký ra tệp CSV`;
  }
  if ((m = trimmed.match(/^Remove\s+(.+)\s+from the newsletter list\?$/i))) {
    return `Xóa ${m[1]} khỏi danh sách đăng ký bản tin?`;
  }
  if ((m = trimmed.match(/^Delete\s+"(.+)"\s+from Media Library\?$/i))) {
    return `Xóa tệp "${m[1]}" khỏi Thư viện Media?`;
  }
  if ((m = trimmed.match(/^Coupons, Promo Codes & Deals in\s+(.+)$/i))) {
    return `Mã giảm giá & Ưu đãi của ${m[1]}`;
  }
  if ((m = trimmed.match(/^Articles in\s+"(.+)"\s*\((\d+)\)$/i))) {
    return `Bài viết trong chuyên mục "${m[1]}" (${m[2]})`;
  }
  if ((m = trimmed.match(/^Question\s*#(\d+)$/i))) return `Câu hỏi #${m[1]}`;
  if ((m = trimmed.match(/^Preview:\s*(.+)$/i))) return `Xem trước: ${m[1]}`;
  if ((m = trimmed.match(/^Up to\s+(.+)$/i))) return `Giảm tới ${m[1]}`;
  if ((m = trimmed.match(/^Active\s+(.+)\s+Codes$/i))) return `Mã giảm giá ${m[1]} đang mở`;
  if ((m = trimmed.match(/^Selected\s+(\d+)\s+permissions\s+for\s+this\s+role\.$/i))) {
    return `Đã chọn ${m[1]} quyền hạn cho vai trò này.`;
  }
  if ((m = trimmed.match(/^(\d+)\s+of\s+(\d+)\s+active$/i))) {
    return `Đang bật ${m[1]} / ${m[2]} quyền`;
  }
  if ((m = trimmed.match(/^(\d+)\s+chars$/i))) return `${m[1]} ký tự`;
  if ((m = trimmed.match(/^💡 Leave blank to automatically generate 7 standard search keywords based on the store name \((.+)\)\.$/i))) {
    return `💡 Để trống để hệ thống tự động tạo 7 từ khóa tìm kiếm chuẩn theo tên thương hiệu (${m[1]}).`;
  }
  if ((m = trimmed.match(/^(.+)\s+not found\.$/i))) return `Không tìm thấy ${m[1]}.`;

  // Header & Card Badges
  if ((m = trimmed.match(/^(\d+)\s+Offers\s+Total$/i))) return `Tổng ${m[1]} ưu đãi`;
  if ((m = trimmed.match(/^(\d+)\s+Stores\s+Total$/i))) return `Tổng ${m[1]} thương hiệu`;
  if ((m = trimmed.match(/^(\d+)\s+Articles\s+Total$/i))) return `Tổng ${m[1]} bài viết`;
  if ((m = trimmed.match(/^(\d+)\s+Categories\s+Total$/i))) return `Tổng ${m[1]} chuyên mục`;
  if ((m = trimmed.match(/^(\d+)\s+Subscribers\s+Total$/i))) return `Tổng ${m[1]} người đăng ký`;
  if ((m = trimmed.match(/^(\d+)\s+Media\s+Files$/i))) return `${m[1]} tệp Media`;
  if ((m = trimmed.match(/^(\d+)\s+Links\s+Total$/i))) return `Tổng ${m[1]} liên kết`;
  if ((m = trimmed.match(/^(\d+)\s+Pages\s+Total$/i))) return `Tổng ${m[1]} trang tĩnh`;
  if ((m = trimmed.match(/^(\d+)\s+Inquiries\s+Total$/i))) return `Tổng ${m[1]} liên hệ`;
  if ((m = trimmed.match(/^(\d+)\s+Users\s+Total$/i))) return `Tổng ${m[1]} nhân sự`;
  if ((m = trimmed.match(/^(\d+)\s+Roles\s+Configured$/i))) return `${m[1]} vai trò đã cấu hình`;
  if ((m = trimmed.match(/^(\d+)\s+Roles$/i))) return `${m[1]} vai trò`;
  if ((m = trimmed.match(/^(\d+)\s+Events\s+Logged$/i))) return `${m[1]} sự kiện đã ghi`;
  if ((m = trimmed.match(/^(\d+)\s+Active$/i))) return `${m[1]} đang hoạt động`;
  if ((m = trimmed.match(/^(\d+)\s+active$/i))) return `${m[1]} đang hoạt động`;
  if ((m = trimmed.match(/^(\d+)\s+featured$/i))) return `${m[1]} nổi bật`;
  if ((m = trimmed.match(/^(\d+)\s+partner\s+brands$/i))) return `${m[1]} thương hiệu đối tác`;
  if ((m = trimmed.match(/^Across\s+(\d+)\s+stores$/i))) return `Trên ${m[1]} thương hiệu`;
  if ((m = trimmed.match(/^(\d+)\s+subscribers$/i))) return `${m[1]} người đăng ký`;
  if ((m = trimmed.match(/^(\d+)\s+categories$/i))) return `${m[1]} chuyên mục`;
  if ((m = trimmed.match(/^(\d+)\s+reader\s+inquiries$/i))) return `${m[1]} liên hệ từ độc giả`;
  if ((m = trimmed.match(/^([\d,]+)\s+clicks\s+\((.+)\)$/i))) return `${m[1]} lượt click (${m[2]})`;
  if ((m = trimmed.match(/^(\d+)\s+Offers$/i))) return `${m[1]} Ưu đãi`;
  if ((m = trimmed.match(/^(\d+)\s+New$/i))) return `${m[1]} Mới`;
  if ((m = trimmed.match(/^(\d+)\s+Staff$/i))) return `${m[1]} Nhân sự`;
  if ((m = trimmed.match(/^(\d+)\s+actions$/i))) return `${m[1]} quyền hạn`;
  if ((m = trimmed.match(/^(\d+)\s*\/\s*page$/i))) return `${m[1]} / trang`;

  // Filter Pills with counts
  if ((m = trimmed.match(/^All\s*\((\d+)\)$/i))) return `Tất cả (${m[1]})`;
  if ((m = trimmed.match(/^Promo Codes\s*\((\d+)\)$/i))) return `Mã giảm giá (${m[1]})`;
  if ((m = trimmed.match(/^Deals\s*\((\d+)\)$/i))) return `Khuyến mãi (${m[1]})`;
  if ((m = trimmed.match(/^★\s*Exclusive\s*\((\d+)\)$/i))) return `★ Độc quyền (${m[1]})`;
  if ((m = trimmed.match(/^All Placements\s*\((\d+)\)$/i))) return `Tất cả vị trí (${m[1]})`;
  if ((m = trimmed.match(/^Header Main Nav\s*\((\d+)\)$/i))) return `Menu Đầu trang (${m[1]})`;
  if ((m = trimmed.match(/^Footer Links\s*\((\d+)\)$/i))) return `Menu Chân trang (${m[1]})`;
  if ((m = trimmed.match(/^All Pages\s*\((\d+)\)$/i))) return `Tất cả trang (${m[1]})`;
  if ((m = trimmed.match(/^Published\s*\((\d+)\)$/i))) return `Đã xuất bản (${m[1]})`;
  if ((m = trimmed.match(/^Drafts\s*\((\d+)\)$/i))) return `Bản nháp (${m[1]})`;
  if ((m = trimmed.match(/^All Messages\s*\((\d+)\)$/i))) return `Tất cả tin nhắn (${m[1]})`;
  if ((m = trimmed.match(/^All Staff\s*\((\d+)\)$/i))) return `Tất cả nhân sự (${m[1]})`;
  if ((m = trimmed.match(/^Active\s*\((\d+)\)$/i))) return `Đang hoạt động (${m[1]})`;
  if ((m = trimmed.match(/^2FA Protected\s*\((\d+)\)$/i))) return `Đã bật 2FA (${m[1]})`;
  if ((m = trimmed.match(/^All Assets\s*\((\d+)\)$/i))) return `Tất cả ảnh (${m[1]})`;
  if ((m = trimmed.match(/^Stores\s*\((\d+)\)$/i))) return `Thương hiệu (${m[1]})`;
  if ((m = trimmed.match(/^Articles\s*\((\d+)\)$/i))) return `Bài viết (${m[1]})`;
  if ((m = trimmed.match(/^Banners\s*\((\d+)\)$/i))) return `Banner (${m[1]})`;
  if ((m = trimmed.match(/^Icons\s*\((\d+)\)$/i))) return `Biểu tượng (${m[1]})`;
  if ((m = trimmed.match(/^All tags\s*\((\d+)\)$/i))) return `Tất cả thẻ (${m[1]})`;
  if ((m = trimmed.match(/^All Functional Modules\s*\((\d+)\)$/i))) return `Tất cả phân hệ chức năng (${m[1]})`;

  if ((m = trimmed.match(/^([\d,]+)\s+uses$/i))) return `${m[1]} lượt dùng`;
  if ((m = trimmed.match(/^([\d,]+)\s+views$/i))) return `${m[1]} lượt xem`;
  if ((m = trimmed.match(/^(\d+)\s+min\s+read$/i))) return `${m[1]} phút đọc`;

  // Search & Form Input Placeholders
  if (/^Search title, voucher code, store/i.test(trimmed)) {
    return 'Tìm tiêu đề, mã voucher, thương hiệu...';
  }
  if (/^Search by offer title, promo code, discount/i.test(trimmed)) {
    return 'Tìm theo tiêu đề ưu đãi, mã giảm giá, mức giảm...';
  }
  if (/^Search store name, slug, domain/i.test(trimmed) || /^Search stores/i.test(trimmed)) {
    return 'Tìm kiếm tên thương hiệu, đường dẫn, tên miền...';
  }
  if (/^Search headline, author, tag, slug/i.test(trimmed) || /^Search articles/i.test(trimmed)) {
    return 'Tìm kiếm tiêu đề bài viết, tác giả, thẻ, đường dẫn...';
  }
  if (/^Search categories by name, slug/i.test(trimmed)) {
    return 'Tìm chuyên mục theo tên, đường dẫn...';
  }
  if (/^Search by label or URL/i.test(trimmed)) {
    return 'Tìm theo nhãn menu hoặc đường dẫn URL...';
  }
  if (/^Search pages by title, slug, or content/i.test(trimmed)) {
    return 'Tìm trang tĩnh theo tiêu đề, đường dẫn hoặc nội dung...';
  }
  if (/^Search inquiries by sender, email, phone/i.test(trimmed)) {
    return 'Tìm liên hệ theo tên người gửi, email, số điện thoại...';
  }
  if (/^Search by email/i.test(trimmed)) {
    return 'Tìm kiếm theo địa chỉ email...';
  }
  if (/^Search by name or email/i.test(trimmed)) {
    return 'Tìm kiếm theo họ tên hoặc email...';
  }
  if (/^Filter roles by name/i.test(trimmed)) {
    return 'Lọc vai trò theo tên...';
  }
  if (/^Search actions \(e\.g\. view, create, delete\)/i.test(trimmed)) {
    return 'Tìm quyền hạn (VD: xem, tạo, xóa)...';
  }
  if (/^Search action, user, IP, target/i.test(trimmed)) {
    return 'Tìm thao tác, người dùng, IP, đối tượng...';
  }
  if (/^e\.g\.\s+Anker\s+Innovations/i.test(trimmed)) {
    return 'VD: Anker Innovations';
  }
  if (/^e\.g\.\s+Leading tech accessories/i.test(trimmed)) {
    return 'VD: Thương hiệu phụ kiện công nghệ và trạm sạc nhanh GaN hàng đầu. Cập nhật mã giảm giá 15% - 40% mỗi ngày...';
  }
  if (/^e\.g\.\s+Anker coupon code/i.test(trimmed)) {
    return 'VD: mã giảm giá Anker, voucher Anker, khuyến mãi Anker, freeship Anker...';
  }
  if (/^Enter a helpful answer for shoppers/i.test(trimmed)) {
    return 'Nhập câu trả lời chi tiết hướng dẫn khách mua hàng...';
  }
  if (/^e\.g\.\s+How do I apply a\s+(.+)\s+promo code at checkout\?$/i.test(trimmed)) {
    return 'VD: Làm thế nào để áp dụng mã giảm giá khi thanh toán?';
  }
  if (/^e\.g\.\s+15% Off Sitewide/i.test(trimmed)) {
    return 'VD: Giảm 15% toàn bộ đơn hàng đèn LED Nilight';
  }
  if (/^Valid on regular priced items only/i.test(trimmed)) {
    return 'Áp dụng cho sản phẩm nguyên giá. Không áp dụng đồng thời với chương trình xả kho...';
  }
  if (/^Concise 1-2 sentence executive summary/i.test(trimmed)) {
    return 'Tóm tắt ngắn gọn 1–2 câu hiển thị trên thẻ bài viết và dưới tiêu đề chính...';
  }
  if (/^Describe what types of articles/i.test(trimmed)) {
    return 'Mô tả các chủ đề bài viết và đánh giá thuộc chuyên mục này...';
  }
  if (/^Brief subtitle displayed under the page heading/i.test(trimmed)) {
    return 'Tiêu đề phụ ngắn gọn hiển thị ngay dưới tiêu đề chính của trang...';
  }
  if (/^Describe the responsibilities and scope of this role/i.test(trimmed)) {
    return 'Mô tả phạm vi công việc và trách nhiệm của vai trò này...';
  }
  if (/^Write a concise professional bio describing this team member/i.test(trimmed)) {
    return 'Nhập tiểu sử chuyên môn ngắn gọn giới thiệu lĩnh vực đánh giá và kinh nghiệm của nhân sự...';
  }
  if (/^Enter custom password \(min\. 6 characters\)/i.test(trimmed)) {
    return 'Nhập mật khẩu tùy chỉnh (tối thiểu 6 ký tự)...';
  }
  if (/^e\.g\.\s+Senior Consumer Tech Reviewer/i.test(trimmed)) {
    return 'VD: Biên tập viên Đánh giá Công nghệ Cao cấp';
  }
  if (/^e\.g\.\s+Elena Croft/i.test(trimmed)) {
    return 'VD: Nguyễn Minh Anh';
  }

  // Media Library dynamic patterns
  if ((m = trimmed.match(/^All Assets\s*\((\d+)\)$/i))) {
    return `Tất cả tài nguyên (${m[1]})`;
  }
  if ((m = trimmed.match(/^All tags\s*\((\d+)\)$/i))) {
    return `Tất cả thẻ (${m[1]})`;
  }
  if ((m = trimmed.match(/^Complete Upload & Save\s*\((.+)\)$/i))) {
    return `Hoàn tất tải lên & Lưu (${m[1]})`;
  }
  if ((m = trimmed.match(/^Manage Search Tags\s*\((\d+)\)$/i))) {
    return `Quản lý thẻ tìm kiếm (${m[1]})`;
  }
  if ((m = trimmed.match(/^Added tag #(.+)$/i))) {
    return `Đã thêm thẻ #${m[1]}`;
  }
  if ((m = trimmed.match(/^Removed tag #(.+)$/i))) {
    return `Đã xóa thẻ #${m[1]}`;
  }
  if ((m = trimmed.match(/^Filter by #(.+)$/i))) {
    return `Lọc theo thẻ #${m[1]}`;
  }
  if ((m = trimmed.match(/^Remove tag #(.+)$/i))) {
    return `Xóa thẻ #${m[1]}`;
  }
  if ((m = trimmed.match(/^Remove #(.+)$/i))) {
    return `Xóa #${m[1]}`;
  }
  if ((m = trimmed.match(/^Articles in "(.+)" \((.+)\)$/i))) {
    return `Bài viết trong "${m[1]}" (${m[2]})`;
  }

  return raw;
}

export function translateItemNameToVi(itemName: string): string {
  const key = itemName.trim().toLowerCase();
  return ITEM_NAME_VI[key] || itemName;
}

const AdminI18nContext = createContext<AdminI18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (text) => text,
});

interface TextNodeCache {
  en: string;
  vi: string;
}

const origTextMap = new WeakMap<Text, TextNodeCache>();
const origPlaceholderMap = new WeakMap<Element, TextNodeCache>();
const origTitleMap = new WeakMap<Element, TextNodeCache>();

function shouldSkipTextNodeParent(el: Element | null): boolean {
  if (!el) return true;
  const tag = el.tagName;
  if (
    tag === 'SCRIPT' ||
    tag === 'STYLE' ||
    tag === 'TEXTAREA' ||
    tag === 'CODE' ||
    tag === 'PRE'
  ) {
    return true;
  }
  if (el.getAttribute('contenteditable') === 'true') return true;
  if (el.closest('[contenteditable="true"], [data-no-i18n="true"]')) return true;
  return false;
}

function shouldSkipAttributeElement(el: Element | null): boolean {
  if (!el) return true;
  const tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') {
    return true;
  }
  if (el.getAttribute('contenteditable') === 'true') return true;
  if (el.closest('[contenteditable="true"], [data-no-i18n="true"]')) return true;
  return false;
}

function applyDomTranslations(root: HTMLElement, locale: AdminLocale) {
  // 1. Walk Text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    if (!shouldSkipTextNodeParent(parent)) {
      const currentVal = node.nodeValue || '';
      const trimmedVal = currentVal.trim();
      const existing = origTextMap.get(node);

      // Re-compute cache if this is a new text node OR if React updated its text content dynamically
      if (!existing || (currentVal !== existing.en && currentVal !== existing.vi)) {
        const englishBase =
          trimmedVal && EXACT_EN_MAP[trimmedVal]
            ? currentVal.replace(trimmedVal, EXACT_EN_MAP[trimmedVal])
            : currentVal;
        const viTranslated = translateAdminStringToVi(englishBase);
        origTextMap.set(node, { en: englishBase, vi: viTranslated });
      }

      const cached = origTextMap.get(node)!;
      const targetVal = locale === 'vi' ? cached.vi : cached.en;
      if (node.nodeValue !== targetVal) {
        node.nodeValue = targetVal;
      }
    }
    node = walker.nextNode() as Text | null;
  }

  // 2. Translate placeholder & title attributes (including <textarea> and <input>)
  const elements = root.querySelectorAll<HTMLElement>('[placeholder], [title]');
  elements.forEach((el) => {
    if (shouldSkipAttributeElement(el)) return;

    if (el.hasAttribute('placeholder')) {
      const currentPh = el.getAttribute('placeholder') || '';
      const existingPh = origPlaceholderMap.get(el);
      if (!existingPh || (currentPh !== existingPh.en && currentPh !== existingPh.vi)) {
        const enPh = EXACT_EN_MAP[currentPh.trim()] || currentPh;
        const viPh = translateAdminStringToVi(enPh);
        origPlaceholderMap.set(el, { en: enPh, vi: viPh });
      }
      const cachedPh = origPlaceholderMap.get(el)!;
      const nextPh = locale === 'vi' ? cachedPh.vi : cachedPh.en;
      if (currentPh !== nextPh) {
        el.setAttribute('placeholder', nextPh);
      }
    }

    if (el.hasAttribute('title')) {
      const currentTitle = el.getAttribute('title') || '';
      const existingTitle = origTitleMap.get(el);
      if (!existingTitle || (currentTitle !== existingTitle.en && currentTitle !== existingTitle.vi)) {
        const enTitle = EXACT_EN_MAP[currentTitle.trim()] || currentTitle;
        const viTitle = translateAdminStringToVi(enTitle);
        origTitleMap.set(el, { en: enTitle, vi: viTitle });
      }
      const cachedTitle = origTitleMap.get(el)!;
      const nextTitle = locale === 'vi' ? cachedTitle.vi : cachedTitle.en;
      if (currentTitle !== nextTitle) {
        el.setAttribute('title', nextTitle);
      }
    }
  });
}

export function AdminI18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>('en');
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as AdminLocale | null;
      if (saved === 'vi' || saved === 'en') {
        setLocaleState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = useCallback((next: AdminLocale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next: AdminLocale = prev === 'en' ? 'vi' : 'en';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (text: string): string => {
      if (!text || locale === 'en') return text;
      return translateAdminStringToVi(text);
    },
    [locale]
  );

  // Sync DOM translations whenever locale, pathname, or Admin DOM changes
  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    let isApplying = false;
    const run = () => {
      if (isApplying) return;
      isApplying = true;
      try {
        applyDomTranslations(container, locale);
      } finally {
        isApplying = false;
      }
    };

    run();
    const rafId = window.requestAnimationFrame(run);
    const timerId = window.setTimeout(run, 120);

    const observer = new MutationObserver(() => {
      run();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      observer.disconnect();
    };
  }, [locale, pathname]);

  return (
    <AdminI18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      <div ref={rootRef} data-admin-i18n-root="true" className="contents">
        {children}
      </div>
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n() {
  return useContext(AdminI18nContext);
}
