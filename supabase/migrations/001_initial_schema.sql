create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now()
);

create type public.habit_category as enum ('routine', 'recovery', 'movement', 'nutrition', 'career');

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  category public.habit_category not null,
  target_per_week int not null check (target_per_week between 1 and 7),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  checkin_date date not null,
  bedtime time,
  wake_time time,
  sleep_quality int not null check (sleep_quality between 1 and 5),
  energy int not null check (energy between 1 and 5),
  mood int not null check (mood between 1 and 5),
  water_intake int not null default 0 check (water_intake >= 0),
  workout_completed boolean not null default false,
  yoga_completed boolean not null default false,
  meditation_completed boolean not null default false,
  walking_completed boolean not null default false,
  study_completed boolean not null default false,
  study_duration_minutes int not null default 0 check (study_duration_minutes >= 0),
  nutrition_adherence int not null check (nutrition_adherence between 1 and 5),
  weight numeric(6,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  sleep_date date not null,
  bedtime time,
  wake_time time,
  duration_minutes int,
  quality int check (quality between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.health_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  metric_date date not null,
  weight numeric(6,2),
  mood int check (mood between 1 and 5),
  energy int check (energy between 1 and 5),
  water_intake int check (water_intake >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workout_date date not null,
  workout_type text not null,
  duration_minutes int not null check (duration_minutes >= 0),
  intensity int check (intensity between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

create table public.schedule_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  weekday int check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  category public.habit_category not null,
  created_at timestamptz not null default now()
);

create table public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  entry_date date not null,
  planned_start time not null,
  planned_end time not null,
  actual_start time,
  actual_end time,
  title text not null,
  category public.habit_category not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  category public.habit_category not null,
  target_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz not null default now()
);

create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  week_start date not null,
  routine_summary text,
  recovery_summary text,
  movement_summary text,
  nutrition_summary text,
  career_summary text,
  next_week_focus text,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daily_checkins_touch_updated_at before update on public.daily_checkins
for each row execute function public.touch_updated_at();

alter table public.users enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.health_metrics enable row level security;
alter table public.workout_logs enable row level security;
alter table public.schedule_templates enable row level security;
alter table public.schedule_entries enable row level security;
alter table public.goals enable row level security;
alter table public.weekly_reviews enable row level security;

create policy "Users can manage own profile" on public.users for all using (id = auth.uid()) with check (id = auth.uid());

create policy "Users can manage own habits" on public.habits for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own habit logs" on public.habit_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own daily checkins" on public.daily_checkins for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own sleep logs" on public.sleep_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own health metrics" on public.health_metrics for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own workout logs" on public.workout_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own schedule templates" on public.schedule_templates for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own schedule entries" on public.schedule_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own goals" on public.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage own weekly reviews" on public.weekly_reviews for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
