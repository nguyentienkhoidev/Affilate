'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, Save, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';

interface AdminFormPageProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  /** id of the <form> element so header/footer buttons can submit it */
  formId: string;
  submitLabel?: string;
  /** Extra controls rendered next to the Save button in the header */
  headerActions?: ReactNode;
  /** Narrow (balanced centered form), wide (2-column layout), or full width */
  width?: 'narrow' | 'wide' | 'full';
  children: ReactNode;
}

export default function AdminFormPage({
  title,
  description,
  backHref,
  backLabel = 'Back to list',
  formId,
  submitLabel = 'Save',
  headerActions,
  width = 'wide',
  children,
}: AdminFormPageProps) {
  const widthClass =
    width === 'narrow'
      ? 'max-w-4xl'
      : width === 'full'
      ? 'w-full max-w-none px-2 sm:px-4 lg:px-6'
      : 'max-w-6xl';

  return (
    <div className={`space-y-6 mx-auto ${widthClass} w-full`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-5 bg-white/50 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1.5">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#C62828] transition-colors"
          >
            <ArrowLeft size={14} /> {backLabel}
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {description && <p className="text-xs text-slate-500 max-w-2xl">{description}</p>}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {headerActions}
          <Link
            href={backHref}
            className="h-9 px-4 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center whitespace-nowrap shrink-0 shadow-2xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form={formId}
            className="h-9 px-5 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Save size={14} /> {submitLabel}
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

/** Card wrapper used to group fields on form pages */
export function FormSection({
  title,
  description,
  headerRight,
  children,
}: {
  title: string;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      data-admin-form-section="true"
      className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
        </div>
        {headerRight && <div className="shrink-0">{headerRight}</div>}
      </div>
      {children}
    </div>
  );
}

export function FormLoading() {
  return (
    <div className="flex items-center justify-center py-24 text-slate-400 text-xs gap-2">
      <Loader2 size={16} className="animate-spin" /> Loading record...
    </div>
  );
}

export function FormNotFound({ backHref, entity }: { backHref: string; entity: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-24 space-y-4">
      <SearchX size={40} className="mx-auto text-slate-300" />
      <h1 className="text-lg font-bold text-slate-900">{entity} not found</h1>
      <p className="text-xs text-slate-500">The record may have been deleted or the link is invalid.</p>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-xl"
      >
        <ArrowLeft size={14} /> Back to list
      </Link>
    </div>
  );
}

export const inputClass =
  'w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition';

export const labelClass = 'text-xs font-bold text-slate-700';
