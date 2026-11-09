'use client';

import { useState } from 'react';
import { Mail, Search, ArrowUpDown, Download, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import { usePermission } from '@/lib/admin/usePermission';
import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import AdminTableShell from '@/components/admin/AdminTableShell';
import AdminActionButton from '@/components/admin/AdminActionButton';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { adminSelectClass, adminSearchInputClass } from '@/components/admin/adminStyles';
import {
  SUBSCRIBER_SOURCE_LABELS,
  type SubscriberItem,
  type SubscriberStatus,
} from './_lib/data';
import subscriberService from '@/services/subscriberService';

type StatusFilter = 'all' | SubscriberStatus;
type SortBy = 'date-desc' | 'date-asc' | 'email-asc';

const TABLE_COLUMNS = [
  { label: 'Status', className: 'w-32' },
  { label: 'Email' },
  { label: 'Source' },
  { label: 'Subscribed At' },
  { label: 'Actions', className: 'text-right w-28 min-w-[112px]' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminSubscribersPage() {
  const { hasPermission } = usePermission();
  const { toast, confirm: confirmModal } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');

  const {
    items: displayedSubscribers,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    setCurrentPage,
    setPageSize,
    refresh,
  } = useServerPagination<SubscriberItem>({
    endpoint: API_ENDPOINTS.ADMIN.SUBSCRIBERS,
    defaultPageSize: 10,
    search,
    filters: {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sortBy: sortBy === 'email-asc' ? 'email' : 'subscribedAt',
      direction: sortBy === 'date-asc' || sortBy === 'email-asc' ? 'asc' : 'desc',
    },
    transformItem: (s: any) => ({
      id: Number(s.id),
      email: s.email,
      status: (s.status === 'ACTIVE' || s.status === 'active') ? 'active' : 'unsubscribed',
      source: (s.source || 'footer') as any,
      createdAt: s.createdAt || s.subscribedAt || new Date().toISOString(),
    }),
    fallbackItems: [],
  });

  const activeCount = displayedSubscribers.filter((s) => s.status === 'active').length;
  const isFiltered = search.trim() !== '' || statusFilter !== 'all' || sortBy !== 'date-desc';

  const toggleStatus = async (item: SubscriberItem) => {
    try {
      if (item.status === 'active') {
        await apiClient.patch(`${API_ENDPOINTS.ADMIN.SUBSCRIBERS}/${item.id}/unsubscribe`);
        toast.info('Subscriber marked as unsubscribed');
      } else {
        await subscriberService.subscribe(item.email, item.source);
        toast.success('Subscriber re-activated');
      }
      refresh();
    } catch {
      toast.error('Failed to update subscriber status');
    }
  };

  const handleDelete = async (item: SubscriberItem) => {
    const confirmed = await confirmModal({
      title: 'Delete Subscriber',
      message: (
        <span>
          Permanently remove <strong className="text-slate-900">{item.email}</strong> from the mailing list?
        </span>
      ),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      await subscriberService.deleteSubscriber(item.id);
      refresh();
      toast.success('Subscriber deleted');
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Email', 'Status', 'Source', 'Subscribed At'],
      ...displayedSubscribers.map((s) => [s.email, s.status, SUBSCRIBER_SOURCE_LABELS[s.source] || s.source, s.createdAt]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('date-desc');
  };

  if (!hasPermission('feedback.view')) {
    return <UnauthorizedAccess requiredPermission="feedback.view" moduleName="Newsletter Subscribers" />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Mail}
        title="Newsletter Subscribers"
        badge={`${activeCount} Active`}
        description="Readers who signed up via the homepage Dispatch block. Configure the block content in System Settings → Newsletter."
      >
        <button
          type="button"
          onClick={handleExportCsv}
          className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download size={14} /> Export CSV
        </button>
      </AdminPageHeader>

      <AdminFilterBar
        totalItems={totalElements}
        itemName="subscribers"
        isFiltered={isFiltered}
        onReset={handleResetFilters}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className={adminSearchInputClass}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className={adminSelectClass}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className={adminSelectClass}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="email-asc">Email (A → Z)</option>
            </select>
          </div>
        </div>
      </AdminFilterBar>

      <AdminTableShell
        columns={TABLE_COLUMNS}
        isEmpty={displayedSubscribers.length === 0}
        emptyMessage="No subscribers found. Signups from the homepage newsletter block will appear here."
        footer={
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
        }
      >
        {displayedSubscribers.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
            <td className="py-3.5 px-4">
              {item.status === 'active' ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-500 font-bold text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  Unsubscribed
                </span>
              )}
            </td>
            <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">{item.email}</td>
            <td className="py-3.5 px-4 text-xs text-slate-600">
              {SUBSCRIBER_SOURCE_LABELS[item.source] || item.source}
            </td>
            <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(item.createdAt)}</td>
            <td className="py-3.5 px-4">
              <div className="flex items-center justify-end gap-1.5">
                <AdminActionButton
                  icon={item.status === 'active' ? UserX : UserCheck}
                  title={item.status === 'active' ? 'Mark as unsubscribed' : 'Re-activate'}
                  variant={item.status === 'active' ? 'default' : 'success'}
                  onClick={() => toggleStatus(item)}
                />
                <AdminActionButton icon={Trash2} title="Delete" variant="danger" onClick={() => handleDelete(item)} />
              </div>
            </td>
          </tr>
        ))}
      </AdminTableShell>
    </div>
  );
}

