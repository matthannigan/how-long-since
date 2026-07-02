import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Friendly recovery screen shown when a descendant throws. Copy per
 * content-strategy-guide §4.3. Standalone (the shell is unmounted on error). */
function ErrorRecovery() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface-page px-6 text-ink">
      <div role="alert" className="flex flex-col items-center gap-4 text-center">
        <h1 className="font-display text-[1.375rem] font-semibold">Something went wrong.</h1>
        <p className="max-w-sm text-ink-meta-aa">
          Your tasks are saved on this device. Reloading usually fixes it.
        </p>
        <Button className="h-11 px-6" onClick={() => window.location.reload()}>
          Reload app
        </Button>
      </div>
    </main>
  );
}

/**
 * Root error boundary — the backstop for uncaught throws (including `ZodError`
 * and Dexie errors) that a call-site try/catch didn't handle. Wraps the shell +
 * router outlet in routes/__root.tsx.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Uncaught error surfaced to the root boundary:', error, info);
  }

  render(): ReactNode {
    return this.state.hasError ? <ErrorRecovery /> : this.props.children;
  }
}
