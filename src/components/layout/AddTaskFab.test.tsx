import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { useUIStore } from '@/stores/ui-store';
import { renderWithRouter } from '@/test/router';

import { AddTaskFab } from './AddTaskFab';

describe('AddTaskFab', () => {
  afterEach(() => {
    useUIStore.setState({ isAddTaskOpen: false });
  });

  it('renders a labelled link to the new-task route', async () => {
    const { findByRole } = renderWithRouter(
      <main>
        <AddTaskFab />
      </main>,
    );
    expect(await findByRole('link', { name: 'Add task' })).toHaveAttribute(
      'href',
      expect.stringContaining('/tasks/new'),
    );
  });

  it('is hidden while the Add-Task modal is open', async () => {
    useUIStore.setState({ isAddTaskOpen: true });
    const { queryByRole, findByText } = renderWithRouter(
      <main>
        <AddTaskFab />
        <span>ready</span>
      </main>,
    );
    await findByText('ready');
    expect(queryByRole('link', { name: 'Add task' })).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container, findByRole } = renderWithRouter(
      <main>
        <AddTaskFab />
      </main>,
    );
    await findByRole('link', { name: 'Add task' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
