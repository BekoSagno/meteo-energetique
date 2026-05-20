import { prisma } from '../../lib/prisma.js';
import { kitIdFromTopic } from '../topics.js';

const VALID_STATES = new Set(['ONLINE', 'OFFLINE', 'UNSTABLE']);

/**
 * Traite un message kits/{kitId}/status ou kits/{kitId}/ping.
 * Logique métier complète (power_status, power_logs) à brancher ensuite.
 */
export async function handleKitMessage(topic, payload) {
  const kitId = kitIdFromTopic(topic);
  if (!kitId) return;

  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch {
    console.warn(`[MQTT] Payload JSON invalide sur ${topic}`);
    return;
  }

  const kit = await prisma.iotKit.findUnique({
    where: { id: kitId },
    select: { id: true, sectorId: true, isActive: true },
  });

  if (!kit || !kit.isActive) {
    console.warn(`[MQTT] Kit inconnu ou inactif : ${kitId}`);
    return;
  }

  if (topic.endsWith('/ping')) {
    await prisma.iotKit.update({
      where: { id: kitId },
      data: { lastPing: new Date() },
    });
    return;
  }

  if (topic.endsWith('/status')) {
    const state = String(data.state ?? '').toUpperCase();
    if (!VALID_STATES.has(state)) {
      console.warn(`[MQTT] État invalide pour ${kitId} : ${data.state}`);
      return;
    }

    await prisma.$transaction([
      prisma.powerStatus.upsert({
        where: { sectorId: kit.sectorId },
        create: {
          sectorId: kit.sectorId,
          currentState: state,
          lastUpdated: new Date(),
        },
        update: {
          currentState: state,
          lastUpdated: new Date(),
        },
      }),
      prisma.powerLog.create({
        data: {
          sectorId: kit.sectorId,
          kitId: kit.id,
          stateChangedTo: state,
        },
      }),
    ]);
  }
}
