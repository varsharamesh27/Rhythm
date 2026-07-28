alter table public.habits
add constraint habits_id_user_id_key unique (id, user_id);

alter table public.habit_logs
drop constraint habit_logs_habit_id_fkey;

alter table public.habit_logs
add constraint habit_logs_habit_user_fkey
foreign key (habit_id, user_id)
references public.habits (id, user_id)
on delete cascade;

drop policy "Users can manage own habit logs" on public.habit_logs;

create policy "Users can manage own habit logs" on public.habit_logs
for all
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.habits
    where habits.id = habit_logs.habit_id
      and habits.user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.habits
    where habits.id = habit_logs.habit_id
      and habits.user_id = (select auth.uid())
  )
);

create index habits_user_id_created_at_idx
on public.habits (user_id, created_at);

create index habit_logs_user_id_log_date_idx
on public.habit_logs (user_id, log_date);

create index schedule_entries_user_id_entry_date_idx
on public.schedule_entries (user_id, entry_date);

create index goals_user_id_created_at_idx
on public.goals (user_id, created_at);
