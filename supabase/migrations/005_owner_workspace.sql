-- The owner role personalizes the product without granting access to other members' records.
alter table public.users
  add column if not exists workspace_role text not null default 'member'
  check (workspace_role in ('member', 'owner'));

create or replace function public.prevent_workspace_role_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT'
    and new.workspace_role <> 'member'
    and auth.uid() is not null then
    raise exception 'Workspace roles can only be assigned by a database administrator';
  end if;

  if tg_op = 'UPDATE'
    and new.workspace_role is distinct from old.workspace_role
    and auth.uid() is not null then
    raise exception 'Workspace roles can only be changed by a database administrator';
  end if;

  return new;
end;
$$;

drop trigger if exists users_prevent_workspace_role_change on public.users;
create trigger users_prevent_workspace_role_change
before insert or update on public.users
for each row execute function public.prevent_workspace_role_change();
