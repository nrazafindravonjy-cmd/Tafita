-- 89 more published places, bringing the starter content to 100. Coordinates
-- come from OpenStreetMap, except the few marked "à vérifier" in
-- docs/LIEUX.md. Safe to re-run: places that already exist by name are skipped.
insert into places (category_id, name, region, description_fr, description_en, location, status)
select c.id, v.name, v.region, v.description_fr, v.description_en,
       st_makepoint(v.lng, v.lat)::geography, 'published'
from (values
  ('nature', 'Parc national de Masoala', 'Analanjirofo', 'La plus grande aire protégée du pays, où la forêt tropicale descend jusqu''à la mer et aux récifs coralliens.', 'The country''s largest protected area, where rainforest runs down to the sea and its coral reefs.', -15.61804, 49.97762),
  ('nature', 'Parc national de Marojejy', 'Sava', 'Un massif montagneux couvert de forêt humide, refuge du rare propithèque soyeux.', 'A rainforest-covered mountain massif, home to the rare silky sifaka.', -14.46146, 49.70179),
  ('nature', 'Parc national d''Ankarafantsika', 'Boeny', 'Une forêt sèche riche en lémuriens et en oiseaux, autour du lac Ravelobe.', 'A dry forest rich in lemurs and birds, around Lake Ravelobe.', -16.20363, 46.92179),
  ('nature', 'Tsingy Rouges', 'Diana', 'Des aiguilles de grès et de latérite rouge sculptées par l''érosion, près d''Antsiranana.', 'Red sandstone and laterite spires carved by erosion, near Antsiranana.', -12.64229, 49.49106),
  ('nature', 'Réserve spéciale de l''Ankarana', 'Diana', 'Un plateau calcaire de tsingy, de grottes et de canyons boisés.', 'A limestone plateau of tsingy, caves and forested canyons.', -12.96805, 49.13848),
  ('nature', 'Réserve communautaire d''Anja', 'Haute Matsiatra', 'Une réserve gérée par les villageois, célèbre pour ses makis catta au pied de falaises de granit.', 'A village-run reserve famous for its ring-tailed lemurs below granite cliffs.', -21.85721, 46.85084),
  ('nature', 'Parc national d''Andringitra', 'Haute Matsiatra', 'Un massif granitique propice à la randonnée, aux paysages de haute montagne.', 'A granite massif for hiking, with high-mountain landscapes.', -22.2243, 46.92863),
  ('nature', 'Pic Boby (Imarivolanitra)', 'Haute Matsiatra', 'Le deuxième sommet de Madagascar, accessible à pied depuis le parc d''Andringitra.', 'Madagascar''s second-highest summit, reached on foot from Andringitra National Park.', -22.19463, 46.88523),
  ('nature', 'Forêt de Kirindy', 'Menabe', 'Une forêt sèche où l''on observe le fossa, principal prédateur de l''île.', 'A dry forest where you can spot the fossa, the island''s top predator.', -20.06707, 44.65738),
  ('nature', 'Parc national de Zombitse-Vohibasia', 'Atsimo-Andrefana', 'Une forêt de transition sur la route de Toliara, réputée pour ses oiseaux endémiques.', 'A transitional forest on the road to Toliara, known for its endemic birds.', -22.88619, 44.69143),
  ('nature', 'Lac Tritriva', 'Vakinankaratra', 'Un lac de cratère aux eaux vertes, entouré de légendes, près d''Antsirabe.', 'A green crater lake steeped in legend, near Antsirabe.', -19.92858, 46.92486),
  ('nature', 'Parc national d''Andohahela', 'Anosy', 'Un parc qui réunit forêt humide et forêt épineuse, près de Tolagnaro.', 'A park that brings together rainforest and spiny forest, near Tolagnaro.', -24.76575, 46.71907),
  ('nature', 'Réserve de Berenty', 'Anosy', 'Une réserve privée en bord de rivière, connue pour ses sifakas « danseurs ».', 'A private riverside reserve known for its ''dancing'' sifakas.', -24.99588, 46.29527),
  ('nature', 'Réserve de Lokobe', 'Diana', 'La dernière forêt primaire de Nosy Be, où vivent caméléons et lémuriens.', 'Nosy Be''s last primary forest, home to chameleons and lemurs.', -13.39886, 48.32849),
  ('nature', 'Parc national de Tsimanampetsotsa', 'Atsimo-Andrefana', 'Un lac salé fréquenté par les flamants, au cœur de la forêt épineuse.', 'A salt lake visited by flamingos, in the heart of the spiny forest.', -24.19778, 43.83229),
  ('nature', 'Nosy Mangabe', 'Analanjirofo', 'Une île forestière de la baie d''Antongil, refuge de l''aye-aye.', 'A forested island in Antongil Bay, a refuge for the aye-aye.', -15.49512, 49.7676),
  ('nature', 'Lac Alaotra', 'Alaotra-Mangoro', 'Le plus grand lac du pays, entouré de rizières, seul habitat du lémurien bambou du lac Alaotra.', 'The country''s largest lake, ringed by rice fields and the only home of the Alaotra bamboo lemur.', -17.5, 48.45),
  ('nature', 'Parc national de Kirindy-Mitea', 'Menabe', 'Un parc côtier de forêts sèches, de mangroves et de lacs, au sud de Morondava.', 'A coastal park of dry forest, mangroves and lakes, south of Morondava.', -20.76598, 44.07784),
  ('nature', 'Chutes de la Lily', 'Itasy', 'Des chutes d''eau spectaculaires près d''Ampefy, dans la région des lacs volcaniques.', 'Spectacular waterfalls near Ampefy, in the volcanic lake region.', -19.03161, 46.68484),
  ('nature', 'Lac Itasy', 'Itasy', 'Un grand lac d''origine volcanique, à moins de deux heures de la capitale.', 'A large volcanic lake less than two hours from the capital.', -19.07, 46.79),
  ('nature', 'Geysers d''Analavory', 'Itasy', 'De petits geysers aux dépôts calcaires colorés, près du village d''Analavory.', 'Small geysers with colourful mineral deposits, near the village of Analavory.', -18.97464, 46.71618),
  ('nature', 'La Fenêtre de l''Isalo', 'Ihorombe', 'Une arche rocheuse naturelle, célèbre pour ses couchers de soleil.', 'A natural rock arch famous for its sunsets.', -22.64116, 45.30868),
  ('nature', 'Piscine naturelle de l''Isalo', 'Ihorombe', 'Un bassin d''eau claire bordé de palmiers, au milieu des canyons de l''Isalo.', 'A clear pool fringed with palms among the Isalo canyons.', -22.5664, 45.36423),
  ('hidden-gem', 'Cirque rouge', 'Boeny', 'Un amphithéâtre de terres rouges, ocre et blanches érodées, près de Mahajanga.', 'An amphitheatre of eroded red, ochre and white earth, near Mahajanga.', -15.63464, 46.35306),
  ('nature', 'Parc national de Mikea', 'Atsimo-Andrefana', 'Une forêt sèche et épineuse, territoire du peuple Mikea.', 'A dry spiny forest, homeland of the Mikea people.', -22.35574, 43.46032),
  ('nature', 'Réserve du Palmarium', 'Atsinanana', 'Une réserve au bord du lac Ampitabe, sur le canal des Pangalanes, où les lémuriens s''approchent des visiteurs.', 'A reserve on Lake Ampitabe, along the Pangalanes Canal, where lemurs come close to visitors.', -18.60602, 49.21068),
  ('nature', 'Mont Ibity', 'Vakinankaratra', 'Un massif de quartzite au sud d''Antsirabe, riche en plantes endémiques.', 'A quartzite massif south of Antsirabe, rich in endemic plants.', -20.10145, 47.0056),
  ('nature', 'Tsingy de Namoroka', 'Boeny', 'Un parc isolé de tsingy, de grottes et de piscines naturelles.', 'A remote park of tsingy, caves and natural pools.', -16.45408, 45.34665),
  ('nature', 'Réserve d''Ambohitantely', 'Analamanga', 'L''un des derniers fragments de forêt des Hautes Terres, au nord de la capitale.', 'One of the last fragments of highland forest, north of the capital.', -18.15951, 47.30558),
  ('nature', 'Lemurs'' Park', 'Analamanga', 'Un parc botanique près d''Antananarivo, où l''on voit plusieurs espèces de lémuriens en liberté.', 'A botanical park near Antananarivo with several free-roaming lemur species.', -18.95433, 47.35865),
  ('hidden-gem', 'Grotte d''Anjohibe', 'Boeny', 'Un vaste réseau de grottes à stalactites, au nord-est de Mahajanga.', 'A vast cave system with stalactites, north-east of Mahajanga.', -15.54229, 46.88538),
  ('hidden-gem', 'Lac sacré d''Antanavo', 'Diana', 'Un lac sacré peuplé de crocodiles, lié à une légende locale de village englouti.', 'A sacred lake home to crocodiles, tied to a local legend of a drowned village.', -12.75704, 49.25783),
  ('nature', 'Mont Passot', 'Diana', 'Le point culminant de Nosy Be, avec une vue sur les lacs de cratère.', 'Nosy Be''s highest point, overlooking its crater lakes.', -13.32165, 48.22905),
  ('nature', 'Montagne des Français', 'Diana', 'Un massif calcaire près d''Antsiranana, apprécié pour ses randonnées, ses grottes et ses baobabs.', 'A limestone massif near Antsiranana, popular for its hikes, caves and baobabs.', -12.33, 49.35),
  ('nature', 'Lac Mantasoa', 'Analamanga', 'Un lac de barrage entouré de pinèdes, lieu de week-end des habitants de la capitale.', 'A reservoir lake surrounded by pine forests, a weekend getaway for the capital.', -19.00958, 47.83885),
  ('nature', 'Réserve du Cap Sainte-Marie', 'Androy', 'L''extrémité sud de Madagascar, aux falaises battues par l''océan.', 'Madagascar''s southern tip, with cliffs battered by the ocean.', -25.56506, 45.17545),
  ('beach', 'Nosy Iranja', 'Diana', 'Deux îlots reliés à marée basse par un banc de sable blanc, refuge des tortues marines.', 'Two islets joined at low tide by a white sandbar, a refuge for sea turtles.', -13.59165, 47.81337),
  ('beach', 'Nosy Komba', 'Diana', 'Une île volcanique face à Nosy Be, connue pour ses lémuriens et son artisanat.', 'A volcanic island facing Nosy Be, known for its lemurs and handicrafts.', -13.46956, 48.3485),
  ('beach', 'Nosy Tanikely', 'Diana', 'Un îlot protégé idéal pour le snorkeling, parmi les tortues et les poissons de récif.', 'A protected islet ideal for snorkelling among turtles and reef fish.', -13.48291, 48.23804),
  ('beach', 'Nosy Sakatia', 'Diana', 'Une petite île calme à l''ouest de Nosy Be, réputée pour la plongée.', 'A quiet small island west of Nosy Be, known for diving.', -13.30589, 48.16239),
  ('beach', 'Île aux Nattes (Nosy Nato)', 'Analanjirofo', 'Une petite île sans voitures au sud de Sainte-Marie, bordée de plages et de lagons.', 'A small car-free island south of Sainte-Marie, fringed with beaches and lagoons.', -17.10913, 49.80703),
  ('beach', 'Anakao', 'Atsimo-Andrefana', 'Un village de pêcheurs Vezo aux plages de sable blanc, au sud de Toliara.', 'A Vezo fishing village with white-sand beaches, south of Toliara.', -23.65796, 43.64732),
  ('beach', 'Nosy Ve', 'Atsimo-Andrefana', 'Un îlot sacré face à Anakao, où nichent les phaétons à brins rouges.', 'A sacred islet off Anakao where red-tailed tropicbirds nest.', -23.64648, 43.60354),
  ('beach', 'Plage de Libanona', 'Anosy', 'Une plage abritée de Tolagnaro, propice à la baignade et au surf.', 'A sheltered Tolagnaro beach, good for swimming and surfing.', -25.03866, 46.99442),
  ('beach', 'Baie de Lokaro', 'Anosy', 'Une baie sauvage aux eaux turquoise, accessible en pirogue depuis Tolagnaro.', 'A wild turquoise bay reached by pirogue from Tolagnaro.', -24.94838, 47.11189),
  ('beach', 'Ramena', 'Diana', 'Un village de pêcheurs et sa plage, point de départ vers la mer d''Émeraude.', 'A fishing village and its beach, the starting point for the Emerald Sea.', -12.24243, 49.34565),
  ('beach', 'Mer d''Émeraude', 'Diana', 'Un lagon aux eaux vert émeraude, à l''entrée de la baie d''Antsiranana.', 'An emerald-green lagoon at the entrance to Antsiranana Bay.', -12.16829, 49.36759),
  ('beach', 'Andavadoaka', 'Atsimo-Andrefana', 'Un village Vezo isolé, connu pour ses récifs et sa gestion communautaire de la pêche.', 'A remote Vezo village known for its reefs and community-led fishing management.', -22.07305, 43.23863),
  ('beach', 'Salary', 'Atsimo-Andrefana', 'Une longue baie tranquille entre dunes et lagon, au nord de Toliara.', 'A long, quiet bay between dunes and lagoon, north of Toliara.', -22.56164, 43.28994),
  ('hidden-gem', 'Belo-sur-Mer', 'Menabe', 'Un village où l''on construit encore à la main de grandes goélettes en bois.', 'A village where large wooden schooners are still built by hand.', -20.7363, 44.002),
  ('beach', 'Nosy Mitsio', 'Diana', 'Un archipel sauvage au nord-est de Nosy Be, apprécié des plongeurs.', 'A wild archipelago north-east of Nosy Be, popular with divers.', -12.88122, 48.58365),
  ('beach', 'Nosy Hara', 'Diana', 'Un parc marin d''îlots calcaires au large de la côte nord-ouest.', 'A marine park of limestone islets off the north-west coast.', -12.24164, 49.01143),
  ('beach', 'Foulpointe (Mahavelona)', 'Atsinanana', 'Une station balnéaire protégée par un récif, avec les vestiges d''un fort circulaire.', 'A beach resort sheltered by a reef, with the remains of a circular fort.', -17.67887, 49.51185),
  ('beach', 'Plage d''Andilana', 'Diana', 'L''une des plus belles plages de Nosy Be, idéale au coucher du soleil.', 'One of Nosy Be''s finest beaches, ideal at sunset.', -13.25439, 48.18884),
  ('beach', 'Piscine naturelle d''Ambodiatafana', 'Analanjirofo', 'Des bassins naturels creusés dans la roche volcanique, au nord de Sainte-Marie.', 'Natural pools carved into volcanic rock, in the north of Sainte-Marie.', -16.72861, 50.01071),
  ('beach', 'Sainte-Luce', 'Anosy', 'Une baie préservée au nord de Tolagnaro, entre forêt littorale et plages désertes.', 'An unspoilt bay north of Tolagnaro, between coastal forest and empty beaches.', -24.7791, 47.19603),
  ('beach', 'Plage d''Ambatoloaka', 'Diana', 'La plage animée de Nosy Be, avec ses restaurants et ses centres de plongée.', 'Nosy Be''s lively beach, with restaurants and dive centres.', -13.39467, 48.20239),
  ('beach', 'Baie de Sakalava', 'Diana', 'Une baie ventée prisée des kitesurfeurs, près de Ramena.', 'A windy bay popular with kitesurfers, near Ramena.', -12.27645, 49.39364),
  ('hidden-gem', 'Lavanono', 'Androy', 'Un village isolé du Grand Sud, connu des surfeurs pour ses vagues.', 'A remote Deep South village known to surfers for its waves.', -25.42729, 44.93991),
  ('beach', 'Nosy Ankao', 'Sava', 'Une île au large de la côte nord-est, aux plages désertes.', 'An island off the north-east coast with deserted beaches.', -12.80413, 49.82687),
  ('culture', 'Palais d''Andafiavaratra', 'Analamanga', 'L''ancien palais du Premier ministre de la monarchie merina, devenu musée.', 'The former palace of the Merina monarchy''s prime minister, now a museum.', -18.92088, 47.53288),
  ('culture', 'Lac Anosy', 'Analamanga', 'Le lac en cœur de la capitale, bordé de jacarandas, avec le monument aux morts sur son île.', 'The lake at the heart of the capital, lined with jacarandas, with a war memorial on its island.', -18.9156, 47.5194),
  ('culture', 'Andohalo', 'Analamanga', 'Le quartier historique de la Haute-Ville d''Antananarivo, avec sa cathédrale et ses maisons anciennes.', 'The historic Upper Town district of Antananarivo, with its cathedral and old houses.', -18.9177, 47.53142),
  ('culture', 'Hôtel des Thermes d''Antsirabe', 'Vakinankaratra', 'Un grand hôtel colonial, symbole de la ville thermale d''Antsirabe.', 'A grand colonial hotel, symbol of the spa town of Antsirabe.', -19.86587, 47.03287),
  ('culture', 'Papier Antemoro d''Ambalavao', 'Haute Matsiatra', 'Un atelier où l''on fabrique à la main le papier traditionnel Antemoro décoré de fleurs.', 'A workshop where traditional Antemoro paper is handmade and decorated with flowers.', -21.83026, 46.94174),
  ('culture', 'Ambalavao', 'Haute Matsiatra', 'Une petite ville connue pour son grand marché aux zébus et ses vignobles.', 'A small town known for its large zebu market and vineyards.', -21.83162, 46.93847),
  ('culture', 'Haute-Ville de Fianarantsoa', 'Haute Matsiatra', 'Un quartier historique de ruelles et d''églises, sur les hauteurs de Fianarantsoa.', 'A historic quarter of lanes and churches on the heights of Fianarantsoa.', -21.46001, 47.07691),
  ('culture', 'Baobabs amoureux', 'Menabe', 'Deux baobabs enlacés, entourés d''une légende d''amour, près de Morondava.', 'Two entwined baobabs, surrounded by a love legend, near Morondava.', -20.21154, 44.39996),
  ('culture', 'Cimetière des pirates', 'Analanjirofo', 'Un cimetière ancien face à la baie d''Ambodifotatra, témoin de l''époque des pirates.', 'An old cemetery facing Ambodifotatra Bay, a relic of the pirate era.', -17.01211, 49.84753),
  ('culture', 'Ambodifotatra', 'Analanjirofo', 'La petite capitale de Sainte-Marie, avec l''une des plus anciennes églises catholiques du pays.', 'Sainte-Marie''s small capital, with one of the country''s oldest Catholic churches.', -16.99964, 49.85258),
  ('culture', 'Ambositra', 'Amoron''i Mania', 'La capitale de l''artisanat du bois et de la marqueterie.', 'The capital of woodcraft and marquetry.', -20.53281, 47.24505),
  ('culture', 'Antoetra', 'Amoron''i Mania', 'La porte des villages Zafimaniry, dont le savoir-faire du bois est inscrit au patrimoine immatériel de l''UNESCO.', 'Gateway to the Zafimaniry villages, whose woodcraft is on UNESCO''s Intangible Heritage list.', -20.77583, 47.31733),
  ('culture', 'Hell-Ville (Andoany)', 'Diana', 'La ville principale de Nosy Be, avec son marché et ses maisons coloniales.', 'Nosy Be''s main town, with its market and colonial houses.', -13.40541, 48.2743),
  ('culture', 'Antsiranana (Diego-Suarez)', 'Diana', 'Une ville portuaire aux architectures coloniales, sur l''une des plus grandes baies du monde.', 'A port city of colonial architecture on one of the world''s largest bays.', -12.27796, 49.29137),
  ('culture', 'Toamasina', 'Atsinanana', 'Le premier port du pays, animé, et porte d''entrée du canal des Pangalanes.', 'The country''s busiest port and gateway to the Pangalanes Canal.', -18.1554, 49.40984),
  ('culture', 'Colline royale d''Antsahadinta', 'Analamanga', 'L''une des douze collines sacrées de l''Imerina, avec ses tombeaux royaux.', 'One of the twelve sacred hills of Imerina, with its royal tombs.', -19.01232, 47.45721),
  ('culture', 'Colline d''Ilafy', 'Analamanga', 'Une colline royale de l''Imerina, avec un ancien palais en bois devenu musée.', 'A royal Imerina hill with an old wooden palace turned museum.', -18.85402, 47.56559),
  ('culture', 'Ampefy', 'Itasy', 'Un village au bord du lac Itasy, point de départ vers les chutes de la Lily et les geysers.', 'A village on Lake Itasy, the starting point for the Lily Falls and the geysers.', -19.0415, 46.73238),
  ('culture', 'Manakara', 'Fitovinany', 'Le terminus côtier du train Fianarantsoa–Côte Est, entre océan et canal des Pangalanes.', 'The coastal terminus of the Fianarantsoa–East Coast railway, between ocean and Pangalanes Canal.', -22.14496, 48.01135),
  ('culture', 'Mananjary', 'Vatovavy', 'Une ville côtière connue pour le Sambatra, grande cérémonie de circoncision collective.', 'A coastal town known for the Sambatra, a major collective circumcision ceremony.', -21.23854, 48.3463),
  ('culture', 'Mahajanga', 'Boeny', 'Une ville portuaire ensoleillée, célèbre pour son baobab géant et sa corniche.', 'A sunny port city famous for its giant baobab and seafront promenade.', -15.71815, 46.31726),
  ('culture', 'Toliara', 'Atsimo-Andrefana', 'La grande ville du Sud-Ouest, porte d''entrée vers les plages et le lagon.', 'The South-West''s main city and gateway to its beaches and lagoon.', -23.35417, 43.66966),
  ('culture', 'Tolagnaro (Fort-Dauphin)', 'Anosy', 'Une ville entre montagnes et baies, avec les vestiges du fort Flacourt.', 'A town between mountains and bays, with the remains of Fort Flacourt.', -25.0295, 46.97318),
  ('culture', 'Morondava', 'Menabe', 'La ville côtière proche de l''Allée des Baobabs, point de départ vers Kirindy et les Tsingy.', 'The coastal town near the Avenue of the Baobabs, the starting point for Kirindy and the Tsingy.', -20.29508, 44.27865),
  ('food', 'Ambanja', 'Diana', 'La capitale du cacao malgache, dans la vallée du Sambirano.', 'The capital of Malagasy cocoa, in the Sambirano valley.', -13.68145, 48.45284),
  ('food', 'Sambava', 'Sava', 'Au cœur de la région de la vanille, l''une des meilleures au monde.', 'At the heart of the vanilla region, one of the world''s finest.', -14.25496, 50.15565),
  ('food', 'Antalaha', 'Sava', 'Une ville côtière qui vit au rythme du commerce de la vanille.', 'A coastal town that lives by the vanilla trade.', -14.90123, 50.28104),
  ('food', 'Dzamandzar', 'Diana', 'Le village de la sucrerie de Nosy Be, berceau du rhum local.', 'Home of Nosy Be''s sugar mill and birthplace of the local rum.', -13.35161, 48.19439),
  ('hidden-gem', 'Vallée de Tsaranoro', 'Haute Matsiatra', 'Une vallée dominée par des parois de granit, paradis de l''escalade et de la randonnée.', 'A valley overlooked by granite walls, a paradise for climbing and hiking.', -21.82366, 46.97685)
) as v(category, name, region, description_fr, description_en, lat, lng)
join categories c on c.slug = v.category
where not exists (select 1 from places p where p.name = v.name);

