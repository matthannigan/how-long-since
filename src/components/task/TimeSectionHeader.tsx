import type { TimeSection } from '@/lib/time-sections';

interface TimeSectionHeaderProps {
  section: TimeSection;
  count: number;
}

/**
 * Group header for the By Time view: the section title (`h3`, keeping the
 * h1→h2→h3 order valid for axe) and a "15 min · N" count. Sized larger than the
 * task rows for a clear hierarchy, matching CategoryBadge. The old per-section
 * dot marker was dropped — the time glyph already rides on every row, and the
 * 4–5-dot versions overflowed the circle.
 */
export function TimeSectionHeader({ section, count }: TimeSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-5 pt-[14px] pb-1.5">
      <h3 className="font-display text-lg font-bold text-ink">{section.title}</h3>
      <span className="text-xs text-ink-meta-aa">
        {section.shortLabel ? `${section.shortLabel} · ${count}` : count}
      </span>
    </div>
  );
}
