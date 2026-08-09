create or replace function public.get_weekly_points_leaderboard()
returns table (
  rank bigint,
  user_id uuid,
  public_name text,
  weekly_score integer,
  routine_points integer,
  recovery_points integer,
  movement_points integer,
  nutrition_points integer,
  career_points integer,
  checkin_days integer,
  week_start date,
  week_end date
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with bounds as (
    select
      date_trunc('week', current_date)::date as week_start,
      (date_trunc('week', current_date)::date + 6) as week_end
  ),
  opted_in as (
    select
      users.id,
      coalesce(nullif(trim(users.leaderboard_name), ''), 'Rhythm member') as public_name,
      users.created_at
    from public.users
    where users.leaderboard_opt_in = true
  ),
  habit_counts as (
    select
      opted_in.id as user_id,
      habits.category,
      sum(habits.target_per_week)::numeric as target,
      sum(least(coalesce(logs.completed, 0), habits.target_per_week))::numeric as completed
    from opted_in
    join public.habits on habits.user_id = opted_in.id and habits.is_active
    cross join bounds
    left join lateral (
      select count(*)::integer as completed
      from public.habit_logs
      where habit_logs.habit_id = habits.id
        and habit_logs.user_id = opted_in.id
        and habit_logs.completed = true
        and habit_logs.log_date between bounds.week_start and bounds.week_end
    ) logs on true
    group by opted_in.id, habits.category
  ),
  habit_points as (
    select
      opted_in.id as user_id,
      coalesce(max(round(10 * least(habit_counts.completed / nullif(habit_counts.target, 0), 1))) filter (where habit_counts.category = 'routine'), 0)::integer as routine,
      coalesce(max(round(5 * least(habit_counts.completed / nullif(habit_counts.target, 0), 1))) filter (where habit_counts.category = 'recovery'), 0)::integer as recovery,
      coalesce(max(round(5 * least(habit_counts.completed / nullif(habit_counts.target, 0), 1))) filter (where habit_counts.category = 'movement'), 0)::integer as movement,
      coalesce(max(round(5 * least(habit_counts.completed / nullif(habit_counts.target, 0), 1))) filter (where habit_counts.category = 'nutrition'), 0)::integer as nutrition,
      coalesce(max(round(5 * least(habit_counts.completed / nullif(habit_counts.target, 0), 1))) filter (where habit_counts.category = 'career'), 0)::integer as career
    from opted_in
    left join habit_counts on habit_counts.user_id = opted_in.id
    group by opted_in.id
  ),
  schedule_points as (
    select
      opted_in.id as user_id,
      case when count(schedule_entries.id) = 0 then 0
        else round(10 * count(schedule_entries.id) filter (where schedule_entries.completed)::numeric / count(schedule_entries.id))::integer
      end as points
    from opted_in
    cross join bounds
    left join public.schedule_entries on schedule_entries.user_id = opted_in.id
      and schedule_entries.entry_date between bounds.week_start and bounds.week_end
    group by opted_in.id
  ),
  checkin_points as (
    select
      opted_in.id as user_id,
      count(daily_checkins.id)::integer as checkin_days,
      round(20 * count(daily_checkins.id)::numeric / 7)::integer as consistency,
      round(15 * coalesce(sum(daily_checkins.sleep_quality + daily_checkins.energy), 0)::numeric / 70)::integer as recovery,
      round(
        7 * least(count(daily_checkins.id) filter (where daily_checkins.workout_completed)::numeric / 3, 1)
        + 2 * count(daily_checkins.id) filter (where daily_checkins.yoga_completed)::numeric / 7
        + case
            when 6 - count(daily_checkins.id) filter (where daily_checkins.workout_completed) <= 0 then 1
            else least(
              count(daily_checkins.id) filter (where daily_checkins.walking_completed and not daily_checkins.workout_completed)::numeric
              / (6 - count(daily_checkins.id) filter (where daily_checkins.workout_completed)),
              1
            )
          end
      )::integer as movement,
      round(7 * coalesce(sum(daily_checkins.nutrition_adherence), 0)::numeric / 35)::integer as nutrition,
      round(3 * count(daily_checkins.id) filter (where daily_checkins.water_intake >= 8)::numeric / 7)::integer as hydration,
      round(5 * count(daily_checkins.id) filter (where daily_checkins.study_completed)::numeric / 7)::integer as study
    from opted_in
    cross join bounds
    left join public.daily_checkins on daily_checkins.user_id = opted_in.id
      and daily_checkins.checkin_date between bounds.week_start and bounds.week_end
    group by opted_in.id
  ),
  points as (
    select
      opted_in.id as user_id,
      opted_in.public_name,
      opted_in.created_at,
      habit_points.routine + schedule_points.points + checkin_points.consistency as routine_points,
      habit_points.recovery + checkin_points.recovery as recovery_points,
      habit_points.movement + checkin_points.movement as movement_points,
      habit_points.nutrition + checkin_points.nutrition + checkin_points.hydration as nutrition_points,
      habit_points.career + checkin_points.study as career_points,
      checkin_points.checkin_days,
      bounds.week_start,
      bounds.week_end
    from opted_in
    join habit_points on habit_points.user_id = opted_in.id
    join schedule_points on schedule_points.user_id = opted_in.id
    join checkin_points on checkin_points.user_id = opted_in.id
    cross join bounds
  ),
  totals as (
    select points.*, routine_points + recovery_points + movement_points + nutrition_points + career_points as weekly_score
    from points
  )
  select
    row_number() over (order by totals.weekly_score desc, totals.routine_points desc, totals.checkin_days desc, totals.created_at asc),
    totals.user_id,
    totals.public_name,
    totals.weekly_score,
    totals.routine_points,
    totals.recovery_points,
    totals.movement_points,
    totals.nutrition_points,
    totals.career_points,
    totals.checkin_days,
    totals.week_start,
    totals.week_end
  from totals
  order by weekly_score desc, routine_points desc, checkin_days desc, created_at asc;
$$;

revoke all on function public.get_weekly_points_leaderboard() from public;
grant execute on function public.get_weekly_points_leaderboard() to authenticated;
