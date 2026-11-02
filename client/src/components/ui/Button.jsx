import React from 'react';
import { cn } from '../../lib/utils.js';

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      default:
        'bg-zinc-900 text-zinc-50 shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200',
      outline:
        'border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50',
      secondary:
        'bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700/80',
      ghost:
        'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50',
      destructive:
        'bg-rose-600 text-white shadow-sm hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700',
    };

    const sizes = {
      default: 'h-8 px-3.5 py-1.5',
      sm: 'h-7 px-2.5 text-[11px]',
      lg: 'h-9 px-4 text-sm',
      icon: 'h-7 w-7 p-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
