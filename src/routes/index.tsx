import { createFileRoute, redirect } from '@tanstack/react-router';

import { QuickWinsView } from '@/components/task/QuickWinsView';
import { getSettings } from '@/lib/settings';

/**
 * `/` is the Quick Wins view (the default). The remember-last-view redirect
 * (Req 4.6) fires only on the first navigation of the session — otherwise
 * toggling back to "Quick Wins" would be bounced straight to the remembered
 * view (see the risk note in dev/phase1_step4.md).
 */
let initialLoadHandled = false;

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    if (initialLoadHandled) return;
    initialLoadHandled = true;
    const settings = await getSettings();
    if (settings.currentView === 'category') {
      throw redirect({ to: '/category' });
    }
    if (settings.currentView === 'time') {
      throw redirect({ to: '/time' });
    }
  },
  component: QuickWinsView,
});
