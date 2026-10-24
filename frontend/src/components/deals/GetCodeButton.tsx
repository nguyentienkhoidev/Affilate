'use client';

import { Scissors, Sparkles, ExternalLink } from 'lucide-react';

interface GetCodeButtonProps {
  code?: string;
  isCode?: boolean;
  onOpenModal?: () => void;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function GetCodeButton({
  code,
  isCode = true,
  onOpenModal,
  onClick,
  className = '',
  size = 'md',
  fullWidth = false,
}: GetCodeButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
    if (onOpenModal) onOpenModal();
  };

  // If it's not a coupon code (Direct Deal / Activate Deal)
  if (!isCode || !code) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`group font-black tracking-wide text-white rounded-xl shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 hover:shadow-sm active:scale-95 ${
          size === 'sm' ? 'py-2 px-3 text-xs' : size === 'lg' ? 'py-3 px-5 text-sm' : 'py-2.5 px-4 text-xs'
        } ${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`}
      >
        <Sparkles size={14} className="text-emerald-200" />
        <span>Activate Deal</span>
        <ExternalLink size={13} className="text-white/80 group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  // Get Code button: Compact, 1 single color (#c62828), same size as Activate Deal, opens popup
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group font-black tracking-wide text-white rounded-xl shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 bg-[#c62828] hover:bg-[#b71c1c] hover:shadow-sm active:scale-95 ${
        size === 'sm' ? 'py-2 px-3 text-xs' : size === 'lg' ? 'py-3 px-5 text-sm' : 'py-2.5 px-4 text-xs'
      } ${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`}
    >
      <Scissors size={14} className="text-red-100 group-hover:rotate-12 transition-transform duration-200" />
      <span>Get Code</span>
      <ExternalLink size={13} className="text-white/80 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}
