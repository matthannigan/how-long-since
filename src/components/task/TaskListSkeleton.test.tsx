import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

import { TaskListSkeleton } from './TaskListSkeleton';

describe('TaskListSkeleton', () => {
  it('renders the requested number of placeholder rows', () => {
    const { getByTestId } = render(
      <main>
        <TaskListSkeleton rows={3} />
      </main>,
    );
    const skeleton = getByTestId('task-list-skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton.children).toHaveLength(3);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <main>
        <TaskListSkeleton />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
