# Security

The application now accepts an in-memory product image and can call Replicate
through a server-only API route. Authentication, durable database
storage, private object storage, and real payments are not implemented yet;
the account, projects, and checkout experiences are local prototypes.

Provider credentials are read only from untracked server environment variables.
The browser receives a limited readiness status, never a credential. Prompt
construction and provider SDK calls live under `src/server/ai`, which is guarded
with `server-only` imports.

## Current browser baseline

All application responses set a conservative baseline through `next.config.ts`:

- `Content-Security-Policy` limits framing, base URLs, object embedding, and
  form submissions to the same origin;
- `Permissions-Policy` disables camera, microphone, and geolocation;
- `Referrer-Policy` uses `strict-origin-when-cross-origin`;
- `X-Content-Type-Options` uses `nosniff`;
- `X-Frame-Options` uses `DENY`;
- the default `X-Powered-By` response header is disabled.

The CSP deliberately does not set `script-src` yet. A strict script policy
needs production nonce/hash handling and should be validated against the final
Next.js runtime rather than added speculatively.

HSTS is also intentionally deferred. Enable it only on the final HTTPS
production domain after confirming subdomain ownership and migration strategy.
Start without `preload`; do not add `includeSubDomains` until every subdomain is
known to support HTTPS.

## Dependency posture

As of 2026-08-29, Next.js and `eslint-config-next` are pinned together at
`16.3.0`, and `npm audit --omit=dev` reports zero known vulnerabilities. Re-run
the audit after dependency changes and review framework release notes before
upgrading. Do not use `npm audit fix --force` to bypass dependency review.

## Current generation controls

- Requests must use multipart form data and are capped at 20 MB at the route
  boundary.
- The product file is limited to 8 MB and must be a PNG, JPEG, or WebP whose
  filename extension, declared MIME type, and decoded signature agree.
- Decoded dimensions and pixel count are bounded before a provider request.
- Project/request identifiers, preset IDs, garment specifications, and reference
  counts are validated against trusted server-side catalogs.
- Live mode requires an explicit user action and applies a one-attempt guard per
  project/request pair to reduce accidental provider spend.
- Provider failures are mapped to safe public messages; upstream payloads and
  credentials are not returned to the browser.

The image currently remains in process memory for the provider request and is
not written to application storage. This validation is an initial boundary, not
a substitute for authenticated ownership, rate limiting, malware scanning, and
isolated media processing before production uploads are enabled.

## Checklist before adding uploads or accounts

- Keep secrets in untracked server-only environment variables and rotate them
  through the selected secrets manager.
- Add authentication, authorization, account ownership checks, and secure
  session handling before storing user work.
- Validate upload extensions, declared MIME types, and detected file content;
  reject mismatches and unsupported formats.
- Perform image parsing and transformation server-side in an isolated process,
  never by interpolating user-controlled paths or commands.
- Enforce upload byte limits, decoded pixel/dimension limits, frame/page limits,
  and processing timeouts before allocation-heavy work.
- Rate-limit uploads, generation actions, exports, authentication attempts, and
  other expensive or abuse-prone endpoints.
- Use private storage/CDN origins with least-privilege credentials, explicit
  cache rules, and no public bucket listing.
- Enforce object ownership on every read, write, edit, export, and delete.
- Use short-lived, purpose-scoped signed URLs and avoid leaking them through
  logs, analytics, referrers, or long-lived client state.
- Publish privacy, retention, and deletion behavior; provide complete account
  and asset deletion paths.
- Strip EXIF/GPS and other unnecessary metadata from customer images before
  distribution or model processing.
- Monitor runtime and development dependencies, review lockfile changes, and
  triage `npm audit` findings without forced major downgrades.
- Harden CSP with nonces or hashes once the production script, analytics, font,
  image, and connection sources are known.
- Enable production-only HSTS after the HTTPS domain and subdomain strategy is
  verified; initially omit `preload`.
