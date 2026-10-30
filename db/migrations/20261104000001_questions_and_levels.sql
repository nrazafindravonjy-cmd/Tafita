-- Part 2 of 2: questions and answers, their reports, and contributor counts.
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places on delete cascade,
  author_id text not null references profiles on delete cascade default auth.user_id(),
  body text not null check (char_length(body) between 5 and 500),
  created_at timestamptz not null default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions on delete cascade,
  author_id text not null references profiles on delete cascade default auth.user_id(),
  body text not null check (char_length(body) between 2 and 1000),
  created_at timestamptz not null default now()
);

alter table questions enable row level security;
alter table answers enable row level security;

drop policy if exists "questions are public" on questions;
create policy "questions are public" on questions for select using (true);
drop policy if exists "members ask questions" on questions;
create policy "members ask questions" on questions for insert to authenticated with check (author_id = auth.user_id());
drop policy if exists "authors and moderators delete questions" on questions;
create policy "authors and moderators delete questions" on questions for delete to authenticated
  using (author_id = auth.user_id() or is_moderator());

drop policy if exists "answers are public" on answers;
create policy "answers are public" on answers for select using (true);
drop policy if exists "members answer" on answers;
create policy "members answer" on answers for insert to authenticated with check (author_id = auth.user_id());
drop policy if exists "authors and moderators delete answers" on answers;
create policy "authors and moderators delete answers" on answers for delete to authenticated
  using (author_id = auth.user_id() or is_moderator());

grant select on questions, answers to anonymous, authenticated;
grant insert, delete on questions, answers to authenticated;

-- Questions and answers can be reported like reviews and photos.
alter table reports drop constraint if exists reports_target_type_check;
alter table reports add constraint reports_target_type_check
  check (target_type in ('review', 'photo', 'question', 'answer'));

-- Public counts behind contributor levels. It runs with its owner's rights
-- and exposes only these four numbers per member.
create or replace view contributor_stats as
  select pr.id as user_id,
         (select count(*) from reviews r where r.author_id = pr.id) as reviews,
         (select count(*) from place_photos ph where ph.uploaded_by = pr.id) as photos,
         (select count(*) from places p where p.created_by = pr.id and p.status = 'published') as places,
         (select count(*) from answers a where a.author_id = pr.id) as answers
  from profiles pr;
grant select on contributor_stats to anonymous, authenticated;

notify pgrst, 'reload schema';
