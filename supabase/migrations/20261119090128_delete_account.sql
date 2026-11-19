-- Suppression du compte de l'utilisateur connecté.
-- La suppression de auth.users entraîne celle du profil (on delete cascade),
-- et de tout ce qui en dépend (amitiés, etc.).
create function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = (select auth.uid());
end;
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;