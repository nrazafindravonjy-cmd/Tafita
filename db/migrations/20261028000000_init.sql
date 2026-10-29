-- Tafita MVP schema for Neon: profiles, categories, places, photos and reviews.
-- Run after enabling Neon Auth and the Data API, which create the auth schema
-- and the authenticated and anonymous roles used below.
create extension if not exists postgis;

create type place_status as enum ('pending', 'published', 'rejected');
create type user_role as enum ('member', 'moderator', 'admin');

create table profiles (
  -- Neon Auth (Better Auth) user ids are text.
  id text primary key default auth.user_id(),
  username text unique not null check (char_length(username) between 3 and 30),
  avatar_url text,
  preferred_language text not null default 'fr' check (preferred_language in ('fr', 'en')),
  role user_role not null default 'member',
  created_at timestamptz not null default now()
);

create table categories (
  id serial primary key,
  slug text unique not null,
  name_fr text not null,
  name_en text not null
);

create table places (
  id uuid primary key default gen_random_uuid(),
  category_id int not null references categories,
  name text not null,
  description_fr text,
  description_en text,
  region text,
  location geography(point, 4326) not null,
  status place_status not null default 'pending',
  created_by text references profiles on delete set null,
  created_at timestamptz not null default now()
);
create index places_location_idx on places using gist (location);
create index places_status_idx on places (status);

create table place_photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places on delete cascade,
  -- Object key in Cloudflare R2; the public URL is built client-side.
  storage_key text not null,
  uploaded_by text references profiles on delete set null,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places on delete cascade,
  author_id text not null references profiles on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text check (char_length(body) <= 2000),
  language text not null default 'fr' check (language in ('fr', 'en')),
  created_at timestamptz not null default now(),
  unique (place_id, author_id)
);

create function is_moderator() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.user_id() and role in ('moderator', 'admin'));
$$;

-- Places near a point, used by the map screen.
create function nearby_places(lat double precision, lng double precision, radius_m double precision default 50000)
returns setof places language sql stable as $$
  select * from places
  where status = 'published'
    and st_dwithin(location, st_makepoint(lng, lat)::geography, radius_m)
  order by location <-> st_makepoint(lng, lat)::geography;
$$;

alter table profiles enable row level security;
alter table categories enable row level security;
alter table places enable row level security;
alter table place_photos enable row level security;
alter table reviews enable row level security;

create policy "profiles are public" on profiles for select using (true);
create policy "users edit own profile" on profiles for update using (id = auth.user_id())
  with check (id = auth.user_id() and role = (select role from profiles where id = auth.user_id()));
create policy "users create own profile" on profiles for insert with check (id = auth.user_id() and role = 'member');

create policy "categories are public" on categories for select using (true);

create policy "published places are public" on places for select
  using (status = 'published' or created_by = auth.user_id() or is_moderator());
create policy "members submit places" on places for insert
  with check (created_by = auth.user_id() and status = 'pending');
create policy "moderators manage places" on places for update using (is_moderator());

create policy "photos of visible places are public" on place_photos for select
  using (exists (select 1 from places p where p.id = place_id));
create policy "members add photos" on place_photos for insert with check (uploaded_by = auth.user_id());
create policy "members delete own photos" on place_photos for delete using (uploaded_by = auth.user_id() or is_moderator());

create policy "reviews are public" on reviews for select using (true);
create policy "members write reviews" on reviews for insert with check (author_id = auth.user_id());
create policy "members edit own reviews" on reviews for update using (author_id = auth.user_id());
create policy "members delete own reviews" on reviews for delete using (author_id = auth.user_id() or is_moderator());

grant usage on schema public to authenticated, anonymous;
grant select on all tables in schema public to authenticated, anonymous;
grant insert, update, delete on profiles, places, place_photos, reviews to authenticated;
grant execute on function nearby_places, is_moderator to authenticated, anonymous;

insert into categories (slug, name_fr, name_en) values
  ('nature', 'Nature et parcs', 'Nature and parks'),
  ('beach', 'Plages et îles', 'Beaches and islands'),
  ('culture', 'Culture et patrimoine', 'Culture and heritage'),
  ('food', 'Gastronomie', 'Food'),
  ('hidden-gem', 'Pépites', 'Hidden gems');
