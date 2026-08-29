# Goal 2 — Server-only image generation

This milestone connects the approved Basic Studio flow to typed, server-only image providers. It proves the complete request path in mock mode and is ready for one controlled Replicate-hosted Nano Banana 2 feasibility request. It is not a production backend.

## Environment

Create `.env.local` in the repository root. Never commit it or expose its values through a `NEXT_PUBLIC_` variable.

```dotenv
GEMINI_API_KEY=
AI_IMAGE_MODEL=gemini-3.1-flash-image
REPLICATE_API_TOKEN=
REPLICATE_IMAGE_MODEL=google/nano-banana-2
AI_GENERATION_MODE=mock
```

The committed `.env.example` contains the same names with an empty key. `.gitignore` ignores `.env*` while explicitly allowing only `.env.example`.

- `mock` is the safe default and works without a key or external request.
- `gemini` requires a non-empty `GEMINI_API_KEY` and uses only the server route.
- `replicate` requires a non-empty `REPLICATE_API_TOKEN` and the allowlisted official model `google/nano-banana-2`.
- Restart the development server after changing environment variables.
- The browser can read only the public readiness response; it never receives the key, provider implementation, references, or final prompt.

## Request path

`POST /api/generation` accepts multipart form data containing one product image and curated metadata. The server validates the upload and preset IDs, resolves only the selected model, pose, and lighting assets from trusted catalog paths, builds the versioned prompt, and calls the selected provider. It returns one inline result plus safe metadata.

The request uses Node.js runtime, `Cache-Control: no-store`, in-memory image handling, one `1K` image, and no provider retry. Gemini has a 120-second timeout. Replicate has a 150-second deadline, asks the create endpoint to wait for up to 60 seconds, and then polls only the same prediction ID if it is still running. Polling never creates a second prediction. Client duplicate submissions are blocked while a request is active. Every non-mock mode also enforces at most three unique request IDs per project in the current server process.

## Server modules

- `providers/gemini.ts`, `providers/replicate.ts`, and `providers/mock.ts` implement the shared provider contract in `types.ts`.
- `provider-factory.ts` selects the provider from validated server environment variables.
- The Replicate provider sends exactly the four selected references as in-memory data URLs, requests JPG at `1K`, disables Google and image-search grounding, creates exactly one prediction, and accepts output only from a validated inline image or a Replicate delivery URL.
- `prompts/master-prompt.ts` owns permanent campaign, reference-priority, and output direction.
- `prompts/product-preservation.ts` owns product fidelity and cross-reference exclusions.
- `prompts/garment-fit.ts` maps allowlisted fit, fabric, and optional measurement values to curated copy.
- `prompts/build-generation-prompt.ts` assembles the final prompt.
- `prompts/prompt-version.ts` currently exports `fashion-generation-v1`.
- `presets/*-prompt-mappings.ts` associates every existing catalog ID with a role, curated fragment, must-copy rule, and must-not-copy rule.
- `presets/camera-composition-mappings.ts` maps existing camera choices to composition and aspect ratio. Camera is composition metadata, not an additional reference image.
- `presets/selection-resolver.ts` rejects invalid or cross-model combinations.
- `request.ts`, `product-specification.ts`, `image-validation.ts`, and `references.ts` enforce input and trusted-asset boundaries.
- `errors.ts` normalizes failures into safe public codes and messages.

## Improving prompt fragments

Edit the mapping for an existing stable preset ID. Keep each fragment observable and specific, and preserve the separation between:

- `promptFragment`: the intended visual direction;
- `mustCopy`: the allowed information from that reference role;
- `mustNotCopy`: unrelated identity, clothing, product, lighting, pose, props, or background content.

Do not accept free-form browser text into the master prompt and do not add catalog IDs without real project data and assets. Update `fashion-generation-v1` when prompt behaviour changes materially, then add or update prompt-composition tests.

## Example assembled prompt

This abbreviated example omits all image/base64 data:

```text
Prompt version: fashion-generation-v1.

Create one photorealistic premium fashion campaign photograph.
Reference priority: product, model identity, pose, then lighting.

Preserve garment identity, shape, color, material, construction, logos,
graphics, pattern placement, neckline, sleeves, hems, and length. Do not
redesign, recolor, duplicate, invent details, change text, or add watermarks.

Model reference: preserve the selected person's identity and appearance only;
do not copy reference clothing, accessories, background, lighting, or pose.
Pose reference: reproduce body position and composition only.
Lighting reference: reproduce light behaviour and mood only.

Camera composition: selected allowlisted composition and aspect ratio.
Garment: top, size M, relaxed fit, fluid fabric. Optional measurements are
visual fit guidance only and are not guaranteed physical measurements.

Return one finished 1K image with natural anatomy and realistic fabric interaction.
```

