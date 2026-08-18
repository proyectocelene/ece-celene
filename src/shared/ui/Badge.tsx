import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-700 border-slate-200',
      primary: 'bg-blue-50 text-blue-700 border-blue-200',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      danger: 'bg-rose-50 text-rose-700 border-rose-200',
      info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };

    const sizes = {
      sm: 'text-[11px] px-2 py-0.5 font-medium',
      md: 'text-xs px-2.5 py-1 font-semibold',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border transition-colors',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
