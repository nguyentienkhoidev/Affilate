import Link from 'next/link';
import { Globe, Edit2, Trash2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import AdminActionButton from '@/components/admin/AdminActionButton';
import { ROUTES } from '@/constants/routes';
import type { StaticPageData } from '../_lib/data';

interface StaticPageTableRowProps {
  page: StaticPageData;
  onDelete: (id: number) => void;
}

/**
 * Table row representing a single static/legal page in the admin table.
 */
export default function StaticPageTableRow({ page: p, onDelete }: StaticPageTableRowProps) {
  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
          #{p.sortOrder}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <span className="font-bold text-slate-900 text-sm block">
          {p.title}
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          ID: #{p.id}
        </span>
      </td>
      <td className="py-3.5 px-4 font-mono text-indigo-600 font-semibold">
        <Link
          href={`/${p.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 hover:underline text-indigo-600 font-medium"
        >
          <span>/{p.slug}</span>
          <ExternalLink size={11} className="text-slate-400" />
        </Link>
      </td>
      <td className="py-3.5 px-4 text-slate-500 text-xs">
        {p.updatedAt}
      </td>
      <td className="py-3.5 px-4">
        {p.isActive ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
            <CheckCircle2 size={12} /> Published
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
            <XCircle size={12} /> Draft
          </span>
        )}
      </td>
      <td className="py-3.5 px-4 text-right whitespace-nowrap w-36 min-w-[144px]">
        <div className="flex items-center justify-end gap-1.5">
          <AdminActionButton
            href={`/${p.slug}`}
            icon={Globe}
            title="View Live Page"
            variant="default"
          />
          <AdminActionButton
            href={ROUTES.ADMIN.PAGE_EDIT(p.id)}
            icon={Edit2}
            title="Edit Page"
            variant="default"
          />
          <AdminActionButton
            onClick={() => onDelete(p.id)}
            icon={Trash2}
            title="Delete Page"
            variant="danger"
          />
        </div>
      </td>
    </tr>
  );
}
