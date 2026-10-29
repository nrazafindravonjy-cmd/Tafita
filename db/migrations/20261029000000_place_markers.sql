-- Map markers: published places with plain coordinates, since the Data API
-- returns PostGIS geography columns as encoded binary.
create view place_markers with (security_invoker = true) as
  select p.id, p.name, p.region, p.category_id, c.slug as category_slug,
         st_y(p.location::geometry) as lat, st_x(p.location::geometry) as lng
  from places p
  join categories c on c.id = p.category_id
  where p.status = 'published';

grant select on place_markers to authenticated, anonymous;

-- Starter places so the map is not empty at launch. Coordinates are approximate
-- and should be checked on site before the beta.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('nature', 'Allée des Baobabs', 'Menabe', 'Une allée de baobabs de Grandidier près de Morondava, célèbre au coucher du soleil.', 'An avenue of Grandidier baobabs near Morondava, famous at sunset.', -20.2508, 44.4186),
  ('nature', 'Tsingy de Bemaraha', 'Melaky', 'Une forêt de pics calcaires classée au patrimoine mondial de l''UNESCO.', 'A forest of limestone pinnacles listed as a UNESCO World Heritage Site.', -19.1300, 44.8100),
  ('nature', 'Parc national de l''Isalo', 'Ihorombe', 'Des canyons de grès, des piscines naturelles et des lémuriens.', 'Sandstone canyons, natural pools and lemurs.', -22.5500, 45.3800),
  ('nature', 'Parc national de Ranomafana', 'Vatovavy', 'Une forêt tropicale humide, refuge du lémurien bambou doré.', 'A rainforest that shelters the golden bamboo lemur.', -21.2600, 47.4200),
  ('nature', 'Andasibe-Mantadia', 'Alaotra-Mangoro', 'Une forêt où l''on entend le chant de l''indri, le plus grand lémurien.', 'A forest where you can hear the song of the indri, the largest lemur.', -18.9400, 48.4200),
  ('nature', 'Montagne d''Ambre', 'Diana', 'Un massif volcanique couvert de forêt, avec lacs de cratère et cascades.', 'A forested volcanic massif with crater lakes and waterfalls.', -12.5200, 49.1700),
  ('beach', 'Nosy Be', 'Diana', 'La plus grande île touristique du pays, réputée pour ses plages et ses plongées.', 'The country''s main tourist island, known for its beaches and diving.', -13.4000, 48.2700),
  ('beach', 'Île Sainte-Marie', 'Analanjirofo', 'Une île bordée de lagons, où l''on observe les baleines de juillet à septembre.', 'A lagoon-fringed island where whales can be watched from July to September.', -17.0800, 49.8200),
  ('beach', 'Ifaty', 'Atsimo-Andrefana', 'Des plages protégées par la barrière de corail, au nord de Toliara.', 'Beaches sheltered by the coral reef, north of Toliara.', -23.1500, 43.6200),
  ('culture', 'Rova d''Antananarivo', 'Analamanga', 'Le palais de la Reine, qui domine la capitale depuis la plus haute colline.', 'The Queen''s Palace, overlooking the capital from its highest hill.', -18.9236, 47.5317),
  ('culture', 'Colline royale d''Ambohimanga', 'Analamanga', 'Une colline sacrée et ancienne cité royale, classée au patrimoine mondial de l''UNESCO.', 'A sacred hill and former royal city, listed as a UNESCO World Heritage Site.', -18.7590, 47.5630)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category;
