import "server-only";

import { GenerationProviderError } from "./errors";
import type { GenerationImageReference } from "./types";

export const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_REFERENCE_TOTAL_BYTES = 18 * 1024 * 1024;
export const MIN_IMAGE_DIMENSION = 256;
export const MAX_IMAGE_DIMENSION = 6000;

type SupportedMimeType = GenerationImageReference["mimeType"];
type ImageMetadata = { mimeType: SupportedMimeType; width: number; height: number };

function readPng(buffer: Buffer): ImageMetadata | null {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature) || buffer.toString("ascii", 12, 16) !== "IHDR") return null;
  return { mimeType: "image/png", width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpeg(buffer: Buffer): ImageMetadata | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + length + 2 > buffer.length) return null;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { mimeType: "image/jpeg", height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += length + 2;
  }
  return null;
}

function readWebp(buffer: Buffer): ImageMetadata | null {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      mimeType: "image/webp",
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  if (chunk === "VP8 " && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
    return {
      mimeType: "image/webp",
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L" && buffer.length >= 25 && buffer[20] === 0x2f) {
    const bits = buffer.readUInt32LE(21);
    return {
      mimeType: "image/webp",
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  return null;
}

export function inspectImageBuffer(buffer: Buffer): ImageMetadata {
  const metadata = readPng(buffer) ?? readJpeg(buffer) ?? readWebp(buffer);
  if (!metadata || metadata.width < 1 || metadata.height < 1) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: "The image file is corrupted or uses an unsupported format.",
    });
  }
  return metadata;
}

export function validateImageBuffer(
  buffer: Buffer,
  claimedMimeType: string,
  options: { maxBytes?: number; minDimension?: number; maxDimension?: number } = {},
) {
  const maxBytes = options.maxBytes ?? MAX_PRODUCT_IMAGE_BYTES;
  if (buffer.length === 0 || buffer.length > maxBytes) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: `The product image must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.`,
    });
  }

  const metadata = inspectImageBuffer(buffer);
  if (metadata.mimeType !== claimedMimeType) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: "The image file type does not match its contents.",
    });
  }

  const minDimension = options.minDimension ?? MIN_IMAGE_DIMENSION;
  const maxDimension = options.maxDimension ?? MAX_IMAGE_DIMENSION;
  if (
    metadata.width < minDimension ||
    metadata.height < minDimension ||
    metadata.width > maxDimension ||
    metadata.height > maxDimension
  ) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: `Image dimensions must be between ${minDimension} and ${maxDimension} pixels.`,
    });
  }
  return metadata;
}

export function validateReferenceSet(references: readonly GenerationImageReference[]) {
  const roles = new Set(references.map((reference) => reference.role));
  if (references.length !== 4 || roles.size !== 4 || !["product", "model", "pose", "lighting"].every((role) => roles.has(role as GenerationImageReference["role"]))) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: "Exactly one product, model, pose, and lighting reference is required.",
    });
  }
  const totalBytes = references.reduce((sum, reference) => sum + reference.data.length, 0);
  if (totalBytes > MAX_REFERENCE_TOTAL_BYTES) {
    throw new GenerationProviderError("invalid-request", {
      safeMessage: "The combined image references are too large.",
    });
  }
}
