'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  ShieldCheck,
  User,
  Clock,
  Laptop,
  Smartphone,
  Globe,
  PlusCircle,
  Edit3,
  Trash2,
  Send,
  Lock,
  LogIn,
  SlidersHorizontal,
  X,
  Copy,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Pagination from '@/components/admin/Pagination';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { usePermission } from '@/lib/admin/usePermission';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import {
  AUDIT_STORE_KEY,
  DEFAULT_AUDIT_LOGS,
  recordAuditAction,
  exportLogsToCSV,
  type AuditLogItem,
  type ActionType,
} from './_lib/data';

export default function AdminTracingPage() {
  const { hasPermission, currentRole } = usePermission();
  const { items: auditLogs, setItems } = useAdminCollection<AuditLogItem>(
    AUDIT_STORE_KEY,
    DEFAULT_AUDIT_LOGS
  );

  // Filters state
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Inspector modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (!hasPermission('audit.view')) {
    return (
      <UnauthorizedAccess
        requiredPermission="audit.view"
        moduleName="Action Tracing & Audit Trail"
      />
    );
  }

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Quick action simulate
  const handleSimulateAction = () => {
    const sampleActions: Array<{
      action: ActionType;
      actionTitle: string;
      module: AuditLogItem['module'];
      targetName: string;
      summary: string;
      severity: AuditLogItem['severity'];
      changes?: Array<{ field: string; label: string; before: any; after: any }>;
    }> = [
      {
        action: 'UPDATE',
        actionTitle: 'Cập nhật giá ưu đãi và mã coupon cho Nike Store',
        module: 'Offers',
        targetName: 'Nike Super Brand Day 30% OFF',
        summary: 'Điều chỉnh phần trăm chiết khấu từ 20% lên 30% theo sự kiện Flash Sale.',
        severity: 'success',
        changes: [
          { field: 'discount', label: 'Mức giảm giá', before: '20% OFF', after: '30% OFF Flash' },
          { field: 'verified', label: 'Trạng thái xác thực', before: false, after: true },
        ],
      },
      {
        action: 'PUBLISH',
        actionTitle: 'Lên lịch xuất bản bài viết cẩm nang mua sắm máy ảnh 2026',
        module: 'Articles',
        targetName: 'Top 5 Máy Ảnh Mirrorless Đáng Mua Nhất 2026',
        summary: 'Đặt lịch công khai bài viết tự động vào 09:00 ngày mai.',
        severity: 'info',
        changes: [
          { field: 'status', label: 'Trạng thái', before: 'DRAFT', after: 'SCHEDULED' },
          { field: 'scheduleTime', label: 'Hẹn giờ phát hành', before: null, after: '2026-10-25 09:00:00' },
        ],
      },
      {
        action: 'DELETE',
        actionTitle: 'Xóa danh mục phụ không còn sử dụng: Phụ kiện cũ 2024',
        module: 'Categories',
        targetName: 'Phụ kiện máy tính cũ 2024',
        summary: 'Lưu trữ và xóa mềm danh mục phụ khỏi cây phân loại danh mục sản phẩm.',
        severity: 'danger',
        changes: [
          { field: 'status', label: 'Thao tác dữ liệu', before: 'ACTIVE (Hiển thị)', after: 'DELETED (Đã gỡ)' },
        ],
      },
    ];

    const pick = sampleActions[Math.floor(Math.random() * sampleActions.length)];
    const newLog = recordAuditAction({
      userId: 1,
      userName: currentRole.roleName,
      userEmail: 'admin@bargorya.com',
      userRole: currentRole.roleName,
      action: pick.action,
      actionTitle: pick.actionTitle,
      module: pick.module,
      targetName: pick.targetName,
      severity: pick.severity,
      details: {
        summary: pick.summary,
        changes: pick.changes,
      },
    });

    setItems((prev) => [newLog, ...prev]);
    showToast(`Đã ghi vết thành công action mới: "${newLog.actionTitle}"`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent = exportLogsToCSV(filteredLogs);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Audit_Trail_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Đã xuất file báo cáo ${filteredLogs.length} bản ghi truy vết thành công!`);
  };

  // Copy Log JSON
  const handleCopyLogJSON = (log: AuditLogItem) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          log.actionTitle.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          log.userEmail.toLowerCase().includes(q) ||
          log.module.toLowerCase().includes(q) ||
          (log.targetName && log.targetName.toLowerCase().includes(q)) ||
          log.ipAddress.includes(q) ||
          (log.details?.summary && log.details.summary.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Action type
      if (actionFilter !== 'ALL' && log.action !== actionFilter) {
        return false;
      }

      // Module
      if (moduleFilter !== 'ALL' && log.module !== moduleFilter) {
        return false;
      }

      // User
      if (userFilter !== 'ALL' && log.userEmail !== userFilter) {
        return false;
      }

      // Date
      if (dateFilter !== 'ALL') {
        const logDate = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (dateFilter === 'TODAY' && now - logDate > 24 * 60 * 60 * 1000) return false;
        if (dateFilter === 'WEEK' && now - logDate > 7 * 24 * 60 * 60 * 1000) return false;
        if (dateFilter === 'MONTH' && now - logDate > 30 * 24 * 60 * 60 * 1000) return false;
      }

      return true;
    });
  }, [auditLogs, search, actionFilter, moduleFilter, userFilter, dateFilter]);

  // Pagination slice
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const deletesAndRbac = auditLogs.filter(
      (l) => l.action === 'DELETE' || l.action === 'RBAC_CHANGE'
    ).length;
    const uniqueUsers = new Set(auditLogs.map((l) => l.userEmail)).size;
    const todayCount = auditLogs.filter(
      (l) => Date.now() - new Date(l.timestamp).getTime() < 24 * 60 * 60 * 1000
    ).length;
    return { total, deletesAndRbac, uniqueUsers, todayCount };
  }, [auditLogs]);

  // Action badge styling helper
  const getActionBadge = (action: ActionType) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle size={11} /> CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            <Edit3 size={11} /> UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 size={11} /> DELETE
          </span>
        );
      case 'PUBLISH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            <Send size={11} /> PUBLISH
          </span>
        );
      case 'RBAC_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
            <Lock size={11} /> RBAC MATRIX
          </span>
        );
      case 'SECURITY':
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            <LogIn size={11} /> AUTH / 2FA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
            {action}
          </span>
        );
    }
  };

  // Relative time helper
  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hôm qua';
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-fadeIn">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <History size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Action Tracing &amp; Audit Trail
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 max-w-3xl">
            Theo dõi và truy xuất toàn bộ lịch sử thao tác của các user/nhân sự theo thời gian thực.
            Kiểm tra chi tiết thay đổi (Before &amp; After diff), IP truy cập, thiết bị và các phân hệ bị tác động.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSimulateAction}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition cursor-pointer shadow-2xs"
            title="Thử nghiệm ghi thêm 1 action mới vào nhật ký"
          >
            <Sparkles size={14} /> Ghi vết Action Mới
          </button>

          <button
            onClick={handleExportCSV}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition cursor-pointer shadow-2xs"
            title="Xuất danh sách ra file CSV"
          >
            <Download size={14} /> Xuất Báo cáo CSV
          </button>
        </div>
      </div>

      {/* 2. Overview Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-zinc-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Tổng Số Hành Động</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <History size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900">{stats.total}</span>
            <span className="text-xs font-bold text-emerald-600">+{stats.todayCount} hôm nay</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Toàn bộ thao tác đã ghi nhận trong hệ thống</p>
        </Card>

        <Card className="p-4 bg-white border border-zinc-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Thao Tác Nhạy Cảm</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{stats.deletesAndRbac}</span>
            <span className="text-xs text-zinc-500 font-medium">Xóa dữ liệu / Đổi quyền</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Cần đối chiếu kiểm tra định kỳ</p>
        </Card>

        <Card className="p-4 bg-white border border-zinc-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Nhân Sự Đang Tác Nghiệp</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900">{stats.uniqueUsers}</span>
            <span className="text-xs font-bold text-indigo-600">Active Staff</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Các user đã phát sinh thao tác gần đây</p>
        </Card>

        <Card className="p-4 bg-white border border-zinc-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Bảo Mật &amp; Truy Cập 2FA</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">100%</span>
            <span className="text-xs font-bold text-emerald-700">Protected</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Toàn bộ phiên làm việc đều qua xác thực 2 lớp</p>
        </Card>
      </div>

      {/* 3. Filter & Search Controls */}
      <Card className="p-4 bg-white border border-zinc-200/80 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo user, email, hành động, tên bài viết, mã coupon, IP..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Action Filter */}
          <div className="md:col-span-2">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">Mọi Hành động (All)</option>
              <option value="CREATE">CREATE (Tạo mới)</option>
              <option value="UPDATE">UPDATE (Cập nhật)</option>
              <option value="DELETE">DELETE (Xóa dữ liệu)</option>
              <option value="PUBLISH">PUBLISH (Xuất bản)</option>
              <option value="RBAC_CHANGE">RBAC MATRIX (Phân quyền)</option>
              <option value="SECURITY">SECURITY &amp; 2FA</option>
              <option value="LOGIN">LOGIN (Đăng nhập)</option>
              <option value="MEDIA_UPLOAD">MEDIA (Tải ảnh)</option>
            </select>
          </div>

          {/* Module Filter */}
          <div className="md:col-span-2">
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">Tất cả Phân hệ (Modules)</option>
              <option value="Articles">Articles (Bài viết &amp; Review)</option>
              <option value="Stores">Stores (Cửa hàng)</option>
              <option value="Offers">Offers (Ưu đãi &amp; Coupon)</option>
              <option value="Categories">Categories (Danh mục)</option>
              <option value="Users">Users (Nhân sự)</option>
              <option value="Roles">Roles &amp; RBAC</option>
              <option value="Settings">Settings (Cài đặt &amp; SEO)</option>
              <option value="Media">Media Library</option>
              <option value="Auth">Auth &amp; Session</option>
            </select>
          </div>

          {/* User Filter */}
          <div className="md:col-span-3">
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">Mọi Nhân sự (All Staff)</option>
              <option value="admin@bargorya.com">Nguyễn Tiến Khôi (Super Administrator)</option>
              <option value="nam.le@bargorya.com">Lê Hoàng Nam (Staff Editor)</option>
              <option value="thu.vo@bargorya.com">Võ Minh Thư (Deals Hunter)</option>
              <option value="linh.tran@bargorya.com">Trần Thảo Linh (Content Writer)</option>
            </select>
          </div>
        </div>

        {/* Quick Date Pills */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
              Thời gian:
            </span>
            {(
              [
                { key: 'ALL', label: 'Tất cả' },
                { key: 'TODAY', label: '24h qua' },
                { key: 'WEEK', label: '7 ngày gần nhất' },
                { key: 'MONTH', label: '30 ngày' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setDateFilter(t.key);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  dateFilter === t.key
                    ? 'bg-zinc-900 text-white shadow-2xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-zinc-500 font-mono">
            Hiển thị <strong>{paginatedLogs.length}</strong> / {filteredLogs.length} bản ghi
          </div>
        </div>
      </Card>

      {/* 4. Action Tracing Activity Table */}
      <Card className="overflow-hidden border border-zinc-200/80 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4">Loại Hành Động</th>
                <th className="py-3 px-4">Phân Hệ &amp; Đối tượng</th>
                <th className="py-3 px-4">Thiết bị &amp; IP</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <History size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs">Không tìm thấy bản ghi truy vết phù hợp</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Thử điều chỉnh từ khóa tìm kiếm hoặc chọn lại bộ lọc hành động.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isMac = log.deviceType.toLowerCase().includes('mac');

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                          <Clock size={12} className="text-zinc-400 shrink-0" />
                          <span>{formatRelativeTime(log.timestamp)}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </div>
                      </td>

                      {/* User & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {log.userName.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 truncate">{log.userName}</p>
                            <p className="text-[10px] text-zinc-500 font-mono truncate">{log.userEmail}</p>
                            <span className="inline-block text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded mt-0.5">
                              {log.userRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Module & Target */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                            {log.module}
                          </span>
                          {log.targetHref ? (
                            <Link
                              href={log.targetHref}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-zinc-900 hover:text-indigo-600 transition truncate"
                            >
                              {log.targetName || log.targetId}
                            </Link>
                          ) : (
                            <span className="font-bold text-zinc-900 truncate">
                              {log.targetName || '-'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-600 line-clamp-1">
                          {log.actionTitle}
                        </p>
                      </td>

                      {/* Device & IP */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-700">
                          {isMac ? (
                            <Laptop size={13} className="text-zinc-500 shrink-0" />
                          ) : (
                            <Globe size={13} className="text-zinc-500 shrink-0" />
                          )}
                          <span className="font-mono text-[11px]">{log.ipAddress}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{log.location}</div>
                      </td>

                      {/* View Details CTA */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {filteredLogs.length > pageSize && (
          <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredLogs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* 5. Deep Dive Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm">
                    Chi Tiết Nhật Ký Truy Vết (Trace Event Deep Dive)
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Event ID: {selectedLog.id} • {new Date(selectedLog.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLogJSON(selectedLog)}
                  className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition cursor-pointer"
                  title="Sao chép toàn bộ JSON của event này"
                >
                  {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedId ? 'Đã sao chép' : 'Copy JSON'}</span>
                </button>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Event Summary Card */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Hành Động Thực Hiện
                  </span>
                  {getActionBadge(selectedLog.action)}
                </div>
                <h4 className="text-sm font-bold text-zinc-900">{selectedLog.actionTitle}</h4>
                {selectedLog.details?.summary && (
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {selectedLog.details.summary}
                  </p>
                )}
              </div>

              {/* 2-Column User & Environment Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* User column */}
                <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-white space-y-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Nhân Sự Thực Hiện
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {selectedLog.userName.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">{selectedLog.userName}</p>
                      <p className="text-zinc-500 font-mono text-[11px]">{selectedLog.userEmail}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Vai trò phân quyền:</span>
                    <span className="font-bold text-indigo-700">{selectedLog.userRole}</span>
                  </div>
                </div>

                {/* Device & Network column */}
                <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-white space-y-2">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Môi Trường &amp; Thiết Bị
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-zinc-700">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Địa chỉ IP:</span>
                      <span className="font-bold">{selectedLog.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Vị trí địa lý:</span>
                      <span>{selectedLog.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Hệ điều hành:</span>
                      <span>{selectedLog.deviceType}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 truncate">
                    UA: {selectedLog.userAgent}
                  </div>
                </div>
              </div>

              {/* Before & After Diff Comparison Table */}
              {selectedLog.details?.changes && selectedLog.details.changes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-zinc-800">
                      Chi Tiết Thay Đổi Dữ Liệu (Before &amp; After Diff)
                    </h5>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {selectedLog.details.changes.length} trường bị sửa đổi
                    </span>
                  </div>

                  <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3.5 w-1/3">Trường dữ liệu</th>
                          <th className="py-2.5 px-3.5 w-1/3 text-rose-700 bg-rose-50/50">
                            Giá trị Cũ (Before)
                          </th>
                          <th className="py-2.5 px-3.5 w-1/3 text-emerald-700 bg-emerald-50/50">
                            Giá trị Mới (After)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {selectedLog.details.changes.map((ch, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50">
                            <td className="py-2.5 px-3.5 font-semibold text-zinc-900">
                              {ch.label}
                              <code className="block text-[10px] font-mono text-zinc-400 mt-0.5">
                                {ch.field}
                              </code>
                            </td>
                            <td className="py-2.5 px-3.5 text-rose-700 font-mono text-[11px] bg-rose-50/20 break-all">
                              {ch.before === null || ch.before === undefined ? (
                                <span className="text-zinc-400 italic">None</span>
                              ) : (
                                String(ch.before)
                              )}
                            </td>
                            <td className="py-2.5 px-3.5 text-emerald-700 font-mono text-[11px] bg-emerald-50/20 font-bold break-all">
                              {ch.after === null || ch.after === undefined ? (
                                <span className="text-zinc-400 italic">None</span>
                              ) : (
                                String(ch.after)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Raw JSON Snapshot */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Raw JSON Audit Payload
                </span>
                <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Lưu trữ bất biến nhằm tuân thủ tiêu chuẩn an toàn bảo mật thông tin &amp; kiểm toán.
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="h-8 px-4 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition cursor-pointer shadow-2xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
