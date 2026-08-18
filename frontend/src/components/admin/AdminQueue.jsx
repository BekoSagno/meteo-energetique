import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders, formatPhoneDisplay } from '../../lib/auth.js';

export default function AdminQueue() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/outbox`, {
          headers: { ...authHeaders() },
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message ?? 'Chargement impossible');
        setItems(json.items ?? []);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">File d’envoi</h1>
      <p className="mt-1 text-sm font-semibold text-brand-dark/60">
        Notifications préparées (SMS / WhatsApp / app). Statut « queued » : rien n’est envoyé pour l’instant.
      </p>
      {error && <p className="mt-4 font-bold text-brand-red">{error}</p>}
      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="font-extrabold">{item.publication?.title}</p>
            <p className="mt-1 text-brand-dark/60">
              {item.channel} · {item.status} · {formatPhoneDisplay(item.user?.phoneNumber)}
            </p>
          </li>
        ))}
      </ul>
      {items.length === 0 && !error ? (
        <p className="mt-6 text-sm font-semibold text-brand-dark/50">File vide.</p>
      ) : null}
    </div>
  );
}
