import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * App-level toast host. Adapted from the shadcn default to drop the `next-themes`
 * dependency (this app drives theme from the Dexie `AppSettings` singleton) — the
 * resolved theme is passed in as a prop by `PreferencesProvider`. Colors map to
 * the Soft Daylight tokens; the action slot carries the "Just Done" undo (Step 5)
 * and save/delete confirmations (Steps 7–8).
 */
const Toaster = ({ theme = 'system', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-center"
      duration={5000}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          actionButton: '!bg-accent !text-white',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--color-surface-card)',
          '--normal-text': 'var(--color-ink)',
          '--normal-border': 'var(--color-border-default)',
          '--border-radius': 'var(--radius-card)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
