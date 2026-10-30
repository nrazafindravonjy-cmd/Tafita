-- Starter places, part 1 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
delete from places where name = 'Test Tafita';

insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('nature', 'Allée des Baobabs', 'Menabe', 'Une allée de baobabs de Grandidier près de Morondava, célèbre au coucher du soleil.', 'An avenue of Grandidier baobabs near Morondava, famous at sunset.', -20.25033, 44.41927),
  ('nature', 'Tsingy de Bemaraha', 'Melaky', 'Une forêt de pics calcaires classée au patrimoine mondial de l''UNESCO.', 'A forest of limestone pinnacles listed as a UNESCO World Heritage Site.', -18.91332, 44.8306),
  ('nature', 'Parc national de l''Isalo', 'Ihorombe', 'Des canyons de grès, des piscines naturelles et des lémuriens.', 'Sandstone canyons, natural pools and lemurs.', -22.42583, 45.27241),
  ('nature', 'Andasibe-Mantadia', 'Alaotra-Mangoro', 'Une forêt où l''on entend le chant de l''indri, le plus grand lémurien.', 'A forest where you can hear the song of the indri, the largest lemur.', -18.93594, 48.4304),
  ('nature', 'Montagne d''Ambre', 'Diana', 'Un massif volcanique couvert de forêt, avec lacs de cratère et cascades.', 'A forested volcanic massif with crater lakes and waterfalls.', -12.62941, 49.14476),
  ('beach', 'Nosy Be', 'Diana', 'La plus grande île touristique du pays, réputée pour ses plages et ses plongées.', 'The country''s main tourist island, known for its beaches and diving.', -13.31191, 48.26644),
  ('beach', 'Ifaty', 'Atsimo-Andrefana', 'Des plages protégées par la barrière de corail, au nord de Toliara.', 'Beaches sheltered by the coral reef, north of Toliara.', -23.15925, 43.61054),
  ('culture', 'Rova d''Antananarivo', 'Analamanga', 'Le palais de la Reine, qui domine la capitale depuis la plus haute colline.', 'The Queen''s Palace, overlooking the capital from its highest hill.', -18.92361, 47.53215)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
