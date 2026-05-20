import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/constants.js';
import { fetchFallbackSector } from '../lib/defaultSector.js';
import { mapCurrentToSector } from '../lib/sectorMapper.js';

export { mapCurrentToSector } from '../lib/sectorMapper.js';

async function resolveSectorAt(lat, longitude, signal) {
  const url = new URL(`${API_BASE_URL}/api/sectors/current`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lng', String(longitude));

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);

  const json = await res.json();
  return mapCurrentToSector(json);
}

/**
 * GPS d'abord, puis secteur de repli (Dixinn Centre) en cas d'échec.
 * @returns {{ loading, sector, locationMode: 'gps'|'fallback'|null }}
 */
export function useGeolocation({ enabled = true } = {}) {
  const [loading, setLoading] = useState(enabled);
  const [sector, setSector] = useState(null);
  const [locationMode, setLocationMode] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function applyFallback() {
      try {
        const fallback = await fetchFallbackSector(controller.signal);
        if (fallback && !controller.signal.aborted) {
          setSector(fallback);
          setLocationMode('fallback');
        }
      } catch {
        /* App.jsx charge aussi le repli */
      }
    }

    async function finishWithGps(lat, lng) {
      try {
        const mapped = await resolveSectorAt(lat, lng, controller.signal);
        if (controller.signal.aborted) return;

        if (mapped) {
          setSector(mapped);
          setLocationMode('gps');
        } else {
          await applyFallback();
        }
      } catch {
        if (!controller.signal.aborted) await applyFallback();
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    if (!navigator.geolocation) {
      applyFallback().finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
      return () => controller.abort();
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        finishWithGps(position.coords.latitude, position.coords.longitude);
      },
      () => {
        applyFallback().finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );

    return () => controller.abort();
  }, [enabled]);

  return { loading, sector, locationMode };
}
