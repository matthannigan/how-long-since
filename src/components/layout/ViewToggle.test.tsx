import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { renderWithRouter } from '@/test/router';

import { ViewToggle } from './ViewToggle';

describe('ViewToggle', () => {
  it('marks Quick Wins active with aria-current at /', async () => {
    const { findByRole, getByRole } = renderWithRouter(<ViewToggle />, { initialPath: '/' });
    expect(await findByRole('link', { name: 'Quick Wins', current: 'page' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'By Category' })).not.toHaveAttribute('aria-current');
    expect(getByRole('link', { name: 'By Time' })).not.toHaveAttribute('aria-current');
  });

  it('marks By Category active at /category', async () => {
    const { findByRole, getByRole } = renderWithRouter(<ViewToggle />, {
      initialPath: '/category',
    });
    expect(await findByRole('link', { name: 'By Category', current: 'page' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Quick Wins' })).not.toHaveAttribute('aria-current');
  });

  it('marks By Time active at /time', async () => {
    const { findByRole } = renderWithRouter(<ViewToggle />, { initialPath: '/time' });
    expect(await findByRole('link', { name: 'By Time', current: 'page' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container, findByRole } = renderWithRouter(<ViewToggle />);
    await findByRole('link', { name: 'Quick Wins' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
