export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'CLONE'
  | 'RBAC_CHANGE'
  | 'SECURITY'
  | 'LOGIN'
  | 'MEDIA_UPLOAD'
  | 'SETTINGS_CHANGE';

export type ActionSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface AuditFieldDiff {
  field: string;
  label: string;
  before: any;
  after: any;
}

export interface AuditLogItem {
  id: string;
  timestamp: string; // ISO 8601 string
  userId: number | string;
  userName: string;
  userEmail: string;
  userRole: string;
  userAvatar?: string;
  action: ActionType;
  actionTitle: string;
  module:
    | 'Articles'
    | 'Stores'
    | 'Offers'
    | 'Categories'
    | 'Users'
    | 'Roles'
    | 'Settings'
    | 'Media'
    | 'Menus'
    | 'Pages'
    | 'Auth';
  targetId?: string | number;
  targetName?: string;
  targetHref?: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  location: string;
  severity: ActionSeverity;
  details?: {
    summary: string;
    changes?: AuditFieldDiff[];
    metadata?: Record<string, any>;
  };
}

export const AUDIT_STORE_KEY = 'admin:audit_logs';

export const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'trc-1001',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 minutes ago
    userId: 1,
    userName: 'Nguyễn Tiến Khôi',
    userEmail: 'admin@bargorya.com',
    userRole: 'Super Administrator',
    action: 'UPDATE',
    actionTitle: 'Cập nhật cấu hình giao diện PostForm & Pin Sidebar/Header',
    module: 'Articles',
    targetId: 'art-youcanic',
    targetName: 'YouCanic Review 2026: Smart Diagnostic Scanners',
    targetHref: '/admin/posts/art-youcanic/edit',
    ipAddress: '118.69.182.24',
    userAgent: 'Chrome 131.0.0.0 (macOS Sequoia 15.3)',
    deviceType: 'Desktop / macOS',
    location: 'Hồ Chí Minh, Vietnam',
    severity: 'success',
    details: {
      summary: 'Tối ưu độ rộng editor 100%, khóa cố định header & sidebar khi cuộn trang và căn giữa icon menu.',
      changes: [
        { field: 'layoutSticky', label: 'Cố định Header & Sidebar', before: 'false (cuộn tự do)', after: 'true (fixed viewport h-screen)' },
        { field: 'editorWidth', label: 'Không gian soạn thảo', before: 'max-w-7xl (1280px)', after: '100% Full-Width' },
        { field: 'sidebarCollapsedLogo', label: 'Hiển thị Logo thu nhỏ', before: 'Cắt 50% logo B', after: 'Hiển thị trọn vẹn 32x32px & centered' },
      ],
      metadata: { componentCount: 6, status: 'PUBLISHED' },
    },
  },
  {
    id: 'trc-1002',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    userId: 1,
    userName: 'Nguyễn Tiến Khôi',
    userEmail: 'admin@bargorya.com',
    userRole: 'Super Administrator',
    action: 'RBAC_CHANGE',
    actionTitle: 'Khóa vĩnh viễn các quyền cơ bản (Core Privileges) cho toàn bộ Roles',
    module: 'Roles',
    targetId: 2,
    targetName: 'Staff Editor & Custom Operational Roles',
    targetHref: '/admin/roles',
    ipAddress: '118.69.182.24',
    userAgent: 'Chrome 131.0.0.0 (macOS Sequoia 15.3)',
    deviceType: 'Desktop / macOS',
    location: 'Hồ Chí Minh, Vietnam',
    severity: 'warning',
    details: {
      summary: 'Thiết lập 4 quyền hệ thống tối thiểu: backend.access, dashboard.view, user.2fa_self, file.upload cố định không thể chỉnh sửa.',
      changes: [
        { field: 'lockedPermissions', label: 'Quyền cố định bắt buộc', before: '[] (cho phép tùy biến)', after: '["backend.access", "dashboard.view", "user.2fa_self", "file.upload"]' },
        { field: 'rbacMatrixMode', label: 'Cơ chế RBAC', before: 'Unrestricted Manual', after: 'Enforced Core System Security' },
      ],
      metadata: { affectedRoles: 3, enforcedBy: 'Super Administrator' },
    },
  },
  {
    id: 'trc-1003',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), // 1 hour ago
    userId: 2,
    userName: 'Lê Hoàng Nam',
    userEmail: 'nam.le@bargorya.com',
    userRole: 'Staff Editor (Biên tập viên)',
    action: 'PUBLISH',
    actionTitle: 'Xuất bản công khai bài đánh giá Vesla Copper Review 2026',
    module: 'Articles',
    targetId: 'art-vesla-copper-2026',
    targetName: 'Vesla Copper Review 2026 – Premium Copper Drinkware',
    targetHref: '/admin/posts/art-vesla-copper-2026/edit',
    ipAddress: '14.169.85.112',
    userAgent: 'Firefox 132.0 (Windows 11 Pro)',
    deviceType: 'Desktop / Windows',
    location: 'Đà Nẵng, Vietnam',
    severity: 'success',
    details: {
      summary: 'Chuyển trạng thái từ DRAFT sang PUBLISHED, kích hoạt hiển thị spotlight trang chủ.',
      changes: [
        { field: 'status', label: 'Trạng thái xuất bản', before: 'DRAFT (Bản nháp)', after: 'PUBLISHED (Công khai)' },
        { field: 'featured', label: 'Feature Hero Spotlight', before: 'false', after: 'true' },
        { field: 'publishedAt', label: 'Ngày công khai', before: 'Chưa đặt', after: '2026-10-24 14:00:00' },
      ],
      metadata: { words: 3420, readTimeMinutes: 14, score: 4.9 },
    },
  },
  {
    id: 'trc-1004',
    timestamp: new Date(Date.now() - 1000 * 60 * 130).toISOString(), // 2 hours ago
    userId: 4,
    userName: 'Võ Minh Thư',
    userEmail: 'thu.vo@bargorya.com',
    userRole: 'Affiliate & Deals Hunter',
    action: 'CREATE',
    actionTitle: 'Thêm mới mã giảm giá độc quyền YOUCANIC30',
    module: 'Offers',
    targetId: 'off-304',
    targetName: 'Giảm ngay $30 cho dòng máy YouCanic Full Diagnostic',
    targetHref: '/admin/offers',
    ipAddress: '27.72.101.45',
    userAgent: 'Safari 18.1 (macOS Sonoma 14.7)',
    deviceType: 'Desktop / macOS',
    location: 'Hà Nội, Vietnam',
    severity: 'info',
    details: {
      summary: 'Tạo mã voucher YOUCANIC30 với mức giảm $30 áp dụng cho toàn bộ checkout máy chẩn đoán.',
      changes: [
        { field: 'code', label: 'Mã Coupon', before: null, after: 'YOUCANIC30' },
        { field: 'discount', label: 'Mức giảm giá', before: null, after: '$30 OFF Direct' },
        { field: 'isVerified', label: 'Xác thực thanh toán', before: false, after: true },
      ],
      metadata: { storeSlug: 'youcanic', network: 'Direct Partner Affiliate' },
    },
  },
  {
    id: 'trc-1005',
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(), // 3.5 hours ago
    userId: 4,
    userName: 'Võ Minh Thư',
    userEmail: 'thu.vo@bargorya.com',
    userRole: 'Affiliate & Deals Hunter',
    action: 'UPDATE',
    actionTitle: 'Xác thực kiểm tra giỏ hàng thành công cho Coupon Shopee 50K',
    module: 'Offers',
    targetId: 'off-108',
    targetName: 'Shopee Voucher 50K Cho Đơn Công Nghệ',
    targetHref: '/admin/offers',
    ipAddress: '27.72.101.45',
    userAgent: 'Safari 18.1 (macOS Sonoma 14.7)',
    deviceType: 'Desktop / macOS',
    location: 'Hà Nội, Vietnam',
    severity: 'success',
    details: {
      summary: 'Bật huy hiệu xanh Verified Coupon sau khi test mua hàng thành công trên app Shopee.',
      changes: [
        { field: 'verified', label: 'Nhãn Verified', before: 'false (Chưa test)', after: 'true (Đã xác minh)' },
        { field: 'lastVerifiedAt', label: 'Thời điểm test', before: '2026-10-18', after: '2026-10-24 12:45' },
      ],
    },
  },
  {
    id: 'trc-1006',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    userId: 1,
    userName: 'Nguyễn Tiến Khôi',
    userEmail: 'admin@bargorya.com',
    userRole: 'Super Administrator',
    action: 'SECURITY',
    actionTitle: 'Kích hoạt xác thực 2 bước (2FA TOTP) cho tài khoản nhân viên mới',
    module: 'Users',
    targetId: 3,
    targetName: 'Trần Thảo Linh (linh.tran@bargorya.com)',
    targetHref: '/admin/users',
    ipAddress: '118.69.182.24',
    userAgent: 'Chrome 131.0.0.0 (macOS Sequoia 15.3)',
    deviceType: 'Desktop / macOS',
    location: 'Hồ Chí Minh, Vietnam',
    severity: 'warning',
    details: {
      summary: 'Cấp mã QR Google Authenticator và bắt buộc xác thực 2 lớp trước khi cấp quyền Staff.',
      changes: [
        { field: 'twoFactorStatus', label: 'Bảo mật 2FA', before: 'INACTIVE', after: 'ACTIVE (Enforced)' },
        { field: 'role', label: 'Vai trò nhân sự', before: 'Pending User', after: 'Cộng tác viên Content' },
      ],
    },
  },
  {
    id: 'trc-1007',
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(), // 7 hours ago
    userId: 3,
    userName: 'Trần Thảo Linh',
    userEmail: 'linh.tran@bargorya.com',
    userRole: 'Cộng tác viên Content',
    action: 'MEDIA_UPLOAD',
    actionTitle: 'Tải lên 4 hình ảnh độ phân giải cao cho bài viết Vesla Copper',
    module: 'Media',
    targetId: 'med-8821',
    targetName: 'vesla_copper_bottle_laboratory_test.webp',
    targetHref: '/admin/media',
    ipAddress: '113.190.23.88',
    userAgent: 'Chrome 130.0.0.0 (Windows 11)',
    deviceType: 'Desktop / Windows',
    location: 'Hải Phòng, Vietnam',
    severity: 'info',
    details: {
      summary: 'Thêm tệp đa phương tiện vào thư viện chung Media Library với định dạng tối ưu WebP.',
      changes: [
        { field: 'fileName', label: 'Tên tệp', before: null, after: 'vesla_copper_bottle_laboratory_test.webp' },
        { field: 'fileSize', label: 'Dung lượng', before: null, after: '1.8 MB (Lossless WebP)' },
        { field: 'dimensions', label: 'Kích thước', before: null, after: '2400 x 1600 px' },
      ],
    },
  },
  {
    id: 'trc-1008',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    userId: 1,
    userName: 'Nguyễn Tiến Khôi',
    userEmail: 'admin@bargorya.com',
    userRole: 'Super Administrator',
    action: 'SETTINGS_CHANGE',
    actionTitle: 'Cập nhật mã xác thực đối tác PartnerBoost & Google Search Console',
    module: 'Settings',
    targetId: 'seo-config',
    targetName: 'Global SEO Verification & Impact Meta Tags',
    targetHref: '/admin/settings/seo',
    ipAddress: '118.69.182.24',
    userAgent: 'Chrome 131.0.0.0 (macOS Sequoia 15.3)',
    deviceType: 'Desktop / macOS',
    location: 'Hồ Chí Minh, Vietnam',
    severity: 'warning',
    details: {
      summary: 'Cập nhật Impact Partner API verification token và kích hoạt auto-generate Sitemap/Robots.txt.',
      changes: [
        { field: 'partnerBoostKey', label: 'PartnerBoost Tag', before: 'pb-old-token-2025', after: 'pb-verif-2026-prod' },
        { field: 'sitemapAutoSync', label: 'Tự động tạo Sitemap', before: 'false', after: 'true' },
      ],
    },
  },
  {
    id: 'trc-1009',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    userId: 2,
    userName: 'Lê Hoàng Nam',
    userEmail: 'nam.le@bargorya.com',
    userRole: 'Staff Editor (Biên tập viên)',
    action: 'UPDATE',
    actionTitle: 'Tăng mức hoa hồng liên kết cửa hàng Nike Official Store',
    module: 'Stores',
    targetId: 's-nike',
    targetName: 'Nike Official Store Vietnam',
    targetHref: '/admin/stores',
    ipAddress: '14.169.85.112',
    userAgent: 'Firefox 132.0 (Windows 11 Pro)',
    deviceType: 'Desktop / Windows',
    location: 'Đà Nẵng, Vietnam',
    severity: 'info',
    details: {
      summary: 'Điều chỉnh tỷ lệ chiết khấu affiliate từ 4.5% lên 7.0% theo chương trình Super Brand Day.',
      changes: [
        { field: 'cashbackRate', label: 'Tỷ lệ hoa hồng', before: '4.5%', after: '7.0% Exclusive' },
        { field: 'trackingUrl', label: 'Link tracking', before: 'https://go.nike.com/aff_std', after: 'https://go.nike.com/aff_brand_day_2026' },
      ],
    },
  },
  {
    id: 'trc-1010',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // Yesterday
    userId: 1,
    userName: 'Nguyễn Tiến Khôi',
    userEmail: 'admin@bargorya.com',
    userRole: 'Super Administrator',
    action: 'DELETE',
    actionTitle: 'Gỡ bỏ 18 mã coupon hết hạn đợt Mega Sale Black Friday cũ',
    module: 'Offers',
    targetId: 'batch-cleanup',
    targetName: '18 Expired Vouchers (Lazada & Tiki)',
    targetHref: '/admin/offers',
    ipAddress: '118.69.182.24',
    userAgent: 'Chrome 131.0.0.0 (macOS Sequoia 15.3)',
    deviceType: 'Desktop / macOS',
    location: 'Hồ Chí Minh, Vietnam',
    severity: 'danger',
    details: {
      summary: 'Dọn dẹp cơ sở dữ liệu coupon hết hạn hiệu lực nhằm tối ưu tỷ lệ conversion cho độc giả.',
      changes: [
        { field: 'status', label: 'Thao tác dữ liệu', before: '18 Active Vouchers', after: 'Purged from production database' },
      ],
    },
  },
  {
    id: 'trc-1011',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    userId: 4,
    userName: 'Võ Minh Thư',
    userEmail: 'thu.vo@bargorya.com',
    userRole: 'Affiliate & Deals Hunter',
    action: 'LOGIN',
    actionTitle: 'Đăng nhập thành công với xác thực 2 lớp TOTP từ IP mới',
    module: 'Auth',
    targetId: 'auth-sess-9912',
    targetName: 'Phiên làm việc web console',
    ipAddress: '27.72.101.45',
    userAgent: 'Safari 18.1 (macOS Sonoma 14.7)',
    deviceType: 'Desktop / macOS',
    location: 'Hà Nội, Vietnam',
    severity: 'info',
    details: {
      summary: 'Đăng nhập vào hệ thống Admin ProCMS thành công, mã OTP 6 số xác thực đúng.',
    },
  },
  {
    id: 'trc-1012',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    userId: 1,
    userName: 'Nguyễn Tiến Khôi',
    userEmail: 'admin@bargorya.com',
    userRole: 'Super Administrator',
    action: 'CREATE',
    actionTitle: 'Tạo vai trò mới: Nhân viên Săn Deals / Coupon (Deals Hunter)',
    module: 'Roles',
    targetId: 3,
    targetName: 'Deals Hunter RBAC Role',
    targetHref: '/admin/roles',
    ipAddress: '118.69.182.24',
    userAgent: 'Chrome 131.0.0.0 (macOS Sequoia 15.3)',
    deviceType: 'Desktop / macOS',
    location: 'Hồ Chí Minh, Vietnam',
    severity: 'success',
    details: {
      summary: 'Định nghĩa vai trò mới chuyên quản lý merchant và coupon với 12 đặc quyền.',
      changes: [
        { field: 'roleName', label: 'Tên vai trò', before: null, after: 'Nhân viên Săn Deals / Coupon' },
        { field: 'roleSlug', label: 'Mã slug', before: null, after: 'deals_hunter' },
      ],
    },
  },
];

