# AI Fashion Studio

AI Fashion Studio is a Next.js application for turning a product image into a
directed fashion campaign. The current workflow lets a user upload a garment,
choose a model, lighting, pose, camera treatment, and fit details, then submit a
validated image-generation request through a server-only provider adapter.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default `mock` mode
works without a provider credential. Never expose provider keys with a
`NEXT_PUBLIC_` prefix or commit `.env.local`.

## Quality checks

```bash
npm run check
npm run security:audit
```

`npm run check` runs the automated tests, TypeScript, ESLint, and the production
build. The security audit remains separate so dependency-registry availability
does not block ordinary local development.

## Project documentation

- [Architecture](docs/architecture.md)
- [Development workflow](docs/development.md)
- [Image-generation integration](docs/goal-2-image-generation.md)
- [Asset requirements](docs/asset-requirements.md)
- [Security posture](docs/security.md)
- [Asset credits](docs/asset-credits.md)
