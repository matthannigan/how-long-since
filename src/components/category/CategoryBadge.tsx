import type { Category } from '@/types';

/**
 * By Category group header (style-guide §3.8): a 12px solid color dot, the
 * category name, and the count of tasks in the group. The dot is decorative
 * (`aria-hidden`) — the name carries the meaning — and uses the category's own
 * stored hue rather than a theme token.
 */
export function CategoryBadge({ category, count }: { category: Category; count: number }) {
  return (
    <div className="flex items-center gap-[9px] px-5 pt-[14px] pb-1.5">
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
        aria-hidden="true"
      />
      <h3 className="font-display text-lg font-bold text-ink">{category.name}</h3>
      <span className="text-xs text-ink-meta-aa">{count}</span>
    </div>
  );
}
