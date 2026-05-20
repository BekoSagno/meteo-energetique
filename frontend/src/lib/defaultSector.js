import { API_BASE_URL, DEFAULT_LAT, DEFAULT_LNG } from './constants.js';
import { mapCurrentToSector } from './sectorMapper.js';

export const FALLBACK_SECTOR_NAME = 'Dixinn Centre Centre';

/**
 * Secteur de repli — Dixinn Centre (coordonnées du seed).
 */
export async function fetchFallbackSector(signal) {
  const url = new URL(`${API_BASE_URL}/api/sectors/current`);
  url.searchParams.set('lat', String(DEFAULT_LAT));
  url.searchParams.set('lng', String(DEFAULT_LNG));

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('fallback-current-failed');

  const json = await res.json();
  let sector = mapCurrentToSector(json);

  if (sector) {
    return {
      ...sector,
      coordinates: sector.coordinates ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
    };
  }

  const listRes = await fetch(`${API_BASE_URL}/api/sectors?regionId=1`, { signal });
  if (!listRes.ok) return null;

  const { sectors } = await listRes.json();
  const picked =
    sectors.find((s) => s.name === FALLBACK_SECTOR_NAME) ??
    sectors.find((s) => s.commune?.name === 'Dixinn') ??
    sectors[0] ??
    null;

  if (!picked) return null;

  return {
    ...picked,
    coordinates: picked.coordinates ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
    state: picked.state ?? picked.powerStatus?.currentState ?? 'ONLINE',
  };
}

export function fallbackLocationLabel(sector) {
  const commune = sector?.commune?.name ?? 'Dixinn';
  return commune;
}
