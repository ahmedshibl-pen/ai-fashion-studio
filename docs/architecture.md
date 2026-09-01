# Architecture

AI Fashion Studio uses Next.js 16 App Router, React, and TypeScript. The browser
experience is separated from the server-only image-generation integration so
provider credentials, prompt construction, and reference preparation never
enter the client bundle.

## Source organization

- `src/app`: route entry points, route metadata, the generation route handler,
  and global styles
- `src/components`: reusable landing, shell, and UI building blocks
- `src/features`: feature-owned experiences and domain logic for the studio,
  projects, account, checkout, and mock authentication
- `src/server/ai`: server-only request validation, prompt modules, provider
  adapters, reference preparation, and live-attempt protection
- `src/lib`: shared application infrastructure and the local prototype store
- `src/types`: contracts shared across features and server boundaries
- `public/images`: committed runtime imagery grouped by product area
- `scripts`: optional, offline asset-authoring utilities
- `tests`: Node test-runner coverage for the generation boundary and recovery
  helpers

## Routes

- `/`: cinematic product landing page
- `/studio/basic`: the model, product, lighting, pose, and camera workspace
- `/projects` and `/projects/[projectId]`: local project list and project detail
- `/account` and `/checkout`: prototype account and checkout experiences
- `/api/generation`: server-only generation status and multipart generation API

The current account, checkout, and project persistence are prototype-local.
Authentication, billing, durable database records, and private object storage
remain separate future integrations.

## Generation boundary

The client submits one explicit multipart request. The route validates metadata
and image limits, resolves trusted preset IDs into prompt/reference data, then
  selects the configured mock or Replicate provider. Provider errors are
normalized before being returned to the browser, and secrets stay in
server-only environment variables.
