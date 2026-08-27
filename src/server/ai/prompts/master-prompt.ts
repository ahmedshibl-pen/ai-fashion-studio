import "server-only";

export const MASTER_CAMPAIGN_DIRECTION =
  "Create one photorealistic, premium fashion campaign photograph from the four labelled reference images.";

export const REFERENCE_PRIORITY_DIRECTION = [
  "Reference priority, highest to lowest:",
  "1. Product reference — the only source of truth for garment identity and construction.",
  "2. Model reference — the only source of truth for the selected person’s identity and appearance.",
  "3. Pose reference — body position and composition direction only.",
  "4. Lighting reference — illumination behaviour and studio mood only.",
  "If references conflict, follow this priority order and never sacrifice product identity.",
].join("\n");

export const OUTPUT_DIRECTION = [
  "Return only one finished image at the requested aspect ratio.",
  "Do not add captions, borders, watermarks, UI, duplicated garments, extra products, or unrequested text.",
  "Keep anatomy natural: no extra limbs, malformed hands, fused fingers, or broken body geometry.",
].join(" ");
