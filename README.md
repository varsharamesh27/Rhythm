# rhythm

rhythm is a personal habit, health, meal, and schedule-tracking web app. Each person receives a private workspace for routine consistency, sleep, workouts, yoga, meditation, walking, hydration, nutrition consistency, planned and actual calories, weight trends, mood, energy, study sessions, goals, weekly reviews, and planned-versus-actual schedule adherence.

No AI model is integrated yet. Current insights are deterministic summaries from your own logs.

## Implemented workflows

- Supabase email/password signup, login, persistent sessions, and password recovery
- Responsive desktop and mobile app shell
- Today daily check-in with Zod validation and Supabase persistence
- Dashboard reading check-ins, custom habits, and schedule entries
- Habits page to create habits, mark today complete, and pause habits
- Schedule page with a reusable ideal schedule and separate dated planned-versus-actual entries
- Per-user ideal-schedule editing with every-day and weekday-specific blocks
- Weekly Menu for Monday-through-Sunday meal planning and planned-versus-actual calories
- Health page with recent body signals and Recharts trends
- Insights page with non-AI summaries, goals, and weekly reviews
- Settings page backed by the `users` profile table
- Personalized workspace identity that uses each member's chosen name
- First-name and last-name registration; names are never derived from email addresses
- Private Owner hub for the person building and operating Rhythm
- Loading, empty, validation, and error states
- Row-level security for user-owned data
- Unit tests for calculation utilities and a Playwright check-in flow test

## Local setup

The repository includes a project-local Node runtime for Windows. In VS Code, use **Terminal > Run Task > Rhythm: Start local app**. The task keeps the server in a dedicated terminal and avoids depending on a global Node installation. It uses `127.0.0.1`, matching the local URL used by Supabase email links.

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

Run migrations in filename order. `001_initial_schema.sql` creates the profile, habit, check-in, health, schedule, goal, and review tables. `002_weekly_menu.sql` adds `weekly_menu_items` and its meal-slot enum. `003_security_hardening.sql` enforces same-user habit logs and adds indexes for user-scoped dashboard queries. `004_multi_item_weekly_menu.sql` allows multiple food items per meal and adds quantity, unit, and per-unit calorie fields. `005_owner_workspace.sql` adds the protected Owner workspace role. `006_profile_names.sql` stores intentional first and last names for profile personalization.

Every user-owned table has RLS policies using `auth.uid()`, so users can manage only their own records. A trigger creates a `public.users` profile when a Supabase auth user is created.

### Profile names

New accounts must enter a first name and last name during registration. Rhythm stores those fields and uses only the first name for workspace greetings. It never creates a name from an email address.

For an existing account, apply `006_profile_names.sql`, sign in, open **Your Rhythm**, and save your name there. Your name remains in your private Supabase profile rather than in this repository.

### Make your account the Owner

After signing in with the account that should operate Rhythm, open the Supabase SQL editor and run:

```sql
select id, email from auth.users;

update public.users
set workspace_role = 'owner'
where id = 'paste-your-auth-user-id-here';
```

Refresh Rhythm. The navigation will show **Owner hub**, and your chosen name will appear across the workspace. The Owner role is intentionally personal: it does not allow reading another person's health, habit, schedule, meal, or note data.

## Seed data

Local demo mode now starts empty so personal tracking begins with a clean history. For a disposable Supabase project, you can run `supabase/seed.sql` manually after signing in once. Do not run the seed against the account you will use for personal tracking.

## Testing

