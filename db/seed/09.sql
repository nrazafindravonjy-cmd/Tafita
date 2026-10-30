-- Starter places, part 9 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('culture', 'Ambodifotatra', 'Analanjirofo', 'La petite capitale de Sainte-Marie, avec l''une des plus anciennes églises catholiques du pays.', 'Sainte-Marie''s small capital, with one of the country''s oldest Catholic churches.', -16.99964, 49.85258),
  ('culture', 'Ambositra', 'Amoron''i Mania', 'La capitale de l''artisanat du bois et de la marqueterie.', 'The capital of woodcraft and marquetry.', -20.53281, 47.24505),
  ('culture', 'Antoetra', 'Amoron''i Mania', 'La porte des villages Zafimaniry, dont le savoir-faire du bois est inscrit au patrimoine immatériel de l''UNESCO.', 'Gateway to the Zafimaniry villages, whose woodcraft is on UNESCO''s Intangible Heritage list.', -20.77583, 47.31733),
  ('culture', 'Hell-Ville (Andoany)', 'Diana', 'La ville principale de Nosy Be, avec son marché et ses maisons coloniales.', 'Nosy Be''s main town, with its market and colonial houses.', -13.40541, 48.2743),
  ('culture', 'Antsiranana (Diego-Suarez)', 'Diana', 'Une ville portuaire aux architectures coloniales, sur l''une des plus grandes baies du monde.', 'A port city of colonial architecture on one of the world''s largest bays.', -12.27796, 49.29137),
  ('culture', 'Toamasina', 'Atsinanana', 'Le premier port du pays, animé, et porte d''entrée du canal des Pangalanes.', 'The country''s busiest port and gateway to the Pangalanes Canal.', -18.1554, 49.40984),
  ('culture', 'Manakara', 'Fitovinany', 'Le terminus côtier du train Fianarantsoa–Côte Est, entre océan et canal des Pangalanes.', 'The coastal terminus of the Fianarantsoa–East Coast railway, between ocean and Pangalanes Canal.', -22.14496, 48.01135)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
