import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'indigo';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-900 text-white',
    secondary: 'bg-zinc-100 text-zinc-800 border border-zinc-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    destructive: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    outline: 'border border-zinc-300 text-zinc-700',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
