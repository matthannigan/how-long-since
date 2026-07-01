import { createRootRoute, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { AppShell } from '@/components/layout/AppShell';

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
    <AppShell>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </AppShell>
  );
}
