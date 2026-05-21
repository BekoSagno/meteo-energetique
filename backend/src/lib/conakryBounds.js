/**
 * Emprise couverte — évite des requêtes PostGIS inutiles pour coordonnées hors zone.
 * @see frontend/src/lib/conakryBounds.js (mêmes valeurs)
 */
export const GRAND_CONAKRY_BOUNDS = {
  minLat: 9.44,
  maxLat: 9.69,
  minLng: -13.76,
  maxLng: -13.45,
};

export const GUINEA_BOUNDS = {
  minLat: 7.1,
  maxLat: 12.75,
  minLng: -15.25,
  maxLng: -7.4,
};

function inBounds(lat, lng, bounds) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}

export function isWithinGrandConakryCoverage(lat, lng) {
  return inBounds(lat, lng, GRAND_CONAKRY_BOUNDS);
}

export function isWithinGuinea(lat, lng) {
  return inBounds(lat, lng, GUINEA_BOUNDS);
}
