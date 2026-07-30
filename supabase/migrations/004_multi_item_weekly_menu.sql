alter table public.weekly_menu_items
  add column planned_quantity numeric(8, 2),
  add column actual_quantity numeric(8, 2),
  add column unit text,
  add column calories_per_unit numeric(8, 2);

update public.weekly_menu_items
set
  planned_quantity = case when meal_name = '' then 0 else 1 end,
  actual_quantity = case when actual_calories is null then null else 1 end,
  unit = 'serving',
  calories_per_unit = planned_calories;

alter table public.weekly_menu_items
  alter column planned_quantity set not null,
  alter column planned_quantity set default 1,
  alter column unit set not null,
  alter column unit set default 'serving',
  alter column calories_per_unit set not null,
  alter column calories_per_unit set default 0,
  add constraint weekly_menu_items_planned_quantity_check check (planned_quantity >= 0),
  add constraint weekly_menu_items_actual_quantity_check check (actual_quantity is null or actual_quantity >= 0),
  add constraint weekly_menu_items_calories_per_unit_check check (calories_per_unit >= 0);

alter table public.weekly_menu_items
  drop constraint if exists weekly_menu_items_user_id_meal_date_meal_slot_key;

create index weekly_menu_items_user_date_slot_idx
  on public.weekly_menu_items (user_id, meal_date, meal_slot);
