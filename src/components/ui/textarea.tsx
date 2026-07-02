import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Multi-line text field (description / notes) matching the Input surface
 * (style-guide §3.6), just taller and resizable vertically.
 */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-20 w-full rounded-input border-[1.5px] border-border-default bg-surface-card px-4 py-3 text-base text-ink shadow-[0_2px_8px_-6px_rgba(70,62,55,0.2)] transition-[color,box-shadow] outline-none placeholder:text-ink-secondary focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
