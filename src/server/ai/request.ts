import "server-only";

import type { ProductAsset } from "@/types/mock-platform";

import { GenerationProviderError } from "./errors";
import { MAX_PRODUCT_IMAGE_BYTES } from "./image-validation";
import { resolveGenerationSelection } from "./presets/selection-resolver";
import { validateProductSpecification } from "./product-specification";

const MAX_METADATA_LENGTH = 20_000;
const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,119}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMetadata(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_METADATA_LENGTH) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Generation metadata is missing or too large." });
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) throw new Error("metadata must be an object");
    return parsed;
  } catch (error) {
    throw new GenerationProviderError("invalid-request", {
      cause: error,
      safeMessage: "Generation metadata is not valid JSON.",
    });
  }
}

export async function parseGenerationFormData(formData: FormData) {
  const metadata = parseMetadata(formData.get("metadata"));
  const image = formData.get("productImage");
  if (!(image instanceof File)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Upload one product image." });
  }
  if (image.size === 0 || image.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "The product image must be 8 MB or smaller." });
  }
  if (image.type !== "image/png" && image.type !== "image/jpeg" && image.type !== "image/webp") {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Upload a PNG, JPG, or WEBP product image." });
  }
  const allowedExtensions = image.type === "image/jpeg" ? ["jpg", "jpeg"] : [image.type.slice("image/".length)];
  const extension = image.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: "The product image filename does not match its image type.",
    });
  }

  const requestId = typeof metadata.requestId === "string" && ID_PATTERN.test(metadata.requestId) ? metadata.requestId : null;
  const projectId = typeof metadata.projectId === "string" && ID_PATTERN.test(metadata.projectId) ? metadata.projectId : null;
  if (!requestId || !projectId) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "The generation request identifiers are invalid." });
  }
  if (metadata.explicitUserAction !== true) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Generation requires an explicit user action." });
  }
  if (!isRecord(metadata.selection)) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "The studio selection is missing." });
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const product: ProductAsset = {
    id: `${projectId}-product`,
    fileName: image.name.slice(0, 120) || "product-image",
    mimeType: image.type,
    size: image.size,
    previewDataUrl: `data:${image.type};base64,${buffer.toString("base64")}`,
  };

  return {
    requestId,
    projectId,
    product,
    selection: resolveGenerationSelection(metadata.selection),
    productSpecification: validateProductSpecification(metadata.productSpecification),
  } as const;
}
