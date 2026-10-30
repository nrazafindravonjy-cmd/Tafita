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
  ('nature', 'Réserve de Lokobe', 'Diana', 'La dernière forêt primaire de Nosy Be, où vivent caméléons et lémuriens.', 'Nosy Be''s last primary forest, home to chameleons and lemurs.', -13.39886, 48.32849),
  ('nature', 'Parc national de Tsimanampetsotsa', 'Atsimo-Andrefana', 'Un lac salé fréquenté par les flamants, au cœur de la forêt épineuse.', 'A salt lake visited by flamingos, in the heart of the spiny forest.', -24.19778, 43.83229),
  ('nature', 'Nosy Mangabe', 'Analanjirofo', 'Une île forestière de la baie d''Antongil, refuge de l''aye-aye.', 'A forested island in Antongil Bay, a refuge for the aye-aye.', -15.49512, 49.7676),
  ('nature', 'Lac Alaotra', 'Alaotra-Mangoro', 'Le plus grand lac du pays, entouré de rizières, seul habitat du lémurien bambou du lac Alaotra.', 'The country''s largest lake, ringed by rice fields and the only home of the Alaotra bamboo lemur.', -17.5, 48.45),
  ('nature', 'Parc national de Kirindy-Mitea', 'Menabe', 'Un parc côtier de forêts sèches, de mangroves et de lacs, au sud de Morondava.', 'A coastal park of dry forest, mangroves and lakes, south of Morondava.', -20.76598, 44.07784),
  ('nature', 'Chutes de la Lily', 'Itasy', 'Des chutes d''eau spectaculaires près d''Ampefy, dans la région des lacs volcaniques.', 'Spectacular waterfalls near Ampefy, in the volcanic lake region.', -19.03161, 46.68484)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
