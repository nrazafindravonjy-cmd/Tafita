-- Starter places, part 8 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('beach', 'Nosy Ankao', 'Sava', 'Une île au large de la côte nord-est, aux plages désertes.', 'An island off the north-east coast with deserted beaches.', -12.80413, 49.82687),
  ('culture', 'Palais d''Andafiavaratra', 'Analamanga', 'L''ancien palais du Premier ministre de la monarchie merina, devenu musée.', 'The former palace of the Merina monarchy''s prime minister, now a museum.', -18.92088, 47.53288),
  ('culture', 'Lac Anosy', 'Analamanga', 'Le lac en cœur de la capitale, bordé de jacarandas, avec le monument aux morts sur son île.', 'The lake at the heart of the capital, lined with jacarandas, with a war memorial on its island.', -18.9156, 47.5194),
  ('culture', 'Andohalo', 'Analamanga', 'Le quartier historique de la Haute-Ville d''Antananarivo, avec sa cathédrale et ses maisons anciennes.', 'The historic Upper Town district of Antananarivo, with its cathedral and old houses.', -18.9177, 47.53142),
  ('culture', 'Hôtel des Thermes d''Antsirabe', 'Vakinankaratra', 'Un grand hôtel colonial, symbole de la ville thermale d''Antsirabe.', 'A grand colonial hotel, symbol of the spa town of Antsirabe.', -19.86587, 47.03287),
  ('culture', 'Papier Antemoro d''Ambalavao', 'Haute Matsiatra', 'Un atelier où l''on fabrique à la main le papier traditionnel Antemoro décoré de fleurs.', 'A workshop where traditional Antemoro paper is handmade and decorated with flowers.', -21.83026, 46.94174),
  ('culture', 'Ambalavao', 'Haute Matsiatra', 'Une petite ville connue pour son grand marché aux zébus et ses vignobles.', 'A small town known for its large zebu market and vineyards.', -21.83162, 46.93847),
  ('culture', 'Haute-Ville de Fianarantsoa', 'Haute Matsiatra', 'Un quartier historique de ruelles et d''églises, sur les hauteurs de Fianarantsoa.', 'A historic quarter of lanes and churches on the heights of Fianarantsoa.', -21.46001, 47.07691),
  ('culture', 'Baobabs amoureux', 'Menabe', 'Deux baobabs enlacés, entourés d''une légende d''amour, près de Morondava.', 'Two entwined baobabs, surrounded by a love legend, near Morondava.', -20.21154, 44.39996),
  ('culture', 'Cimetière des pirates', 'Analanjirofo', 'Un cimetière ancien face à la baie d''Ambodifotatra, témoin de l''époque des pirates.', 'An old cemetery facing Ambodifotatra Bay, a relic of the pirate era.', -17.01211, 49.84753)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
