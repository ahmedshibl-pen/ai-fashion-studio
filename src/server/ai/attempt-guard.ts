import "server-only";

import { GenerationProviderError } from "./errors";

const MAX_LIVE_ATTEMPTS_PER_PROJECT = 3;
const liveAttempts = new Map<string, Set<string>>();

export function reserveLiveGenerationAttempt(projectId: string, requestId: string) {
  const requests = liveAttempts.get(projectId) ?? new Set<string>();
  if (requests.has(requestId)) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: "This live generation request has already been submitted.",
    });
  }
  if (requests.size >= MAX_LIVE_ATTEMPTS_PER_PROJECT) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: "The three-attempt live generation limit has been reached for this project.",
    });
  }
  requests.add(requestId);
  liveAttempts.set(projectId, requests);
  return { attempt: requests.size, maximum: MAX_LIVE_ATTEMPTS_PER_PROJECT } as const;
}

export function resetLiveAttemptGuardForTests() {
  liveAttempts.clear();
}
