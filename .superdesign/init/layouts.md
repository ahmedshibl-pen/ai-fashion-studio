# Shared layouts

## Root layout — `src/app/layout.tsx`

The required Next.js root layout provides metadata and the shared CSS foundation.

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Fashion Studio — From Product Image to Fashion Campaign",
  description: "Choose the model, lighting, and pose. Build campaign-ready fashion imagery inside one intelligent studio.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
```

## Marketing header — `src/components/landing/site-header.tsx`

Full source is included in `components.md`. It is rendered by `/` and supplies the responsive overlay navigation.
