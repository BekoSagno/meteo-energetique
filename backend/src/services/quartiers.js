import { prisma } from '../lib/prisma.js';

function createError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  throw err;
}

export async function listQuartiersByCommune(communeId) {
  if (communeId == null) {
    createError(400, 'VALIDATION_ERROR', 'Le paramètre communeId est requis.');
  }

  const id = Number.parseInt(String(communeId), 10);
  if (Number.isNaN(id)) {
    createError(400, 'VALIDATION_ERROR', 'communeId invalide.');
  }

  const quartiers = await prisma.quartier.findMany({
    where: { communeId: id },
    orderBy: { name: 'asc' },
    include: { _count: { select: { sectors: true } } },
  });

  return quartiers.map((q) => ({
    id: q.id,
    name: q.name,
    communeId: q.communeId,
    sectorCount: q._count.sectors,
  }));
}
