-- Part 1 of 2: saved lists and visited places.
create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references profiles on delete cascade default auth.user_id(),
  name text not null check (char_length(name) between 1 and 60),
  -- Anyone with the link can view a shared list.
  is_shared boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists list_places (
  list_id uuid not null references lists on delete cascade,
  place_id uuid not null references places on delete cascade,
  position int not null default 0,
  added_at timestamptz not null default now(),
  primary key (list_id, place_id)
);

create table if not exists visits (
  user_id text not null references profiles on delete cascade default auth.user_id(),
  place_id uuid not null references places on delete cascade,
  visited_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table lists enable row level security;
alter table list_places enable row level security;
alter table visits enable row level security;

drop policy if exists "owners and shared lists are readable" on lists;
create policy "owners and shared lists are readable" on lists for select using (is_shared or owner_id = auth.user_id());
drop policy if exists "owners manage lists" on lists;
create policy "owners manage lists" on lists for all to authenticated
  using (owner_id = auth.user_id()) with check (owner_id = auth.user_id());

drop policy if exists "list places follow their list" on list_places;
create policy "list places follow their list" on list_places for select
  using (exists (select 1 from lists l where l.id = list_id and (l.is_shared or l.owner_id = auth.user_id())));
drop policy if exists "owners manage list places" on list_places;
create policy "owners manage list places" on list_places for all to authenticated
  using (exists (select 1 from lists l where l.id = list_id and l.owner_id = auth.user_id()))
  with check (exists (select 1 from lists l where l.id = list_id and l.owner_id = auth.user_id()));

drop policy if exists "members manage their visits" on visits;
create policy "members manage their visits" on visits for all to authenticated
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

grant select on lists, list_places to anonymous, authenticated;
grant select, insert, update, delete on lists, list_places, visits to authenticated;

notify pgrst, 'reload schema';
