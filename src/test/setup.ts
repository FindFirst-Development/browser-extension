import { vi } from "vitest";

// Minimal browser API shim
const storageData: Record<string, unknown> = {};

const browserMock = {
  storage: {
    local: {
      get: vi.fn(async (keys: string | string[]) => {
        const ks = Array.isArray(keys) ? keys : [keys];
        return Object.fromEntries(ks.map((k) => [k, storageData[k]]));
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(storageData, items);
      }),
      remove: vi.fn(async (keys: string | string[]) => {
        const ks = Array.isArray(keys) ? keys : [keys];
        ks.forEach((k) => delete storageData[k]);
      }),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    openOptionsPage: vi.fn(),
  },
};

// Expose as globalThis.browser
(globalThis as unknown as Record<string, unknown>)["browser"] = browserMock;

// Helper to reset storage between tests
export function resetStorage() {
  Object.keys(storageData).forEach((k) => delete storageData[k]);
  vi.clearAllMocks();
  // Re-bind storage mock internals after clearAllMocks
  browserMock.storage.local.get.mockImplementation(async (keys: string | string[]) => {
    const ks = Array.isArray(keys) ? keys : [keys];
    return Object.fromEntries(ks.map((k) => [k, storageData[k]]));
  });
  browserMock.storage.local.set.mockImplementation(async (items: Record<string, unknown>) => {
    Object.assign(storageData, items);
  });
  browserMock.storage.local.remove.mockImplementation(async (keys: string | string[]) => {
    const ks = Array.isArray(keys) ? keys : [keys];
    ks.forEach((k) => delete storageData[k]);
  });
}

export { browserMock };
