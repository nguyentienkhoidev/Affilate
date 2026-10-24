import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-zinc-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs sm:text-sm text-zinc-900 shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-9',
              error && 'border-rose-500 focus-visible:ring-rose-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
