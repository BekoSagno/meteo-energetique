import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders, formatPhoneDisplay } from '../../lib/auth.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { ...authHeaders() },
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message ?? 'Chargement impossible');
        setUsers(json.users ?? []);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Utilisateurs</h1>
      <p className="mt-1 text-sm font-semibold text-brand-dark/60">
        Inscrits par commune, quartier et secteur — base du ciblage d’alertes.
      </p>
      {error && <p className="mt-4 font-bold text-brand-red">{error}</p>}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase text-brand-dark/55">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Alertes</th>
              <th className="px-4 py-3">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-bold">
                  {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || '—'}
                </td>
                <td className="px-4 py-3">{formatPhoneDisplay(u.phoneNumber)}</td>
                <td className="px-4 py-3 text-brand-dark/70">
                  {[u.commune?.name, u.quartier?.name, u.defaultSector?.name].filter(Boolean).join(' · ') ||
                    '—'}
                </td>
                <td className="px-4 py-3">
                  {u.notifySms ? 'SMS ' : ''}
                  {u.notifyWhatsapp ? 'WhatsApp' : ''}
                  {!u.notifySms && !u.notifyWhatsapp ? 'App' : ''}
                </td>
                <td className="px-4 py-3">{u.role === 'edg_staff' ? 'EDG' : 'Citoyen'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
