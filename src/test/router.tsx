import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

/**
 * Render a component that uses TanStack `Link` (which throws outside a router)
 * inside a minimal in-memory router. The component under test renders in the
 * root route, and the four app paths are registered as no-op routes so `Link`
 * href-building and active-state matching resolve at runtime.
 */
export function renderWithRouter(
  ui: ReactNode,
  { initialPath = '/' }: { initialPath?: string } = {},
) {
  const rootRoute = createRootRoute({ component: () => <>{ui}</> });
  const children = ['/', '/time', '/settings', '/categories', '/tasks/$taskId'].map((path) =>
    createRoute({ getParentRoute: () => rootRoute, path, component: () => null }),
  );
  const router = createRouter({
    routeTree: rootRoute.addChildren(children),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  return { router, ...render(<RouterProvider router={router} />) };
}
