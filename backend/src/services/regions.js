import { prisma } from '../lib/prisma.js';

export async function listRegions() {
  const regions = await prisma.region.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { communes: true } },
    },
  });

  return regions.map((r) => ({
    id: r.id,
    name: r.name,
    communeCount: r._count.communes,
  }));
}
