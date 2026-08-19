import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders, formatPhoneDisplay } from '../../lib/auth.js';

const TYPE_LABEL = {
  TOTAL_DARKNESS: { label: 'Coupure totale', color: 'bg-red-100 text-red-700' },
  LOW_VOLTAGE: { label: 'Baisse de tension', color: 'bg-amber-100 text-amber-700' },
  STABLE_RETURN: { label: 'Retour stable', color: 'bg-emerald-100 text-emerald-700' },
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/reports`, {
          headers: { ...authHeaders() },
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message ?? 'Chargement impossible');
        setReports(json.reports ?? []);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-dark">Signalements</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {reports.length} signalement{reports.length !== 1 ? 's' : ''} terrain — consultation uniquement, pas d'impact sur le temps réel.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Type</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Lieu</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Usager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reports.map((r) => {
                const typeConfig = TYPE_LABEL[r.reportType] ?? { label: r.reportType, color: 'bg-slate-100 text-slate-600' };
                const location = [r.sector?.commune?.name, r.sector?.quartier?.name, r.sector?.name].filter(Boolean).join(' · ');
                const user = r.user
                  ? `${[r.user.firstName, r.user.lastName].filter(Boolean).join(' ')} · ${formatPhoneDisplay(r.user.phoneNumber)}`
                  : null;
                return (
                  <tr key={r.id} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-xs font-semibold text-slate-500">
                      {new Date(r.reportedAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{location || '—'}</td>
                    <td className="px-5 py-3">
                      {user ? (
                        <span className="font-semibold text-slate-600">{user}</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">Anonyme</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {reports.length === 0 && !error && (
          <div className="py-12 text-center">
            <p className="text-sm font-bold text-slate-400">Aucun signalement pour le moment.</p>
            <p className="mt-1 text-xs font-medium text-slate-300">Les signalements citoyens apparaîtront ici.</p>
          </div>
        )}
      </div>
    </div>
  );
}
