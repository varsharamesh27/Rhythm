# rhythm

rhythm is a private habit, health, meal, and schedule-tracking web app for one person. It tracks routine consistency, sleep, workouts, yoga, meditation, walking, hydration, nutrition consistency, planned and actual calories, weight trends, mood, energy, study sessions, goals, weekly reviews, and planned-versus-actual schedule adherence.

No AI model is integrated yet. Current insights are deterministic summaries from your own logs.

## Implemented workflows

- Supabase magic-link authentication
- Responsive desktop and mobile app shell
- Today daily check-in with Zod validation and Supabase persistence
- Dashboard reading check-ins, custom habits, and schedule entries
- Habits page to create habits, mark today complete, and pause habits
- Schedule page to create planned blocks and save actual completion
- Personal routine preset that adds the daily routine without duplicating existing blocks
- Weekly Menu for Monday-through-Sunday meal planning and planned-versus-actual calories
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
SUPABASE_URL=your Supabase project URL
SUPABASE_ANON_KEY=your Supabase publishable or anon key
SITE_URL=http://127.0.0.1:3000
RHYTHM_OWNER_EMAIL=the only email allowed to sign in
```

## Database setup

Apply migrations in Supabase SQL editor or with the Supabase CLI:

```powershell
supabase db push
```

Run migrations in filename order. `001_initial_schema.sql` creates the profile, habit, check-in, health, schedule, goal, and review tables. `002_weekly_menu.sql` adds `weekly_menu_items` and its meal-slot enum. `003_security_hardening.sql` enforces same-owner habit logs and adds indexes for owner-scoped dashboard queries.

Every user-owned table has RLS policies using `auth.uid()`, so users can manage only their own records. A trigger creates a `public.users` profile when a Supabase auth user is created.

## Seed data

Local demo mode now starts empty so personal tracking begins with a clean history. For a disposable Supabase project, you can run `supabase/seed.sql` manually after signing in once. Do not run the seed against the account you will use for personal tracking.

## Testing

```powershell
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

Playwright starts the application in local demo mode, resets the disposable local store, and covers theme switching, sign-out, daily check-in, weekly menu, and routine workflows. It never writes the local demo data to Supabase.

## Architecture decisions

- App routes live under `src/app` with readable folder names: `dashboard`, `today`, `habits`, `schedule`, `health`, `insights`, `settings`, and `login`.
- Database access is isolated in `src/lib/db`; UI components call typed functions or server actions, not Supabase directly.
- Zod schemas live in `src/lib/validations` and validate server action input.
- Calculation utilities live in `src/lib/metrics` so they can be unit tested without React or Supabase.
- Weight is shown as one health trend, not as the primary success measure. Routine, recovery, movement, nutrition, and career progress stay separate.

## Deployment

Rhythm is deployed privately with Codex Sites and uses an OpenNext Cloudflare Worker build. On Windows, `npm run build` performs the normal Next.js validation build. On the Linux deployment host it additionally creates a server-capable `dist` artifact from `.open-next`.

Supabase provides durable PostgreSQL storage and magic-link authentication:

1. Create a Supabase project and keep its database password in a password manager.
2. Open the Supabase SQL editor and run `supabase/migrations/001_initial_schema.sql`, `002_weekly_menu.sql`, and `003_security_hardening.sql` in that order.
3. In Supabase project settings, copy the project URL and publishable/anon key.
4. Add these variables to the Codex Sites production environment:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your publishable or anon key
SITE_URL=https://rhythm-personal-tracker.varsha2709.chatgpt.site
RHYTHM_OWNER_EMAIL=your-email@example.com
```

5. In Supabase Authentication URL Configuration, set:

```text
Site URL: https://rhythm-personal-tracker.varsha2709.chatgpt.site
Redirect URL: https://rhythm-personal-tracker.varsha2709.chatgpt.site/auth/callback
```

6. Save a new Sites version and deploy it so the environment revision is applied.
7. Open the deployed login page and send the first magic link to the exact `RHYTHM_OWNER_EMAIL`.
8. After the owner account exists, disable new-user sign-ups in Supabase Authentication settings. Existing-user magic links will continue to work.

The owner email check in the app and Supabase row-level security provide separate protections. The publishable/anon key is safe for client use, but Rhythm keeps it server-side because no browser component needs direct database access. Never configure a Supabase service-role key.

Codex Sites access must remain `custom` with only the owner account allowed. This outer access gate is separate from the application login and Supabase RLS.

## Moving from demo mode

Demo data lives only in `.demo-data.json` on the local computer. It is intentionally not uploaded automatically because it may contain personal entries. Production never falls back to this file: without Supabase configuration, the deployed login page pauses tracking and displays a database setup message.

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
npm run test:e2e
npm run build
```

Then verify the production site is still owner-only, complete a test check-in, refresh the page, and confirm the entry remains before recording personal health information.
