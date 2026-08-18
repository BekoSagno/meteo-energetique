import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders } from '../../lib/auth.js';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/overview`, {
          headers: { ...authHeaders() },
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message ?? 'Chargement impossible');
        setOverview(json.overview);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      }
    })();
    return () => controller.abort();
  }, []);

  const cards = overview
    ? [
        { label: 'Citoyens inscrits', value: overview.citizens },
        { label: 'Personnel EDG', value: overview.staff },
        { label: 'Publications Info', value: overview.publications },
        { label: 'Signalements', value: overview.reports },
        { label: 'Notifications en file', value: overview.queued },
      ]
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-brand-dark">Tableau de bord</h1>
      <p className="mt-1 text-sm font-semibold text-brand-dark/60">
        Pilotage du site public — les publications n’altèrent pas l’état temps réel du réseau.
      </p>
      {error && <p className="mt-4 font-bold text-brand-red">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-dark/50">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-brand-dark">{card.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
