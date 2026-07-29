# rhythm

rhythm is a personal habit, health, meal, and schedule-tracking web app. Each person receives a private workspace for routine consistency, sleep, workouts, yoga, meditation, walking, hydration, nutrition consistency, planned and actual calories, weight trends, mood, energy, study sessions, goals, weekly reviews, and planned-versus-actual schedule adherence.

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

The repository includes a project-local Node runtime for Windows. In VS Code, use **Terminal > Run Task > Rhythm: Start local app**. The task keeps the server in a dedicated terminal and avoids depending on a global Node installation.

Alternatively, install Node.js 20 or newer and run:

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
```

## Database setup

Apply migrations in Supabase SQL editor or with the Supabase CLI:

```powershell
supabase db push
```

Run migrations in filename order. `001_initial_schema.sql` creates the profile, habit, check-in, health, schedule, goal, and review tables. `002_weekly_menu.sql` adds `weekly_menu_items` and its meal-slot enum. `003_security_hardening.sql` enforces same-user habit logs and adds indexes for user-scoped dashboard queries.

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
- Next.js server components and server actions are the application backend. `src/lib/supabase/server.ts` creates the cookie-aware Supabase client used by that backend.
- Supabase Auth owns accounts and sessions. Supabase PostgreSQL is the durable data store; records are associated with the authenticated user's UUID.
- Zod schemas live in `src/lib/validations` and validate server action input.
- Calculation utilities live in `src/lib/metrics` so they can be unit tested without React or Supabase.
- Weight is shown as one health trend, not as the primary success measure. Routine, recovery, movement, nutrition, and career progress stay separate.

## Deployment

For a public, multi-user release, the recommended pairing is **Vercel + Supabase**. Vercel runs the Next.js application and creates preview deployments for pull requests; Supabase provides authentication and PostgreSQL. Codex Sites remains supported by the repository's OpenNext Cloudflare build, but its access control should remain private until Supabase is configured.

### Supabase

1. Create a Supabase project and keep its database password in a password manager.
2. Open the Supabase SQL editor and run `supabase/migrations/001_initial_schema.sql`, `002_weekly_menu.sql`, and `003_security_hardening.sql` in that order.
3. In Supabase project settings, copy the project URL and publishable/anon key.
4. Add these variables to the chosen host's production environment:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your publishable or anon key
SITE_URL=https://your-production-domain.example
```

5. In Supabase Authentication URL Configuration, set:

```text
Site URL: https://your-production-domain.example
Redirect URL: https://your-production-domain.example/auth/callback
```

6. Configure custom SMTP before inviting many people. Supabase's default mail sender is intended for initial testing and has a low rate limit.
7. Configure Auth rate limits and CAPTCHA, require MFA for project administrators, and enable SSL enforcement.
8. Deploy and create two test accounts. Confirm that each account can see only its own records.

The publishable/anon key is designed for client-facing applications, but Rhythm keeps it server-side because no browser component needs direct database access. Never configure a Supabase service-role key in this application. RLS is the data-isolation boundary and must remain enabled for every user-owned table.

### Vercel

1. Import the GitHub repository into Vercel.
2. Add the three environment variables above to Production and Preview.
3. Set the production domain, then update `SITE_URL` and Supabase's allowed URLs to match it.
4. Deploy from `main` only after the feature PR is approved and merged.

### Codex Sites

The existing Sites project uses an OpenNext Cloudflare Worker build. On Windows, `npm run build` performs the normal Next.js validation build; on the Linux deployment host it also creates the server-capable `dist` artifact. Keep Sites access restricted until the Supabase environment is connected and tested.

## Moving from demo mode

Demo data lives only in `.demo-data.json` on the local computer. It is intentionally not uploaded because it may contain personal entries. Production never falls back to this file: without Supabase configuration, the deployed login page pauses tracking and displays a database setup message.

Once real Supabase variables are present, demo mode turns off automatically:

- Login uses a magic link and creates a private workspace for each authenticated user.
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

Then verify account isolation with two test users, complete a check-in, refresh the page, and confirm the entry remains. Add a privacy notice and retention/deletion policy before inviting people to enter health information.
