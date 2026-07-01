import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Register vitest-axe's `toHaveNoViolations` matcher globally.
expect.extend(axeMatchers);

// Unmount React trees between tests so the DOM doesn't leak across cases.
afterEach(() => {
  cleanup();
});
