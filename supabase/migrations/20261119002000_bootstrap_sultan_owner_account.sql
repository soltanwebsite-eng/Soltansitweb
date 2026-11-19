create or replace function public.assign_sultan_first_owner()
returns trigger language plpgsql security definer set search_path = pg_catalog, auth as $$
begin
  if lower(coalesce(new.email,'')) = 'soltanphene3@gmail.com'
     and not exists (select 1 from auth.users u where u.id <> new.id and coalesce(u.raw_app_meta_data->>'role','') = 'owner') then
    update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('role','owner') where id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists sultan_assign_first_owner on auth.users;
create trigger sultan_assign_first_owner after insert on auth.users for each row execute function public.assign_sultan_first_owner();
revoke all on function public.assign_sultan_first_owner() from public, anon, authenticated;
