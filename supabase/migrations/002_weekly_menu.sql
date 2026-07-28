create type public.meal_slot as enum ('breakfast', 'forenoon', 'lunch', 'evening', 'dinner');

create table public.weekly_menu_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  meal_date date not null,
  meal_slot public.meal_slot not null,
  meal_name text not null default '',
  planned_calories int not null default 0 check (planned_calories >= 0),
  actual_calories int check (actual_calories >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, meal_date, meal_slot)
);

create trigger weekly_menu_items_touch_updated_at before update on public.weekly_menu_items
for each row execute function public.touch_updated_at();

alter table public.weekly_menu_items enable row level security;

create policy "Users can manage own weekly menu" on public.weekly_menu_items
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
