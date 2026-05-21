import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/constants.js';
import {
  isWithinGrandConakryCoverage,
  isWithinGuinea,
} from '../lib/conakryBounds.js';
import { fetchFallbackSector } from '../lib/defaultSector.js';
import { mapCurrentToSector } from '../lib/sectorMapper.js';

export { mapCurrentToSector } from '../lib/sectorMapper.js';

/** @typedef {'gps' | 'fallback' | 'diaspora'} LocationMode */

/**
 * Résout un secteur via l'API — ne lève pas si hors zone (sector null) ou erreur HTTP.
 * @returns {Promise<import('../lib/sectorMapper.js').mapCurrentToSector extends Function ? ReturnType<typeof mapCurrentToSector> : null>}
 */
async function resolveSectorAt(lat, longitude, signal) {
  const url = new URL(`${API_BASE_URL}/api/sectors/current`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lng', String(longitude));

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;

    const json = await res.json();
    return mapCurrentToSector(json);
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    return null;
  }
}

/**
 * Géolocalisation en arrière-plan — repli Kaloum si hors zone ou API vide.
 * @returns {{ refining, sector, locationMode: LocationMode|null, outOfCoverage, diasporaView }}
 */
export function useGeolocation({ enabled = true } = {}) {
  const [refining, setRefining] = useState(enabled);
  const [sector, setSector] = useState(null);
  const [locationMode, setLocationMode] = useState(null);
  const [outOfCoverage, setOutOfCoverage] = useState(false);
  const [diasporaView, setDiasporaView] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setRefining(false);
      return;
    }

    const controller = new AbortController();

    async function applyKaloumFallback(mode) {
      const fallback = await fetchFallbackSector(controller.signal);
      if (controller.signal.aborted) return;

      if (fallback) {
        setSector(fallback);
        setLocationMode(mode);
      }
      setOutOfCoverage(true);
      setDiasporaView(mode === 'diaspora');
    }

    async function finishWithGps(lat, lng) {
      try {
        const abroad = !isWithinGuinea(lat, lng);
        const inConakry = isWithinGrandConakryCoverage(lat, lng);

        if (!inConakry) {
          await applyKaloumFallback(abroad ? 'diaspora' : 'fallback');
          return;
        }

        const mapped = await resolveSectorAt(lat, lng, controller.signal);
        if (controller.signal.aborted) return;

        if (mapped) {
          setSector(mapped);
          setLocationMode('gps');
          setOutOfCoverage(false);
          setDiasporaView(false);
          return;
        }

        await applyKaloumFallback(abroad ? 'diaspora' : 'fallback');
      } catch (err) {
        if (err?.name === 'AbortError') return;
        try {
          await applyKaloumFallback('fallback');
        } catch {
          /* placeholder App inchangé */
        }
      } finally {
        if (!controller.signal.aborted) setRefining(false);
      }
    }

    if (!navigator.geolocation) {
      setRefining(false);
      return () => controller.abort();
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        finishWithGps(position.coords.latitude, position.coords.longitude);
      },
      () => {
        if (!controller.signal.aborted) setRefining(false);
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 120_000 }
    );

    return () => controller.abort();
  }, [enabled]);

  return {
    refining,
    sector,
    locationMode,
    outOfCoverage,
    diasporaView,
    /** @deprecated Utiliser `refining` */
    loading: refining,
  };
}
