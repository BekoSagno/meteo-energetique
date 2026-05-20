import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stats = await prisma.$queryRawUnsafe(`
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE ST_Dimension(boundary::geometry) = 2)::int AS surfaces,
    COUNT(*) FILTER (WHERE ST_Dimension(boundary::geometry) < 2)::int AS non_surfaces,
    ROUND(AVG(ST_Area(boundary::geography))::numeric / 1e6, 2) AS avg_area_km2
  FROM sectors
  WHERE boundary IS NOT NULL
`);

console.log('Secteurs:', stats[0]);

const samples = await prisma.$queryRawUnsafe(`
  SELECT c.name,
    GeometryType(ST_Union(s.boundary::geometry)) AS union_type,
    ROUND(ST_Area(ST_Union(s.boundary::geography))::numeric / 1e6, 2) AS commune_area_km2
  FROM communes c
  JOIN sectors s ON s.commune_id = c.id
  WHERE c.name IN ('Matoto', 'Tombolia', 'Kaloum')
  GROUP BY c.id, c.name
  ORDER BY c.name
`);

console.log('Communes (union):', samples);

await prisma.$disconnect();