/**
 * Log a user action to localStorage audit trail
 */
export function recordAuditAction(
  entry: Omit<AuditLogItem, 'id' | 'timestamp' | 'ipAddress' | 'userAgent' | 'deviceType' | 'location'> &
    Partial<AuditLogItem>
): AuditLogItem {
  if (typeof window === 'undefined') {
    return {
      id: `trc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: 'Unknown Browser',
      deviceType: 'Desktop',
      location: 'Localhost',
      ...entry,
    };
  }

  try {
    const raw = localStorage.getItem(AUDIT_STORE_KEY);
    const existing: AuditLogItem[] = raw ? JSON.parse(raw) : DEFAULT_AUDIT_LOGS;

    const newLog: AuditLogItem = {
      id: `trc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ipAddress: entry.ipAddress || '118.69.182.24',
      userAgent: entry.userAgent || navigator.userAgent,
      deviceType: entry.deviceType || (navigator.userAgent.includes('Mac') ? 'Desktop / macOS' : 'Desktop / Windows'),
      location: entry.location || 'Hồ Chí Minh, Vietnam',
      ...entry,
    };

    const updated = [newLog, ...existing].slice(0, 500); // keep max 500 records
    localStorage.setItem(AUDIT_STORE_KEY, JSON.stringify(updated));
    return newLog;
  } catch {
    return {
      id: `trc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: 'Browser',
      deviceType: 'Desktop',
      location: 'Local',
      ...entry,
    };
  }
}

/**
 * Export audit logs to CSV format
 */
export function exportLogsToCSV(logs: AuditLogItem[]): string {
  const headers = [
    'ID',
    'Thời Gian',
    'Người Thực Hiện',
    'Email',
    'Vai Trò',
    'Hành Động',
    'Tiêu Đề Hành Động',
    'Phân Hệ (Module)',
    'Đối Tượng Ảnh Hưởng',
    'Địa Chỉ IP',
    'Thiết Bị / OS',
    'Mức Độ (Severity)',
    'Chi Tiết Tóm Tắt',
  ];

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = logs.map((log) => [
    escapeCSV(log.id),
    escapeCSV(new Date(log.timestamp).toLocaleString('vi-VN')),
    escapeCSV(log.userName),
    escapeCSV(log.userEmail),
    escapeCSV(log.userRole),
    escapeCSV(log.action),
    escapeCSV(log.actionTitle),
    escapeCSV(log.module),
    escapeCSV(log.targetName || log.targetId || '-'),
    escapeCSV(log.ipAddress),
    escapeCSV(log.deviceType),
    escapeCSV(log.severity),
    escapeCSV(log.details?.summary || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
