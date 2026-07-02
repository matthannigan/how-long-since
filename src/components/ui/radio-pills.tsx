'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A single-select group rendered as pills / segments rather than dotted radios
 * (task form: time estimate, frequency unit, last-done, category chips). Built
 * on Radix `RadioGroup` so it keeps real radio semantics for free — roving
 * tabindex, arrow-key navigation, single selection, focus management. Each
 * `RadioPill` exposes `data-[state=checked]` so callers style the selected
 * state with utilities (white segment, terracotta pill, tinted chip, …).
 */
function RadioPills({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-pills"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    />
  );
}

function RadioPill({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-pill"
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { RadioPill, RadioPills };
