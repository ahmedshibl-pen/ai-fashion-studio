export const GENERATION_IMAGE_SIZE = "1K" as const;
export const GENERATION_IMAGE_MIME_TYPE = "image/jpeg" as const;

export type GenerationMode = "mock" | "gemini";
export type GenerationProviderName = GenerationMode;
export type GenerationAspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9";

export type GenerationReferenceRole =
  | "product"
  | "model"
  | "pose"
  | "lighting";

export type GenerationImageReference = {
  role: GenerationReferenceRole;
  label: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  data: Buffer;
};

export type GenerationProviderRequest = {
  requestId: string;
  prompt: string;
  promptVersion: string;
  aspectRatio: GenerationAspectRatio;
  references: readonly GenerationImageReference[];
};

export type GenerationUsage = {
  inputTokens?: number;
  outputTokens?: number;
  thoughtTokens?: number;
  totalTokens?: number;
};

export type GenerationProviderResult = {
  provider: GenerationProviderName;
  model: string;
  image: {
    mimeType: "image/png" | "image/jpeg" | "image/webp";
    base64: string;
  };
  metadata: {
    requestId: string;
    providerRequestId?: string;
    promptVersion: string;
    durationMs: number;
    imageSize: typeof GENERATION_IMAGE_SIZE;
    aspectRatio: GenerationAspectRatio;
    usage?: GenerationUsage;
  };
};

export interface GenerationProvider {
  readonly name: GenerationProviderName;
  readonly model: string;
  generate(request: GenerationProviderRequest): Promise<GenerationProviderResult>;
}
