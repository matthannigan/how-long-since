import { beforeEach, describe, expect, it } from 'vitest';

import { db, DEFAULT_SETTINGS } from './db/schema';
import { getSettings, PREFS_STORAGE_KEY, updateSettings } from './settings';

describe('lib/settings', () => {
  beforeEach(async () => {
    await db.settings.clear();
    localStorage.clear();
  });

  it('getSettings falls back to defaults when the singleton is absent', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('getSettings returns the stored row', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS, theme: 'dark' });
    expect((await getSettings()).theme).toBe('dark');
  });

  it('updateSettings persists a patch and mirrors visual prefs to localStorage', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS });

    await updateSettings({ theme: 'dark', textSize: 'larger' });

    expect((await getSettings()).theme).toBe('dark');
    const mirror = JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY) ?? '{}');
    expect(mirror).toMatchObject({ theme: 'dark', textSize: 'larger' });
  });

  it('rejects an invalid patch without writing', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS });

    await expect(updateSettings({ theme: 'neon' as never })).rejects.toThrow();

    expect((await getSettings()).theme).toBe('system');
  });
});
