import { prisma } from '../lib/prisma.js';

const SEED_PUBLICATIONS = [
  {
    tab: 'actualites',
    badge: 'urgent',
    title: 'Coupure programmée à Matoto — mardi 14h à 17h',
    zoneLabel: 'Matoto · Kissosso, Nongo',
    summary: 'Travaux sur un transformateur. Le courant sera rétabli progressivement à partir de 17h.',
    body: `EDG informe les usagers de Matoto qu’une coupure planifiée aura lieu mardi de 14h à 17h dans les secteurs Kissosso et Nongo, afin de sécuriser un transformateur.

Pendant cette période, évitez les appareils sensibles. Le rétablissement sera progressif à partir de 17h.`,
    shortMessage: 'EDG: coupure planifiee Matoto mar. 14h-17h (Kissosso/Nongo).',
    channelInApp: true,
    channelSms: true,
    channelWhatsapp: true,
  },
  {
    tab: 'actualites',
    badge: 'officiel',
    title: 'Instabilité prévue ce soir en pointe (19h–22h)',
    zoneLabel: 'Grand Conakry',
    summary: 'Forte demande attendue. Privilégiez les usages essentiels pendant la pointe.',
    body: `Une pointe de consommation est attendue ce soir entre 19h et 22h sur le Grand Conakry. Des baisses de tension peuvent survenir dans certains quartiers.`,
    shortMessage: 'EDG: pointe 19h-22h Grand Conakry. Usages lourds a eviter.',
    channelInApp: true,
    channelSms: false,
    channelWhatsapp: false,
  },
  {
    tab: 'panels',
    badge: 'expertise',
    title: 'Table ronde : comprendre le délestage à Conakry',
    zoneLabel: 'Conakry',
    summary: 'Ingénieurs réseau et collectivité expliquent les causes et les leviers d’amélioration.',
    body: `Panel public (durée 90 min) : pourquoi le délestage survient, comment il est décidé, et ce que les usagers peuvent planifier.`,
    shortMessage: null,
    channelInApp: true,
    channelSms: false,
    channelWhatsapp: false,
  },
  {
    tab: 'textes',
    badge: 'document',
    title: 'Arrêté relatif à l’information des usagers sur les coupures planifiées',
    zoneLabel: 'Guinée',
    summary: 'Cadre de publication des coupures programmées (document type).',
    body: `Document de référence : les coupures planifiées doivent être communiquées aux usagers avec la zone, la plage horaire et l’heure de rétablissement estimée.`,
    shortMessage: null,
    channelInApp: true,
    channelSms: false,
    channelWhatsapp: false,
  },
];

function formatPublication(row) {
  return {
    id: `pub-${row.id}`,
    tab: row.tab,
    badge: row.badge,
    title: row.title,
    zone: row.zoneLabel,
    date: new Date(row.publishedAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    summary: row.summary,
    body: row.body,
    documentLabel: row.tab === 'textes' ? 'PDF — bientôt disponible' : null,
    channels: {
      inApp: row.channelInApp,
      sms: row.channelSms,
      whatsapp: row.channelWhatsapp,
    },
    shortMessage: row.shortMessage,
  };
}

async function ensureSeedPublications() {
  const count = await prisma.infoPublication.count();
  if (count > 0) return;
  await prisma.infoPublication.createMany({ data: SEED_PUBLICATIONS });
}

export async function listAllInfoForStaff() {
  await ensureSeedPublications();
  const rows = await prisma.infoPublication.findMany({
    orderBy: { publishedAt: 'desc' },
  });
  return rows.map((row) => ({
    ...formatPublication(row),
    numericId: row.id,
    status: row.status,
    communeId: row.communeId,
  }));
}

export async function createInfoPublication(body) {
  const tab = String(body.tab ?? 'actualites').trim();
  if (!['actualites', 'panels', 'textes'].includes(tab)) {
    const err = new Error('Rubrique invalide.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const title = String(body.title ?? '').trim();
  const summary = String(body.summary ?? '').trim();
  const bodyText = String(body.body ?? '').trim();
  const zoneLabel = String(body.zoneLabel ?? 'Grand Conakry').trim();

  if (title.length < 8 || summary.length < 8 || bodyText.length < 12) {
    const err = new Error('Titre, résumé et texte sont requis.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const communeId =
    body.communeId != null && body.communeId !== ''
      ? Number.parseInt(String(body.communeId), 10)
      : null;

  const created = await prisma.infoPublication.create({
    data: {
      tab,
      badge: String(body.badge ?? (tab === 'actualites' ? 'officiel' : tab === 'textes' ? 'document' : 'expertise')),
      title,
      summary,
      body: bodyText,
      zoneLabel,
      communeId: Number.isFinite(communeId) ? communeId : null,
      shortMessage: body.shortMessage ? String(body.shortMessage).slice(0, 160) : null,
      channelInApp: body.channelInApp !== false,
      channelSms: Boolean(body.channelSms),
      channelWhatsapp: Boolean(body.channelWhatsapp),
      status: 'published',
    },
  });

  const queued = await enqueuePublicationNotifications(created.id);
  return { item: formatPublication(created), queued: queued.queued };
}

export async function listPublishedInfo({ tab } = {}) {
  await ensureSeedPublications();

  const where = { status: 'published' };
  if (tab) where.tab = String(tab);

  const rows = await prisma.infoPublication.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
  });
  return rows.map(formatPublication);
}

/**
 * Prépare la file d’envoi (queued) selon zone + opt-in.
 * N’envoie aucun SMS ni WhatsApp.
 */
export async function enqueuePublicationNotifications(publicationId) {
  const publication = await prisma.infoPublication.findUnique({
    where: { id: publicationId },
  });
  if (!publication || publication.status !== 'published') {
    return { queued: 0 };
  }

  const userWhere = { isVerified: true };
  if (publication.sectorId) userWhere.defaultSectorId = publication.sectorId;
  else if (publication.quartierId) userWhere.quartierId = publication.quartierId;
  else if (publication.communeId) userWhere.communeId = publication.communeId;

  const users = await prisma.user.findMany({
    where: userWhere,
    select: {
      id: true,
      notifyInApp: true,
      notifySms: true,
      notifyWhatsapp: true,
    },
  });

  const rows = [];
  for (const user of users) {
    if (publication.channelInApp && user.notifyInApp) {
      rows.push({ publicationId, userId: user.id, channel: 'in_app', status: 'queued' });
    }
    if (publication.channelSms && user.notifySms) {
      rows.push({ publicationId, userId: user.id, channel: 'sms', status: 'queued' });
    }
    if (publication.channelWhatsapp && user.notifyWhatsapp) {
      rows.push({ publicationId, userId: user.id, channel: 'whatsapp', status: 'queued' });
    }
  }

  if (rows.length === 0) return { queued: 0 };

  await prisma.notificationOutbox.createMany({
    data: rows,
    skipDuplicates: true,
  });

  return { queued: rows.length };
}
