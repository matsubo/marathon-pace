# AGENT.md

## Project Overview

Marathon Pace Chart — a React web app that calculates and displays marathon split times. Users set a target finish time via slider and get a detailed pace chart for race day checkpoints.

## Tech Stack

- **Runtime**: React 19, TypeScript 5, React Router 6
- **Build**: Vite 5, Tailwind CSS 3, PostCSS, Autoprefixer
- **Test**: Vitest, Testing Library (React, user-event, jest-dom)
- **Lint**: ESLint 9 with TypeScript ESLint and React plugins
- **Package Manager**: pnpm 9
- **Deploy**: GitHub Pages via GitHub Actions (push to `main`)

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Dev server (localhost:5173)
pnpm run build        # TypeScript check + Vite production build
pnpm run preview      # Preview production build
pnpm run typecheck    # tsc --noEmit
pnpm run lint         # ESLint src/
pnpm run test         # Vitest run (single pass)
pnpm run test:watch   # Vitest watch mode
```

## Project Structure

```
src/
├── App.tsx                    # Main application component (UI, state, logic)
├── main.tsx                   # Entry point, React Router setup
├── index.css                  # Tailwind directives, print styles, slider styles
├── components/
│   └── Icons.tsx              # SVG icon components
├── hooks/
│   ├── useLocalStorage.ts     # Generic localStorage persistence hook
│   └── useLocalStorage.test.ts
├── utils/
│   ├── constants.ts           # Marathon distances, presets, checkpoints, formatters
│   ├── constants.test.ts
│   ├── translations.ts        # i18n strings (en, ja, zh, es, hi)
│   └── translations.test.ts
└── test/
    └── setup.ts               # Test environment setup (jest-dom)
```

## Architecture

- **Single-page app** with React Router for URL-based state sharing
- **State flow**: URL query param (`?target_time=3-30-00`) > localStorage > default (4:00:00)
- **Localization**: Type-safe translation keys across 5 languages with browser detection fallback
- **Styling**: Tailwind utility classes with dark mode toggle (CSS class strategy)
- **Image generation**: Canvas API produces 1200x630 pace card PNGs for download/sharing

## Key Constants

- Marathon: 42.195 km / 26.2188 mi
- Target time range: 120–420 minutes (2:00:00–7:00:00)
- Checkpoints: every 5 km (10 splits) or ~4 mi (6 splits)
- Preset buttons: 2:30, 2:50, 3:00, 3:30, 4:00, 4:30, 5:00, 6:00

## Testing

Tests live alongside source files (`*.test.ts`). Run with `pnpm run test`. Current coverage includes:
- Utility function tests (formatTime, formatPace, parseTimeString, timeToUrlParam)
- Translation completeness verification (all keys present in all languages)
- Custom hook tests (useLocalStorage)

Test config: `vitest.config.ts` — jsdom environment, globals enabled.

## Design System

### Aesthetic: "Track Surface"

Inspired by the vermillion polyurethane of world-class running tracks, race timing boards, and Japanese sports editorial design. The design prioritizes athletic energy, readability, and a scoreboard feel.

### Typography

Loaded via Google Fonts in `index.html`:

| Role | Font | Usage |
|------|------|-------|
| Display | **Bebas Neue** (`font-display`) | Time display, pace values, table split times, section headings |
| Body | **DM Sans** (`font-sans`) | All UI text, labels, buttons, descriptions |

Tailwind classes: `font-display` for display, `font-sans` (default) for body.

### Color Palette

Defined in `tailwind.config.js` under `theme.extend.colors`:

**Track (accent)**:
| Token | Hex | Usage |
|-------|-----|-------|
| `track-50` | `#FEF2EF` | Highlighted table row background (light) |
| `track-400` | `#E8613D` | Accent text (dark mode) |
| `track-500` | `#D94F30` | Primary accent — buttons, slider, active presets, share CTA |
| `track-600` | `#C04229` | Hover states |
| `track-700` | `#A93B24` | Active/pressed states |
| `track-900` | `#5C2115` | Highlighted row tint (dark mode, with opacity) |

**Surface (backgrounds)**:
| Token | Hex | Usage |
|-------|-----|-------|
| `surface-light` | `#FAF7F4` | Page background (light mode) — warm parchment |
| `surface` | `#FFFFFF` | Card background (light mode) |
| `surface-dark` | `#111318` | Page background (dark mode) |
| `surface-dark-card` | `#1A1D27` | Card background (dark mode) |
| `surface-dark-card-alt` | `#1F2230` | Alternate card / table header (dark mode) |

**Semantic colors** use Tailwind's built-in `stone` palette for text:
- Light text: `stone-900`, `stone-500`, `stone-400`
- Dark text: `stone-100`, `stone-400`, `stone-500`

### Theme System

The app uses a `Theme` interface in `App.tsx` with a conditional object (`darkMode ? darkTheme : lightTheme`). Each theme key maps to Tailwind class strings. The `dark` class is toggled on `<html>` for CSS-level dark styles (slider thumb, row-highlight pseudo-element).

### Visual Elements

**Track pattern** (`index.css` `.track-pattern`): Subtle 45-degree repeating diagonal lines across the page background, evoking running track lane markings.

**Row highlight** (`index.css` `.row-highlight`): A `::before` pseudo-element adds a 3px vermillion left border to Half and Finish rows in the pace table.

**Slider**: Custom-styled range input with vermillion fill, white-bordered circular thumb, and a glowing `box-shadow` ring. Dark mode adjusts thumb border and glow color.

**Modals**: `backdrop-blur-sm` overlay with spring-curve slide-up animation (`cubic-bezier(0.16, 1, 0.3, 1)`).

### Layout

- Max width: `max-w-2xl` (672px), centered
- Card corners: `rounded-2xl`
- Spacing: generous padding (`p-8 sm:p-10` for main card)
- Preset buttons: `rounded-lg` rectangles (not pills)
- Unit toggle: segmented control inside a container with `rounded-lg p-1`

### Share Image (Canvas)

Generated via Canvas API (1200x630). Matches the design system:
- Track-gradient background (`#D94F30` → `#A93B24`) with diagonal lane lines
- White rounded card, Bebas Neue for time/pace, DM Sans for labels
- Pace box with `#FEF2EF` background tint

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) auto-deploys on push to `main`. Base path is detected automatically for project pages vs user/org pages.
