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
RHYTHM_OWNER_EMAIL=the only email allowed to sign in
```

## Database setup

Apply migrations in Supabase SQL editor or with the Supabase CLI:

```powershell
supabase db push
```

The main migration creates `users`, `habits`, `habit_logs`, `daily_checkins`, `sleep_logs`, `health_metrics`, `workout_logs`, `schedule_templates`, `schedule_entries`, `goals`, and `weekly_reviews`.

Every user-owned table has RLS policies using `auth.uid()`, so users can manage only their own records. A trigger creates a `public.users` profile when a Supabase auth user is created.

## Seed data

Local demo mode creates fictional records automatically. For a disposable Supabase project, you can run `supabase/seed.sql` manually after signing in once. Do not run the seed against the account you will use for personal tracking.

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

The recommended long-term setup is Vercel for the Next.js app and Supabase for authentication and private PostgreSQL storage.

1. Create a Supabase project and keep its database password in a password manager.
2. Open the Supabase SQL editor and run `supabase/migrations/001_initial_schema.sql`.
3. In Supabase project settings, copy the project URL and publishable/anon key.
4. Import this GitHub repository into Vercel.
5. Add these Vercel environment variables for Production, Preview, and Development:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your publishable or anon key
NEXT_PUBLIC_SITE_URL=https://your-rhythm-domain.vercel.app
RHYTHM_OWNER_EMAIL=your-email@example.com
```

6. In Supabase Authentication URL Configuration, set:

```text
Site URL: https://your-rhythm-domain.vercel.app
Redirect URL: https://your-rhythm-domain.vercel.app/auth/callback
```

7. Deploy, open the deployed login page, and send the first magic link to the exact `RHYTHM_OWNER_EMAIL`.
8. After the owner account exists, disable new-user sign-ups in Supabase Authentication settings. Existing-user magic links will continue to work.

The owner email check in the app and Supabase row-level security provide separate protections. The anon key is designed to be public; never place a Supabase service-role key in this app or in a `NEXT_PUBLIC_` variable.

## Moving from demo mode

Demo data lives only in `.demo-data.json` on the local computer. It is intentionally not uploaded automatically because it includes fictional seed records and may contain personal entries. Start the production account with a clean history, then enter the current day through the Today page.

Once real Supabase variables are present, demo mode turns off automatically:

- Login uses a magic link sent to the owner email.
- Check-ins, habits, schedules, goals, reviews, and settings are stored in Supabase.
- Refreshing, restarting, or changing devices does not remove cloud records.
- RLS restricts every query to the authenticated user's records.

## Production checklist

Before using rhythm as the primary tracker:

```powershell
npm run lint
npm run typecheck
npm test
