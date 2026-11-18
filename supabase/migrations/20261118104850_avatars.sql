-- Le profil stocke le chemin du fichier (et non une URL complète) :
-- l'URL publique est reconstruite par l'app, donc elle reste valide
-- quand l'adresse de Supabase change (développement, production).
alter table public.profiles rename column avatar_url to avatar_path;

-- Un profil ne peut référencer qu'un fichier de son propre dossier
alter table public.profiles
  add constraint profiles_avatar_path_owner
  check (avatar_path is null or avatar_path like id::text || '/%');

-- Bucket public (les photos sont lisibles via leur URL), 2 Mo max
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Chacun gère uniquement les fichiers de son dossier : avatars/<user_id>/...
create policy "Avatars : lecture de son dossier"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Avatars : envoi dans son dossier"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Avatars : modification dans son dossier"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Avatars : suppression dans son dossier"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );