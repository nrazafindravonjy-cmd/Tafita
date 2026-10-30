// Publisher details shown in the legal pages.
export const Publisher = {
  name: 'Nirintsoa Patrick Razafindravonjy',
  contactEmail: 'n.razafindravonjy@gmail.com',
  country: 'Madagascar',
  updatedOn: '3 novembre 2026',
} as const;

type Section = { title: string; body: string };
export type LegalDocumentId = 'privacy' | 'terms';
type LegalDocument = { title: string; sections: Section[] };

const p = Publisher;

const fr: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: 'Politique de confidentialité',
    sections: [
      { title: 'Qui est responsable', body: `Tafita est éditée par ${p.name} (${p.country}). Pour toute question sur vos données : ${p.contactEmail}.` },
      {
        title: 'Données collectées',
        body: "Compte : nom, adresse e-mail et mot de passe (stocké chiffré par notre service d'authentification). Profil : nom d'utilisateur et langue. Contenus que vous publiez : avis, notes, photos, lieux proposés et signalements. Données techniques : journaux de connexion conservés par nos hébergeurs. Tafita n'utilise ni publicité ni cookie de suivi ; seule votre session de connexion est enregistrée dans votre navigateur.",
      },
      {
        title: 'Pourquoi',
        body: "Pour vous fournir le service (créer votre compte, publier vos contenus) et pour la modération et la sécurité de la communauté. Ces traitements reposent sur l'exécution du service que vous demandez et sur l'intérêt légitime de protéger les utilisateurs.",
      },
      {
        title: 'Qui y a accès',
        body: "Vos avis, photos, nom d'utilisateur et lieux proposés sont publics dans l'application. Votre e-mail n'est jamais affiché. Nos prestataires techniques traitent les données pour notre compte : Neon (base de données, authentification et stockage des photos, hébergés à Francfort, Union européenne) et Vercel (hébergement du site). Les fonds de carte (OpenFreeMap, EOX), la recherche de lieux (OpenStreetMap Nominatim) et les photos de Wikimedia Commons sont chargés depuis leurs serveurs, qui reçoivent donc votre adresse IP.",
      },
      {
        title: "Transferts hors de l'Union européenne",
        body: "Certains prestataires, comme Vercel, peuvent traiter des données aux États-Unis. Ces transferts sont encadrés par les garanties prévues par le RGPD, comme les clauses contractuelles types de la Commission européenne.",
      },
      {
        title: 'Durée de conservation',
        body: "Vos données sont conservées tant que votre compte existe. Quand vous supprimez votre compte, votre profil, vos avis, vos photos et vos signalements sont effacés immédiatement. Les lieux que vous avez proposés et qui ont été publiés restent visibles, sans votre nom.",
      },
      {
        title: 'Vos droits',
        body: `Vous pouvez accéder à vos données, les corriger, les supprimer (bouton « Supprimer mon compte » dans le Profil), demander leur portabilité ou vous opposer à leur traitement en écrivant à ${p.contactEmail}. Vous pouvez aussi adresser une réclamation à l'autorité de protection des données de votre pays, en France la CNIL (cnil.fr).`,
      },
      { title: 'Âge minimum', body: "Tafita s'adresse aux personnes de 15 ans et plus." },
    ],
  },
  terms: {
    title: "Conditions d'utilisation",
    sections: [
      { title: 'Objet', body: `Tafita est une application gratuite pour découvrir Madagascar, ses lieux et sa culture, éditée par ${p.name}. En créant un compte, vous acceptez ces conditions.` },
      { title: 'Votre compte', body: "Vous êtes responsable de votre compte et de la confidentialité de votre mot de passe. Les informations que vous donnez doivent être exactes." },
      {
        title: 'Ce que vous pouvez publier',
        body: "Publiez des avis sincères sur des lieux que vous connaissez et des photos que vous avez prises vous-même ou que vous avez le droit de partager. Sont interdits : les contenus illégaux, haineux, violents ou à caractère sexuel, le harcèlement, la publicité, les fausses informations, et les photos où une personne est reconnaissable sans son accord.",
      },
      {
        title: 'Vos contenus',
        body: "Vous restez propriétaire de vos contenus. En les publiant, vous autorisez Tafita à les afficher gratuitement dans l'application, partout dans le monde, tant qu'ils y sont publiés. Vous pouvez les supprimer en supprimant votre compte.",
      },
      {
        title: 'Modération et signalements',
        body: "Chacun peut signaler un avis ou une photo. Les modérateurs peuvent retirer tout contenu contraire à ces conditions et, en cas d'abus répétés, supprimer un compte.",
      },
      {
        title: 'Informations sur les lieux',
        body: "Les descriptions, positions et avis sont donnés à titre indicatif. Vérifiez sur place les conditions d'accès, les horaires et la sécurité ; Tafita ne peut pas garantir leur exactitude.",
      },
      { title: 'Photos et cartes', body: "Les photos de lieux proviennent de Wikimedia Commons sous licences libres, avec leur auteur et leur licence indiqués. Les cartes utilisent les données d'OpenStreetMap." },
      { title: 'Modifications', body: "Ces conditions peuvent évoluer ; la date de mise à jour figure en bas de page. En cas de changement important, vous en serez informé dans l'application." },
      { title: 'Droit applicable', body: `Ces conditions sont régies par le droit du pays de l'éditeur (${p.country}), sans priver les utilisateurs de la protection que leur accorde la loi de leur pays.` },
    ],
  },
};

