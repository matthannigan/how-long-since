import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Text input styled to the Soft Daylight form spec (style-guide §3.6): warm-white
 * card surface, 1.5px greige border, 14px radius, terracotta focus ring. ≥44px
 * tall for touch. Consumes tokens, not hex.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex min-h-11 w-full min-w-0 rounded-input border-[1.5px] border-border-default bg-surface-card px-4 py-3 text-base font-medium text-ink shadow-[0_2px_8px_-6px_rgba(70,62,55,0.2)] transition-[color,box-shadow] outline-none placeholder:font-normal placeholder:text-ink-secondary focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
