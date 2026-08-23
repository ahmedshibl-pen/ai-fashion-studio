# AI Fashion Studio — Cinematic Editorial Studio

## Product and direction

AI Fashion Studio turns one product image into a professionally art-directed fashion campaign. The public landing feels like entering a private luxury set; the application behind it feels like the calm, precise creative console used by a fashion-production team. The prototype includes landing, Basic Studio, mock sign-in, checkout/credits, generation progress, result review, approval, delivery, projects, and account.

Avoid generic SaaS dashboards, purple/blue AI gradients, neon, cyberpunk, gaming UI, crypto cards, heavy glassmorphism, pill-shaped everything, busy shadows, playful motion, and decorative 3D objects. The visual system is fashion-editorial but contemporary: graphite tailoring, oxblood leather, warm stone paper, and muted brass.

## Required creative workflow

Basic Studio uses one continuous workspace with Product → Model → Lighting → Pose → Camera → Review. Camera is an explicit current product requirement and stays beside Lighting and Pose. Preserve Male Model 01, Female Model 01, exactly 8 compatible male lighting presets, exactly 6 compatible male pose presets, and existing model-specific Camera presets. Female Model 01 never receives male assets and shows the approved preparation empty state when compatible studio options are unavailable.

## Semantic color system

- `--canvas-dark: #11100F`; `--canvas-walnut: #1D1A18`; `--canvas-chocolate: #292522`.
- `--canvas-light: #EFEBE4`; `--surface-light: #F6F3ED`; `--surface-elevated: #FCFAF6`; `--surface-beige: #DED7CD`; `--surface-dark: #292522`.
- `--text-primary: #191817`; `--text-secondary: #68625D`; `--text-on-dark: #F8F5EF`; `--text-on-dark-muted: rgba(248,245,239,.72)`.
- `--brand-primary: #7A2E3E`; `--brand-primary-hover: #96394D`.
- `--accent-bronze: #9A7955`; `--accent-champagne: #D6C3A5`; `--accent-gold: #B79368`.
- `--border-subtle: rgba(43,37,33,.15)`; `--border-strong: rgba(43,37,33,.32)`; `--border-on-dark: rgba(248,245,239,.14)`.
- `--focus-ring: #B98962`.
- `--success: #526B56`; `--warning: #A36F32`; `--error: #994A43`; `--information: #596B72`.

Components use semantic CSS variables and never scatter literal theme colors.

## Typography

Use `next/font/google` with only Cormorant Garamond 500/600 for large editorial headings; IBM Plex Sans 400/500/600 for body, navigation and UI; IBM Plex Mono 500 sparingly for steps, statuses, metadata, and preset codes. Expose font variables and strong system fallbacks. The result should feel like a contemporary fashion publication paired with a precise production interface, never a traditional salon invitation. Use responsive `clamp()` display type, deliberate line breaks, readable mobile measure, and avoid excessive uppercase.

## Shape, spacing, and depth

- Spacing rhythm: 4, 8, 12, 16, 24, 32, 48, 64px.
- Radius: 0px for editorial sections, 2px for buttons/inputs, 4–6px for cards/dialogs; no bubbly radius language.
- Thin warm borders establish hierarchy; shadows are rare and warm.
- Interactive targets are at least 44px; primary controls 48–52px.
- Desktop content width is 92rem; application content can reach 100rem with 24–40px gutters.

## Navigation and shell

Marketing navigation overlays the scene with a compact dark-walnut gradient and lower-edge fade. On scroll it becomes slightly more opaque without layout shift. The application shell uses a solid dark header with wordmark, Projects, Account, mock credits, autosave status, and avatar. Mobile navigation is an accessible full-screen dark sheet with Escape close, focus handling, scroll lock, and 44px targets.

## Shared components

Create local reusable Button, IconButton, Card, StatusBadge, Stepper, Tabs, RadioCard, UploadSurface, Dialog, Sheet, Toast/StatusMessage, Progress, ImageFrame, SectionHeading, CurrentSetup, EmptyState, and Skeleton components. APIs use compact variants. Selection is shown through border, check/icon and text, never color alone. Focus uses the focus-ring token.

Model selection uses an interactive runway-style carousel. The active model appears large and centered in front of the client; previous/next controls and touch/trackpad horizontal gestures slide between models. The control exposes an accessible radio-group selection and a visible index. Do not reduce models to tiny static cards.

## Motion

Motion resembles a camera gliding through a set or an editorial page reveal: opacity, 4–16px translation, crossfades, subtle perspective, small image-scale changes, warm ambient light, and button feedback. Timing: 160–220ms interactions, 280–400ms transitions, 500–750ms reveals, 8–14s ambient effects. No bounce, elastic easing, rapid loops, pointer tilt, scroll hijacking, or large blur. Reduced motion disables parallax and ambient loops while keeping content visible.

## Accessibility and responsive behavior

Use semantic landmarks, logical headings, live statuses, correct radio/tab/dialog/sheet semantics, visible labels/errors, strong disabled states, keyboard parity, and sufficient contrast. Mobile has no horizontal overflow; previews stack above controls; steppers scroll horizontally; actions stick above the safe area; dialogs stay on-screen. Test 2048, 1440×900, 1366×768, 1024, 768, 390×844, and 320px.

## Image and performance rules

The supplied studio/parquet composite is authoritative landing imagery. Preserve lamp, light, chair, painting, herringbone floor, alignment, and seamless continuity. Use `next/image`; only the hero is high priority. Below-fold media is lazy. Preset grids use thumbnails and only the selected large preview. Keep static content server-rendered, client islands small, dependencies minimal, and studio workflow code off the landing route.

Use ONLY the fonts, colors, spacing, component styles, and behavior defined here. Do not introduce other fonts, theme colors, rounded visual language, or unsupported features.
