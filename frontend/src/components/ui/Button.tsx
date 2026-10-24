import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer whitespace-nowrap shrink-0';

    const variants = {
      default: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300',
      outline: 'border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 shadow-xs',
      ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
      link: 'text-indigo-600 underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      xs: 'text-xs h-7 px-2.5 rounded-md gap-1.5',
      sm: 'text-xs h-8 px-3 rounded-lg gap-2',
      default: 'text-xs sm:text-sm h-9 px-4 rounded-lg gap-2',
      lg: 'text-sm sm:text-base h-11 px-5 rounded-xl gap-2.5 font-semibold',
      icon: 'h-8 w-8 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
