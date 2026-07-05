# rhythm

rhythm is a private habit, health, and schedule-tracking web app for one person. The first vertical slice includes Supabase authentication, a Today check-in form, database persistence, and a basic dashboard that reads submitted check-in data.

## What is implemented now

- Next.js App Router with strict TypeScript
- Tailwind CSS and shadcn-style local UI primitives
- Supabase auth using magic links
- Supabase PostgreSQL schema with row-level security
- Today check-in form with Zod validation
- Dashboard metrics and Recharts trends from daily check-ins
- App shell with desktop and mobile navigation
- Placeholder pages for Habits, Schedule, Health, Insights, and Settings
- Unit tests for metric utilities
- Playwright test for the daily check-in flow

## Local setup

Install Node.js 20 or newer, then run:

```powershell
npm install
copy .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3000`.

## Environment variables

```text
NEXT_PUBLIC_SUPABASE_URL=your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your Supabase anon key
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

## Database setup

Apply migrations in Supabase SQL editor or with the Supabase CLI:

```powershell
supabase db push
```

The main migration creates:

- `users`
- `habits`
- `habit_logs`
- `daily_checkins`
- `sleep_logs`
- `health_metrics`
- `workout_logs`
- `schedule_templates`
- `schedule_entries`
- `goals`
- `weekly_reviews`

Every user-owned table has row-level security policies using `auth.uid()`, so users can manage only their own records. A trigger creates a `public.users` profile when a Supabase auth user is created.

## Seed data

After signing in once, run `supabase/migrations/002_seed_demo_data.sql` to create thirty fictional daily check-ins for the first profile user. The seed covers sleep, workouts, yoga, meditation, walking, hydration, nutrition consistency, optional weight, mood, energy, and study sessions.

## Testing

```powershell
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

The Playwright test requires an authenticated Supabase browser state. Save it as a storage state file and set it in Playwright config or sign in during test setup before visiting `/today`.

## Architecture decisions

- UI routes stay under `src/app`; reusable UI is under `src/components`.
- Supabase database access is isolated in `src/lib/db` instead of being embedded in UI components.
- Zod schemas live in `src/lib/validations` and are reused by server actions.
- Metric calculations live in `src/lib/metrics` so they are testable without React or Supabase.
- Weight is shown as one health trend, not as the primary success signal. Routine, recovery, movement, nutrition, and career progress are separated in wording and metrics.

## Deployment

Deploy to Vercel, add the same Supabase environment variables, and configure the Supabase auth redirect URL to include your deployed `/auth/callback` URL.
