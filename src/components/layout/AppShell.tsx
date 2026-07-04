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
            <path
              d="M-40.06 68.01 A103.59 103.59 0 1 1 104.84 207.36"
              className="fill-none stroke-[var(--color-border-default)]"
              strokeWidth="14.27"
            />
            <path
              d="M49.96 119.81 L49.96 42.12 A77.69 77.69 0 0 1 97.81 180.97 Z"
              className="fill-[var(--color-overdue-tint)]"
            />
            <path
              d="M49.96 119.81 L49.96 48.28"
              className="fill-none stroke-[var(--color-ink)]"
              strokeWidth="12.07"
              strokeLinecap="round"
            />
            <path
              d="M49.96 119.81 L94.35 176.53"
              className="fill-none stroke-[var(--color-accent-deep)]"
              strokeWidth="12.07"
              strokeLinecap="round"
            />
            <path
              d="M81.2 94.55 C81.2 84.26 88.06 78.56 94.92 78.56 C102.35 78.56 107.5 83.7 107.5 91.12 C107.5 97.4 102.93 100.84 98.35 104.26 C94.92 106.78 93.44 109.99 93.44 113.99"
              className="fill-none stroke-[var(--color-ink)]"
              strokeWidth="9.16"
              strokeLinecap="round"
            />
            <circle cx="93.21" cy="128.27" r="6.29" className="fill-[var(--color-ink)]" />
            <circle cx="49.96" cy="119.81" r="12.33" className="fill-[var(--color-accent)]" />
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
