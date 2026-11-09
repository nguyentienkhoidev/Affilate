import type { ReactNode } from 'react';
import { useAdminI18n, translateItemNameToVi } from '@/context/AdminI18nContext';

interface AdminFilterBarProps {
  /** The filter inputs / selects / pills to render inside the box */
  children: ReactNode;
  /** Total result count after filtering */
  totalItems: number;
  /** Label for the item type, e.g. "stores", "articles" */
  itemName?: string;
  /** Whether any non-default filters are active (controls reset button) */
  isFiltered: boolean;
  /** Called when user clicks "Clear all filters" */
  onReset: () => void;
}

/**
 * Wrapper card for all admin filter toolbars.
 * Renders the filter inputs passed as children, then a bottom bar with
 * a result count and an optional "Clear all filters" reset button.
 */
export default function AdminFilterBar({
  children,
  totalItems,
  itemName = 'results',
  isFiltered,
  onReset,
}: AdminFilterBarProps) {
  const { locale, t } = useAdminI18n();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
      {children}

      {/* Bottom summary row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span className="text-[11px] text-slate-500 font-medium">
          {locale === 'vi' ? (
            <>
              Tìm thấy <strong className="text-slate-900">{totalItems}</strong>{' '}
              {translateItemNameToVi(itemName)} phù hợp
            </>
          ) : (
            <>
              Found <strong className="text-slate-900">{totalItems}</strong> matching {itemName}
            </>
          )}
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-bold text-[#C62828] hover:underline cursor-pointer"
          >
            {t('Clear all filters')}
          </button>
        )}
      </div>
    </div>
  );
}
