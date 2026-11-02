import React from 'react';
import { cn } from '../../lib/utils.js';

export const Badge = ({ className, variant = 'default', ...props }) => {
  const baseStyles =
    'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none';

  const variants = {
    default:
      'border border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900',
    secondary:
      'border border-transparent bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    outline:
      'border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300',
    // Indicators (retaining semantic colors)
    high:
      'border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    medium:
      'border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    low:
      'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props} />
  );
};
