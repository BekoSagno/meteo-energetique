import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders, formatPhoneDisplay } from '../../lib/auth.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

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

  const filtered = search
    ? users.filter((u) => {
        const q = search.toLowerCase();
        const name = [u.firstName, u.lastName, u.name].filter(Boolean).join(' ').toLowerCase();
        const phone = (u.phoneNumber ?? '').toLowerCase();
        const zone = [u.commune?.name, u.quartier?.name, u.defaultSector?.name].filter(Boolean).join(' ').toLowerCase();
        return name.includes(q) || phone.includes(q) || zone.includes(q);
      })
    : users;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-dark">Utilisateurs</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {users.length} inscrit{users.length !== 1 ? 's' : ''} — base du ciblage des alertes.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom, tel, zone…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold shadow-sm transition placeholder:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Nom</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Téléphone</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Zone</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Alertes</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => {
                const displayName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || '—';
                const zone = [u.commune?.name, u.quartier?.name, u.defaultSector?.name].filter(Boolean).join(' · ') || '—';
                const channels = [u.notifySms && 'SMS', u.notifyWhatsapp && 'WhatsApp'].filter(Boolean);
                const channelLabel = channels.length > 0 ? channels.join(', ') : 'App';
                const isStaff = u.role === 'edg_staff';
                return (
                  <tr key={u.id} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${isStaff ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                          {displayName[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="font-bold text-brand-dark">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{formatPhoneDisplay(u.phoneNumber)}</td>
                    <td className="px-5 py-3 text-slate-500">{zone}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {channelLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${isStaff ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                        {isStaff ? 'EDG' : 'Citoyen'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !error && (
          <div className="py-12 text-center">
            <p className="text-sm font-bold text-slate-400">
              {search ? 'Aucun résultat pour cette recherche.' : 'Aucun utilisateur inscrit.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
