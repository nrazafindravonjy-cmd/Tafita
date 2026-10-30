-- Starter places, part 7 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('hidden-gem', 'Belo-sur-Mer', 'Menabe', 'Un village où l''on construit encore à la main de grandes goélettes en bois.', 'A village where large wooden schooners are still built by hand.', -20.7363, 44.002),
  ('beach', 'Nosy Mitsio', 'Diana', 'Un archipel sauvage au nord-est de Nosy Be, apprécié des plongeurs.', 'A wild archipelago north-east of Nosy Be, popular with divers.', -12.88122, 48.58365),
  ('beach', 'Nosy Hara', 'Diana', 'Un parc marin d''îlots calcaires au large de la côte nord-ouest.', 'A marine park of limestone islets off the north-west coast.', -12.24164, 49.01143),
  ('beach', 'Foulpointe (Mahavelona)', 'Atsinanana', 'Une station balnéaire protégée par un récif, avec les vestiges d''un fort circulaire.', 'A beach resort sheltered by a reef, with the remains of a circular fort.', -17.67887, 49.51185),
  ('beach', 'Plage d''Ambatoloaka', 'Diana', 'La plage animée de Nosy Be, avec ses restaurants et ses centres de plongée.', 'Nosy Be''s lively beach, with restaurants and dive centres.', -13.39467, 48.20239),
  ('beach', 'Baie de Sakalava', 'Diana', 'Une baie ventée prisée des kitesurfeurs, près de Ramena.', 'A windy bay popular with kitesurfers, near Ramena.', -12.27645, 49.39364)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
