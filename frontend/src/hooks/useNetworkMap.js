import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/constants.js';

export function useNetworkMap({ moment, date, regionId, refreshKey = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(`${API_BASE_URL}/api/map/communes`);
        url.searchParams.set('moment', moment);
        url.searchParams.set('date', date);
        if (regionId != null) url.searchParams.set('regionId', String(regionId));

        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message ?? `Erreur ${res.status}`);
        setData(json);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message === 'Failed to fetch' ? 'Serveur injoignable.' : err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [moment, date, regionId, refreshKey]);

  return { data, loading, error };
}

/** 7 derniers jours pour les onglets (style La Chaîne Météo). */
export function buildMapDayTabs(count = 7) {
  const tabs = [];
  const today = new Date();

  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const weekday = d
      .toLocaleDateString('fr-FR', { weekday: 'short' })
      .replace('.', '');
    const dayNum = d.getDate();
    const dayLabel = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    tabs.push({
      dateKey,
      label: `${dayLabel} ${dayNum}`,
      isToday: i === count - 1,
    });
  }

  return tabs;
}
