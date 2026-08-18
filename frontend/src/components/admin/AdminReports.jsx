import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders, formatPhoneDisplay } from '../../lib/auth.js';

const TYPE_LABEL = {
  TOTAL_DARKNESS: 'Coupure totale',
  LOW_VOLTAGE: 'Baisse de tension',
  STABLE_RETURN: 'Retour stable',
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
    <div>
      <h1 className="font-display text-2xl font-extrabold">Signalements citoyens</h1>
      <p className="mt-1 text-sm font-semibold text-brand-dark/60">
        Avis terrain pour améliorer le service — sans modifier l’état temps réel affiché.
      </p>
      {error && <p className="mt-4 font-bold text-brand-red">{error}</p>}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase text-brand-dark/55">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Lieu</th>
              <th className="px-4 py-3">Usager</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  {new Date(r.reportedAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3 font-bold">{TYPE_LABEL[r.reportType] ?? r.reportType}</td>
                <td className="px-4 py-3">
                  {[r.sector?.commune?.name, r.sector?.quartier?.name, r.sector?.name]
                    .filter(Boolean)
                    .join(' · ')}
                </td>
                <td className="px-4 py-3">
                  {r.user
                    ? `${[r.user.firstName, r.user.lastName].filter(Boolean).join(' ')} · ${formatPhoneDisplay(r.user.phoneNumber)}`
                    : 'Anonyme'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && !error ? (
          <p className="px-4 py-8 text-center text-sm font-semibold text-brand-dark/50">
            Aucun signalement pour le moment.
          </p>
        ) : null}
      </div>
    </div>
  );
}
