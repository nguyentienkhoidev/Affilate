'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Download,
  Eye,
  RefreshCw,
  ShieldCheck,
  User,
  Clock,
  Laptop,
  Globe,
  PlusCircle,
  Edit3,
  Trash2,
  Send,
  Lock,
  LogIn,
  Upload,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { usePermission } from '@/lib/admin/usePermission';
import { useToast } from '@/context/ToastContext';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { auditService, type AuditStats } from '@/services/auditService';
import {
  exportLogsToCSV,
  type AuditLogItem,
  type ActionType,
} from './_lib/data';
import AuditDetailModal from './_components/AuditDetailModal';

export default function AdminTracingPage() {
  const { hasPermission } = usePermission();
  const { toast } = useToast();

  // Filters state
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Stats state from DB
  const [statsData, setStatsData] = useState<AuditStats | null>(null);

  // Inspector modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Compute startDate based on dateFilter
  const computedStartDate = useMemo(() => {
    const now = Date.now();
    if (dateFilter === 'TODAY') return new Date(now - 24 * 60 * 60 * 1000).toISOString();
    if (dateFilter === 'WEEK') return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (dateFilter === 'MONTH') return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    return undefined;
  }, [dateFilter]);

  // Load audit statistics & dynamic filter options from PostgreSQL
  const loadStats = useCallback(async () => {
    const data = await auditService.getAuditStats();
    if (data) {
      setStatsData(data);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const {
    items: displayedLogs,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    setCurrentPage,
    setPageSize,
    refresh,
  } = useServerPagination<AuditLogItem>({
    endpoint: API_ENDPOINTS.ADMIN.AUDIT,
    defaultPageSize: 10,
    search,
    filters: {
      action: actionFilter !== 'ALL' ? actionFilter : undefined,
      module: moduleFilter !== 'ALL' ? moduleFilter.toLowerCase() : undefined,
      user: userFilter !== 'ALL' ? userFilter : undefined,
      startDate: computedStartDate,
    },
    transformItem: (l: any) => ({
      id: String(l.id),
      timestamp: l.timestamp || l.createdAt || new Date().toISOString(),
      userId: String(l.userId || '1'),
      userName: l.userName || 'Super Administrator',
      userEmail: l.userEmail || 'admin@heygoodly.com',
      userRole: l.userRole || 'Administrator',
      userAvatar: l.userAvatar,
      action: (l.action || 'UPDATE') as any,
      actionTitle: l.actionTitle || l.action || 'Audit Record',
      module: l.module || 'system',
      targetId: l.targetId || String(l.resourceId || ''),
      targetName: l.targetName || l.resourceName || 'System Resource',
      targetHref: l.targetHref || '/admin/dashboard',
      ipAddress: l.ipAddress || '127.0.0.1',
      userAgent: l.userAgent || 'Web Application',
      deviceType: l.deviceType || 'Web Application',
      location: l.location || 'Localhost / Internal Network',
      severity: (l.severity || 'info') as any,
      details: l.details || { note: 'Captured via Spring Boot Audit Trail' },
    }),
    fallbackItems: [],
  });

  // Export full filtered audit logs to CSV
  const handleExportCSV = async () => {
    toast.success('Preparing full audit trail report for export...');
    try {
      const allLogs = await auditService.getAllLogsForExport({
        search: search.trim() || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        module: moduleFilter !== 'ALL' ? moduleFilter.toLowerCase() : undefined,
        user: userFilter !== 'ALL' ? userFilter : undefined,
        startDate: computedStartDate,
      });

      const logsToExport = allLogs.length > 0 ? allLogs : displayedLogs;
      const csvContent = exportLogsToCSV(logsToExport);
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Audit_Trail_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${logsToExport.length} audit records to CSV successfully!`);
    } catch {
      toast.error('Failed to export audit report');
    }
  };

  // Copy Log JSON
  const handleCopyLogJSON = (log: AuditLogItem) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast.success('Copied event JSON to clipboard');
  };

  // Action badge styling helper
  const getActionBadge = (action: ActionType) => {
    const actStr = String(action).toUpperCase();
    if (actStr === 'CREATE') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          <PlusCircle size={11} /> CREATE
        </span>
      );
    }
    if (actStr === 'UPDATE' || actStr === 'UPDATE_PROFILE' || actStr === 'UPDATE_MEDIA_TAGS') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          <Edit3 size={11} /> {actStr}
        </span>
      );
    }
    if (actStr === 'DELETE' || actStr === 'DELETE_MEDIA') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
          <Trash2 size={11} /> {actStr}
        </span>
      );
    }
    if (actStr === 'PUBLISH') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
          <Send size={11} /> PUBLISH
        </span>
      );
    }
    if (actStr === 'VERIFY') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
          <CheckCircle2 size={11} /> VERIFY
        </span>
      );
    }
    if (actStr === 'UPLOAD_MEDIA') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Upload size={11} /> UPLOAD_MEDIA
        </span>
      );
    }
    if (actStr.includes('RBAC') || actStr.includes('SECURITY') || actStr.includes('2FA')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
          <Lock size={11} /> {actStr}
        </span>
      );
    }
    if (actStr === 'LOGIN') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
          <LogIn size={11} /> LOGIN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-zinc-200">
        {action}
      </span>
    );
  };

  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!hasPermission('audit.view')) {
    return (
      <UnauthorizedAccess
        requiredPermission="audit.view"
        moduleName="Action Tracing & Audit Trail"
      />
    );
  }

  // Real Database Metrics
  const totalEvents = statsData?.totalEvents ?? totalElements;
  const sensitiveActions = statsData?.sensitiveActions ?? 0;
  const activeOperators = statsData?.activeOperators ?? 0;
  const last24Hours = statsData?.last24Hours ?? 0;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <AdminPageHeader
        icon={History}
        title="Action Tracing & Comprehensive Audit Trail"
        badge={`${totalEvents} Events Logged`}
        description="Immutable audit log tracking all system changes: editorial reviews, promo code updates, RBAC permission changes, and 2FA sign-ins."
      >
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setActionFilter('ALL');
            setModuleFilter('ALL');
            setUserFilter('ALL');
            setDateFilter('ALL');
            setCurrentPage(1);
            loadStats();
            refresh();
          }}
          className="h-9 px-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Reset Filters</span>
        </button>

        <button
          type="button"
          onClick={handleExportCSV}
          className="h-9 px-3.5 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download size={14} />
          <span>Export CSV Report</span>
        </button>
      </AdminPageHeader>

      {/* 2. Top Metric Cards (100% Real PostgreSQL Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Events</span>
            <History size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 mt-2">{totalEvents}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Immutable system audit records</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sensitive Actions</span>
            <Lock size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{sensitiveActions}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Data deletions &amp; RBAC changes</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Operators</span>
            <User size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{activeOperators}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Staff accounts with recorded actions</p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Last 24 Hours</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{last24Hours}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Events recorded today</p>
        </div>
      </div>

      {/* 3. Advanced Multi-Filter Box (Dynamic DB-driven Options) */}
      <Card className="p-4 space-y-3.5 bg-white border border-zinc-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search action, user, IP, target..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Action Types</option>
              {statsData?.availableActions && statsData.availableActions.length > 0 ? (
                statsData.availableActions.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))
              ) : (
                <>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PUBLISH">PUBLISH</option>
                  <option value="UPLOAD_MEDIA">UPLOAD_MEDIA</option>
                  <option value="DELETE_MEDIA">DELETE_MEDIA</option>
                </>
              )}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Modules</option>
              {statsData?.availableModules && statsData.availableModules.length > 0 ? (
                statsData.availableModules.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod.toUpperCase()}
                  </option>
                ))
              ) : (
                <>
                  <option value="media">MEDIA</option>
                  <option value="stores">STORES</option>
                  <option value="offers">OFFERS</option>
                  <option value="posts">POSTS</option>
                  <option value="users">USERS</option>
                  <option value="auth">AUTH</option>
                </>
              )}
            </select>
          </div>

          {/* Staff Member Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Staff Members</option>
              {statsData?.availableOperators && statsData.availableOperators.length > 0 ? (
                statsData.availableOperators.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))
              ) : (
                <option value="admin@heygoodly.com">admin@heygoodly.com</option>
              )}
            </select>
          </div>
        </div>

        {/* Quick Date Pills */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
              Time Range:
            </span>
            {(
              [
                { key: 'ALL', label: 'All Time' },
                { key: 'TODAY', label: 'Last 24h' },
                { key: 'WEEK', label: 'Last 7 Days' },
                { key: 'MONTH', label: 'Last 30 Days' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
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
            Showing <strong>{displayedLogs.length}</strong> of {totalElements} records
          </div>
        </div>
      </Card>

      {/* 4. Action Tracing Activity Table */}
      <Card className="overflow-hidden border border-zinc-200/80 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Module &amp; Target</th>
                <th className="py-3 px-4">Device &amp; IP</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-indigo-600" />
                      <p className="text-xs font-semibold">Loading audit trail...</p>
                    </div>
                  </td>
                </tr>
              ) : displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <History size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs">No matching audit records found</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Try adjusting your search keywords or resetting the filters.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedLogs.map((log) => {
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
                          {new Date(log.timestamp).toLocaleString('en-US')}
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
                          <span className="text-[10px] font-bold font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded uppercase">
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
                            <Laptop size={13} className="text-indigo-600 shrink-0" />
                          ) : (
                            <Globe size={13} className="text-zinc-500 shrink-0" />
                          )}
                          <span className="font-mono text-[11px] font-semibold text-zinc-800">{log.ipAddress}</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded">
                            {log.deviceType}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{log.location}</div>
                      </td>

                      {/* View Details CTA */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
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
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </Card>

      {/* 5. Deep Dive Drawer / Modal */}
      <AuditDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onCopyJSON={handleCopyLogJSON}
        copiedId={copiedId}
        getActionBadge={getActionBadge}
      />
    </div>
  );
}
