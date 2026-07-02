const COMING_SOON = 'rounded-chip bg-surface-sunk px-2 py-0.5 text-xs font-medium text-ink-meta-aa';

/** App version constant. A build-time inject from package.json is a later nicety. */
const APP_VERSION = '1.0.0';

/**
 * About & Help. Version + a one-line description are live; the User Guide and
 * Send Feedback links are Phase 2, shown disabled rather than as dead links.
 */
export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="space-y-3 border-t border-border-default pt-6"
    >
      <h2 id="about-heading" className="font-display text-lg font-semibold text-ink">
        About &amp; Help
      </h2>
      <div className="flex min-h-11 items-center justify-between gap-4">
        <span className="text-[0.9375rem] font-medium text-ink">How Long Since</span>
        <span className="text-sm text-ink-meta-aa">v{APP_VERSION}</span>
      </div>
      <p className="text-sm text-ink-meta-aa">
        Track when you last did each task, so nothing slips through the cracks.
      </p>
      <div className="flex min-h-11 items-center justify-between gap-4 opacity-60">
        <span className="text-[0.9375rem] font-medium text-ink">User Guide</span>
        <span className={COMING_SOON}>Coming soon</span>
      </div>
      <div className="flex min-h-11 items-center justify-between gap-4 opacity-60">
        <span className="text-[0.9375rem] font-medium text-ink">Send Feedback</span>
        <span className={COMING_SOON}>Coming soon</span>
      </div>
    </section>
  );
}
