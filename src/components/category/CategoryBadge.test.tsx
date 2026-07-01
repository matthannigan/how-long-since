import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { DEFAULT_CATEGORIES } from '@/lib/db/schema';

import { CategoryBadge } from './CategoryBadge';

const KITCHEN = DEFAULT_CATEGORIES[0];

describe('CategoryBadge', () => {
  it('renders the category name and count', () => {
    const { getByRole, getByText } = render(<CategoryBadge category={KITCHEN} count={3} />);
    expect(getByRole('heading', { name: 'Kitchen', level: 3 })).toBeInTheDocument();
    expect(getByText('3')).toBeInTheDocument();
  });

  it('tints the dot with the category color', () => {
    const { container } = render(<CategoryBadge category={KITCHEN} count={1} />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toHaveStyle({ backgroundColor: KITCHEN.color });
  });

  it('has no axe violations', async () => {
    const { container } = render(<CategoryBadge category={KITCHEN} count={2} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
