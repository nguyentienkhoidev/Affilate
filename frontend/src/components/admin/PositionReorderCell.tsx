'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { apiClient } from '@/lib/api/axios-client';

interface PositionReorderCellProps {
  sortOrder?: number;
  index: number;
  total: number;
  canReorder?: boolean;
  disabled?: boolean;
  onMove: (delta: -1 | 1) => void;
}

/**
 * Shared table cell showing a record's explicit display position (#1, #2, ... or Auto)
 * with Up / Down buttons to swap positions immediately.
 */
export default function PositionReorderCell({
  sortOrder,
  index,
  total,
  canReorder = true,
  disabled = false,
  onMove,
}: PositionReorderCellProps) {
  const isPinned = typeof sortOrder === 'number' && sortOrder > 0 && sortOrder < 9999;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center min-w-[38px] px-2 py-0.5 rounded-md text-[11px] font-bold ${
          isPinned
            ? 'bg-red-50 text-[#C62828] border border-red-200'
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}
        title={isPinned ? `Pinned at position #${sortOrder}` : 'Auto (default order 9999)'}
      >
        {isPinned ? `#${sortOrder}` : 'Auto'}
      </span>

      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={disabled || !canReorder || index <= 0}
          title={canReorder ? 'Move up' : 'Sort by Display Order to reorder'}
          className="p-1 text-slate-500 hover:text-[#C62828] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
        >
          <ArrowUp size={12} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={disabled || !canReorder || index >= total - 1}
          title={canReorder ? 'Move down' : 'Sort by Display Order to reorder'}
          className="p-1 text-slate-500 hover:text-[#C62828] hover:bg-slate-50 border-l border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
        >
          <ArrowDown size={12} />
        </button>
      </div>
    </div>
  );
}

/**
 * Swaps an item with its neighbor in the current list and persists the full ordered ID list.
 */
export async function reorderListItems<T extends { id: number | string }>(
  items: T[],
  index: number,
  delta: -1 | 1,
  endpoint: string
): Promise<T[] | null> {
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= items.length) {
    return null;
  }
  const reordered = [...items];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, moved);

  await apiClient.patch(endpoint, {
    orderedIds: reordered.map((item) => Number(item.id)),
  });
  return reordered;
}
