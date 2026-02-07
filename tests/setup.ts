import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// eslint-disable-next-line no-console
const originalConsoleError = console.error;

beforeAll(() => {
  // eslint-disable-next-line no-console
  vi.spyOn(console, 'error').mockImplementation((...args: Parameters<typeof console.error>) => {
    const firstArg = args[0];
    if (typeof firstArg === 'string' && firstArg.includes('not wrapped in act(...')) {
      return;
    }
    originalConsoleError(...args);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    void callback;
    void options;
  }
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;
