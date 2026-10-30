-- Proposed places with plain coordinates and the author's username. Row-level
-- security on places still applies: members see their own proposals and
-- moderators see every one.
create or replace view place_submissions with (security_invoker = true) as
  select p.id, p.name, p.region, p.description_fr, p.description_en, p.status, p.created_at,
         p.created_by, c.slug as category_slug, pr.username as author_username,
         st_y(p.location::geometry) as lat, st_x(p.location::geometry) as lng
  from places p
  join categories c on c.id = p.category_id
  left join profiles pr on pr.id = p.created_by;

grant select on place_submissions to authenticated;
