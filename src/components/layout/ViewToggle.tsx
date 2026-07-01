import { Link } from '@tanstack/react-router';

import { updateSettings } from '@/lib/settings';
import type { AppSettings } from '@/types';

const SEGMENT_BASE =
  'flex min-h-11 flex-1 items-center justify-center rounded-[18px] px-4 text-[0.8125rem] font-semibold text-ink-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent';
const SEGMENT_ACTIVE = 'bg-surface-card text-ink shadow-[0_2px_6px_rgba(70,62,55,0.1)]';

/**
 * The app's primary view switch (there is no bottom nav — see the decisions
 * register). Two segments route between the By Category (`/`) and By Time
 * (`/time`) views and persist the choice to the `settings` singleton so the
 * "remember last view" redirect (Req 4.6) can honor it on the next load.
 * Style per style-guide §3.4.
 */
export function ViewToggle() {
  const remember = (view: AppSettings['currentView']) => {
    void updateSettings({ currentView: view });
  };

  return (
    <nav aria-label="Choose a view" className="mx-auto max-w-2xl px-4">
      <div className="flex gap-1 rounded-track bg-surface-track p-1">
        <Link
          to="/"
          className={SEGMENT_BASE}
          activeProps={{ className: SEGMENT_ACTIVE, 'aria-current': 'page' }}
          activeOptions={{ exact: true }}
          onClick={() => remember('category')}
        >
          By Category
        </Link>
        <Link
          to="/time"
          className={SEGMENT_BASE}
          activeProps={{ className: SEGMENT_ACTIVE, 'aria-current': 'page' }}
          onClick={() => remember('time')}
        >
          By Time
        </Link>
      </div>
    </nav>
  );
}
