'use client';

import { useState } from 'react';
import { MessageSquare, Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { useServerPagination } from '@/lib/admin/useServerPagination';
import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/lib/api/axios-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import Pagination from '@/components/admin/Pagination';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import AdminTableShell from '@/components/admin/AdminTableShell';
import { adminSelectClass, adminSearchInputClass } from '@/components/admin/adminStyles';
import { type FeedbackItem } from './_lib/data';
import FeedbackTableRow from './_components/FeedbackTableRow';
import FeedbackDetailModal from './_components/FeedbackDetailModal';

type StatusFilter = 'all' | 'unread' | 'read';
type SortBy = 'date-desc' | 'date-asc' | 'name-asc';

const TABLE_COLUMNS = [
  { label: 'Status', className: 'w-24' },
  { label: 'Sender' },
  { label: 'Message Snippet' },
  { label: 'Date' },
  { label: 'Actions', className: 'text-right w-28 min-w-[112px]' },
];

export default function AdminFeedbackPage() {
  const { toast, confirm: confirmModal } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [selectedMessage, setSelectedMessage] = useState<FeedbackItem | null>(null);

  const {
    items: displayedFeedbacks,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    setCurrentPage,
    setPageSize,
    refresh,
  } = useServerPagination<FeedbackItem>({
    endpoint: API_ENDPOINTS.ADMIN.FEEDBACK,
    defaultPageSize: 10,
    search,
    filters: {
      sortBy: sortBy === 'name-asc' ? 'name' : 'createdAt',
      direction: sortBy === 'date-asc' || sortBy === 'name-asc' ? 'asc' : 'desc',
    },
    transformItem: (f: any) => ({
      id: Number(f.id),
      name: f.name || 'Anonymous',
      email: f.email || '',
      phone: f.phone || '',
      message: f.message || '',
      isRead: Boolean(f.isRead),
      createdAt: f.createdAt || new Date().toISOString(),
    }),
    fallbackItems: [],
  });

  const toggleRead = async (id: number) => {
    try {
      const item = displayedFeedbacks.find((f) => f.id === id);
      const nextStatus = !item?.isRead;
      await apiClient.patch(`${API_ENDPOINTS.ADMIN.FEEDBACK}/${id}/read?isRead=${nextStatus}`);
      refresh();
      toast.info(nextStatus ? 'Marked inquiry as read' : 'Marked inquiry as unread');
    } catch {
      toast.error('Failed to update inquiry status');
    }
  };

  const handleDelete = async (id: number) => {
    const item = displayedFeedbacks.find((f) => f.id === id);
    const confirmed = await confirmModal({
      title: 'Delete Inquiry',
      message: (
        <span>
          Are you sure you want to delete inquiry from{' '}
          <strong className="text-rose-600 font-bold">{item?.name || 'this sender'}</strong>?
        </span>
      ),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await apiClient.delete(`${API_ENDPOINTS.ADMIN.FEEDBACK}/${id}`);
        refresh();
        if (selectedMessage?.id === id) setSelectedMessage(null);
        toast.success('Inquiry deleted successfully');
      } catch {
        toast.error('Failed to delete inquiry');
      }
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('date-desc');
  };

  const isFiltered = search.trim() !== '' || statusFilter !== 'all' || sortBy !== 'date-desc';
  const unreadCount = displayedFeedbacks.filter((f) => !f.isRead).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <AdminPageHeader
        icon={MessageSquare}
        title="Customer Inquiries & Feedback"
        badge={`${totalElements} Inquiries Total`}
        description="Review user coupon reports, merchant listing applications, and partnership proposals."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`h-9 px-4 inline-flex items-center justify-center text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              statusFilter === 'all'
                ? 'bg-[#C62828] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Messages ({totalElements})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unread')}
            className={`h-9 px-4 inline-flex items-center justify-center text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 gap-1.5 ${
              statusFilter === 'unread'
                ? 'bg-[#C62828] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </AdminPageHeader>

      {/* Advanced Filter Bar */}
      <AdminFilterBar
        totalItems={totalElements}
        itemName="inquiries"
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
              placeholder="Search inquiries by sender, email, phone, or message text..."
              className={adminSearchInputClass}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className={adminSelectClass}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Sender (A → Z)</option>
            </select>
          </div>
        </div>
      </AdminFilterBar>

      {/* Inquiries Table */}
      <AdminTableShell
        columns={TABLE_COLUMNS}
        isEmpty={displayedFeedbacks.length === 0}
        emptyMessage="No customer inquiries found. Try adjusting your keyword query or clear active filters."
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
        {displayedFeedbacks.map((item) => (
          <FeedbackTableRow
            key={item.id}
            item={item}
            onToggleRead={toggleRead}
            onSelectMessage={(msg) => {
              setSelectedMessage(msg);
              if (!msg.isRead) toggleRead(msg.id);
            }}
            onDelete={handleDelete}
          />
        ))}
      </AdminTableShell>

      {/* Message Preview Modal */}
      <FeedbackDetailModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </div>
  );
}
