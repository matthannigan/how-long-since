import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { RootErrorBoundary } from './RootErrorBoundary';

function Boom(): never {
  throw new Error('boom');
}

describe('RootErrorBoundary', () => {
  it('renders the children when there is no error', () => {
    const { getByText } = render(
      <RootErrorBoundary>
        <p>all good</p>
      </RootErrorBoundary>,
    );
    expect(getByText('all good')).toBeInTheDocument();
  });

  it('renders the recovery UI when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { getByRole } = render(
      <RootErrorBoundary>
        <Boom />
      </RootErrorBoundary>,
    );
    expect(getByRole('alert')).toHaveTextContent('Something went wrong.');
    expect(getByRole('button', { name: 'Reload app' })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('recovery UI has no axe violations', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <RootErrorBoundary>
        <Boom />
      </RootErrorBoundary>,
    );
    expect(await axe(container)).toHaveNoViolations();
    spy.mockRestore();
  });
});
