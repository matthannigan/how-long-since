import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { InstanceLabelsField } from './InstanceLabelsField';

/** Stateful wrapper so chips behave as they will inside TaskForm. */
function Harness({
  suggestions = [],
  onSubmit = vi.fn(),
  initial = [],
}: {
  suggestions?: string[];
  onSubmit?: () => void;
  initial?: string[];
}) {
  const [labels, setLabels] = useState<string[]>(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <InstanceLabelsField
        labels={labels}
        onChange={setLabels}
        suggestions={suggestions}
        inputId="places"
      />
      <button type="submit">Save</button>
    </form>
  );
}

describe('InstanceLabelsField', () => {
  it('commits a chip on Enter without submitting the enclosing form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/where — or who\?/i), 'Guest room{Enter}');

    expect(screen.getByText('Guest room')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/where — or who\?/i)).toHaveValue('');
  });

  it('commits a chip on comma', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText(/where — or who\?/i), 'Luna,');
    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('commits a pending draft on blur so a typed label is not lost', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText(/where — or who\?/i), 'Main bedroom');
    await user.tab(); // leave the input without pressing Enter
    expect(screen.getByText('Main bedroom')).toBeInTheDocument();
  });

  it('rejects duplicates case-insensitively', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['Guest room']} />);

    await user.type(screen.getByLabelText(/where — or who\?/i), 'guest ROOM{Enter}');
    expect(screen.getAllByText(/guest room/i)).toHaveLength(1);
  });

  it('removes a chip via its labeled remove button', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['Guest room', 'Luna']} />);

    await user.click(screen.getByRole('button', { name: 'Remove Guest room' }));
    expect(screen.queryByText('Guest room')).not.toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('adds a suggestion on tap', async () => {
    const user = userEvent.setup();
    render(<Harness suggestions={['Main bedroom', 'Attic']} />);

    await user.click(screen.getByRole('button', { name: /main bedroom/i }));

    // Now a chip (with a remove button); the suggestions group is caller-driven.
    expect(screen.getByRole('button', { name: 'Remove Main bedroom' })).toBeInTheDocument();
    const group = screen.getByRole('group', { name: 'Suggestions' });
    expect(group).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Harness initial={['Guest room']} suggestions={['Attic']} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
