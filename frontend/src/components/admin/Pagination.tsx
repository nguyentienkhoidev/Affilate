'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  showPageSizeSelector?: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  totalPages: propTotalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemName = 'items',
  showPageSizeSelector = true,
}: PaginationProps) {
  const totalPages = propTotalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const pages: (number | string)[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (safePage > 3) pages.push('...');

    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (safePage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 px-4 py-3 border-t border-slate-100 bg-white">
      {/* Left: Summary & Page Size Customizer */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          {totalItems === 0 ? (
            <span>No {itemName} found</span>
          ) : (
            <span>
              Showing <strong className="text-slate-900 font-semibold">{startItem}</strong> to{' '}
              <strong className="text-slate-900 font-semibold">{endItem}</strong> of{' '}
              <strong className="text-slate-900 font-semibold">{totalItems}</strong> {itemName}
            </span>
          )}
        </div>

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-slate-200">
            <span className="text-[11px] text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                onPageChange(1);
              }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#C62828] cursor-pointer transition"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      {totalPages > 1 ? (
        <div className="flex items-center gap-1 select-none">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={safePage <= 1}
            className="w-7 h-7 inline-flex items-center justify-center shrink-0 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="w-7 h-7 inline-flex items-center justify-center shrink-0 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-1.5 py-1 text-slate-400 text-xs">
                    ...
                  </span>
                );
              }
              const isCurrent = p === safePage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p as number)}
                  className={`min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-[#C62828] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            className="w-7 h-7 inline-flex items-center justify-center shrink-0 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={safePage >= totalPages}
            className="w-7 h-7 inline-flex items-center justify-center shrink-0 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      ) : (
        <span className="text-[11px] font-mono text-slate-400">Page 1 of 1</span>
      )}
    </div>
  );
}
