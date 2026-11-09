import { Edit2, Trash2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import AdminActionButton from '@/components/admin/AdminActionButton';
import { ROUTES } from '@/constants/routes';
import type { MenuItem } from '../_lib/data';

interface MenuTableRowProps {
  item: MenuItem;
  onDelete: (id: number) => void;
}

/**
 * Table row for an individual menu item in the admin navigation list.
 */
export default function MenuTableRow({ item, onDelete }: MenuTableRowProps) {
  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
          #{item.sortOrder}
        </span>
      </td>
      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
        {item.title}
      </td>
      <td className="py-3.5 px-4">
        {item.position === 'main' ? (
          <span className="inline-flex items-center text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full text-[10px]">
            Header Nav
          </span>
        ) : (
          <span className="inline-flex items-center text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
            Footer Sitemap
          </span>
        )}
      </td>
      <td className="py-3.5 px-4">
        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
          {item.targetType}
        </span>
      </td>
      <td className="py-3.5 px-4 font-mono text-indigo-600 font-semibold max-w-xs truncate">
        <span title={item.targetValue} className="inline-flex items-center gap-1">
          {item.targetValue}
          {item.targetValue.startsWith('http') && <ExternalLink size={11} className="text-slate-400" />}
        </span>
      </td>
      <td className="py-3.5 px-4">
        {item.isActive ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
            <CheckCircle2 size={12} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
            <XCircle size={12} /> Inactive
          </span>
        )}
      </td>
      <td className="py-3.5 px-4 text-right whitespace-nowrap w-28 min-w-[112px]">
        <div className="flex items-center justify-end gap-1.5">
          <AdminActionButton
            href={ROUTES.ADMIN.MENU_EDIT(item.id)}
            icon={Edit2}
            title="Edit Item"
            variant="default"
          />
          <AdminActionButton
            onClick={() => onDelete(item.id)}
            icon={Trash2}
            title="Delete Item"
            variant="danger"
          />
        </div>
      </td>
    </tr>
  );
}
