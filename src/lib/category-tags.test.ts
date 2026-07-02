import { describe, expect, it } from 'vitest';

import { DEFAULT_CATEGORIES } from '@/lib/db/schema';
import type { Category } from '@/types';

import { getCategoryTag } from './category-tags';

describe('getCategoryTag', () => {
  it('maps every default category to a tokenized tag pair', () => {
    for (const category of DEFAULT_CATEGORIES) {
      const tag = getCategoryTag(category);
      expect(tag.bg).toMatch(/^var\(--color-cat-.+-tag-bg\)$/);
      expect(tag.fg).toMatch(/^var\(--color-cat-.+-tag-fg\)$/);
    }
  });

  it('is case-insensitive on the hue hex', () => {
    const kitchen = DEFAULT_CATEGORIES[0];
    expect(getCategoryTag({ ...kitchen, color: '#3B82F6' })).toEqual(
      getCategoryTag({ ...kitchen, color: '#3b82f6' }),
    );
  });

  it('derives an AA-leaning, theme-adaptive color-mix pair for a custom hue', () => {
    const custom: Category = { id: 'x', name: 'Custom', color: '#123456', isDefault: false };
    expect(getCategoryTag(custom)).toEqual({
      bg: 'color-mix(in srgb, #123456 18%, var(--color-surface-card))',
      fg: 'color-mix(in srgb, #123456 55%, var(--color-ink))',
    });
  });

  it('falls back to neutral tokens when a category has no color', () => {
    const noColor: Category = { id: 'x', name: 'No color', isDefault: false };
    expect(getCategoryTag(noColor)).toEqual({
      bg: 'var(--color-surface-sunk)',
      fg: 'var(--color-ink-meta-aa)',
    });
  });
});
