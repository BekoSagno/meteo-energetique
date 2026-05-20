/**
 * Centres officiels des 13 communes du Grand Conakry (mairies / centres urbains).
 * Format : { lat, lng } — même référentiel que la carte Leaflet.
 */
export const COMMUNE_CENTERS = {
  Kassa: { lat: 9.47, lng: -13.73 },
  Kaloum: { lat: 9.508, lng: -13.71 },
  Dixinn: { lat: 9.545, lng: -13.675 },
  Matam: { lat: 9.54, lng: -13.655 },
  Ratoma: { lat: 9.595, lng: -13.64 },
  Lambanyi: { lat: 9.605, lng: -13.615 },
  Gbessia: { lat: 9.57, lng: -13.62 },
  Matoto: { lat: 9.585, lng: -13.595 },
  Sonfonia: { lat: 9.62, lng: -13.575 },
  Tombolia: { lat: 9.595, lng: -13.555 },
  Kagbelen: { lat: 9.665, lng: -13.52 },
  Manéah: { lat: 9.645, lng: -13.48 },
  Sanoyah: { lat: 9.615, lng: -13.49 },
};

export const CONAKRY_MAP_BOUNDS = {
  minLat: 9.45,
  maxLat: 9.68,
  minLng: -13.75,
  maxLng: -13.46,
};

export const CONAKRY_MAP_CENTER = {
  lat: 9.565,
  lng: -13.62,
};

/** @param {string} communeName */
export function getCommuneCenter(communeName) {
  return COMMUNE_CENTERS[communeName] ?? null;
}
