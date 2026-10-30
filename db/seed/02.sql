-- Starter places, part 2 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('culture', 'Colline royale d''Ambohimanga', 'Analamanga', 'Une colline sacrée et ancienne cité royale, classée au patrimoine mondial de l''UNESCO.', 'A sacred hill and former royal city, listed as a UNESCO World Heritage Site.', -18.75933, 47.56532),
  ('nature', 'Parc national de Masoala', 'Analanjirofo', 'La plus grande aire protégée du pays, où la forêt tropicale descend jusqu''à la mer et aux récifs coralliens.', 'The country''s largest protected area, where rainforest runs down to the sea and its coral reefs.', -15.61804, 49.97762),
  ('nature', 'Parc national de Marojejy', 'Sava', 'Un massif montagneux couvert de forêt humide, refuge du rare propithèque soyeux.', 'A rainforest-covered mountain massif, home to the rare silky sifaka.', -14.46146, 49.70179),
  ('nature', 'Parc national d''Ankarafantsika', 'Boeny', 'Une forêt sèche riche en lémuriens et en oiseaux, autour du lac Ravelobe.', 'A dry forest rich in lemurs and birds, around Lake Ravelobe.', -16.20363, 46.92179),
  ('nature', 'Tsingy Rouges', 'Diana', 'Des aiguilles de grès et de latérite rouge sculptées par l''érosion, près d''Antsiranana.', 'Red sandstone and laterite spires carved by erosion, near Antsiranana.', -12.64229, 49.49106),
  ('nature', 'Réserve spéciale de l''Ankarana', 'Diana', 'Un plateau calcaire de tsingy, de grottes et de canyons boisés.', 'A limestone plateau of tsingy, caves and forested canyons.', -12.96805, 49.13848),
  ('nature', 'Réserve communautaire d''Anja', 'Haute Matsiatra', 'Une réserve gérée par les villageois, célèbre pour ses makis catta au pied de falaises de granit.', 'A village-run reserve famous for its ring-tailed lemurs below granite cliffs.', -21.85721, 46.85084),
  ('nature', 'Parc national d''Andringitra', 'Haute Matsiatra', 'Un massif granitique propice à la randonnée, aux paysages de haute montagne.', 'A granite massif for hiking, with high-mountain landscapes.', -22.2243, 46.92863),
  ('nature', 'Pic Boby (Imarivolanitra)', 'Haute Matsiatra', 'Le deuxième sommet de Madagascar, accessible à pied depuis le parc d''Andringitra.', 'Madagascar''s second-highest summit, reached on foot from Andringitra National Park.', -22.19463, 46.88523),
  ('nature', 'Forêt de Kirindy', 'Menabe', 'Une forêt sèche où l''on observe le fossa, principal prédateur de l''île.', 'A dry forest where you can spot the fossa, the island''s top predator.', -20.06707, 44.65738)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
