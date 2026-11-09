import { CheckCircle2, Eye, Trash2 } from 'lucide-react';
import AdminActionButton from '@/components/admin/AdminActionButton';
import type { FeedbackItem } from '../_lib/data';

interface FeedbackTableRowProps {
  item: FeedbackItem;
  onToggleRead: (id: number) => void;
  onSelectMessage: (item: FeedbackItem) => void;
  onDelete: (id: number) => void;
}

/**
 * Table row representing a customer inquiry / feedback in the admin list.
 */
export default function FeedbackTableRow({
  item,
  onToggleRead,
  onSelectMessage,
  onDelete,
}: FeedbackTableRowProps) {
  return (
    <tr
      className={`hover:bg-slate-50/60 transition-colors ${
        !item.isRead ? 'bg-indigo-50/25 font-semibold' : ''
      }`}
    >
      <td className="py-3.5 px-4">
        <button
          type="button"
          onClick={() => onToggleRead(item.id)}
          className="cursor-pointer"
          title={item.isRead ? 'Click to mark as Unread' : 'Click to mark as Read'}
        >
          {item.isRead ? (
            <span className="inline-flex items-center gap-1 text-slate-400 text-[10px]">
              <CheckCircle2 size={13} className="text-slate-400" /> Read
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#C62828] font-bold text-[10px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C62828] animate-pulse" /> New
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
          onClick={() => onSelectMessage(item)}
          className="text-xs text-slate-700 truncate cursor-pointer hover:text-[#C62828]"
        >
          {item.message}
        </p>
      </td>
      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-xs">
        {item.createdAt}
      </td>
      <td className="py-3.5 px-4 text-right whitespace-nowrap w-28 min-w-[112px]">
        <div className="flex items-center justify-end gap-1.5">
          <AdminActionButton
            onClick={() => onSelectMessage(item)}
            icon={Eye}
            title="Read Message"
            variant="default"
          />
          <AdminActionButton
            onClick={() => onDelete(item.id)}
            icon={Trash2}
            title="Delete Inquiry"
            variant="danger"
          />
        </div>
      </td>
    </tr>
  );
}
