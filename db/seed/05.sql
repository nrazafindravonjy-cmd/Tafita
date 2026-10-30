-- Starter places, part 5 of 10. Paste and run on its own; the result lists
-- the places added. Places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('nature', 'Lemurs'' Park', 'Analamanga', 'Un parc botanique près d''Antananarivo, où l''on voit plusieurs espèces de lémuriens en liberté.', 'A botanical park near Antananarivo with several free-roaming lemur species.', -18.95433, 47.35865),
  ('nature', 'Mont Passot', 'Diana', 'Le point culminant de Nosy Be, avec une vue sur les lacs de cratère.', 'Nosy Be''s highest point, overlooking its crater lakes.', -13.32165, 48.22905),
  ('nature', 'Montagne des Français', 'Diana', 'Un massif calcaire près d''Antsiranana, apprécié pour ses randonnées, ses grottes et ses baobabs.', 'A limestone massif near Antsiranana, popular for its hikes, caves and baobabs.', -12.33, 49.35),
  ('nature', 'Lac Mantasoa', 'Analamanga', 'Un lac de barrage entouré de pinèdes, lieu de week-end des habitants de la capitale.', 'A reservoir lake surrounded by pine forests, a weekend getaway for the capital.', -19.00958, 47.83885),
  ('beach', 'Nosy Iranja', 'Diana', 'Deux îlots reliés à marée basse par un banc de sable blanc, refuge des tortues marines.', 'Two islets joined at low tide by a white sandbar, a refuge for sea turtles.', -13.59165, 47.81337),
  ('beach', 'Nosy Komba', 'Diana', 'Une île volcanique face à Nosy Be, connue pour ses lémuriens et son artisanat.', 'A volcanic island facing Nosy Be, known for its lemurs and handicrafts.', -13.46956, 48.3485),
  ('beach', 'Nosy Tanikely', 'Diana', 'Un îlot protégé idéal pour le snorkeling, parmi les tortues et les poissons de récif.', 'A protected islet ideal for snorkelling among turtles and reef fish.', -13.48291, 48.23804)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name)
returning name;
