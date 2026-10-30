-- Starter places, part 3 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('nature', 'Parc national de Zombitse-Vohibasia', 'Atsimo-Andrefana', 'Une forêt de transition sur la route de Toliara, réputée pour ses oiseaux endémiques.', 'A transitional forest on the road to Toliara, known for its endemic birds.', -22.88619, 44.69143),
  ('nature', 'Lac Tritriva', 'Vakinankaratra', 'Un lac de cratère aux eaux vertes, entouré de légendes, près d''Antsirabe.', 'A green crater lake steeped in legend, near Antsirabe.', -19.92858, 46.92486),
  ('nature', 'Parc national d''Andohahela', 'Anosy', 'Un parc qui réunit forêt humide et forêt épineuse, près de Tolagnaro.', 'A park that brings together rainforest and spiny forest, near Tolagnaro.', -24.76575, 46.71907),
  ('nature', 'Réserve de Berenty', 'Anosy', 'Une réserve privée en bord de rivière, connue pour ses sifakas « danseurs ».', 'A private riverside reserve known for its ''dancing'' sifakas.', -24.99588, 46.29527),
  ('nature', 'Parc national de Tsimanampetsotsa', 'Atsimo-Andrefana', 'Un lac salé fréquenté par les flamants, au cœur de la forêt épineuse.', 'A salt lake visited by flamingos, in the heart of the spiny forest.', -24.19778, 43.83229)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
