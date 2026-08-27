export type GenerationErrorCode =
  | "invalid-request"
  | "configuration"
  | "authentication"
  | "rate-limited"
  | "safety-blocked"
  | "unavailable"
  | "timeout"
  | "no-image"
  | "provider-error";

const SAFE_MESSAGES: Record<GenerationErrorCode, string> = {
  "invalid-request": "The generation request is not valid.",
  configuration: "Image generation is not configured on the server.",
  authentication: "The image provider could not authenticate this request.",
  "rate-limited": "The image provider is temporarily rate limited. Try again later.",
  "safety-blocked": "The image provider could not create this image under its safety rules.",
  unavailable: "The image provider is temporarily unavailable.",
  timeout: "The image provider did not respond in time.",
  "no-image": "The image provider completed without returning an image.",
  "provider-error": "The image provider could not complete this request.",
};

export class GenerationProviderError extends Error {
  readonly safeMessage: string;

  constructor(
    readonly code: GenerationErrorCode,
    options: {
      cause?: unknown;
      retryable?: boolean;
      providerCode?: string;
      safeMessage?: string;
    } = {},
  ) {
    super(options.safeMessage ?? SAFE_MESSAGES[code], { cause: options.cause });
    this.name = "GenerationProviderError";
    this.safeMessage = options.safeMessage ?? SAFE_MESSAGES[code];
    this.retryable = options.retryable ?? false;
    this.providerCode = options.providerCode;
  }

  readonly retryable: boolean;
  readonly providerCode?: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeGenerationError(error: unknown): GenerationProviderError {
  if (error instanceof GenerationProviderError) return error;

  const record = asRecord(error);
  const status = typeof record.status === "number" ? record.status : undefined;
  const providerCode = typeof record.code === "string" ? record.code : undefined;
  const name = typeof record.name === "string" ? record.name.toLowerCase() : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (name.includes("timeout") || message.includes("timed out") || message.includes("timeout")) {
    return new GenerationProviderError("timeout", { cause: error, retryable: true, providerCode });
  }
  if (status === 401 || status === 403 || message.includes("api key")) {
    return new GenerationProviderError("authentication", { cause: error, providerCode });
  }
  if (status === 429 || providerCode === "resource_exhausted" || providerCode === "rate_limit_exceeded") {
    return new GenerationProviderError("rate-limited", { cause: error, retryable: true, providerCode });
  }
  if (status === 503 || providerCode === "unavailable") {
    return new GenerationProviderError("unavailable", { cause: error, retryable: true, providerCode });
  }
  if (message.includes("safety") || message.includes("blocked")) {
    return new GenerationProviderError("safety-blocked", { cause: error, providerCode });
  }
  if (status === 400 || status === 404 || providerCode === "invalid_request") {
    return new GenerationProviderError("invalid-request", { cause: error, providerCode });
  }

  return new GenerationProviderError("provider-error", { cause: error, providerCode });
}
