-- Relations d'amitié : une seule ligne par paire d'utilisateurs.
-- Refuser, annuler ou supprimer un ami = supprimer la ligne.
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null,
  addressee_id uuid not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_requester_fkey
    foreign key (requester_id) references public.profiles (id) on delete cascade,
  constraint friendships_addressee_fkey
    foreign key (addressee_id) references public.profiles (id) on delete cascade,
  constraint friendships_status_check
    check (status in ('pending', 'accepted')),
  constraint friendships_not_self
    check (requester_id <> addressee_id)
);

-- Une seule relation par paire, quel que soit le sens (A→B ou B→A)
create unique index friendships_pair_key
  on public.friendships (
    least(requester_id, addressee_id),
    greatest(requester_id, addressee_id)
  );

create index friendships_requester_idx on public.friendships (requester_id);
create index friendships_addressee_idx on public.friendships (addressee_id);

create trigger friendships_set_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

-- Droits : seule la colonne status est modifiable
revoke all on public.friendships from anon;
revoke update on public.friendships from authenticated;
grant update (status) on public.friendships to authenticated;

-- Sécurité (RLS)
alter table public.friendships enable row level security;

create policy "Chacun lit ses relations"
  on public.friendships for select
  to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

create policy "Chacun envoie une demande en son nom"
  on public.friendships for insert
  to authenticated
  with check (
    (select auth.uid()) = requester_id
    and status = 'pending'
  );

create policy "Le destinataire accepte une demande reçue"
  on public.friendships for update
  to authenticated
  using ((select auth.uid()) = addressee_id and status = 'pending')
  with check ((select auth.uid()) = addressee_id and status = 'accepted');

create policy "Chacun supprime ses relations"
  on public.friendships for delete
  to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

-- Mises à jour en direct (Realtime)
alter publication supabase_realtime add table public.friendships;