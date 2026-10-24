export interface RoleItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  usersCount: number;
  permissions: string[];
}

export interface PermissionGroup {
  module: string;
  isCore?: boolean;
  description?: string;
  permissions: {
    code: string;
    label: string;
    description: string;
    isLocked?: boolean;
  }[];
}

export const ROLES_STORE_KEY = 'roles';

export const CORE_PERMISSION_CODES: string[] = [
  'backend.access',
  'dashboard.view',
  'user.2fa_self',
  'file.upload',
];

export const isCorePermission = (code: string): boolean => {
  return CORE_PERMISSION_CODES.includes(code);
};

export const PERMISSION_CATALOG: PermissionGroup[] = [
  {
    module: 'Quyền Cơ Bản Hệ Thống (Core System - Bắt Buộc)',
    isCore: true,
    description: 'Quyền tối thiểu mặc định mọi vai trò đều được cấp, cố định và không thể chỉnh sửa.',
    permissions: [
      {
        code: 'backend.access',
        label: 'Truy cập Admin ProCMS',
        description: 'Đăng nhập vào bảng điều khiển quản trị và sử dụng các tính năng cơ bản',
        isLocked: true,
      },
      {
        code: 'dashboard.view',
        label: 'Xem Bảng tin Dashboard',
        description: 'Xem các chỉ số vận hành tổng quan, biểu đồ và thông báo hệ thống',
        isLocked: true,
      },
      {
        code: 'user.2fa_self',
        label: 'Hồ sơ Cá nhân & 2FA',
        description: 'Xem thông tin tài khoản của mình, đổi mật khẩu và quản lý bảo mật 2 bước',
        isLocked: true,
      },
      {
        code: 'file.upload',
        label: 'Thư viện Media & Tải ảnh',
        description: 'Mở Media Library dùng chung để xem và chèn hình ảnh khi soạn thảo',
        isLocked: true,
      },
    ],
  },
  {
    module: 'Quản lý Cửa hàng (Stores Directory)',
    permissions: [
      { code: 'store.view', label: 'Xem Cửa hàng', description: 'Xem danh sách và chi tiết các đối tác thương hiệu' },
      { code: 'store.create', label: 'Tạo Cửa hàng', description: 'Thêm mới nhãn hàng và liên kết domain tiếp thị' },
      { code: 'store.update', label: 'Cập nhật Cửa hàng', description: 'Chỉnh sửa logo, đánh giá sao, mô tả merchant' },
      { code: 'store.delete', label: 'Xóa Cửa hàng', description: 'Lưu trữ hoặc gỡ bỏ cửa hàng khỏi danh bạ' },
      { code: 'store.clone', label: 'Nhân bản Cửa hàng', description: 'Sao chép nhanh cấu hình merchant thành bản nháp' },
      { code: 'store.affiliate_intel', label: 'Dữ liệu Hoa hồng & Intel', description: 'Xem tỷ lệ hoa hồng affiliate và email liên hệ trực tiếp' },
    ],
  },
  {
    module: 'Ưu đãi & Mã giảm giá (Coupons & Deals)',
    permissions: [
      { code: 'offer.view', label: 'Xem Ưu đãi', description: 'Duyệt danh sách coupon vouchers và deal khuyến mãi' },
      { code: 'offer.create', label: 'Tạo Ưu đãi', description: 'Thêm mới mã coupon hoặc chương trình giảm giá' },
      { code: 'offer.update', label: 'Chỉnh sửa Ưu đãi', description: 'Sửa phần trăm giảm, thời hạn và điều khoản' },
      { code: 'offer.delete', label: 'Xóa Ưu đãi', description: 'Gỡ bỏ coupon hết hạn hoặc lỗi thời' },
      { code: 'offer.verify', label: 'Xác thực Coupon', description: 'Bật nhãn Verified sau khi kiểm tra mã thành công' },
      { code: 'offer.clone', label: 'Nhân bản Ưu đãi', description: 'Sao chép coupon có sẵn với 1 cú click' },
    ],
  },
  {
    module: 'Bài viết & Đánh giá (Articles & Reviews)',
    permissions: [
      { code: 'post.view', label: 'Xem Bài viết', description: 'Đọc bản thảo đánh giá sản phẩm và cẩm nang' },
      { code: 'post.create', label: 'Viết Bài mới', description: 'Soạn bài review, deal box, pros/cons toàn màn hình' },
      { code: 'post.update', label: 'Chỉnh sửa Bài viết', description: 'Chỉnh sửa nội dung, mục lục, chấm điểm benchmark' },
      { code: 'post.delete', label: 'Xóa Bài viết', description: 'Lưu trữ hoặc xóa bài đánh giá' },
      { code: 'post.publish', label: 'Xuất bản & Lên lịch', description: 'Chuyển bài viết sang công khai hoặc hẹn giờ đăng' },
      { code: 'post.clone', label: 'Nhân bản Bài viết', description: 'Tạo bản sao nháp bài viết để biên tập lại' },
    ],
  },
  {
    module: 'CMS & Kênh Nội dung (CMS & Channels)',
    permissions: [
      { code: 'category.view', label: 'Xem Danh mục', description: 'Xem cây danh mục ngành hàng và phân loại' },
      { code: 'category.manage', label: 'Quản lý Danh mục', description: 'Thêm, sửa, sắp xếp thứ tự hiển thị danh mục' },
      { code: 'menu.manage', label: 'Menu Điều hướng', description: 'Tùy chỉnh menu header, footer và sidebar portal' },
      { code: 'page.view', label: 'Trang Tĩnh & Chính sách', description: 'Quản lý các trang điều khoản, chính sách, giới thiệu' },
      { code: 'feedback.view', label: 'Liên hệ & Khách hàng', description: 'Xem và phản hồi ý kiến đóng góp từ độc giả' },
    ],
  },
  {
    module: 'Tài khoản & Nhân sự (Staff Accounts)',
    permissions: [
      { code: 'user.view', label: 'Xem Nhân sự', description: 'Xem danh sách tài khoản nhân viên và quyền hạn' },
      { code: 'user.create', label: 'Tạo Nhân sự', description: 'Cấp tài khoản mới cho nhân viên backoffice' },
      { code: 'user.update', label: 'Cập nhật Nhân sự', description: 'Thay đổi chức vụ, email hoặc khóa tài khoản' },
      { code: 'user.2fa_reset', label: 'Reset 2FA Khẩn cấp', description: 'Mở khóa 2FA khi nhân viên thất lạc authenticator' },
    ],
  },
  {
    module: 'Phân quyền & RBAC Matrix (Roles & RBAC)',
    permissions: [
      { code: 'role.view', label: 'Xem Ma trận Vai trò', description: 'Xem cấu hình các vai trò và quyền hạn chi tiết' },
      { code: 'role.manage', label: 'Quản lý & Cấp quyền', description: 'Tạo vai trò mới và lưu phân quyền RBAC Matrix' },
      { code: 'audit.view', label: 'Xem Nhật ký Truy vết (Tracing)', description: 'Truy xuất lịch sử thao tác, sửa đổi dữ liệu của toàn bộ user' },
    ],
  },
  {
    module: 'Cài đặt Hệ thống & SEO (System Settings)',
    permissions: [
      { code: 'setting.general', label: 'Cấu hình Chung', description: 'Cập nhật tên website, logo, thông tin liên hệ' },
      { code: 'setting.seo', label: 'SEO & Thẻ Meta', description: 'Cấu hình mã xác minh PartnerBoost, Impact, Google' },
      { code: 'setting.tracking', label: 'Tracking & Analytics', description: 'Cài đặt mã Google Tag Manager, Google Analytics' },
      { code: 'setting.ads', label: 'Quảng cáo & Banners', description: 'Quản trị các vị trí banner tài trợ trên trang chủ' },
    ],
  },
];

