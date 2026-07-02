import { fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_SETTINGS } from '@/lib/db/schema';
import { renderWithRouter } from '@/test/router';

import { SettingsView } from './SettingsView';

describe('SettingsView', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.settings.add({ ...DEFAULT_SETTINGS });
    localStorage.clear();
  });

  it('renders the Appearance controls reflecting current settings', async () => {
    // Wrapped in a router because the Manage Categories link uses TanStack Link.
    const { findByRole } = renderWithRouter(
      <main>
        <SettingsView />
      </main>,
    );
    // Default theme is 'system'.
    expect(await findByRole('radio', { name: 'System' })).toBeChecked();
    expect(await findByRole('switch', { name: 'High contrast' })).not.toBeChecked();
  });

  it('persists a theme change to the settings singleton', async () => {
    const { findByRole } = renderWithRouter(
      <main>
        <SettingsView />
      </main>,
    );
    fireEvent.click(await findByRole('radio', { name: 'Dark' }));
    await waitFor(async () => {
      expect((await db.settings.get('1'))?.theme).toBe('dark');
    });
  });

  it('has no axe violations', async () => {
    const { container, findByRole } = renderWithRouter(
      <main>
        <SettingsView />
      </main>,
    );
    await findByRole('radio', { name: 'System' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
