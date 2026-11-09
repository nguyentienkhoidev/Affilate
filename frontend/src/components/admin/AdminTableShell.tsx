import type { ReactNode } from 'react';
import { useAdminI18n } from '@/context/AdminI18nContext';

interface Column {
  label: string;
  className?: string;
}

interface AdminTableShellProps {
  /** Column headers */
  columns: Column[];
  /** Table body rows */
  children: ReactNode;
  /** Message shown when there are no rows (after filter/search) */
  emptyMessage?: string;
  /** Number of rows — pass 0 to show the empty state */
  rowCount?: number;
  /** Boolean flag indicating if table is empty */
  isEmpty?: boolean;
  /** Optional footer content like pagination */
  footer?: ReactNode;
}

/**
 * Reusable table shell for all admin list pages.
 * Renders a rounded container with standard thead, empty state row, and optional footer.
 */
export default function AdminTableShell({
  columns,
  children,
  emptyMessage = 'No records match your current filters.',
  rowCount,
  isEmpty,
  footer,
}: AdminTableShellProps) {
  const { t } = useAdminI18n();
  const isTableEmpty = isEmpty !== undefined ? isEmpty : rowCount === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`py-3 px-4 ${col.className ?? ''}`}>
                  {t(col.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isTableEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-400"
                >
                  {t(emptyMessage)}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className="border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  );
}
