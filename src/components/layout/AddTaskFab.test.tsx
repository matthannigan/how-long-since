import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { useUIStore } from '@/stores/ui-store';

import { AddTaskFab } from './AddTaskFab';

describe('AddTaskFab', () => {
  afterEach(() => {
    useUIStore.setState({ isAddTaskOpen: false });
  });

  it('opens the Add-Task modal when pressed', async () => {
    const user = userEvent.setup();
    const { findByRole } = render(<AddTaskFab />);
    await user.click(await findByRole('button', { name: 'Add task' }));
    expect(useUIStore.getState().isAddTaskOpen).toBe(true);
  });

  it('is hidden while the Add-Task modal is open', async () => {
    useUIStore.setState({ isAddTaskOpen: true });
    const { queryByRole, findByText } = render(
      <>
        <AddTaskFab />
        <span>ready</span>
      </>,
    );
    await findByText('ready');
    expect(queryByRole('button', { name: 'Add task' })).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container, findByRole } = render(<AddTaskFab />);
    await findByRole('button', { name: 'Add task' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
