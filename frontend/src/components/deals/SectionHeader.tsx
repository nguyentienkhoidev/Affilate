import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
}

export default function SectionHeader({
  badge,
  title,
  subtitle,
  viewAllLink,
  viewAllText = 'View All',
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4 mb-6">
      <div className="space-y-1">
        {badge && (
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full inline-block">
            {badge}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition flex items-center gap-1 shrink-0 self-start sm:self-end group"
        >
          <span>{viewAllText}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
