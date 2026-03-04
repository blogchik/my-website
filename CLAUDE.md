# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimal landing page for "Reboot" — built with Next.js (App Router), React, TypeScript, and Tailwind CSS v4. The product spec lives in `CLAUD.md` (the requirements doc). Always consult it for exact copy, styling values, and acceptance criteria.

## Commands

```bash
# Local development
pnpm dev             # Start dev server with Turbopack (localhost:3000)
pnpm build           # Production build
pnpm lint            # ESLint

# Docker
docker compose up    # Dev server with hot reload (localhost:3000)
docker compose build # Rebuild image after dependency changes
```

## Architecture

- **Next.js App Router** — pages in `app/`, no `pages/` directory
- **Tailwind CSS v4** — config via `@theme` in `app/globals.css`, PostCSS plugin `@tailwindcss/postcss`
- **No external UI libraries** — all components are hand-built with Tailwind utilities
- Core files:
  - `app/layout.tsx` — root layout with Montserrat (Google Fonts) + Gatuzo (local font) setup
  - `app/page.tsx` — root landing page (hero section only)
  - `components/Navbar.tsx` — top navbar with desktop links + mobile hamburger (client component)
  - `components/GlowButton.tsx` — reusable CTA button with multicolor gradient glow shadow

## Fonts

- **Gatuzo** (headings) — local font files in `public/fonts/` (Gatuzo-Regular.woff2, Gatuzo-SemiBold.woff2, Gatuzo-Bold.woff2). CSS class: `font-heading`
- **Montserrat** (body) — loaded via `next/font/google`. CSS class: `font-body`
- If Gatuzo files are not present, Montserrat is used as fallback

## Key Design Constraints

- Background is always pure white (`#FFFFFF`), no decorative backgrounds
- Page is hero-only: navbar + centered hero content, no footer
- CTA button glow is the signature element — a blurred gradient underlay (`from-amber-400 via-orange-300 to-violet-500`) positioned beneath a black pill button
- All content must be centered and minimal; do not add extra sections or cards
- Responsive: mobile (<640px) collapses navbar to hamburger, text scales down, no horizontal overflow

## Tailwind Conventions

- Container: `max-w-6xl mx-auto px-4 sm:px-6`
- Headings: `font-heading tracking-tight`, weight 600–700
- Subtitle text: `text-zinc-500`, max-width ~520–600px
- Transitions: `transition-all duration-200 ease-out`
- Focus states: `focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2`

## Docker

- `docker-compose.yml` targets the `dev` stage of the multi-stage `Dockerfile`
- Source files are volume-mounted for hot reload; `node_modules` stays in the container
- Production build uses `output: "standalone"` (configured in `next.config.ts`)
