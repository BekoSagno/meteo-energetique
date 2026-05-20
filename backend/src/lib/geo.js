/**
 * Helpers PostGIS pour requêtes brutes (champs Unsupported dans Prisma).
 */

export function parseCoordinates(lat, lng) {
  if (lat === undefined || lat === null || lng === undefined || lng === null) {
    const err = new Error('Les paramètres lat et lng sont requis.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const latitude = Number.parseFloat(String(lat));
  const longitude = Number.parseFloat(String(lng));

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    const err = new Error('lat et lng doivent être des nombres valides.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (latitude < -90 || latitude > 90) {
    const err = new Error('lat doit être compris entre -90 et 90.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (longitude < -180 || longitude > 180) {
    const err = new Error('lng doit être compris entre -180 et 180.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  return { latitude, longitude };
}

export function pointWkt(longitude, latitude) {
  return `POINT(${longitude} ${latitude})`;
}

export function polygonWkt(rings) {
  const ringStrings = rings.map((ring) =>
    ring.map(([lng, lat]) => `${lng} ${lat}`).join(', ')
  );
  return `POLYGON((${ringStrings.join('), (')}))`;
}

/** Surface secteur ~bufferMeters autour du centroïde (WGS84, usage seed / scripts). */
export const DEFAULT_SECTOR_BUFFER_METERS = 1500;

export function sectorSurfaceWkt(longitude, latitude, bufferMeters = DEFAULT_SECTOR_BUFFER_METERS) {
  return `ST_Buffer(ST_SetSRID(ST_MakePoint(${longitude} ${latitude}), 4326)::geography, ${bufferMeters})::geometry`;
}
