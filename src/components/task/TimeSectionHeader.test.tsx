import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { TIME_SECTIONS } from '@/lib/time-sections';

import { TimeSectionHeader } from './TimeSectionHeader';

const QUICK = TIME_SECTIONS[0]; // Quick tasks · 15 min
const NO_TIME = TIME_SECTIONS[5]; // No time set

describe('TimeSectionHeader', () => {
  it('renders the title as an h3 with the short label and count', () => {
    const { getByRole, getByText } = render(<TimeSectionHeader section={QUICK} count={3} />);
    expect(getByRole('heading', { level: 3, name: 'Quick tasks' })).toBeInTheDocument();
    expect(getByText('15 min · 3')).toBeInTheDocument();
  });

  it('omits the short label for the "No time set" section', () => {
    const { getByText, queryByText } = render(<TimeSectionHeader section={NO_TIME} count={2} />);
    expect(getByText('2')).toBeInTheDocument();
    expect(queryByText(/·/)).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<TimeSectionHeader section={QUICK} count={3} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