export const DEFAULT_ROLES: RoleItem[] = [
  {
    id: 1,
    name: 'Administrator (Superuser)',
    slug: 'admin',
    description: 'Toàn quyền quản trị tối cao trên toàn bộ hệ thống và phân quyền.',
    isSystem: true,
    usersCount: 1,
    permissions: ['ALL'],
  },
  {
    id: 2,
    name: 'Staff Editor (Biên tập viên)',
    slug: 'staff-editor',
    description: 'Nhân viên biên tập nội dung, tạo và duyệt bài đánh giá, quản lý cửa hàng và mã giảm giá.',
    isSystem: false,
    usersCount: 2,
    permissions: [
      ...CORE_PERMISSION_CODES,
      'store.view',
      'store.create',
      'store.update',
      'offer.view',
      'offer.create',
      'offer.update',
      'offer.verify',
      'offer.clone',
      'post.view',
      'post.create',
      'post.update',
      'post.clone',
      'category.view',
      'page.view',
    ],
  },
  {
    id: 3,
    name: 'Affiliate & Deals Hunter',
    slug: 'affiliate-manager',
    description: 'Chuyên viên săn deal, quản lý mã ưu đãi, đối tác merchant và link tiếp thị liên kết.',
    isSystem: false,
    usersCount: 1,
    permissions: [
      ...CORE_PERMISSION_CODES,
      'store.view',
      'store.create',
      'store.update',
      'store.affiliate_intel',
      'offer.view',
      'offer.create',
      'offer.update',
      'offer.verify',
      'offer.clone',
    ],
  },
];
