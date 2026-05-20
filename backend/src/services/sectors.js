import { prisma } from '../lib/prisma.js';

function createError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  throw err;
}

function formatSectorListItem(row) {
  const state = row.currentState ?? null;

  return {
    id: row.id,
    name: row.name,
    regionId: row.regionId,
    communeId: row.communeId,
    quartierId: row.quartierId,
    region: row.region_id ? { id: row.region_id, name: row.region_name } : null,
    commune: row.commune_id ? { id: row.commune_id, name: row.commune_name } : null,
    quartier: row.quartier_id ? { id: row.quartier_id, name: row.quartier_name } : null,
    state,
    powerStatus: state
      ? {
          currentState: state,
          lastUpdated: row.lastUpdated,
          estimatedReturnTime: row.estimatedReturnTime,
          confidenceScore: row.confidenceScore,
        }
      : null,
    coordinates:
      row.lat != null && row.lng != null
        ? { lat: Number(row.lat), lng: Number(row.lng) }
        : null,
  };
}

const SECTORS_SELECT = `
  SELECT
    s.id,
    s.name,
    s.region_id AS "regionId",
    s.commune_id AS "communeId",
    s.quartier_id AS "quartierId",
    r.id AS "region_id",
    r.name AS "region_name",
    c.id AS "commune_id",
    c.name AS "commune_name",
    q.id AS "quartier_id",
    q.name AS "quartier_name",
    ps.current_state AS "currentState",
    ps.last_updated AS "lastUpdated",
    ps.estimated_return_time AS "estimatedReturnTime",
    ps.confidence_score AS "confidenceScore",
    ST_Y(s.boundary) AS lat,
    ST_X(s.boundary) AS lng
  FROM sectors s
  INNER JOIN regions r ON r.id = s.region_id
  INNER JOIN communes c ON c.id = s.commune_id
  INNER JOIN quartiers q ON q.id = s.quartier_id
  LEFT JOIN power_status ps ON ps.sector_id = s.id
  WHERE s.boundary IS NOT NULL
`;

/** Liste les secteurs (niveau final), filtre par quartierId, communeId ou regionId. */
export async function listSectorsWithStatus({ quartierId, communeId, regionId } = {}) {
  if (quartierId != null) {
    const id = Number.parseInt(String(quartierId), 10);
    if (Number.isNaN(id)) createError(400, 'VALIDATION_ERROR', 'quartierId invalide.');
    const rows = await prisma.$queryRawUnsafe(
      `${SECTORS_SELECT} AND s.quartier_id = $1 ORDER BY s.name ASC`,
      id
    );
    return rows.map(formatSectorListItem);
  }

  if (communeId != null) {
    const id = Number.parseInt(String(communeId), 10);
    if (Number.isNaN(id)) createError(400, 'VALIDATION_ERROR', 'communeId invalide.');
    const rows = await prisma.$queryRawUnsafe(
      `${SECTORS_SELECT} AND s.commune_id = $1 ORDER BY q.name ASC, s.name ASC`,
      id
    );
    return rows.map(formatSectorListItem);
  }

  if (regionId != null) {
    const id = Number.parseInt(String(regionId), 10);
    if (Number.isNaN(id)) createError(400, 'VALIDATION_ERROR', 'regionId invalide.');
    const rows = await prisma.$queryRawUnsafe(
      `${SECTORS_SELECT} AND s.region_id = $1 ORDER BY c.name ASC, q.name ASC, s.name ASC`,
      id
    );
    return rows.map(formatSectorListItem);
  }

  const rows = await prisma.$queryRawUnsafe(
    `${SECTORS_SELECT} ORDER BY c.name ASC, q.name ASC, s.name ASC`
  );
  return rows.map(formatSectorListItem);
}

export async function findSectorAtCoordinates(latitude, longitude) {
  const rows = await prisma.$queryRaw`
    SELECT
      s.id,
      s.name,
      s.region_id AS "regionId",
      s.commune_id AS "communeId",
      s.quartier_id AS "quartierId",
      r.id AS "region_id",
      r.name AS "region_name",
      c.id AS "commune_id",
      c.name AS "commune_name",
      q.id AS "quartier_id",
      q.name AS "quartier_name",
      ps.current_state AS "currentState",
      ps.last_updated AS "lastUpdated",
      ps.estimated_return_time AS "estimatedReturnTime",
      ps.confidence_score AS "confidenceScore"
    FROM sectors s
    INNER JOIN regions r ON r.id = s.region_id
    INNER JOIN communes c ON c.id = s.commune_id
    INNER JOIN quartiers q ON q.id = s.quartier_id
    LEFT JOIN power_status ps ON ps.sector_id = s.id
    WHERE s.boundary IS NOT NULL
      AND ST_DWithin(
        s.boundary::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        1500
      )
    ORDER BY ST_Distance(
      s.boundary::geography,
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
    )
    LIMIT 1
  `;

  if (!rows.length) return null;

  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    regionId: row.regionId,
    communeId: row.communeId,
    quartierId: row.quartierId,
    region: { id: row.region_id, name: row.region_name },
    commune: { id: row.commune_id, name: row.commune_name },
    quartier: { id: row.quartier_id, name: row.quartier_name },
    powerStatus: row.currentState
      ? {
          currentState: row.currentState,
          lastUpdated: row.lastUpdated,
          estimatedReturnTime: row.estimatedReturnTime,
          confidenceScore: row.confidenceScore,
        }
      : null,
  };
}
