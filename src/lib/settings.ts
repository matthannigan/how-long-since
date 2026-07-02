import { updateSettingsSchema } from '@/schemas/settings';
import type { AppSettings } from '@/types';

import { db, DEFAULT_SETTINGS } from './db/schema';

/**
 * The singleton `AppSettings` row id. `seedDatabase()` guarantees this row
 * exists at boot, but reads fall back to defaults defensively.
 */
const SETTINGS_ID = '1';

/**
 * localStorage key holding a mirror of the visual preferences. Dexie is the
 * source of truth, but IndexedDB is async — the pre-paint script in index.html
 * reads this synchronous mirror to set `data-theme` (etc.) before first paint,
 * avoiding a light→dark flash. Keep the shape in sync with that inline script.
 */
export const PREFS_STORAGE_KEY = 'hls-prefs';

/** The subset of settings the theme/a11y provider and flash guard care about. */
export type VisualPrefs = Pick<
  AppSettings,
  'theme' | 'textSize' | 'highContrast' | 'reducedMotion'
>;

/** Mirror the visual prefs into localStorage for the pre-paint flash guard. */
export function mirrorPrefsToStorage(settings: VisualPrefs): void {
  try {
    const prefs: VisualPrefs = {
      theme: settings.theme,
      textSize: settings.textSize,
      highContrast: settings.highContrast,
      reducedMotion: settings.reducedMotion,
    };
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Private-mode / disabled storage: the flash guard is a progressive
    // enhancement, so a failed mirror is non-fatal.
  }
}

/** Read the settings singleton, falling back to defaults if it is absent. */
export async function getSettings(): Promise<AppSettings> {
  return (await db.settings.get(SETTINGS_ID)) ?? DEFAULT_SETTINGS;
}

/**
 * Patch the settings singleton. Validates the patch at this write boundary
 * (throwing `ZodError` on bad input), then mirrors the resulting visual prefs
 * to localStorage so the next boot paints the right theme with no flash.
 */
export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  const validated = updateSettingsSchema.parse(patch);
  await db.settings.update(SETTINGS_ID, validated);
  mirrorPrefsToStorage(await getSettings());
}
