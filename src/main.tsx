import './styles/globals.css';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { seedSampleTasks } from './lib/db/dev-seed';
import { seedDatabase } from './lib/db/schema';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

// Seed the default categories + settings singleton once at boot (idempotent,
// create-if-absent) so the theme provider and remember-view redirect have the
// settings row to read. In dev, follow with a handful of sample tasks so the
// views aren't empty before the Add-Task form exists (guarded to DEV, never
// shipped). Render regardless of the seed outcome — a seed failure surfaces
// through the app's normal error paths rather than a blank page.
seedDatabase()
  .then(() => (import.meta.env.DEV ? seedSampleTasks() : undefined))
  .catch((error) => {
    console.error('Database seeding failed:', error);
  })
  .finally(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  });
