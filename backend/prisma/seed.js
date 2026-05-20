/**
 * Seed Grand Conakry — 13 communes × 5 quartiers × 5 secteurs = 325 secteurs
 * Géométrie secteur : Point WGS84 dispersé (500 m – 1,5 km) autour du centre communal.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { COMMUNE_CENTERS } from '../src/lib/conakryCenters.js';
import {
  GRAND_CONAKRY_TREE,
  REGION_NAME,
  dispersedSectorCoordinates,
  initialConfidenceForState,
  initialPowerStateForSector,
} from './seed-data.js';

const prisma = new PrismaClient();

async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      user_reports,
      power_logs,
      power_status,
      iot_kits,
      users,
      sectors,
      quartiers,
      communes,
      regions
    RESTART IDENTITY CASCADE
  `);
}

async function ensureSectorPointGeometry() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE sectors
        ALTER COLUMN boundary TYPE geometry(Point,4326)
        USING CASE
          WHEN boundary IS NULL THEN NULL
          ELSE ST_SetSRID(ST_PointOnSurface(boundary::geometry), 4326)
        END
    `);
  } catch (_) {
    /* Type déjà compatible */
  }
}

async function insertSectorPoint(prisma, ids, lat, lng) {
  const inserted = await prisma.$queryRaw`
    INSERT INTO sectors (region_id, commune_id, quartier_id, name, boundary)
    VALUES (
      ${ids.regionId},
      ${ids.communeId},
      ${ids.quartierId},
      ${ids.sectorName},
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
    )
    RETURNING id
  `;
  return Number(inserted[0].id);
}

async function seed() {
  console.info('🌱 Seed Grand Conakry (centres fixes + points secteurs)\n');
  await resetDatabase();
  await ensureSectorPointGeometry();

  const region = await prisma.region.create({ data: { name: REGION_NAME } });
  console.info(`✓ Région : ${region.name}\n`);

  let defaultSectorId = null;
  let totalQuartiers = 0;
  let totalSectors = 0;
  const stateCounts = { ONLINE: 0, OFFLINE: 0, UNSTABLE: 0 };

  for (const block of GRAND_CONAKRY_TREE) {
    const communeName = block.commune;
    if (!COMMUNE_CENTERS[communeName]) {
      throw new Error(`Centre communal manquant pour « ${communeName} ».`);
    }

    const commune = await prisma.commune.create({
      data: { regionId: region.id, name: communeName },
    });
    console.info(`✓ ${communeName}`);

    for (const q of block.quartiers) {
      const quartier = await prisma.quartier.create({
        data: { communeId: commune.id, name: q.name },
      });
      totalQuartiers += 1;

      for (const sectorName of q.sectors) {
        const { lat, lng } = dispersedSectorCoordinates(communeName, q.name, sectorName);

        const sectorId = await insertSectorPoint(prisma, {
          regionId: region.id,
          communeId: commune.id,
          quartierId: quartier.id,
          sectorName,
        }, lat, lng);
        totalSectors += 1;

        const currentState = initialPowerStateForSector(communeName, q.name, sectorName);
        stateCounts[currentState] += 1;

        await prisma.powerStatus.create({
          data: {
            sectorId,
            currentState,
            confidenceScore: initialConfidenceForState(
              currentState,
              communeName,
              q.name,
              sectorName
            ),
          },
        });

        await prisma.iotKit.create({
          data: {
            id: `KIT-S${sectorId}`,
            sectorId,
            locationName: `Kit ${sectorName}`,
            isActive: true,
          },
        });

        if (communeName === 'Dixinn' && q.name === 'Dixinn Centre' && sectorName === 'Dixinn Centre Centre') {
          defaultSectorId = sectorId;
        }
      }
    }
    console.info('');
  }

  for (const phone of ['+224600000001', '+224600000002', '+224600000003']) {
    await prisma.user.create({
      data: {
        phoneNumber: phone,
        name: `Test ${phone.slice(-1)}`,
        defaultSectorId,
        isVerified: true,
      },
    });
  }

  const pct = (n) => ((n / totalSectors) * 100).toFixed(1);
  console.info(
    `📊 États initiaux : ONLINE ${stateCounts.ONLINE} (${pct(stateCounts.ONLINE)} %) · ` +
      `OFFLINE ${stateCounts.OFFLINE} (${pct(stateCounts.OFFLINE)} %) · ` +
      `UNSTABLE ${stateCounts.UNSTABLE} (${pct(stateCounts.UNSTABLE)} %)\n`
  );
  console.info(`✅ Terminé : ${GRAND_CONAKRY_TREE.length} communes, ${totalQuartiers} quartiers, ${totalSectors} secteurs\n`);
}

seed()
  .catch((e) => {
    console.error('❌', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
