import { Plus, X } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const LABEL_MAX = 40;

interface InstanceLabelsFieldProps {
  /** Committed chips, in entry order. Fully controlled by the parent. */
  labels: string[];
  onChange: (labels: string[]) => void;
  /** Category-scoped suggestions, already filtered/capped by the caller. */
  suggestions: string[];
  inputId: string;
}

/**
 * The "Track in multiple places" chip input (Phase 1.1). Enter or comma
 * commits the draft as a chip (a pending draft is also committed on blur so a
 * typed label isn't silently lost when the user goes straight to Save);
 * duplicates are rejected case-insensitively. Tapping a suggestion appends it.
 * One task is created per chip at submit time — the fan-out itself lives in
 * the form.
 */
export function InstanceLabelsField({
  labels,
  onChange,
  suggestions,
  inputId,
}: InstanceLabelsFieldProps) {
  const [draft, setDraft] = useState('');

  function commit(raw: string) {
    const label = raw.trim();
    if (label) {
      const exists = labels.some((l) => l.toLowerCase() === label.toLowerCase());
      if (!exists) onChange([...labels, label]);
    }
    setDraft('');
  }

  return (
    <div>
      <Label
        htmlFor={inputId}
        className="text-[0.6875rem] font-bold tracking-[0.05em] text-ink-secondary uppercase"
      >
        Where — or who?
      </Label>
      <p className="mt-0.5 text-xs text-ink-meta-aa">
        Add each place or pet — one task is created for each.
      </p>

      <div className="mt-1.5">
        <Input
          id={inputId}
          value={draft}
          maxLength={LABEL_MAX}
          placeholder="e.g. Guest room, Luna"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault(); // never submit the enclosing form
              commit(draft);
            }
          }}
        />
        <div className="mt-1 flex justify-end">
          <span
            className={cn(
              'text-[0.6875rem]',
              draft.length >= LABEL_MAX ? 'text-overdue-aa' : 'text-ink-meta-aa',
            )}
          >
            {draft.length}/{LABEL_MAX}
          </span>
        </div>
      </div>

      {labels.length > 0 && (
        <ul className="mt-1 flex flex-wrap items-center gap-2">
          {labels.map((label) => (
            <li
              key={label.toLowerCase()}
              className="flex min-h-11 items-center gap-1 rounded-chip bg-surface-sunk pr-1 pl-3 text-[0.8125rem] font-semibold text-ink"
            >
              {label}
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={() => onChange(labels.filter((l) => l !== label))}
                className="flex size-9 items-center justify-center rounded-full text-ink-meta-aa outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div
          role="group"
          aria-label="Suggestions"
          className="mt-2 flex flex-wrap items-center gap-2"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.toLowerCase()}
              type="button"
              onClick={() => commit(suggestion)}
              className="inline-flex min-h-11 items-center gap-1 rounded-chip border-[1.5px] border-dashed border-border-soft px-3 text-[0.8125rem] font-semibold text-ink-secondary outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
