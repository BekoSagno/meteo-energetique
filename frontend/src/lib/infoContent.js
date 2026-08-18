/**
 * Contenus mock du module Info — à remplacer par l’API / backoffice plus tard.
 */

export const INFO_TABS = [
  {
    id: 'actualites',
    label: 'Actualités',
    short: 'Alertes',
    description: 'Alertes et communiqués officiels liés au réseau.',
  },
  {
    id: 'panels',
    label: 'Panels',
    short: 'Expertise',
    description: 'Débats, tables rondes et contenus pédagogiques.',
  },
  {
    id: 'textes',
    label: 'Textes',
    short: 'Officiels',
    description: 'Décrets, arrêtés et documents réglementaires.',
  },
];

export const INFO_ITEMS = [
  {
    id: 'act-1',
    tab: 'actualites',
    badge: 'urgent',
    title: 'Coupure programmée à Matoto — mardi 14h à 17h',
    zone: 'Matoto · Kissosso, Nongo',
    date: '18 août 2026',
    summary:
      'Travaux sur un transformateur. Le courant sera rétabli progressivement à partir de 17h.',
    body: `EDG informe les usagers de Matoto qu’une coupure planifiée aura lieu mardi de 14h à 17h dans les secteurs Kissosso et Nongo, afin de sécuriser un transformateur.

Pendant cette période, évitez les appareils sensibles. Le rétablissement sera progressif à partir de 17h.

Cette information n’a pas d’impact automatique sur l’état temps réel affiché dans La Météo du Jour : suivez aussi le statut de votre secteur.`,
  },
  {
    id: 'act-2',
    tab: 'actualites',
    badge: 'officiel',
    title: 'Instabilité prévue ce soir en pointe (19h–22h)',
    zone: 'Grand Conakry',
    date: '18 août 2026',
    summary:
      'Forte demande attendue. Privilégiez les usages essentiels pendant la pointe.',
    body: `Une pointe de consommation est attendue ce soir entre 19h et 22h sur le Grand Conakry. Des baisses de tension peuvent survenir dans certains quartiers.

Conseil : reportez les usages lourds (climatisation, fer, pompes) hors de cette plage si possible.

Restez informés via cette page Info et le statut de votre secteur.`,
  },
  {
    id: 'act-3',
    tab: 'actualites',
    badge: 'officiel',
    title: 'Retour de courant confirmé à Kaloum',
    zone: 'Kaloum',
    date: '17 août 2026',
    summary: 'Les secteurs du centre-ville sont de nouveau sous tension.',
    body: `Après une intervention sur le réseau de Kaloum, le courant est rétabli sur l’ensemble des secteurs du centre-ville.

Si votre compteur reste hors tension, vérifiez d’abord qu’il est rechargé, puis signalez la situation depuis l’application (votre message n’altère pas l’état temps réel).`,
  },
  {
    id: 'pan-1',
    tab: 'panels',
    badge: 'expertise',
    title: 'Table ronde : comprendre le délestage à Conakry',
    zone: 'Conakry',
    date: '22 août 2026 · 15h',
    summary:
      'Ingénieurs réseau et collectivité expliquent les causes et les leviers d’amélioration.',
    body: `Panel public (durée 90 min) : pourquoi le délestage survient, comment il est décidé, et ce que les usagers peuvent planifier.

Format : présentation courte puis questions. Un compte rendu sera publié ici après la séance.

Lieu annoncé dans une actualité de suivi. Replay prévu dans cet onglet Panels.`,
  },
  {
    id: 'pan-2',
    tab: 'panels',
    badge: 'expertise',
    title: 'FAQ : compteur prépayé pendant une coupure',
    zone: 'Tous secteurs',
    date: '10 août 2026',
    summary: 'Ce qui est normal, ce qui ne l’est pas, et quand signaler.',
    body: `Pendant une coupure réseau, le compteur prépayé peut s’éteindre même s’il est chargé. Ce n’est pas forcément un problème de solde.

Après le retour du courant, le compteur doit se rallumer. S’il reste éteint alors que le quartier est alimenté, vérifiez le solde puis signalez depuis l’app.

Cette fiche sera enrichie avec des contenus EDG une fois le partenariat en place.`,
  },
  {
    id: 'txt-1',
    tab: 'textes',
    badge: 'document',
    title: 'Arrêté relatif à l’information des usagers sur les coupures planifiées',
    zone: 'Guinée',
    date: '12 mars 2026',
    summary: 'Cadre de publication des coupures programmées (document type).',
    body: `Document de référence (exemple) : les coupures planifiées doivent être communiquées aux usagers avec la zone, la plage horaire et, si possible, l’heure de rétablissement estimée.

Le PDF officiel sera téléchargeable ici lorsque le backoffice EDG sera connecté.

En attendant, cette fiche illustre le type de textes qui seront classés dans cet onglet.`,
    documentLabel: 'PDF — bientôt disponible',
  },
  {
    id: 'txt-2',
    tab: 'textes',
    badge: 'document',
    title: 'Note d’orientation — tarification et compteurs prépayés',
    zone: 'Guinée',
    date: '5 janvier 2026',
    summary: 'Note pédagogique sur les règles tarifaires (contenu de démonstration).',
    body: `Cette note d’orientation (exemple) rappelle les principes de facturation prépayée et les droits d’information des usagers.

Les versions officielles (décrets, arrêtés, circulaires) seront publiées ici par le personnel autorisé, avec date d’entrée en vigueur et fichier PDF.`,
    documentLabel: 'PDF — bientôt disponible',
  },
];

export function getInfoItemsByTab(tabId) {
  return INFO_ITEMS.filter((item) => item.tab === tabId);
}

export function getInfoItemById(id) {
  return INFO_ITEMS.find((item) => item.id === id) ?? null;
}