-- Move the first starter places onto OpenStreetMap coordinates.
update places set location = st_makepoint(44.41927, -20.25033)::geography where name = 'Allée des Baobabs' and created_by is null;
update places set location = st_makepoint(44.8306, -18.91332)::geography where name = 'Tsingy de Bemaraha' and created_by is null;
update places set location = st_makepoint(45.27241, -22.42583)::geography where name = 'Parc national de l''Isalo' and created_by is null;
update places set location = st_makepoint(47.41437, -21.26001)::geography where name = 'Parc national de Ranomafana' and created_by is null;
update places set location = st_makepoint(48.4304, -18.93594)::geography where name = 'Andasibe-Mantadia' and created_by is null;
update places set location = st_makepoint(49.14476, -12.62941)::geography where name = 'Montagne d''Ambre' and created_by is null;
update places set location = st_makepoint(48.26644, -13.31191)::geography where name = 'Nosy Be' and created_by is null;
update places set location = st_makepoint(43.61054, -23.15925)::geography where name = 'Ifaty' and created_by is null;
update places set location = st_makepoint(47.53215, -18.92361)::geography where name = 'Rova d''Antananarivo' and created_by is null;
update places set location = st_makepoint(47.56532, -18.75933)::geography where name = 'Colline royale d''Ambohimanga' and created_by is null;
