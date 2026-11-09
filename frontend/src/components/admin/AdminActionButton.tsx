import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { useAdminI18n } from '@/context/AdminI18nContext';

type ButtonVariant =
  | 'default'   // slate border, hover blue
  | 'danger'    // slate border, hover rose
  | 'success'   // slate border, hover emerald
  | 'indigo'    // slate border, hover indigo
  | 'primary';  // red background (primary CTA)

interface AdminActionButtonProps {
  /** Icon to render inside the button */
  icon: LucideIcon;
  /** Tooltip title */
  title: string;
  /** Color variant */
  variant?: ButtonVariant;
  /** If provided, renders as <Link> instead of <button> */
  href?: string;
  /** Opens link in new tab */
  target?: '_blank' | '_self';
  /** Click handler (used when href is not provided) */
  onClick?: () => void;
  /** Disables the button and shows not-allowed cursor */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300',
  danger:
    'border-slate-200 bg-white text-slate-400 hover:bg-rose-50/80 hover:text-rose-600 hover:border-rose-300',
  success:
    'border-slate-200 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300',
  indigo:
    'border-slate-200 bg-white text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600 hover:border-indigo-300',
  primary:
    'border-[#C62828]/40 bg-white hover:bg-rose-50/60 text-slate-600 hover:text-[#C62828]',
};

const BASE_CLASS =
  'w-8 h-8 inline-flex items-center justify-center rounded-lg border transition shrink-0 shadow-2xs';

/**
 * Standardised 32×32 icon action button used in every admin table row.
 * Renders as either a Next.js Link (when href is given) or a <button>.
 */
export default function AdminActionButton({
  icon: Icon,
  title,
  variant = 'default',
  href,
  target,
  onClick,
  disabled = false,
  className = '',
}: AdminActionButtonProps) {
  const { t } = useAdminI18n();
  const translatedTitle = title ? t(title) : '';

  const colorClass = disabled
    ? 'border-slate-100 bg-slate-50 text-slate-300 opacity-40 cursor-not-allowed'
    : `${variantStyles[variant]} cursor-pointer`;

  const combinedClass = `${BASE_CLASS} ${colorClass} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} target={target} className={combinedClass} title={translatedTitle}>
        <Icon size={13} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={translatedTitle}
      className={combinedClass}
    >
      <Icon size={13} />
    </button>
  );
}
