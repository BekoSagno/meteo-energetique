import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders, formatPhoneDisplay } from '../../lib/auth.js';

const CHANNEL_CONFIG = {
  in_app: { label: 'App', color: 'bg-emerald-100 text-emerald-700' },
  sms: { label: 'SMS', color: 'bg-blue-100 text-blue-700' },
  whatsapp: { label: 'WhatsApp', color: 'bg-green-100 text-green-700' },
};

const STATUS_CONFIG = {
  queued: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  sent: { label: 'Envoyé', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Échec', color: 'bg-red-100 text-red-700' },
};

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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-dark">File d'envoi</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {items.length} notification{items.length !== 1 ? 's' : ''} préparée{items.length !== 1 ? 's' : ''}. Statut « en attente » : aucun envoi SMS/WhatsApp réel.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Publication</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Destinataire</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Canal</th>
                <th className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => {
                const ch = CHANNEL_CONFIG[item.channel] ?? { label: item.channel, color: 'bg-slate-100 text-slate-600' };
                const st = STATUS_CONFIG[item.status] ?? { label: item.status, color: 'bg-slate-100 text-slate-600' };
                const userName = [item.user?.firstName, item.user?.lastName].filter(Boolean).join(' ');
                return (
                  <tr key={item.id} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-bold text-brand-dark">
                      {item.publication?.title ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {userName && <span className="mr-1 font-semibold">{userName}</span>}
                      <span className="font-mono text-xs">{formatPhoneDisplay(item.user?.phoneNumber)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${ch.color}`}>
                        {ch.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && !error && (
          <div className="py-12 text-center">
            <p className="text-sm font-bold text-slate-400">File d'envoi vide.</p>
            <p className="mt-1 text-xs font-medium text-slate-300">Les notifications apparaîtront ici après une publication.</p>
          </div>
        )}
      </div>
    </div>
  );
}
