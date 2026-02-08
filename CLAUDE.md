# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # Install dependencies
pnpm run dev              # Dev server (localhost:5173)
pnpm run build            # TypeScript check + Vite production build
pnpm run preview          # Preview production build
pnpm run typecheck        # tsc --noEmit
pnpm run lint             # ESLint src/
pnpm run test             # Vitest single run
pnpm run test:watch       # Vitest watch mode
```

## Architecture

Single-page React app that calculates marathon split times from a slider-based target finish time. Deployed to GitHub Pages via GitHub Actions on push to `main`.

### State Flow

URL query param (`?target_time=3-30-00`) takes precedence over localStorage, which takes precedence over the default (4:00:00 / 240 minutes). When the slider changes, both localStorage and the URL query param are updated. Language is detected from the browser on first visit, then persisted to localStorage.

### Key Files

- **`src/App.tsx`** — Main component containing all UI, state management, theme system, pace calculation, Canvas-based share image generation, and social sharing. This is the largest file (~660 lines) and the core of the app.
- **`src/main.tsx`** — Entry point with React Router. Routes: `/og-image` renders `OgImage` component; `*` renders `App`.
- **`src/utils/constants.ts`** — Marathon distances, checkpoint definitions (km/mi), time presets, and formatting functions (`formatTime`, `formatPace`, `parseTimeString`, `timeToUrlParam`).
- **`src/utils/translations.ts`** — Type-safe i18n for 5 languages (en, ja, zh, es, hi). `TranslationKey` union type enforces completeness.
- **`src/hooks/useLocalStorage.ts`** — Generic localStorage persistence hook + `useLanguage` hook with browser language detection.
- **`src/components/Icons.tsx`** — SVG icon components.
- **`src/OgImage.tsx`** — Dedicated route for OG image rendering (screenshot target at `/og-image`).

### Theme System

Dark/light mode uses a `Theme` interface in `App.tsx` that maps semantic keys to Tailwind class strings. The `dark` CSS class is toggled on `<html>` for CSS-level styles (slider, row highlights).

### Design System

- Fonts: **Bebas Neue** (`font-display`) for times/headings, **DM Sans** (`font-sans`) for body text (loaded via Google Fonts in `index.html`)
- Colors: `track-*` (vermillion accent palette) and `surface-*` (background palette) defined in `tailwind.config.js`
- Track pattern: diagonal stripe background in `index.css`

### Testing

Tests are co-located with source files (`*.test.ts`). Vitest with jsdom environment and globals enabled. Setup file at `src/test/setup.ts` imports `@testing-library/jest-dom`.

### Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) auto-deploys on push to `main`. Base path is set via `BASE_PATH` env var — automatically configured for GitHub Pages project pages vs user/org pages.
