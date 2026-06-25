# Lumen — Aesthetic Clock

A minimal, highly customizable web app with three modes: a 24-hour **clock**, a **timer**, and a **stopwatch**. Built to make time feel calm and beautiful.

## Features

- **Clock** — live time with 12h/24h, optional seconds, and date; three display layouts (Digital, Minimal, Stacked).
- **Timer** — circular progress ring, quick presets, deadline-based countdown (accurate even when the tab is backgrounded), and a pleasant completion chime.
- **Stopwatch** — centisecond precision with laps, plus fastest/slowest lap highlighting.
- **Deep customization** — color themes (System, Midnight, Daylight, Mocha, Nord, Rose, Forest), accent colors, fonts (Display, Sans, Mono, Serif), and backgrounds (Solid, Gradient, Animated).
- **Persistent** — every preference is saved to `localStorage` and restored on reload.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand) (with `persist`) for settings
- [Framer Motion](https://www.framer.com/motion/) for transitions

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project structure

```
app/                 Next.js app router (layout, page, global styles)
components/          ClockShell, ModeSwitcher, SettingsPanel, icons
components/views/    ClockView, TimerView, StopwatchView
hooks/              useNow tick + system theme preference
lib/                presets (themes/accents/fonts/backgrounds) + time helpers
store/              Zustand settings store (persisted)
```
