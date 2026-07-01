import type { ReactNode } from 'react';

interface AppShellProps {
  children?: ReactNode;
}

/**
 * The app's single-screen shell: warm-white page surface with the app title.
 * Real navigation (the view toggle, settings gear, Add-Task FAB) arrives in
 * Step 4+. No bottom nav — see the decisions register in dev/phase1.md.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-surface-page text-ink">
      <header className="mx-auto flex max-w-2xl items-center px-4 py-4">
        <h1 className="font-display text-[22px] leading-none font-semibold text-ink">
          How Long Since
        </h1>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-24">{children}</main>
    </div>
  );
}
