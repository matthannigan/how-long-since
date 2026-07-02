import { Link } from '@tanstack/react-router';
import { Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import { AddTaskDialog } from '@/components/task/AddTaskDialog';

import { AddTaskFab } from './AddTaskFab';
import { BackupReminderBanner } from './BackupReminderBanner';
import { ViewToggle } from './ViewToggle';

interface AppShellProps {
  children?: ReactNode;
}

/**
 * The app's single-screen shell: warm-white page surface, a header (app title +
 * settings gear), the By Category / By Time view toggle, the scrollable content
 * region, and the Add-Task FAB. No bottom nav — see the decisions register in
 * dev/phase1.md.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-surface-page text-ink">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          {/* Clock/arc mark (same source as the PWA icon), decorative — the h1
              already names the app. Sized in rem so it scales with text-size;
              tokenized strokes adapt to dark mode + high-contrast. */}
          <svg viewBox="0 0 192 192" aria-hidden="true" className="size-9 shrink-0">
            <circle
              cx="96"
              cy="96"
              r="58"
              className="fill-none stroke-[var(--color-border-default)]"
              strokeWidth="12"
            />
            <path
              d="M96 96 L96 52"
              className="stroke-[var(--color-ink)]"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M96 96 L130 108"
              className="stroke-[var(--color-accent-deep)]"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="96" cy="96" r="9" className="fill-[var(--color-accent)]" />
          </svg>
          <h1 className="font-display text-[1.375rem] leading-none font-semibold text-ink">
            How Long Since
          </h1>
        </div>
        <Link
          to="/settings"
          aria-label="Settings"
          className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
          activeProps={{
            'aria-current': 'page',
            className:
              '[&>span]:bg-surface-card [&>span]:text-ink [&>span]:shadow-[0_2px_6px_rgba(70,62,55,0.1)]',
          }}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-surface-sunk text-ink-secondary">
            <Settings className="size-[18px]" aria-hidden="true" />
          </span>
        </Link>
      </header>

      <ViewToggle />

      <BackupReminderBanner />

      <main className="mx-auto max-w-2xl px-4 pt-4 pb-24">
        {children}
        <AddTaskFab />
        <AddTaskDialog />
      </main>
    </div>
  );
}
