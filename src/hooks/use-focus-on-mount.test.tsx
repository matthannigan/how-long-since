import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ByCategoryView } from '@/components/category/ByCategoryView';
import { ByTimeView } from '@/components/task/ByTimeView';
import { QuickWinsView } from '@/components/task/QuickWinsView';
import { db } from '@/lib/db/schema';

/**
 * Req 4.7 — switching views must land focus on the new view's region rather than
 * dropping it to `<body>`. Each top-level view attaches {@link useFocusOnMount}
 * to its labelled region; this checks the region actually receives focus once it
 * mounts (after the `useLiveQuery` loading skeleton is replaced), for all three
 * views. The empty state is used so no router is needed (no task/category links).
 */
const VIEWS = [
  { name: 'Quick Wins', View: QuickWinsView },
  { name: 'By Category', View: ByCategoryView },
  { name: 'By Time', View: ByTimeView },
] as const;

beforeEach(async () => {
  await Promise.all([db.tasks.clear(), db.categories.clear(), db.settings.clear()]);
});

describe('focus on view switch (Req 4.7)', () => {
  it.each(VIEWS)('$name focuses its region once it mounts', async ({ name, View }) => {
    const { findByRole } = render(<View />);
    const region = await findByRole('region', { name });
    expect(region).toHaveFocus();
  });
});