```powershell
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

Playwright starts a separate application server on port `3100`, resets `.playwright-demo-data.json`, and covers theme switching, sign-out, daily check-in, weekly menu, and routine workflows. Tests never read or write the owner's `.demo-data.json` and never write to Supabase.

## Architecture decisions

- App routes live under `src/app` with readable folder names: `dashboard`, `today`, `habits`, `schedule`, `health`, `insights`, `settings`, `owner`, and `login`.
- Database access is isolated in `src/lib/db`; UI components call typed functions or server actions, not Supabase directly.
- Next.js server components and server actions are the application backend. `src/lib/supabase/server.ts` creates the cookie-aware Supabase client used by that backend.
- Supabase Auth owns accounts and sessions. Supabase PostgreSQL is the durable data store; records are associated with the authenticated user's UUID.
- Supabase stores password hashes; Rhythm never stores or retrieves a user's plain-text password. Forgotten passwords are replaced through the recovery flow.
- `src/lib/auth-urls.ts` creates every account callback and redirect from one canonical `SITE_URL`. It rejects external `next` destinations and requires HTTPS in production.
- `schedule_templates.user_id` stores each account's editable ideal routine. Copying that account's relevant every-day or weekday blocks creates dated `schedule_entries` with the same `user_id`; recording actual times never changes the ideal template or past days.
- Personal schedules are never seeded globally. A new account begins with no ideal blocks and creates its own. RLS checks `auth.uid()` on both schedule tables, so one account cannot read or modify another account's schedule.
- Zod schemas live in `src/lib/validations` and validate server action input.
- Calculation utilities live in `src/lib/metrics` so they can be unit tested without React or Supabase.
- Weight is shown as one health trend, not as the primary success measure. Routine, recovery, movement, nutrition, and career progress stay separate.
- `users.workspace_role` supports a protected Owner workspace identity. It is assigned only from the database administrator context and does not bypass the existing per-user RLS policies.

## Deployment

For a public, multi-user release, the recommended pairing is **Vercel + Supabase**. Vercel runs the Next.js application and creates preview deployments for pull requests; Supabase provides authentication and PostgreSQL. Codex Sites remains supported by the repository's OpenNext Cloudflare build, but its access control should remain private until Supabase is configured.

### Supabase

1. Create a Supabase project and keep its database password in a password manager.
2. Open the Supabase SQL editor and run every file in `supabase/migrations` in filename order, from `001_initial_schema.sql` through `006_profile_names.sql`.
3. In Supabase project settings, copy the project URL and publishable/anon key.
4. Add these variables to the chosen host's production environment:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your publishable or anon key
SITE_URL=https://your-production-domain.example
```

5. For local development, open **Authentication > URL Configuration** and set these exact values:

```text
Site URL: http://127.0.0.1:3000
Redirect URL: http://127.0.0.1:3000/auth/callback
Redirect URL: http://127.0.0.1:3000/auth/confirm
```

Use `http://127.0.0.1:3000` consistently during local development; browser cookies treat `localhost` and `127.0.0.1` as different sites. For production, replace all three origins with the deployed HTTPS domain and set the same domain in the host's `SITE_URL` variable.

6. In **Authentication > Sign In / Providers > Email**, enable email/password signup and keep email confirmation enabled for public use.
7. In **Authentication > Email Templates > Confirm signup**, use this link:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=signup&amp;next=/dashboard">Confirm your Rhythm account</a>
```

8. In **Authentication > Email Templates > Reset password**, use this link:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=recovery&amp;next=/reset-password">Reset your Rhythm password</a>
```

9. Configure custom SMTP before inviting many people. Supabase's default sender is intended for initial testing, is limited to project-team addresses, and has a very low rate limit.
10. Configure Auth rate limits and CAPTCHA, require MFA for project administrators, and enable SSL enforcement.
11. Deploy and create two test accounts. Confirm that each account can see only its own records.

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

- A new user chooses an email and password, confirms the signup email, and then logs in.
- An email used by the earlier code-based login already has an account. Use **Forgot password?** once to set its first password instead of creating it again.
- Existing sessions persist in secure cookies and are refreshed by middleware.
- A forgotten password is replaced through the email recovery link; an existing password cannot be displayed or recovered.
- Check-ins, habits, schedules, goals, reviews, and settings are stored in Supabase.
- Refreshing, restarting, or changing devices does not remove cloud records.
- RLS restricts every query to the authenticated user's records.

During local development only, an authenticated owner can use **Import my local ideal schedule** to copy templates from `.demo-data.json` into that owner's Supabase account. The import scopes every inserted row to the current authenticated `user_id`, skips duplicates, and is not available in production.

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
