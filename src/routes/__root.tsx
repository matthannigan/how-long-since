import { createRootRoute, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { PreferencesProvider, ThemedToaster } from '@/components/layout/PreferencesProvider';
import { RootErrorBoundary } from '@/components/layout/RootErrorBoundary';

// Router devtools are dev-only and code-split out of the production bundle.
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null;

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <PreferencesProvider>
      <RootErrorBoundary>
        <AppShell>
          <Outlet />
        </AppShell>
      </RootErrorBoundary>
      {/* Toast host lives outside the boundary so toasts survive a boundary trip. */}
      <ThemedToaster />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </PreferencesProvider>
  );
}
