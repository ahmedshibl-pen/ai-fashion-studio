# Development

## Requirements

- Node.js 20.9 or newer
- npm

## Local workflow

Create an untracked local environment file and start the development server:

```bash
npm install
cp .env.example .env.local
npm run dev
```

`AI_GENERATION_MODE=mock` is the safe default and does not spend provider
credits. Add only the server-side credential for the live provider you intend
to test. Environment changes require a server restart.

Before sharing changes, run:

```bash
npm run check
npm run security:audit
```

`npm run check` runs tests, TypeScript, ESLint, and a production build. Run an
individual stage with `npm run test`, `npm run typecheck`, `npm run lint`, or
`npm run build` while iterating.

## Project conventions

- Keep route files and route-specific metadata in `src/app`.
- Put reusable UI in `src/components` and feature-owned logic in
  `src/features/<feature>`.
- Keep provider SDKs, prompts, credentials, and request parsing under
  `src/server`; client components must not import from that boundary.
- Add shared cross-feature contracts to `src/types`; keep feature-specific
  types with their feature.
- Store runtime assets under a descriptive `public/images/<area>` directory.
- Do not commit generated `.next` output, local environment files, or
  Superdesign drafts.
- Keep live image-generation calls behind an explicit user action. Use mock mode
  for routine UI and automated testing.

The optional Python asset utilities are documented in
[`scripts/README.md`](../scripts/README.md) and are not required to run the app.
