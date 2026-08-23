# Theme context

## Compact token summary

The current landing uses ink `#0c0907`, espresso `#1a100b`, umber `#3a2115`, ivory `#f3e7d5`, parchment `#cdbba4`, and gold `#c49a65`, with system serif headings and Arial/Helvetica UI text. Layout max-width is 92rem with 1–1.5rem mobile gutters, square editorial controls, thin borders, 44–50px targets, and breakpoints at 699px, 767px, 980px, and 1199px.

The approved system in `.superdesign/design-system.md` replaces these local values with semantic root tokens, Bodoni Moda / Manrope / DM Mono via `next/font`, focus ring `#C99A68`, compact 0–6px radii, fine warm borders, and restrained shadows.

## Raw global CSS — `src/app/globals.css`

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: #fff;
  color-scheme: light;
}

body {
  min-height: 100svh;
  margin: 0;
  background: #fff;
  color: #171717;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.5;
}

:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

body > main {
  padding: 2rem;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
