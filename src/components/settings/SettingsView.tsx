import { Link } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronRight } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { getSettings, updateSettings } from '@/lib/settings';
import type { AppSettings } from '@/types';

const THEME_OPTIONS: ReadonlyArray<[AppSettings['theme'], string]> = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['system', 'System'],
];

const TEXT_SIZE_OPTIONS: ReadonlyArray<[AppSettings['textSize'], string]> = [
  ['default', 'Default'],
  ['large', 'Large'],
  ['larger', 'Larger'],
];

const LEGEND = 'text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-ink-secondary';

/**
 * Settings — Step 4 wires the Appearance controls (theme, text size, high
 * contrast, reduced motion) that the theme/a11y provider consumes, so live
 * theme switching works. Default view, data management, categories, and about
 * are built in Step 8. Lives outside routes/ so the route file can code-split.
 */
export function SettingsView() {
  const settings = useLiveQuery(() => getSettings());
  if (!settings) return null;

  return (
    <div className="space-y-8">
      <section aria-labelledby="appearance-heading" className="space-y-6">
        <h2 id="appearance-heading" className="font-display text-lg font-semibold text-ink">
          Appearance
        </h2>

        <fieldset className="space-y-1">
          <legend className={LEGEND}>Theme</legend>
          <RadioGroup
            className="gap-0"
            value={settings.theme}
            onValueChange={(v) => void updateSettings({ theme: v as AppSettings['theme'] })}
          >
            {THEME_OPTIONS.map(([value, label]) => (
              <div key={value} className="flex min-h-11 items-center gap-3">
                <RadioGroupItem id={`theme-${value}`} value={value} />
                <Label htmlFor={`theme-${value}`}>{label}</Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        <fieldset className="space-y-1">
          <legend className={LEGEND}>Text size</legend>
          <RadioGroup
            className="gap-0"
            value={settings.textSize}
            onValueChange={(v) => void updateSettings({ textSize: v as AppSettings['textSize'] })}
          >
            {TEXT_SIZE_OPTIONS.map(([value, label]) => (
              <div key={value} className="flex min-h-11 items-center gap-3">
                <RadioGroupItem id={`text-size-${value}`} value={value} />
                <Label htmlFor={`text-size-${value}`}>{label}</Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        <div className="flex min-h-11 items-center justify-between gap-4">
          <Label htmlFor="high-contrast">High contrast</Label>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={(checked) => void updateSettings({ highContrast: checked })}
          />
        </div>

        <div className="flex min-h-11 items-center justify-between gap-4">
          <Label htmlFor="reduced-motion">Reduced motion</Label>
          <Switch
            id="reduced-motion"
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => void updateSettings({ reducedMotion: checked })}
          />
        </div>
      </section>

      <section
        aria-labelledby="categories-heading"
        className="space-y-2 border-t border-border-default pt-6"
      >
        <h2 id="categories-heading" className="font-display text-lg font-semibold text-ink">
          Categories
        </h2>
        <Link
          to="/categories"
          className="flex min-h-11 items-center justify-between gap-4 rounded-input px-1 text-ink outline-none hover:text-accent-deep focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="text-[0.9375rem] font-medium">Manage Categories</span>
          <ChevronRight className="size-4 text-ink-secondary" aria-hidden="true" />
        </Link>
      </section>

      <section
        aria-labelledby="more-settings-heading"
        className="space-y-2 border-t border-border-default pt-6"
      >
        <h2 id="more-settings-heading" className="font-display text-lg font-semibold text-ink">
          More settings
        </h2>
        <p className="text-sm text-ink-meta-aa">
          Default view, data export and import, and app info are coming in a later step.
        </p>
      </section>
    </div>
  );
}
