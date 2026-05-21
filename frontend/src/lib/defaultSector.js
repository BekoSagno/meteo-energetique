import { API_BASE_URL, DEFAULT_LAT, DEFAULT_LNG } from './constants.js';
import { mapCurrentToSector } from './sectorMapper.js';

export const FALLBACK_SECTOR_NAME = 'Almamya Centre';

/**
 * Affichage immédiat au premier rendu (sans attendre l’API ni le GPS).
 */
export const INSTANT_PLACEHOLDER_SECTOR = {
  id: 1,
  name: 'Almamya Centre',
  commune: { id: 1, name: 'Kaloum' },
  region: { id: 1, name: 'Conakry' },
  quartier: { id: 1, name: 'Almamya' },
  coordinates: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
  state: 'ONLINE',
  powerStatus: { currentState: 'ONLINE', lastUpdated: null },
  isPlaceholder: true,
};

/**
 * Secteur de repli — Kaloum (coordonnées du seed), enrichi via API en arrière-plan.
 */
export async function fetchFallbackSector(signal) {
  try {
    const url = new URL(`${API_BASE_URL}/api/sectors/current`);
    url.searchParams.set('lat', String(DEFAULT_LAT));
    url.searchParams.set('lng', String(DEFAULT_LNG));

    const res = await fetch(url, { signal });
    if (res.ok) {
      const json = await res.json();
      const sector = mapCurrentToSector(json);
      if (sector) {
        return {
          ...sector,
          coordinates: sector.coordinates ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
        };
      }
    }

    const listRes = await fetch(`${API_BASE_URL}/api/sectors?regionId=1`, { signal });
    if (!listRes.ok) return null;

    const { sectors } = await listRes.json();
    const picked =
      sectors.find((s) => s.name === FALLBACK_SECTOR_NAME) ??
      sectors.find((s) => s.commune?.name === 'Kaloum') ??
      sectors[0] ??
      null;

    if (!picked) return null;

    return {
      ...picked,
      coordinates: picked.coordinates ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
      state: picked.state ?? picked.powerStatus?.currentState ?? 'ONLINE',
    };
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    return null;
  }
}

export function fallbackLocationLabel(sector) {
  const commune = sector?.commune?.name ?? 'Kaloum';
  return commune;
}
