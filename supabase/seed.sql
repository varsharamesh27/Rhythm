-- Run after creating/signing in at least one Supabase auth user.
-- The seed attaches fictional records to the first public user in the project.
-- Use only in a disposable demo project, never in the personal production account.
do $$
declare
  demo_user uuid;
  day_offset int;
begin
  select id into demo_user from public.users order by created_at limit 1;

  if demo_user is null then
    raise notice 'No public.users row exists yet. Sign in once, then rerun this seed.';
    return;
  end if;

  insert into public.habits (user_id, name, category, target_per_week) values
    (demo_user, 'Morning planning', 'routine', 5),
    (demo_user, 'Sleep wind-down', 'recovery', 5),
    (demo_user, 'Workout', 'movement', 4),
    (demo_user, 'Hydration target', 'nutrition', 7),
    (demo_user, 'Study session', 'career', 5)
  on conflict do nothing;

  for day_offset in 0..29 loop
    insert into public.daily_checkins (
      user_id, checkin_date, bedtime, wake_time, sleep_quality, energy, mood, water_intake,
      workout_completed, yoga_completed, meditation_completed, walking_completed, study_completed,
      study_duration_minutes, nutrition_adherence, weight, notes
    ) values (
      demo_user,
      current_date - day_offset,
      time '22:30' + ((day_offset % 3) * interval '15 minutes'),
      time '06:30' + ((day_offset % 4) * interval '10 minutes'),
      3 + (day_offset % 3),
      3 + ((day_offset + 1) % 3),
      3 + ((day_offset + 2) % 3),
      6 + (day_offset % 5),
      day_offset % 2 = 0,
      day_offset % 3 <> 0,
      day_offset % 4 <> 0,
      day_offset % 5 <> 0,
      day_offset % 6 <> 0,
      case when day_offset % 6 <> 0 then 35 + (day_offset % 4) * 15 else 0 end,
      3 + (day_offset % 3),
      172.0 - (day_offset * 0.04),
      'Fictional demo check-in for rhythm.'
    )
    on conflict (user_id, checkin_date) do nothing;
  end loop;
end $$;
