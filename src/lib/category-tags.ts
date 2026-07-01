import type { Category } from '@/types';

/**
 * Category base-hue hex → its AA-safe tag color pair (style-guide §1.4 light,
 * §1.5 dark), as CSS custom properties so dark mode swaps automatically — see
 * the `--color-cat-*-tag-*` tokens in `styles/globals.css`. Keyed by the base
 * hue each default category stores in `Category.color`.
 */
const TAG_BY_HUE: Record<string, { bg: string; fg: string }> = {
  '#3b82f6': { bg: 'var(--color-cat-kitchen-tag-bg)', fg: 'var(--color-cat-kitchen-tag-fg)' },
  '#8b5cf6': { bg: 'var(--color-cat-bathroom-tag-bg)', fg: 'var(--color-cat-bathroom-tag-fg)' },
  '#ec4899': { bg: 'var(--color-cat-bedroom-tag-bg)', fg: 'var(--color-cat-bedroom-tag-fg)' },
  '#10b981': { bg: 'var(--color-cat-living-tag-bg)', fg: 'var(--color-cat-living-tag-fg)' },
  '#f59e0b': { bg: 'var(--color-cat-exterior-tag-bg)', fg: 'var(--color-cat-exterior-tag-fg)' },
  '#ef4444': { bg: 'var(--color-cat-vehicles-tag-bg)', fg: 'var(--color-cat-vehicles-tag-fg)' },
  '#6366f1': { bg: 'var(--color-cat-digital-tag-bg)', fg: 'var(--color-cat-digital-tag-fg)' },
  '#14b8a6': { bg: 'var(--color-cat-health-tag-bg)', fg: 'var(--color-cat-health-tag-fg)' },
  '#f97316': { bg: 'var(--color-cat-pets-tag-bg)', fg: 'var(--color-cat-pets-tag-fg)' },
  '#84cc16': { bg: 'var(--color-cat-garden-tag-bg)', fg: 'var(--color-cat-garden-tag-fg)' },
};

/**
 * Tinted category-tag colors for the By Time row (`TaskCard` `time` variant).
 * Known default hues map to tokenized AA pairs; an unknown custom hue (user
 * categories arrive in Step 7) falls back to a light self-tint, and a category
 * with no color falls back to neutral tokens — so nothing breaks pre-Step-7.
 */
export function getCategoryTag(category: Category): { bg: string; fg: string } {
  const hue = category.color?.toLowerCase();
  if (hue && TAG_BY_HUE[hue]) return TAG_BY_HUE[hue];
  if (category.color) return { bg: `${category.color}1a`, fg: category.color };
  return { bg: 'var(--color-surface-sunk)', fg: 'var(--color-ink-meta-aa)' };
}
