import "server-only";

export const MASTER_CAMPAIGN_DIRECTION =
  "Create one photorealistic, premium fashion campaign photograph from the four labelled reference images.";

export const EQUAL_INPUT_AUTHORITY_DIRECTION = [
  "Treat every selected input as equally binding; no reference or instruction outranks another.",
  "The product reference governs garment identity and construction within its own domain.",
  "The model reference governs the selected person’s identity and appearance within its own domain.",
  "The pose reference governs body position and pose composition within its own domain.",
  "The lighting reference governs illumination behaviour and studio mood within its own domain.",
  "The selected camera composition and garment fit specification are equally mandatory constraints.",
  "Resolve apparent conflicts by respecting each input only within its assigned domain, without weakening or discarding any other selected input.",
].join("\n");

export const OUTPUT_DIRECTION = [
  "Return only one finished image at the requested aspect ratio.",
  "Do not add captions, borders, watermarks, UI, duplicated garments, extra products, or unrequested text.",
  "Keep anatomy natural: no extra limbs, malformed hands, fused fingers, or broken body geometry.",
].join(" ");
