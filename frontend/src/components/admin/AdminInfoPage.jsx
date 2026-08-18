import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders } from '../../lib/auth.js';
import { INFO_TABS } from '../../lib/infoContent.js';

const BADGES = [
  { id: 'urgent', label: 'Urgent' },
  { id: 'officiel', label: 'Officiel' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'document', label: 'Document' },
];

const EMPTY_FORM = {
  tab: 'actualites',
  badge: 'officiel',
  title: '',
  summary: '',
  body: '',
  zoneLabel: 'Grand Conakry',
  communeId: '',
  shortMessage: '',
  channelInApp: true,
  channelSms: false,
  channelWhatsapp: false,
};

export default function AdminInfoPage({ communes = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/info/admin`, {
        headers: { ...authHeaders() },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Impossible de charger le backoffice.');
      setItems(json.items ?? []);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Serveur injoignable.' : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          ...form,
          communeId: form.communeId || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Publication impossible');

      setFeedback(
        `Publié dans Info. File d’envoi : ${json.queued ?? 0} notification(s) en attente (aucun SMS/WhatsApp envoyé).`
      );
      setForm(EMPTY_FORM);
      await loadItems();
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Serveur injoignable.' : err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl pb-4">
      <h1 className="font-display text-2xl font-extrabold text-brand-dark">Publications Info</h1>
      <p className="mt-1 text-sm font-semibold text-brand-dark/60">
        Publier actualités, panels et textes officiels — sans impacter l’état temps réel du réseau.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-brand-dark/10 bg-white px-5 py-6 shadow-card sm:px-8"
      >
        <h2 className="font-display text-lg font-extrabold text-brand-dark">Nouvelle publication</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-label mb-2 block">Rubrique</span>
            <select
              value={form.tab}
              onChange={(e) => update('tab', e.target.value)}
              className="search-input appearance-none pr-8 text-base"
            >
              {INFO_TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-label mb-2 block">Badge</span>
            <select
              value={form.badge}
              onChange={(e) => update('badge', e.target.value)}
              className="search-input appearance-none pr-8 text-base"
            >
              {BADGES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-label mb-2 block">Titre</span>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="search-input pr-4 text-base"
            required
          />
        </label>
        <label className="mt-4 block">
          <span className="text-label mb-2 block">Résumé</span>
          <input
            value={form.summary}
            onChange={(e) => update('summary', e.target.value)}
            className="search-input pr-4 text-base"
            required
          />
        </label>
        <label className="mt-4 block">
          <span className="text-label mb-2 block">Texte</span>
          <textarea
            value={form.body}
            onChange={(e) => update('body', e.target.value)}
            rows={5}
            className="search-input min-h-[120px] pr-4 text-base"
            required
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-label mb-2 block">Zone affichée</span>
            <input
              value={form.zoneLabel}
              onChange={(e) => update('zoneLabel', e.target.value)}
              className="search-input pr-4 text-base"
            />
          </label>
          <label className="block">
            <span className="text-label mb-2 block">Cibler une commune (optionnel)</span>
            <select
              value={form.communeId}
              onChange={(e) => update('communeId', e.target.value)}
              className="search-input appearance-none pr-8 text-base"
            >
              <option value="">Tout le Grand Conakry</option>
              {communes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="mt-4 space-y-2 rounded-xl border border-brand-dark/10 bg-brand-bg px-4 py-3">
          <legend className="text-xs font-extrabold uppercase tracking-wide text-brand-dark/55">
            Canaux
          </legend>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.channelInApp}
              onChange={(e) => update('channelInApp', e.target.checked)}
            />
            Application (Info)
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.channelSms}
              onChange={(e) => update('channelSms', e.target.checked)}
            />
            SMS (file d’attente seulement)
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.channelWhatsapp}
              onChange={(e) => update('channelWhatsapp', e.target.checked)}
            />
            WhatsApp (file d’attente seulement)
          </label>
        </fieldset>

        {(form.channelSms || form.channelWhatsapp) && (
          <label className="mt-4 block">
            <span className="text-label mb-2 block">Message court (SMS, max 160)</span>
            <input
              value={form.shortMessage}
              maxLength={160}
              onChange={(e) => update('shortMessage', e.target.value)}
              className="search-input pr-4 text-base"
            />
          </label>
        )}

        {error && <p className="mt-4 text-sm font-bold text-brand-red">{error}</p>}
        {feedback && <p className="mt-4 text-sm font-bold text-emerald-800">{feedback}</p>}

        <button type="submit" disabled={saving} className="btn-primary mt-5 w-full">
          {saving ? 'Publication…' : 'Publier'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-extrabold text-brand-dark">Déjà publié</h2>
        {loading ? (
          <p className="text-sm font-semibold text-brand-dark/55">Chargement…</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-brand-dark/10 bg-white px-4 py-3 text-sm"
              >
                <p className="font-extrabold text-brand-dark">{item.title}</p>
                <p className="mt-1 text-xs font-semibold text-brand-dark/55">
                  {item.tab} · {item.date} · {item.zone}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
