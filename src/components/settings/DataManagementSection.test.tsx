import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_SETTINGS } from '@/lib/db/schema';

import { DataManagementSection } from './DataManagementSection';

describe('DataManagementSection', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.settings.add({ ...DEFAULT_SETTINGS });
    localStorage.clear();
  });

  it('shows the empty backup state and all data actions', () => {
    render(<DataManagementSection settings={{ ...DEFAULT_SETTINGS, lastBackupDate: null }} />);
    expect(screen.getByText('No previous backups found.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export data/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Import data/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear all data/ })).toBeInTheDocument();
  });

  it('formats a stored backup date instead of the empty state', () => {
    render(
      <DataManagementSection
        settings={{ ...DEFAULT_SETTINGS, lastBackupDate: new Date('2026-06-15T12:00:00Z') }}
      />,
    );
    expect(screen.queryByText('No previous backups found.')).toBeNull();
  });

  it('confirms before clearing all data', async () => {
    render(<DataManagementSection settings={{ ...DEFAULT_SETTINGS }} />);
    fireEvent.click(screen.getByRole('button', { name: /Clear all data/ }));
    expect(await screen.findByRole('heading', { name: 'Clear all data?' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<DataManagementSection settings={{ ...DEFAULT_SETTINGS }} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
