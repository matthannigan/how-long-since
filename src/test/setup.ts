import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Register vitest-axe's `toHaveNoViolations` matcher globally.
expect.extend(axeMatchers);

// jsdom gaps that Radix relies on. Radio/Switch/Dialog form controls measure
// themselves via ResizeObserver (their hidden "bubble input" only mounts inside
// a <form>), and Dialog's dismissable layer uses pointer-capture + scrollIntoView.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function scrollIntoView() {};
Element.prototype.hasPointerCapture ??= function hasPointerCapture() {
  return false;
};
Element.prototype.setPointerCapture ??= function setPointerCapture() {};
Element.prototype.releasePointerCapture ??= function releasePointerCapture() {};

// Unmount React trees between tests so the DOM doesn't leak across cases.
afterEach(() => {
  cleanup();
});
