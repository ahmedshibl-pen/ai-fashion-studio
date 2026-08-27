import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ProductAsset } from "@/types/mock-platform";

import { GenerationProviderError } from "./errors";
import { validateImageBuffer, validateReferenceSet } from "./image-validation";
import type { resolveGenerationSelection } from "./presets";
import type { GenerationImageReference } from "./types";

type ResolvedSelection = ReturnType<typeof resolveGenerationSelection>;

function parseProductDataUrl(product: ProductAsset) {
  const match = product.previewDataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new GenerationProviderError("invalid-request", { safeMessage: "Upload a valid PNG, JPG, or WEBP product image." });
  }
  const data = Buffer.from(match[2], "base64");
  validateImageBuffer(data, match[1]);
  return { data, mimeType: match[1] as GenerationImageReference["mimeType"] };
}

async function readTrustedPublicImage(publicPath: string) {
  if (!publicPath.startsWith("/") || publicPath.includes("..")) {
    throw new GenerationProviderError("configuration");
  }
  const publicRoot = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(publicRoot, publicPath.slice(1));
  if (!filePath.startsWith(`${publicRoot}${path.sep}`)) {
    throw new GenerationProviderError("configuration");
  }
  const data = await readFile(filePath);
  const metadata = validateImageBuffer(data, "image/webp", { maxBytes: 8 * 1024 * 1024 });
  return { data, mimeType: metadata.mimeType };
}

export async function resolveGenerationReferences(
  product: ProductAsset,
  selection: ResolvedSelection,
): Promise<readonly GenerationImageReference[]> {
  const productImage = parseProductDataUrl(product);
  const [model, pose, lighting] = await Promise.all([
    readTrustedPublicImage(selection.model.imagePath),
    readTrustedPublicImage(selection.pose.imagePath),
    readTrustedPublicImage(selection.lighting.imagePath),
  ]);

  const references = [
    { role: "product", label: product.fileName, ...productImage },
    { role: "model", label: selection.model.displayName, ...model },
    { role: "pose", label: selection.pose.label, ...pose },
    { role: "lighting", label: selection.lighting.label, ...lighting },
  ] as const satisfies readonly GenerationImageReference[];
  validateReferenceSet(references);
  return references;
}
