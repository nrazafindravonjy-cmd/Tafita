-- Starter places, part 10 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('culture', 'Mananjary', 'Vatovavy', 'Une ville côtière connue pour le Sambatra, grande cérémonie de circoncision collective.', 'A coastal town known for the Sambatra, a major collective circumcision ceremony.', -21.23854, 48.3463),
  ('culture', 'Mahajanga', 'Boeny', 'Une ville portuaire ensoleillée, célèbre pour son baobab géant et sa corniche.', 'A sunny port city famous for its giant baobab and seafront promenade.', -15.71815, 46.31726),
  ('culture', 'Toliara', 'Atsimo-Andrefana', 'La grande ville du Sud-Ouest, porte d''entrée vers les plages et le lagon.', 'The South-West''s main city and gateway to its beaches and lagoon.', -23.35417, 43.66966),
  ('culture', 'Tolagnaro (Fort-Dauphin)', 'Anosy', 'Une ville entre montagnes et baies, avec les vestiges du fort Flacourt.', 'A town between mountains and bays, with the remains of Fort Flacourt.', -25.0295, 46.97318),
  ('food', 'Ambanja', 'Diana', 'La capitale du cacao malgache, dans la vallée du Sambirano.', 'The capital of Malagasy cocoa, in the Sambirano valley.', -13.68145, 48.45284),
  ('food', 'Sambava', 'Sava', 'Au cœur de la région de la vanille, l''une des meilleures au monde.', 'At the heart of the vanilla region, one of the world''s finest.', -14.25496, 50.15565),
  ('food', 'Antalaha', 'Sava', 'Une ville côtière qui vit au rythme du commerce de la vanille.', 'A coastal town that lives by the vanilla trade.', -14.90123, 50.28104),
  ('food', 'Dzamandzar', 'Diana', 'Le village de la sucrerie de Nosy Be, berceau du rhum local.', 'Home of Nosy Be''s sugar mill and birthplace of the local rum.', -13.35161, 48.19439)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