const en: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: 'Privacy policy',
    sections: [
      { title: 'Who is responsible', body: `Tafita is published by ${p.name} (${p.country}). For any question about your data: ${p.contactEmail}.` },
      {
        title: 'Data we collect',
        body: 'Account: name, email address and password (stored encrypted by our sign-in service). Profile: username and language. Content you publish: reviews, ratings, photos, suggested places and reports. Technical data: connection logs kept by our hosting providers. Tafita uses no advertising or tracking cookies; only your sign-in session is stored in your browser.',
      },
      {
        title: 'Why',
        body: 'To provide the service (create your account, publish your content) and to moderate and secure the community. This relies on providing the service you ask for and on our legitimate interest in protecting users.',
      },
      {
        title: 'Who can see it',
        body: 'Your reviews, photos, username and suggested places are public in the app. Your email is never shown. Our technical providers process data on our behalf: Neon (database, sign-in and photo storage, hosted in Frankfurt, European Union) and Vercel (website hosting). Map tiles (OpenFreeMap, EOX), place search (OpenStreetMap Nominatim) and Wikimedia Commons photos load from their servers, which therefore receive your IP address.',
      },
      {
        title: 'Transfers outside the European Union',
        body: 'Some providers, such as Vercel, may process data in the United States. These transfers rely on the safeguards provided by the GDPR, such as the European Commission’s standard contractual clauses.',
      },
      {
        title: 'How long we keep it',
        body: 'We keep your data while your account exists. When you delete your account, your profile, reviews, photos and reports are erased immediately. Places you suggested that were published stay visible, without your name.',
      },
      {
        title: 'Your rights',
        body: `You can access, correct, delete (the “Delete my account” button in Profile), port or object to the processing of your data by writing to ${p.contactEmail}. You can also complain to your country’s data protection authority, such as the CNIL in France (cnil.fr).`,
      },
      { title: 'Minimum age', body: 'Tafita is intended for people aged 15 and over.' },
    ],
  },
  terms: {
    title: 'Terms of use',
    sections: [
      { title: 'Purpose', body: `Tafita is a free app to discover Madagascar, its places and its culture, published by ${p.name}. By creating an account, you accept these terms.` },
      { title: 'Your account', body: 'You are responsible for your account and for keeping your password secret. The information you give must be accurate.' },
      {
        title: 'What you can publish',
        body: 'Publish honest reviews of places you know and photos you took yourself or have the right to share. Forbidden: illegal, hateful, violent or sexual content, harassment, advertising, false information, and photos where someone can be recognised without their consent.',
      },
      {
        title: 'Your content',
        body: 'You keep ownership of your content. By publishing it, you allow Tafita to display it free of charge in the app, worldwide, for as long as it is published. You can remove it by deleting your account.',
      },
      {
        title: 'Moderation and reports',
        body: 'Anyone can report a review or a photo. Moderators may remove any content that breaks these terms and, after repeated abuse, delete an account.',
      },
      {
        title: 'Information about places',
        body: 'Descriptions, positions and reviews are given for guidance only. Check access, opening hours and safety on site; Tafita cannot guarantee they are accurate.',
      },
      { title: 'Photos and maps', body: 'Place photos come from Wikimedia Commons under free licences, credited with their author and licence. Maps use OpenStreetMap data.' },
      { title: 'Changes', body: 'These terms may change; the update date is shown at the bottom. You will be told in the app about any significant change.' },
      { title: 'Governing law', body: `These terms are governed by the law of the publisher’s country (${p.country}), without removing the protection users have under the law of their own country.` },
    ],
  },
};

export function legalDocument(id: LegalDocumentId, language: string): LegalDocument {
  return (language === 'en' ? en : fr)[id];
}
