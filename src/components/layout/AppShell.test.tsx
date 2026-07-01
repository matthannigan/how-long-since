import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders the app title', () => {
    const { getByRole } = render(<AppShell>content</AppShell>);
    expect(getByRole('heading', { level: 1, name: 'How Long Since' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<AppShell>content</AppShell>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
