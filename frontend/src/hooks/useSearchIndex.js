import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/constants.js';

/**
 * Index local pour la recherche unifiée (Grand Conakry).
 */
export function useSearchIndex() {
  const [index, setIndex] = useState({
    regions: [],
    communes: [],
    quartiers: [],
    sectors: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const regionsRes = await fetch(`${API_BASE_URL}/api/regions`, {
          signal: controller.signal,
        });
        if (!regionsRes.ok) throw new Error('Impossible de charger les régions.');
        const { regions } = await regionsRes.json();

        const conakry = regions.find((r) => r.name === 'Conakry') ?? regions[0];
        if (!conakry) {
          setIndex({ regions: [], communes: [], quartiers: [], sectors: [] });
          return;
        }

        const [communesRes, sectorsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/communes?regionId=${conakry.id}`, {
            signal: controller.signal,
          }),
          fetch(`${API_BASE_URL}/api/sectors?regionId=${conakry.id}`, {
            signal: controller.signal,
          }),
        ]);

        if (!communesRes.ok || !sectorsRes.ok) {
          throw new Error('Impossible de charger l’index de recherche.');
        }

        const { communes } = await communesRes.json();
        const { sectors } = await sectorsRes.json();

        const quartierMap = new Map();
        for (const s of sectors) {
          if (s.quartier && !quartierMap.has(s.quartier.id)) {
            quartierMap.set(s.quartier.id, {
              id: s.quartier.id,
              name: s.quartier.name,
              communeId: s.communeId,
              commune: s.commune,
              region: s.region,
            });
          }
        }

        setIndex({
          regions,
          communes,
          quartiers: [...quartierMap.values()],
          sectors,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message === 'Failed to fetch' ? 'Serveur injoignable.' : err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return { index, loading, error };
}
