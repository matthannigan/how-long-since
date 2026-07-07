import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateSettings } from '@/lib/settings';
import type { AppSettings } from '@/types';

const VIEW_OPTIONS: ReadonlyArray<[AppSettings['currentView'], string]> = [
  ['quick', 'Quick Wins'],
  ['category', 'By Category'],
  ['time', 'By Time'],
];

/**
 * Default view preference (Req 4.6) → `AppSettings.currentView`. The same three
 * views the top toggle switches between; the chosen one is where the app opens.
 */
export function DefaultViewSection({ settings }: { settings: AppSettings }) {
  return (
    <section
      aria-labelledby="default-view-heading"
      className="space-y-3 border-t border-border-default pt-6"
    >
      <div className="space-y-1">
        <h2 id="default-view-heading" className="font-display text-lg font-semibold text-ink">
          Default View
        </h2>
        <p className="text-sm text-ink-meta-aa">Where the app opens. Switching views updates it too.</p>
      </div>
      <RadioGroup
        className="gap-0"
        aria-labelledby="default-view-heading"
        value={settings.currentView}
        onValueChange={(v) => void updateSettings({ currentView: v as AppSettings['currentView'] })}
      >
        {VIEW_OPTIONS.map(([value, label]) => (
          <div key={value} className="flex min-h-11 items-center gap-3">
            <RadioGroupItem id={`view-${value}`} value={value} />
            <Label htmlFor={`view-${value}`}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
    </section>
  );
}