## One controlled live test

1. Keep `AI_GENERATION_MODE=mock`; run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
2. Add the Replicate token manually to `.env.local`. Do not paste it into chat, logs, screenshots, or Git.
3. Immediately before the live test, set up the smallest practical Replicate credit amount with automatic reload disabled.
4. Set `AI_GENERATION_MODE=replicate` and keep `REPLICATE_IMAGE_MODEL=google/nano-banana-2`.
5. Restart the development server and confirm `GET /api/generation` reports Replicate mode as ready without returning the token.
6. In the existing same-tab studio flow, upload one supported product, choose existing model/pose/lighting/camera options, review, check out, and explicitly generate once.
7. Confirm the result appears in the project UI. Record latency, resolution, prompt version, prediction ID, and Replicate timing metrics when available.
8. Return to `AI_GENERATION_MODE=mock` and restart the server after the test.

Automated tests, builds, page loads, and retries must never trigger a paid request. Every live attempt requires an explicit Generate or Retry action. Do not make more than three live attempts during Goal 2, and do not retry automatically.

## Known limitations

- No real provider image has been evaluated yet; product fidelity, identity consistency, pose adherence, lighting adherence, latency, and returned metadata remain unverified until the controlled live test.
- Prompt guidance cannot guarantee exact physical measurements or perfect product reproduction.
- Uploads and provider output are held in memory for the request; there is no durable project, image, or result storage.
- The prototype stores project state and inline results in browser storage, which has capacity and device-locality limits.
- The attempt guard is in-process only. It resets on server restart and is not coordinated across replicas.
- There is no production authentication, ownership enforcement, moderation pipeline, job queue, distributed idempotency, provider ledger, or operational observability.

## Controlled live-attempt record

- Attempt 1 — 2026-08-29: one explicit UI-triggered request reached `POST /api/generation` and Gemini returned HTTP 400 in approximately one second. The project UI preserved the setup and displayed the safe failure state. No image, provider request ID, or usage metadata was returned, so product fidelity could not be evaluated and the application cannot determine whether the failed request incurred billable usage.
- The API key and model-access metadata were then verified without generating an image. The configured key can access `models/gemini-3.1-flash-image`, reported as Nano Banana 2.
- The request contained an optional `delivery: "inline"` output-format field that is absent from Google's current JavaScript image-generation example. That field was removed and an exact-payload regression test was added.
- Attempt 2 — 2026-08-29: after separate explicit approval, the UI sent one request without `delivery`. Gemini again returned HTTP 400 in approximately 2.1 seconds, with no image or usage metadata. This disproved `delivery` as the root cause.
- Google's current Interactions OpenAPI restricts the image output `mime_type` to `image/jpeg`; the application had requested `image/png`, even though PNG remains valid for image inputs. The output request is now aligned to JPEG and protected by the exact-payload test. This is the strongest schema-level diagnosis, but remains unverified by a successful image until a separately approved third and final live attempt.
- After each failure, the application was returned to `AI_GENERATION_MODE=mock`. No automatic retry was made.
- The project then added a separate server-only Replicate provider for the official `google/nano-banana-2` model. Its configuration, exact four-reference payload, single-prediction behavior, polling, safe error handling, and output validation are covered without making an external prediction. Attempt 3 remains unspent and requires separate explicit approval after Replicate billing is enabled.

## Goal 3

Build authenticated project ownership, encrypted durable object storage, durable idempotency and per-user rate limits, a background job queue, cancellation and status polling, observability and cost ledgers, provider/moderation policy controls, data-retention rules, and production-grade result delivery. Keep the provider and prompt contracts stable so the UI does not depend on Gemini directly.

## Acceptance evidence before the live test

- Environment, provider, validation, prompt, endpoint, and client-state tests use mocked network responses or the mock provider; they never create a real Replicate or Gemini prediction.
- Mapping tests cover every existing model, pose, lighting, and camera ID.
- The endpoint rejects non-multipart input, non-explicit requests, cross-model presets, corrupted or unsupported images, oversized requests, and filename/MIME mismatch.
- The request includes exactly product, selected model, selected pose, and selected lighting references.
- Safe provider errors do not expose stack traces, raw provider messages, secrets, images, or prompts.
