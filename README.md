# rhythm

rhythm is a private habit, health, and schedule-tracking web app for one person. It tracks routine consistency, sleep, workouts, yoga, meditation, walking, hydration, nutrition consistency, weight trends, mood, energy, study sessions, goals, weekly reviews, and planned-versus-actual schedule adherence.

No AI model is integrated yet. Current insights are deterministic summaries from your own logs.

## Implemented workflows

- Supabase magic-link authentication
- Responsive desktop and mobile app shell
- Today daily check-in with Zod validation and Supabase persistence
- Dashboard reading check-ins, custom habits, and schedule entries
- Habits page to create habits, mark today complete, and pause habits
- Schedule page to create planned blocks and save actual completion
- Health page with recent body signals and Recharts trends
- Insights page with non-AI summaries, goals, and weekly reviews
- Settings page backed by the `users` profile table
- Loading, empty, validation, and error states
- Row-level security for user-owned data
- Unit tests for calculation utilities and a Playwright check-in flow test

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

The main migration creates `users`, `habits`, `habit_logs`, `daily_checkins`, `sleep_logs`, `health_metrics`, `workout_logs`, `schedule_templates`, `schedule_entries`, `goals`, and `weekly_reviews`.

Every user-owned table has RLS policies using `auth.uid()`, so users can manage only their own records. A trigger creates a `public.users` profile when a Supabase auth user is created.

## Seed data

After signing in once, run `supabase/migrations/002_seed_demo_data.sql` to create thirty fictional daily check-ins for the first profile user.

## Testing

```powershell
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

The Playwright test requires an authenticated Supabase browser state. Save it as a storage state file and set `PLAYWRIGHT_STORAGE_STATE`, or add a test setup step that signs in before visiting `/today`.

## Architecture decisions

- App routes live under `src/app` with readable folder names: `dashboard`, `today`, `habits`, `schedule`, `health`, `insights`, `settings`, and `login`.
- Database access is isolated in `src/lib/db`; UI components call typed functions or server actions, not Supabase directly.
- Zod schemas live in `src/lib/validations` and validate server action input.
- Calculation utilities live in `src/lib/metrics` so they can be unit tested without React or Supabase.
- Weight is shown as one health trend, not as the primary success measure. Routine, recovery, movement, nutrition, and career progress stay separate.

## Deployment

Deploy to Vercel, add the same Supabase environment variables, and configure Supabase auth redirect URLs to include your deployed `/auth/callback` URL.
