import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Shim para jest
(globalThis as any).jest = {
  fn: vi.fn,
  mock: vi.mock,
  spyOn: vi.spyOn,
  clearAllMocks: vi.clearAllMocks,
  requireActual: vi.importActual,
};
