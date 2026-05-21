/**
 * Emprise du Grand Conakry couverte par l'application (aligné backend conakryCenters.js).
 * Marge légère pour le GPS en bordure de commune.
 */
export const GRAND_CONAKRY_BOUNDS = {
  minLat: 9.44,
  maxLat: 9.69,
  minLng: -13.76,
  maxLng: -13.45,
};

/** Bbox approximative de la Guinée (WGS84) — diaspora hors pays. */
export const GUINEA_BOUNDS = {
  minLat: 7.1,
  maxLat: 12.75,
  minLng: -15.25,
  maxLng: -7.4,
};

export const CONAKRY_MAP_CENTER = { lat: 9.565, lng: -13.62 };

function inBounds(lat, lng, bounds) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}

/** Position susceptible d'appartenir à un secteur cartographié. */
export function isWithinGrandConakryCoverage(lat, lng) {
  return inBounds(lat, lng, GRAND_CONAKRY_BOUNDS);
}

export function isWithinGuinea(lat, lng) {
  return inBounds(lat, lng, GUINEA_BOUNDS);
}
