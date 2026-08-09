-- Names are intentional profile data, never inferred from an email address.
alter table public.users
  add column if not exists first_name text,
  add column if not exists last_name text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_first_name_length_check'
  ) then
    alter table public.users
      add constraint users_first_name_length_check
      check (first_name is null or char_length(trim(first_name)) between 1 and 80);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'users_last_name_length_check'
  ) then
    alter table public.users
      add constraint users_last_name_length_check
      check (last_name is null or char_length(trim(last_name)) between 1 and 80);
  end if;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  profile_first_name text := nullif(trim(new.raw_user_meta_data ->> 'first_name'), '');
  profile_last_name text := nullif(trim(new.raw_user_meta_data ->> 'last_name'), '');
begin
  insert into public.users (id, first_name, last_name, display_name)
  values (
    new.id,
    profile_first_name,
    profile_last_name,
    nullif(concat_ws(' ', profile_first_name, profile_last_name), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
