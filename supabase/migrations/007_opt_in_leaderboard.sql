alter table public.users
  add column if not exists leaderboard_opt_in boolean not null default false,
  add column if not exists leaderboard_name text;

alter table public.users
  drop constraint if exists users_leaderboard_name_length_check;

alter table public.users
  add constraint users_leaderboard_name_length_check
  check (
    leaderboard_name is null
    or char_length(trim(leaderboard_name)) between 2 and 40
  );

create or replace function public.get_weekly_leaderboard()
returns table (
  rank bigint,
  user_id uuid,
  public_name text,
  weekly_score integer,
  habit_completions integer,
  habit_target integer,
  checkin_days integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with opted_in as (
    select
      users.id,
      coalesce(nullif(trim(users.leaderboard_name), ''), 'Rhythm member') as public_name,
      users.created_at
    from public.users
    where users.leaderboard_opt_in = true
  ),
  habit_totals as (
    select
      opted_in.id as user_id,
      coalesce((
        select sum(habits.target_per_week)::integer
        from public.habits
        where habits.user_id = opted_in.id and habits.is_active
      ), 0) as habit_target,
      coalesce((
        select count(habit_logs.id)::integer
        from public.habit_logs
        join public.habits on habits.id = habit_logs.habit_id and habits.user_id = habit_logs.user_id
        where habit_logs.user_id = opted_in.id
          and habits.is_active
          and habit_logs.completed = true
          and habit_logs.log_date between date_trunc('week', current_date)::date
            and (date_trunc('week', current_date)::date + 6)
      ), 0) as habit_completions
    from opted_in
  ),
  checkin_totals as (
    select
      opted_in.id as user_id,
      count(daily_checkins.id) filter (
        where daily_checkins.checkin_date between date_trunc('week', current_date)::date
          and (date_trunc('week', current_date)::date + 6)
      )::integer as checkin_days
    from opted_in
    left join public.daily_checkins on daily_checkins.user_id = opted_in.id
    group by opted_in.id
  ),
  scored as (
    select
      opted_in.id as user_id,
      opted_in.public_name,
      opted_in.created_at,
      habit_totals.habit_completions,
      habit_totals.habit_target,
      checkin_totals.checkin_days,
      case
        when habit_totals.habit_target > 0 then round(
          70 * least(habit_totals.habit_completions::numeric / habit_totals.habit_target, 1)
          + 30 * least(checkin_totals.checkin_days::numeric / 7, 1)
        )::integer
        else round(100 * least(checkin_totals.checkin_days::numeric / 7, 1))::integer
      end as weekly_score
    from opted_in
    join habit_totals on habit_totals.user_id = opted_in.id
    join checkin_totals on checkin_totals.user_id = opted_in.id
  )
  select
    row_number() over (order by scored.weekly_score desc, scored.created_at asc) as rank,
    scored.user_id,
    scored.public_name,
    scored.weekly_score,
    scored.habit_completions,
    scored.habit_target,
    scored.checkin_days
  from scored
  order by rank, scored.public_name;
$$;

revoke all on function public.get_weekly_leaderboard() from public;
grant execute on function public.get_weekly_leaderboard() to authenticated;
