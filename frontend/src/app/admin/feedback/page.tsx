'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { useAdminCollection } from '@/lib/admin/useAdminCollection';
import Pagination from '@/components/admin/Pagination';
import {
  FEEDBACK_STORE_KEY,
  DEFAULT_FEEDBACKS,
  type FeedbackItem,
} from './_lib/data';

export default function AdminFeedbackPage() {
  const { items: feedbacks, setItems, remove } = useAdminCollection<FeedbackItem>(
    FEEDBACK_STORE_KEY,
    DEFAULT_FEEDBACKS
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState<FeedbackItem | null>(null);

  const toggleRead = (id: number) => {
    setItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isRead: !f.isRead } : f))
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this inquiry?')) {
      remove(id);
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all' || sortBy !== 'date-desc';

  // Filter & Search
  const filtered = feedbacks.filter((f) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchEmail = f.email.toLowerCase().includes(q);
      const matchPhone = f.phone.toLowerCase().includes(q);
      const matchMsg = f.message.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchMsg) return false;
    }

    if (statusFilter === 'unread' && f.isRead) return false;
    if (statusFilter === 'read' && !f.isRead) return false;

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'date-asc') return a.id - b.id;
    return b.id - a.id;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const unreadCount = feedbacks.filter((f) => !f.isRead).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-indigo-600" size={26} /> Customer Inquiries & Feedback
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review user coupon reports, merchant listing applications, and partnership proposals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className={`h-9 px-4 inline-flex items-center justify-center text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Messages ({feedbacks.length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('unread');
              setCurrentPage(1);
            }}
            className={`h-9 px-4 inline-flex items-center justify-center text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 gap-1.5 ${
              statusFilter === 'unread'
                ? 'bg-indigo-600 text-white shadow-xs'
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
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search inquiries by sender, email, phone, or message text..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Sender (A → Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Message Snippet</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right w-28 min-w-[112px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <MessageSquare className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="font-semibold text-slate-600">No customer inquiries found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting your keyword query or clear active filters.
                    </p>
                  </td>
                </tr>
              ) : (
                pagedItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      !item.isRead ? 'bg-indigo-50/25 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleRead(item.id)}
                        className="cursor-pointer"
                        title={item.isRead ? 'Click to mark as Unread' : 'Click to mark as Read'}
                      >
                        {item.isRead ? (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-[10px]">
                            <CheckCircle2 size={13} className="text-slate-400" /> Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-indigo-700 font-bold text-[10px] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" /> New
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block text-xs">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p
                        onClick={() => {
                          setSelectedMessage(item);
                          if (!item.isRead) toggleRead(item.id);
                        }}
                        className="text-xs text-slate-700 truncate cursor-pointer hover:text-indigo-600"
                      >
                        {item.message}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {item.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap w-28 min-w-[112px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedMessage(item);
                            if (!item.isRead) toggleRead(item.id);
                          }}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Read Message"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shrink-0 shadow-2xs cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Customizable Pagination */}
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Message Preview Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedMessage.name}</h2>
                <p className="text-xs text-slate-500">{selectedMessage.email}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {selectedMessage.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={14} className="text-indigo-600" /> {selectedMessage.phone}
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap text-sm">
                {selectedMessage.message}
              </div>

              <p className="text-[11px] text-slate-400 text-right">
                Received: {selectedMessage.createdAt}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`mailto:${selectedMessage.email}?subject=Regarding your Bargorya inquiry`}
                className="h-9 px-4 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs whitespace-nowrap shrink-0"
              >
                <Mail size={14} /> Reply via Email
              </a>

              <button
                onClick={() => setSelectedMessage(null)}
                className="h-9 px-4 inline-flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
