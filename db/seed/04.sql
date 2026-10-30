-- Starter places, part 4 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('nature', 'Lac Itasy', 'Itasy', 'Un grand lac d''origine volcanique, à moins de deux heures de la capitale.', 'A large volcanic lake less than two hours from the capital.', -19.07, 46.79),
  ('nature', 'Tsingy de Namoroka', 'Boeny', 'Un parc isolé de tsingy, de grottes et de piscines naturelles.', 'A remote park of tsingy, caves and natural pools.', -16.45408, 45.34665)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
