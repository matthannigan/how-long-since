import { createFileRoute, redirect } from '@tanstack/react-router';

import { ByCategoryView } from '@/components/category/ByCategoryView';
import { getSettings } from '@/lib/settings';

/**
 * Guard so the remember-last-view redirect fires only on the first navigation
 * of the session — otherwise toggling back to "By Category" would be bounced
 * straight to `/time` (Req 4.6; see the risk note in dev/phase1_step4.md).
 */
let initialLoadHandled = false;

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    if (initialLoadHandled) return;
    initialLoadHandled = true;
    const settings = await getSettings();
    if (settings.currentView === 'time') {
      throw redirect({ to: '/time' });
    }
  },
  component: ByCategoryView,
});
