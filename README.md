# DayTrack

A modern daily habit and event tracker built with React, Vite, and Supabase.

## Features

- **Email-based login** with Supabase Auth (demo mode with localStorage when not configured)
- **Habits & events** with groups, colors, emoji icons, flexible schedules
- **Three-state tracking** — Done / Skipped / Missed with grace days
- **Today view** — one-tap check-offs with progress ring and confetti
- **Calendar view** — color-coded month grid
- **Dashboard** — charts, heatmap, streaks, mood correlations, weekly review
- **Mood logging** — 5-point scale with habit insights
- **Journal** — daily reflections linked to mood and habits
- **Per-habit detail** — streaks, strength score, individual calendar
- **Export/import** — JSON and CSV data portability
- **PWA** — installable, works offline after first load
- **Themes** — light, dark, ocean, sunset

## Quick Start

```bash
cd daytrack
npm install
cp .env.example .env   # optional — app runs in demo mode without this
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). In demo mode, any email/password works.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Copy your project URL and anon key to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=http://localhost:5173
```

4. In Supabase Auth settings, add redirect URLs for local and production

## Deploy

```bash
npm run build
```

Deploy the `dist/` folder to Vercel or Netlify. Set the same environment variables in your hosting dashboard.

## Tech Stack

- React 19 + Vite + TypeScript
- React Router v7 + TanStack Query
- Tailwind CSS + shadcn-style components
- Recharts + custom heatmap
- Supabase (Auth + PostgreSQL + RLS)

## Project Structure

```
src/
├── pages/          Route pages (Today, Calendar, Dashboard, etc.)
├── components/     UI, habits, dashboard, calendar, mood
├── hooks/          Data fetching hooks
├── contexts/       Auth provider
├── lib/            Supabase, analytics, validators, local store
└── types/          TypeScript types
```
