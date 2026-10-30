-- Starter places, part 4 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('nature', 'Lac Itasy', 'Itasy', 'Un grand lac d''origine volcanique, à moins de deux heures de la capitale.', 'A large volcanic lake less than two hours from the capital.', -19.07, 46.79),
  ('nature', 'Geysers d''Analavory', 'Itasy', 'De petits geysers aux dépôts calcaires colorés, près du village d''Analavory.', 'Small geysers with colourful mineral deposits, near the village of Analavory.', -18.97464, 46.71618),
  ('nature', 'La Fenêtre de l''Isalo', 'Ihorombe', 'Une arche rocheuse naturelle, célèbre pour ses couchers de soleil.', 'A natural rock arch famous for its sunsets.', -22.64116, 45.30868),
  ('nature', 'Piscine naturelle de l''Isalo', 'Ihorombe', 'Un bassin d''eau claire bordé de palmiers, au milieu des canyons de l''Isalo.', 'A clear pool fringed with palms among the Isalo canyons.', -22.5664, 45.36423),
  ('hidden-gem', 'Cirque rouge', 'Boeny', 'Un amphithéâtre de terres rouges, ocre et blanches érodées, près de Mahajanga.', 'An amphitheatre of eroded red, ochre and white earth, near Mahajanga.', -15.63464, 46.35306),
  ('nature', 'Parc national de Mikea', 'Atsimo-Andrefana', 'Une forêt sèche et épineuse, territoire du peuple Mikea.', 'A dry spiny forest, homeland of the Mikea people.', -22.35574, 43.46032),
  ('nature', 'Réserve du Palmarium', 'Atsinanana', 'Une réserve au bord du lac Ampitabe, sur le canal des Pangalanes, où les lémuriens s''approchent des visiteurs.', 'A reserve on Lake Ampitabe, along the Pangalanes Canal, where lemurs come close to visitors.', -18.60602, 49.21068),
  ('nature', 'Mont Ibity', 'Vakinankaratra', 'Un massif de quartzite au sud d''Antsirabe, riche en plantes endémiques.', 'A quartzite massif south of Antsirabe, rich in endemic plants.', -20.10145, 47.0056),
  ('nature', 'Tsingy de Namoroka', 'Boeny', 'Un parc isolé de tsingy, de grottes et de piscines naturelles.', 'A remote park of tsingy, caves and natural pools.', -16.45408, 45.34665),
  ('nature', 'Réserve d''Ambohitantely', 'Analamanga', 'L''un des derniers fragments de forêt des Hautes Terres, au nord de la capitale.', 'One of the last fragments of highland forest, north of the capital.', -18.15951, 47.30558)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
