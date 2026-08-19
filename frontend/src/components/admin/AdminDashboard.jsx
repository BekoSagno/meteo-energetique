import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders } from '../../lib/auth.js';

const CARD_CONFIG = [
  { key: 'citizens', label: 'Citoyens inscrits', icon: UsersIcon, color: 'from-emerald-500 to-emerald-600' },
  { key: 'staff', label: 'Personnel EDG', icon: ShieldIcon, color: 'from-blue-500 to-blue-600' },
  { key: 'publications', label: 'Publications', icon: DocIcon, color: 'from-amber-500 to-amber-600' },
  { key: 'reports', label: 'Signalements', icon: AlertIcon, color: 'from-red-500 to-red-600' },
  { key: 'queued', label: 'En file d\'envoi', icon: SendIcon, color: 'from-violet-500 to-violet-600' },
];

function UsersIcon(props) {
  return <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
}
function ShieldIcon(props) {
  return <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a1 1 0 01.894.553l1.618 3.236 3.578.52a1 1 0 01.554 1.705l-2.59 2.524.611 3.564a1 1 0 01-1.45 1.054L10 12.347l-3.215 1.69a1 1 0 01-1.45-1.054l.611-3.564-2.59-2.524a1 1 0 01.554-1.705l3.578-.52L9.106 1.553A1 1 0 0110 1z" clipRule="evenodd" /></svg>;
}
function DocIcon(props) {
  return <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
}
function AlertIcon(props) {
  return <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
}
function SendIcon(props) {
  return <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
}

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-dark">Tableau de bord</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Vue d'ensemble du site Météo Énergétique. Les publications n'affectent pas l'état temps réel.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {CARD_CONFIG.map((card) => {
          const Icon = card.icon;
          const value = overview?.[card.key];
          return (
            <article
              key={card.key}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${card.color} opacity-10 transition group-hover:opacity-20`} />
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${card.color} p-2 text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tabular-nums text-brand-dark">
                {value != null ? value : '—'}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                {card.label}
              </p>
            </article>
          );
        })}
      </div>

      {overview && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-extrabold text-brand-dark">Accès rapide</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a href="#admin-info" className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-bold text-brand-dark transition hover:border-emerald-200 hover:bg-emerald-50">
              <DocIcon className="h-5 w-5 text-emerald-500" />
              Nouvelle publication
            </a>
            <a href="#admin-users" className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-bold text-brand-dark transition hover:border-blue-200 hover:bg-blue-50">
              <UsersIcon className="h-5 w-5 text-blue-500" />
              Voir les utilisateurs
            </a>
            <a href="#admin-reports" className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-bold text-brand-dark transition hover:border-red-200 hover:bg-red-50">
              <AlertIcon className="h-5 w-5 text-red-500" />
              Consulter les signalements
            </a>
            <a href="#admin-queue" className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm font-bold text-brand-dark transition hover:border-violet-200 hover:bg-violet-50">
              <SendIcon className="h-5 w-5 text-violet-500" />
              File d'envoi
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
