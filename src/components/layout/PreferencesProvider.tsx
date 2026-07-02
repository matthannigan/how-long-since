import { useLiveQuery } from 'dexie-react-hooks';
import { createContext, type ReactNode, useContext, useEffect } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { db } from '@/lib/db/schema';
import { mirrorPrefsToStorage, type VisualPrefs } from '@/lib/settings';
import type { AppSettings } from '@/types';

/**
 * Applies the persisted `AppSettings` visual preferences to the document root as
 * data-attributes that styles/globals.css keys off:
 *   theme         → [data-theme] ('light'/'dark'; removed for 'system' so the
 *                   prefers-color-scheme media query governs — no flash)
 *   textSize      → [data-text-size]
 *   highContrast  → [data-high-contrast]
 *   reducedMotion → [data-reduced-motion]
 * Persisted state lives in Dexie (read via useLiveQuery), never in Zustand.
 */
function applyPreferences(settings: VisualPrefs): void {
  const root = document.documentElement;

  if (settings.theme === 'light' || settings.theme === 'dark') {
    root.setAttribute('data-theme', settings.theme);
  } else {
    root.removeAttribute('data-theme');
  }

  if (settings.textSize && settings.textSize !== 'default') {
    root.setAttribute('data-text-size', settings.textSize);
  } else {
    root.removeAttribute('data-text-size');
  }

  // Explicit 'true' (not toggleAttribute, which sets an empty string) so the
  // [data-high-contrast='true'] / [data-reduced-motion='true'] CSS selectors —
  // and the index.html flash guard — all agree on the value.
  if (settings.highContrast) {
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.removeAttribute('data-high-contrast');
  }

  if (settings.reducedMotion) {
    root.setAttribute('data-reduced-motion', 'true');
  } else {
    root.removeAttribute('data-reduced-motion');
  }
}

const ThemeContext = createContext<AppSettings['theme']>('system');

/** The persisted theme preference ('light' | 'dark' | 'system'). Internal —
 * the only consumer is ThemedToaster below. */
function useThemePreference(): AppSettings['theme'] {
  return useContext(ThemeContext);
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const settings = useLiveQuery(() => db.settings.get('1'));

  useEffect(() => {
    if (!settings) return;
    applyPreferences(settings);
    // Keep the localStorage mirror in sync (e.g. edits from another tab) so the
    // pre-paint flash guard in index.html stays correct on the next load.
    mirrorPrefsToStorage(settings);
  }, [settings]);

  return (
    <ThemeContext.Provider value={settings?.theme ?? 'system'}>{children}</ThemeContext.Provider>
  );
}

/** The app-level toast host, themed from the persisted preference. */
export function ThemedToaster() {
  return <Toaster theme={useThemePreference()} />;
}
