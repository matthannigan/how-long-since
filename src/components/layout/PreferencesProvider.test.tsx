import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { db, DEFAULT_SETTINGS } from '@/lib/db/schema';

import { PreferencesProvider } from './PreferencesProvider';

describe('PreferencesProvider', () => {
  beforeEach(async () => {
    await db.settings.clear();
    const root = document.documentElement;
    for (const attr of [
      'data-theme',
      'data-text-size',
      'data-high-contrast',
      'data-reduced-motion',
    ]) {
      root.removeAttribute(attr);
    }
  });

  it('applies an explicit theme and a11y prefs to the document root', async () => {
    await db.settings.add({
      ...DEFAULT_SETTINGS,
      theme: 'dark',
      textSize: 'larger',
      highContrast: true,
    });

    render(<PreferencesProvider>app</PreferencesProvider>);

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
    expect(document.documentElement.getAttribute('data-text-size')).toBe('larger');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
  });

  it('leaves data-theme unset for system so the media query governs', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS, theme: 'system', reducedMotion: true });

    render(<PreferencesProvider>app</PreferencesProvider>);

    // Wait for the effect to run (reducedMotion is our observable signal).
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
    });
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('points both theme-color metas at a forced theme, then restores them for system', async () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      '<meta name="theme-color" content="#FAF8F4" media="(prefers-color-scheme: light)" />' +
        '<meta name="theme-color" content="#24211D" media="(prefers-color-scheme: dark)" />',
    );
    const metaContents = () =>
      Array.from(
        document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
        (m) => m.content,
      );

    try {
      await db.settings.add({ ...DEFAULT_SETTINGS, theme: 'dark' });
      render(<PreferencesProvider>app</PreferencesProvider>);

      await waitFor(() => {
        expect(metaContents()).toEqual(['#24211D', '#24211D']);
      });

      await db.settings.update('1', { theme: 'system' });
      await waitFor(() => {
        expect(metaContents()).toEqual(['#FAF8F4', '#24211D']);
      });
    } finally {
      for (const m of document.head.querySelectorAll('meta[name="theme-color"]')) m.remove();
    }
  });

  it('adds no axe violations around its children', async () => {
    await db.settings.add({ ...DEFAULT_SETTINGS });
    const { container } = render(
      <PreferencesProvider>
        <main>
          <h1>Content</h1>
          <button type="button">Do thing</button>
        </main>
      </PreferencesProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
