import { ExternalLink } from 'lucide-react';

const COMING_SOON = 'rounded-chip bg-surface-sunk px-2 py-0.5 text-xs font-medium text-ink-meta-aa';

/** Injected from package.json at build time (`define` in vite.config.ts). */
const APP_VERSION = __APP_VERSION__;

/**
 * About & Help. Version + a one-line description are live; the User Guide links
 * to the served static guide (public/user-guide.html) in a new tab — a raw
 * anchor, not a router Link, since it's a standalone page outside the SPA. Send
 * Feedback stays a Phase 2 placeholder rather than a dead link.
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
        Track when you last did each task, so you don&rsquo;t have to remember.
      </p>
      <a
        href="/user-guide.html"
        target="_blank"
        rel="noopener"
        className="flex min-h-11 items-center justify-between gap-4 rounded-input px-1 outline-none hover:text-accent-deep focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="text-[0.9375rem] font-medium text-ink">User Guide</span>
        <ExternalLink className="size-4 text-ink-secondary" aria-hidden="true" />
      </a>
      <div className="flex min-h-11 items-center justify-between gap-4 opacity-60">
        <span className="text-[0.9375rem] font-medium text-ink">Send Feedback</span>
        <span className={COMING_SOON}>Coming soon</span>
      </div>
    </section>
  );
}
