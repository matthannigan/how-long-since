import { DEFAULT_CATEGORIES } from '@/lib/db/schema';
import type { Category } from '@/types';

/** Canonical position of each default category, for ordering groups/pickers. */
const DEFAULT_ORDER = new Map(DEFAULT_CATEGORIES.map((c, i) => [c.id, i]));

/**
 * Default categories first (in their seeded order), then user-created ones
 * alphabetically. Shared by the By Category view and the Step 7 category
 * pickers / Manage list so ordering stays consistent everywhere.
 */
export function sortCategoriesForDisplay(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const ai = DEFAULT_ORDER.get(a.id);
    const bi = DEFAULT_ORDER.get(b.id);
    if (ai !== undefined && bi !== undefined) return ai - bi;
    if (ai !== undefined) return -1;
    if (bi !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });
}
