import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/constants.js';
import { getInfoItemsByTab } from '../lib/infoContent.js';

export function useInfoPublications(tab) {
  const [items, setItems] = useState(() => getInfoItemsByTab(tab));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/api/info`);
        if (tab) url.searchParams.set('tab', tab);
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('info-api');
        const json = await res.json();
        if (Array.isArray(json.items) && json.items.length > 0) {
          setItems(json.items);
          return;
        }
        setItems(getInfoItemsByTab(tab));
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setItems(getInfoItemsByTab(tab));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [tab]);

  return { items, loading };
}
