# Page dependency trees

## `/` — Landing

- `src/app/page.tsx`
  - `src/app/page.module.css`
  - `src/components/landing/site-header.tsx`
    - `src/components/landing/site-header.module.css`
  - `src/components/landing/scene-picture.tsx`
- `src/app/layout.tsx`
  - `src/app/globals.css`

## `/studio/basic` — Basic Studio

- `src/app/studio/basic/page.tsx`
- `src/app/layout.tsx`
  - `src/app/globals.css`
- planned data dependencies:
  - `src/features/basic-studio/model-catalog.ts`
  - `src/features/basic-studio/lighting-presets.ts`
  - `src/features/basic-studio/pose-presets.ts`
  - `src/features/basic-studio/camera-presets.ts`
  - `src/features/basic-studio/studio-session.ts`
