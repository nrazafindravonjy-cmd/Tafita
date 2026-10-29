# Tafita — Cadrage du MVP

## Vision

Tafita est l'application de référence pour découvrir Madagascar, parce qu'elle réunit la carte des lieux (comme Google Maps), le partage communautaire de photos et d'avis (comme Instagram) et une revue de la culture malgache.

## Cibles

Les touristes étrangers cherchent où aller, comment s'y rendre et ce qui vaut vraiment le détour. La diaspora malgache, quant à elle, veut redécouvrir le pays, partager ses adresses et rester liée à sa culture. L'application est donc bilingue français et anglais dès le premier jour, aussi bien pour l'interface que pour le contenu des lieux.

## Périmètre du MVP

Le MVP contient quatre fonctionnalités, car elles suffisent à rendre l'application utile tout en restant réalisables rapidement :

1. **Carte et fiches lieux** : une carte des lieux publiés, filtrable par catégorie, et une fiche par lieu avec photos, description bilingue, région et note moyenne.
2. **Avis** : un utilisateur connecté note un lieu de 1 à 5, écrit un commentaire et ajoute des photos, avec un seul avis par lieu et par utilisateur.
3. **Proposition de lieux** : un utilisateur connecté propose un nouveau lieu, qui reste en attente jusqu'à sa validation par un modérateur.
4. **Comptes** : inscription par e-mail ou Google, un profil public et le choix de la langue.

Le fil social, les abonnements, la revue culturelle éditoriale, les itinéraires et le mode hors-ligne complet sont repoussés après le MVP, parce qu'ils n'ont de valeur qu'une fois la base de contenu constituée.

## Écrans

Le MVP comporte six écrans : la carte, l'onglet Découvrir (liste et recherche), la fiche lieu, l'ajout d'un avis, la proposition d'un lieu et le profil.

## Choix techniques

| Besoin | Choix | Raison |
|---|---|---|
| Application | Expo (React Native, TypeScript) | un seul code pour iOS, Android et web |
| Backend | Neon (Postgres, PostGIS, Neon Auth, Data API) | offre gratuite sans mise en pause et recherche géographique native |
| Carte | MapLibre + tuiles OpenFreeMap | gratuit, sans clé ni quota |
| Photos | Cloudflare R2 | 10 Go gratuits et aucun frais de bande passante |
| Traductions | i18next + expo-localization | langue détectée sur l'appareil, français par défaut |

Le modèle de données est défini dans `db/migrations/20261028000000_init.sql`, et les règles d'accès (RLS) garantissent qu'un lieu proposé reste invisible au public tant qu'un modérateur ne l'a pas publié.

## Coûts

Le développement est gratuit. Les seules dépenses inévitables sont la publication sur Google Play (25 $ une fois) et sur l'App Store (99 $ par an), tandis que Neon reste gratuit au lancement, puisque sa base s'endort sans être mise en pause.

## Feuille de route

1. **Fondations** (fait) : projet Expo, navigation, traductions, client de données et schéma de base.
2. **Carte** : intégration de MapLibre, affichage des lieux et fiche lieu.
3. **Comptes** : authentification et profil.
4. **Avis et photos** : rédaction d'avis et envoi de photos compressées vers R2.
5. **Proposition et modération** : formulaire de lieu et file de validation.
6. **Contenu et bêta** : 50 à 100 lieux de qualité, puis une bêta fermée.

## Indicateurs de succès de la bêta

La bêta sera jugée réussie si au moins 100 utilisateurs actifs publient au moins 200 avis et proposent au moins 30 nouveaux lieux en deux mois.
