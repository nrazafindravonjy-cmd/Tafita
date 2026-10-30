-- Starter places, part 6 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('beach', 'Nosy Sakatia', 'Diana', 'Une petite île calme à l''ouest de Nosy Be, réputée pour la plongée.', 'A quiet small island west of Nosy Be, known for diving.', -13.30589, 48.16239),
  ('beach', 'Île aux Nattes (Nosy Nato)', 'Analanjirofo', 'Une petite île sans voitures au sud de Sainte-Marie, bordée de plages et de lagons.', 'A small car-free island south of Sainte-Marie, fringed with beaches and lagoons.', -17.10913, 49.80703),
  ('beach', 'Anakao', 'Atsimo-Andrefana', 'Un village de pêcheurs Vezo aux plages de sable blanc, au sud de Toliara.', 'A Vezo fishing village with white-sand beaches, south of Toliara.', -23.65796, 43.64732),
  ('beach', 'Nosy Ve', 'Atsimo-Andrefana', 'Un îlot sacré face à Anakao, où nichent les phaétons à brins rouges.', 'A sacred islet off Anakao where red-tailed tropicbirds nest.', -23.64648, 43.60354),
  ('beach', 'Mer d''Émeraude', 'Diana', 'Un lagon aux eaux vert émeraude, à l''entrée de la baie d''Antsiranana.', 'An emerald-green lagoon at the entrance to Antsiranana Bay.', -12.16829, 49.36759),
  ('beach', 'Andavadoaka', 'Atsimo-Andrefana', 'Un village Vezo isolé, connu pour ses récifs et sa gestion communautaire de la pêche.', 'A remote Vezo village known for its reefs and community-led fishing management.', -22.07305, 43.23863)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
