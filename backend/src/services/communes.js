import { prisma } from '../lib/prisma.js';

function createError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  throw err;
}

export async function listCommunesByRegion(regionId) {
  if (!regionId) {
    createError(400, 'VALIDATION_ERROR', 'Le paramètre regionId est requis.');
  }

  const id = Number.parseInt(String(regionId), 10);
  if (Number.isNaN(id)) {
    createError(400, 'VALIDATION_ERROR', 'regionId invalide.');
  }

  const communes = await prisma.commune.findMany({
    where: { regionId: id },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { quartiers: true } },
    },
  });

  return communes.map((c) => ({
    id: c.id,
    name: c.name,
    regionId: c.regionId,
    quartierCount: c._count.quartiers,
  }));
}
