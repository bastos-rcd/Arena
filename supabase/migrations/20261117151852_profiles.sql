-- Table des profils publics (1 profil par compte)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format
    check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  constraint profiles_display_name_length
    check (char_length(btrim(display_name)) between 1 and 40)
);

-- Pseudo unique sans tenir compte des majuscules
create unique index profiles_username_key on public.profiles (lower(username));

-- Mise à jour automatique de updated_at
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Création automatique du profil à l'inscription
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    btrim(new.raw_user_meta_data ->> 'display_name')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Vérifier si un pseudo est libre (appelable avant la connexion)
create function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(p_username)
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

-- Sécurité (RLS)
alter table public.profiles enable row level security;

create policy "Les utilisateurs connectés peuvent lire les profils"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Chacun modifie uniquement son profil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);