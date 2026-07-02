import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { renderWithRouter } from '@/test/router';

import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders the app title and a settings link', async () => {
    const { findByRole } = renderWithRouter(<AppShell>content</AppShell>);
    expect(await findByRole('heading', { level: 1, name: 'How Long Since' })).toBeInTheDocument();
    expect(await findByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container, findByRole } = renderWithRouter(<AppShell>content</AppShell>);
    await findByRole('heading', { level: 1 });
    expect(await axe(container)).toHaveNoViolations();
  });
});
