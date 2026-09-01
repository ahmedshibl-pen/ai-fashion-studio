# Goal 2 — Replicate image generation

This milestone connects the Basic Studio flow to a typed, server-only Replicate
provider for the official `google/nano-banana-2` model. Mock mode preserves the
same validated request path for free local development. This remains a
prototype integration rather than a production backend.

## Environment

Create `.env.local` in the repository root. Never commit it or expose its values
through a `NEXT_PUBLIC_` variable.

```dotenv
REPLICATE_API_TOKEN=
REPLICATE_IMAGE_MODEL=google/nano-banana-2
AI_GENERATION_MODE=mock
```

- `mock` is the safe default and makes no external request.
- `replicate` requires a non-empty server-only token and the allowlisted model.
- Restart the development server after changing environment variables.
- The browser receives readiness metadata only; it never receives the token,
  final prompt, provider implementation, or in-memory references.

## Request path

`POST /api/generation` accepts multipart form data containing one product image
and curated selection metadata. The server validates the upload and preset IDs,
resolves the selected model, pose, and lighting files from trusted public paths,
builds the versioned prompt, and calls Replicate. It returns one inline result
plus safe generation metadata.

The Replicate request sends exactly four labelled image references: product,
model, pose, and lighting. Camera composition and garment specifications are
validated prompt instructions rather than additional images. The provider
requests one JPG at `1K`, disables search grounding, creates exactly one
prediction, and never retries automatically. A 150-second deadline covers the
initial request and polling of that same prediction ID.

## Prompt contract

The current prompt version is `fashion-generation-v2`.

Every selected input is equally binding:

- the product reference controls garment identity and construction;
- the model reference controls Omar's or Darla's identity and appearance;
- the pose reference controls body position and pose composition;
- the lighting reference controls illumination behaviour and mood;
- the camera selection controls framing, crop, perspective, and aspect ratio;
- the garment specification controls the requested fit, fabric behaviour, and
  optional visual measurement guidance.

There is no highest-to-lowest priority order. Apparent conflicts are resolved
by keeping each input inside its assigned domain without weakening another
selected input.

## Server modules

- `providers/replicate.ts` and `providers/mock.ts` implement the shared contract
  in `types.ts`.
- `provider-factory.ts` selects Replicate or mock from validated environment
  variables.
- `prompts/master-prompt.ts` defines equal input authority and output rules.
- `prompts/product-preservation.ts` defines product fidelity and cross-reference
  exclusions.
- `prompts/garment-fit.ts` maps allowlisted fit, fabric, and measurement values.
- `prompts/build-generation-prompt.ts` assembles the final versioned prompt.
- `presets/*-prompt-mappings.ts` maps every catalog ID to its permitted visual
  role and copy/exclusion rules.
- `presets/camera-composition-mappings.ts` maps camera choices to text-based
  composition and aspect ratio.
- `request.ts`, `product-specification.ts`, `image-validation.ts`, and
  `references.ts` enforce request and trusted-asset boundaries.
- `errors.ts` converts upstream failures into safe public errors.

## Controlled live test

1. Keep `AI_GENERATION_MODE=mock` while running tests and UI checks.
2. Add the Replicate token manually to `.env.local`; never paste it into chat,
   screenshots, logs, or Git.
3. Configure the smallest practical credit amount with automatic reload off.
4. Set `AI_GENERATION_MODE=replicate` and restart the server.
5. Confirm `GET /api/generation` reports ready without returning the token.
6. Upload one supported product, choose Omar or Darla plus compatible lighting,
   pose, and camera options, then explicitly generate once.
7. Record result quality, product fidelity, identity, pose, lighting, framing,
   latency, prediction ID, and provider timing metadata.
8. Return to mock mode after the controlled test if live generation is no longer
   needed.

Automated tests, builds, page loads, and polling must never create an extra paid
prediction. Every live generation requires an explicit user action, and the
in-process attempt guard permits at most three unique request IDs per project.

## Known limitations

- A successful real-provider output still needs a controlled quality review.
- Prompt guidance cannot guarantee exact physical measurements or flawless
  product reproduction.
- Uploads and outputs are held in memory for the request; durable private object
  storage is not implemented.
- Project state and inline results remain browser-local and device-local.
- The attempt guard resets with the server and is not coordinated across
  multiple instances.
- Production authentication, ownership, moderation, job queues, durable
  idempotency, cost ledgers, and observability remain future work.

## Acceptance evidence

- Automated tests use mocked network responses or the no-charge mock provider.
- Mapping tests cover every existing model, pose, lighting, and camera ID.
- The endpoint rejects invalid content types, non-explicit requests,
  cross-model presets, corrupt images, oversized requests, and filename/MIME
  mismatches.
- The provider payload contains exactly product, model, pose, and lighting
  references and creates one prediction only.
- Public errors never expose raw provider messages, secrets, images, or prompts.
