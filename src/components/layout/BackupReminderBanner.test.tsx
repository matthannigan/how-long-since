import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_SETTINGS } from '@/lib/db/schema';
import { useUIStore } from '@/stores/ui-store';

import { BackupReminderBanner } from './BackupReminderBanner';

describe('BackupReminderBanner', () => {
  beforeEach(async () => {
    await db.settings.clear();
    localStorage.clear();
    useUIStore.setState({ backupBannerDismissed: false });
  });

  it('shows when a backup has never been taken', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS, lastBackupDate: null });
    render(<BackupReminderBanner />);

    expect(await screen.findByRole('region', { name: 'Backup reminder' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export Data' })).toBeInTheDocument();
  });

  it('stays hidden when the last backup is recent', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS, lastBackupDate: new Date() });
    render(<BackupReminderBanner />);

    await waitFor(async () => {
      expect((await db.settings.get('1'))?.lastBackupDate).toBeInstanceOf(Date);
    });
    expect(screen.queryByRole('region', { name: 'Backup reminder' })).toBeNull();
  });

  it('hides after being dismissed', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS, lastBackupDate: null });
    render(<BackupReminderBanner />);

    const dismiss = await screen.findByRole('button', { name: 'Dismiss' });
    dismiss.click();

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Backup reminder' })).toBeNull();
    });
  });

  it('has no axe violations', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS, lastBackupDate: null });
    const { container } = render(<BackupReminderBanner />);

    await screen.findByRole('region', { name: 'Backup reminder' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
