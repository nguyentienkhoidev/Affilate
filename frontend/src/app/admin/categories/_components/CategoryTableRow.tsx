import Link from 'next/link';
import {
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import AdminActionButton from '@/components/admin/AdminActionButton';
import { ROUTES } from '@/constants/routes';
import { useAdminI18n } from '@/context/AdminI18nContext';
import type { CategoryData } from '../_lib/data';
import type { AdminArticle } from '../../posts/_lib/data';

interface CategoryTableRowProps {
  category: CategoryData;
  allArticles?: AdminArticle[];
  onOpenArticlesModal: (category: CategoryData) => void;
  onDelete: (id: number) => void;
}

/**
 * Table row for an individual editorial category in the admin list.
 */
export default function CategoryTableRow({
  category: cat,
  onOpenArticlesModal,
  onDelete,
}: CategoryTableRowProps) {
  const { t } = useAdminI18n();
  const liveCount = cat.articlesCount ?? 0;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="py-3 px-4 text-center font-mono font-bold text-slate-400 whitespace-nowrap">
        {cat.sortOrder}
      </td>
      <td className="py-3 px-4 min-w-[200px]">
        <span className="font-bold text-slate-900 text-sm block group-hover:text-[#C62828] transition-colors">
          {cat.name}
        </span>
        <span className="text-[11px] text-slate-500 line-clamp-1">
          {cat.description}
        </span>
      </td>
      <td className="py-3 px-4 font-mono text-[#C62828] font-semibold whitespace-nowrap">
        <Link
          href={`/category/${cat.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 hover:underline"
        >
          <span>/category/{cat.slug}</span>
          <ExternalLink size={11} />
        </Link>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onOpenArticlesModal(cat)}
          className="w-36 h-8 inline-flex items-center justify-between bg-slate-100 hover:bg-[#C62828] hover:text-white text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer group shadow-2xs whitespace-nowrap border border-slate-200/80 shrink-0"
          title={t('Click to view all articles in this category')}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <BookOpen size={13} className="text-[#C62828] group-hover:text-white transition-colors shrink-0" />
            <span className="font-bold text-xs">{liveCount}</span>
            <span className="text-slate-500 group-hover:text-white/90 text-xs font-medium">stories</span>
          </div>
          <span className="text-[10px] font-semibold bg-white group-hover:bg-white/20 text-slate-600 group-hover:text-white px-1.5 py-0.5 rounded-md border border-slate-200/60 group-hover:border-transparent transition-colors shrink-0">
            {t('View')}
          </span>
        </button>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        {cat.isActive ? (
          <span className="w-20 inline-flex items-center justify-center gap-1 text-emerald-700 font-bold bg-emerald-50 py-1 rounded-full border border-emerald-200 text-[10px] whitespace-nowrap">
            <CheckCircle2 size={12} /> {t('Active')}
          </span>
        ) : (
          <span className="w-20 inline-flex items-center justify-center gap-1 text-slate-500 font-bold bg-slate-100 py-1 rounded-full text-[10px] whitespace-nowrap">
            <XCircle size={12} /> {t('Inactive')}
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-right whitespace-nowrap w-32 min-w-[128px]">
        <div className="flex items-center justify-end gap-1.5">
          <AdminActionButton
            onClick={() => onOpenArticlesModal(cat)}
            icon={Eye}
            title="View articles in this category"
            variant="default"
          />
          <AdminActionButton
            href={ROUTES.ADMIN.CATEGORY_EDIT(cat.id)}
            icon={Edit2}
            title="Edit Category"
            variant="default"
          />
          <AdminActionButton
            onClick={() => onDelete(cat.id)}
            icon={Trash2}
            title="Delete Category"
            variant="danger"
          />
        </div>
      </td>
    </tr>
  );
}
