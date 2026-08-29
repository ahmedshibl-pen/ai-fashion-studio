import assert from "node:assert/strict";
import test from "node:test";

import { clearMockPlatformStore } from "../src/lib/mock-platform";

test("storage recovery removes only the mock project store", () => {
  const removedKeys: string[] = [];
  const dispatchedEvents: string[] = [];
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        removeItem(key: string) {
          removedKeys.push(key);
        },
      },
      dispatchEvent(event: Event) {
        dispatchedEvents.push(event.type);
      },
    },
  });

  try {
    clearMockPlatformStore();
  } finally {
    if (originalWindow === undefined) {
      delete (globalThis as { window?: Window }).window;
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
    }
  }

  assert.deepEqual(removedKeys, ["ai-fashion-studio:mock-platform:v1"]);
  assert.deepEqual(dispatchedEvents, ["ai-fashion-studio:mock-platform-updated"]);
});
