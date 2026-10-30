-- Reports of reviews and member photos, reviewed by moderators.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id text not null references profiles on delete cascade default auth.user_id(),
  target_type text not null check (target_type in ('review', 'photo')),
  target_id uuid not null,
  reason text not null check (reason in ('inappropriate', 'false', 'spam', 'rights')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  -- One report per person and content.
  unique (reporter_id, target_type, target_id)
);

alter table reports enable row level security;

drop policy if exists "members report content" on reports;
create policy "members report content" on reports for insert to authenticated
  with check (reporter_id = auth.user_id() and status = 'open');
drop policy if exists "moderators read reports" on reports;
create policy "moderators read reports" on reports for select to authenticated using (is_moderator());
drop policy if exists "moderators resolve reports" on reports;
create policy "moderators resolve reports" on reports for update to authenticated using (is_moderator());

grant insert, select, update on reports to authenticated;

-- Account deletion: members delete their own profile, which removes their
-- reviews and reports through the existing cascades.
drop policy if exists "users delete own profile" on profiles;
create policy "users delete own profile" on profiles for delete to authenticated using (id = auth.user_id());

-- Members' photo rows are deleted by the app before the profile, so the stored
-- files can be removed too; places they suggested stay, without an author.
drop policy if exists "members delete own photos" on place_photos;
create policy "members delete own photos" on place_photos for delete
  using (uploaded_by = auth.user_id() or is_moderator());
grant delete on place_photos to authenticated;

notify pgrst, 'reload schema';
