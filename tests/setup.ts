import "@testing-library/jest-dom/vitest";

import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(cleanup);

/**
 * jsdom ships no `matchMedia`. The default answer is "no": a coarse pointer, a
 * narrow screen, no reduced-motion preference — the environment in which the
 * cursor preview must stay unmounted. A test that needs a mouse overrides it.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/** Motion reads it on mount; jsdom has no layout engine to provide one. */
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
