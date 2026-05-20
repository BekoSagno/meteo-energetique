import { parseCoordinates, pointWkt } from '../lib/geo.js';
import { prisma } from '../lib/prisma.js';
import { findSectorAtCoordinates } from './sectors.js';

export const VALID_REPORT_TYPES = [
  'TOTAL_DARKNESS',
  'LOW_VOLTAGE',
  'STABLE_RETURN',
];

/** Seuil de consensus : nombre total de signalements (fenêtre glissante). */
export const CONSENSUS_THRESHOLD = 3;
export const CONSENSUS_WINDOW_MS = 5 * 60 * 1000;

const REPORT_TYPE_TO_POWER_STATE = {
  TOTAL_DARKNESS: 'OFFLINE',
  LOW_VOLTAGE: 'UNSTABLE',
  STABLE_RETURN: 'ONLINE',
};

function createError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

export function validateReportType(reportType) {
  const normalized = String(reportType ?? '')
    .trim()
    .toUpperCase();

  if (!VALID_REPORT_TYPES.includes(normalized)) {
    throw createError(
      400,
      'VALIDATION_ERROR',
      `reportType invalide. Valeurs acceptées : ${VALID_REPORT_TYPES.join(', ')}`
    );
  }

  return normalized;
}

function parseOptionalUserId(userId) {
  if (userId === undefined || userId === null || userId === '') {
    return null;
  }

  const parsed = Number.parseInt(String(userId), 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    throw createError(
      400,
      'VALIDATION_ERROR',
      'userId doit être un entier positif ou être omis.'
    );
  }

  return parsed;
}

async function resolveUserId(userId) {
  if (userId === null) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw createError(
      400,
      'USER_NOT_FOUND',
      `Aucun utilisateur avec l'id ${userId}. Lancez npm run db:seed pour créer les comptes de test.`
    );
  }

  return user.id;
}

async function insertUserReport({ sectorId, userId, reportType, latitude, longitude }) {
  const locationWkt = pointWkt(longitude, latitude);

  const rows = await prisma.$queryRaw`
    INSERT INTO user_reports (user_id, sector_id, report_type, user_location)
    VALUES (
      ${userId},
      ${sectorId},
      ${reportType},
      ST_GeomFromText(${locationWkt}, 4326)
    )
    RETURNING
      id,
      user_id AS "userId",
      sector_id AS "sectorId",
      report_type AS "reportType",
      reported_at AS "reportedAt"
  `;

  const row = rows[0];
  return {
    id: row.id.toString(),
    userId: row.userId,
    sectorId: row.sectorId,
    reportType: row.reportType,
    reportedAt: row.reportedAt,
  };
}

async function countReportsInConsensusWindow(sectorId, reportType) {
  const windowStart = new Date(Date.now() - CONSENSUS_WINDOW_MS);

  return prisma.userReport.count({
    where: {
      sectorId,
      reportType,
      reportedAt: { gte: windowStart },
    },
  });
}

async function applyConsensusStateChange(sectorId, targetState) {
  const existing = await prisma.powerStatus.findUnique({
    where: { sectorId },
  });

  if (existing?.currentState === targetState) {
    return { updated: false, powerStatus: existing };
  }

  const [powerStatus] = await prisma.$transaction([
    prisma.powerStatus.upsert({
      where: { sectorId },
      create: {
        sectorId,
        currentState: targetState,
        lastUpdated: new Date(),
      },
      update: {
        currentState: targetState,
        lastUpdated: new Date(),
      },
    }),
    prisma.powerLog.create({
      data: {
        sectorId,
        kitId: null,
        stateChangedTo: targetState,
      },
    }),
  ]);

  return { updated: true, powerStatus };
}

/**
 * Enregistre un signalement usager, vérifie la position (ST_Contains)
 * et applique le consensus sur les 5 dernières minutes.
 */
export async function submitUserReport(body) {
  const reportType = validateReportType(body.reportType);
  const { latitude, longitude } = parseCoordinates(body.lat, body.lng);
  const explicitUserId =
    body.userId !== undefined && body.userId !== null && body.userId !== ''
      ? parseOptionalUserId(body.userId)
      : null;
  const userId = await resolveUserId(explicitUserId);

  const sector = await findSectorAtCoordinates(latitude, longitude);

  if (!sector) {
    throw createError(
      400,
      'OUT_OF_COVERAGE',
      'Votre position ne correspond à aucun secteur cartographié. Signalement refusé.'
    );
  }

  const report = await insertUserReport({
    sectorId: sector.id,
    userId,
    reportType,
    latitude,
    longitude,
  });

  const reportCount = await countReportsInConsensusWindow(sector.id, reportType);
  const consensusReached = reportCount >= CONSENSUS_THRESHOLD;
  const targetState = REPORT_TYPE_TO_POWER_STATE[reportType];

  let stateUpdated = false;
  let powerStatus = sector.powerStatus;

  if (consensusReached) {
    const result = await applyConsensusStateChange(sector.id, targetState);
    stateUpdated = result.updated;
    powerStatus = {
      currentState: result.powerStatus.currentState,
      lastUpdated: result.powerStatus.lastUpdated,
      estimatedReturnTime: result.powerStatus.estimatedReturnTime,
      confidenceScore: result.powerStatus.confidenceScore,
    };
  }

  return {
    report: {
      ...report,
      coordinates: { lat: latitude, lng: longitude },
    },
    sector: {
      id: sector.id,
      name: sector.name,
      region: sector.region,
    },
    consensus: {
      reached: consensusReached,
      reportCount,
      threshold: CONSENSUS_THRESHOLD,
      windowMinutes: CONSENSUS_WINDOW_MS / 60_000,
      countingMode: 'total_reports',
      targetState: consensusReached ? targetState : null,
    },
    powerStatus,
    stateUpdated,
  };
}
