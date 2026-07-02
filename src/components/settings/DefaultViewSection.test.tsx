import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_SETTINGS } from '@/lib/db/schema';

import { DefaultViewSection } from './DefaultViewSection';

describe('DefaultViewSection', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.settings.add({ ...DEFAULT_SETTINGS });
    localStorage.clear();
  });

  it('reflects the current default view', () => {
    render(<DefaultViewSection settings={{ ...DEFAULT_SETTINGS, currentView: 'category' }} />);
    expect(screen.getByRole('radio', { name: 'By Category' })).toBeChecked();
  });

  it('persists a change to the settings singleton', async () => {
    render(<DefaultViewSection settings={{ ...DEFAULT_SETTINGS, currentView: 'quick' }} />);
    fireEvent.click(screen.getByRole('radio', { name: 'By Time' }));
    await waitFor(async () => {
      expect((await db.settings.get('1'))?.currentView).toBe('time');
    });
  });

  it('has no axe violations', async () => {
    const { container } = render(<DefaultViewSection settings={{ ...DEFAULT_SETTINGS }} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
