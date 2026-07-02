import { useCallback } from 'react';

/**
 * Returns a callback ref that moves focus to the element as soon as it attaches
 * to the DOM. Used by the three top-level views so switching views (Req 4.7)
 * lands focus on the new region instead of dropping it to `<body>`.
 *
 * A callback ref (not `useRef` + `useEffect([])`) is deliberate: the views render
 * a loading skeleton first while `useLiveQuery` resolves, so the focusable region
 * mounts on a *later* render. An effect with an empty dep array would run once,
 * against the skeleton, and never focus the region. The callback ref fires when
 * the region node actually attaches, after the skeleton is replaced.
 *
 * The target must be focusable — give it `tabIndex={-1}` (and `outline-none`,
 * since the focus is programmatic, not a keyboard tab-stop).
 */
export function useFocusOnMount<T extends HTMLElement>() {
  return useCallback((node: T | null) => {
    node?.focus();
  }, []);
}
