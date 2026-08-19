import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';
import { authHeaders } from '../../lib/auth.js';
import { INFO_TABS } from '../../lib/infoContent.js';

const BADGES = [
  { id: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { id: 'officiel', label: 'Officiel', color: 'bg-emerald-600' },
  { id: 'expertise', label: 'Expertise', color: 'bg-blue-600' },
  { id: 'document', label: 'Document', color: 'bg-amber-600' },
];

const EMPTY_FORM = {
  tab: 'actualites',
  badge: 'officiel',
  title: '',
  summary: '',
  body: '',
  zoneLabel: 'Grand Conakry',
  communeId: '',
  quartierId: '',
  sectorId: '',
  shortMessage: '',
  channelInApp: true,
  channelSms: false,
  channelWhatsapp: false,
};

function ChevronDown({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function SelectField({ label, value, onChange, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-brand-dark shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>
      {hint && <p className="mt-1 text-[11px] font-medium text-slate-400">{hint}</p>}
    </label>
  );
}

function TextField({ label, value, onChange, required, placeholder, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-sm transition placeholder:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      {hint && <p className="mt-1 text-[11px] font-medium text-slate-400">{hint}</p>}
    </label>
  );
}

function TextAreaField({ label, value, onChange, required, rows = 5, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-sm transition placeholder:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </label>
  );
}

function CheckboxField({ label, checked, onChange, description }) {
  return (
    <label className="flex items-start gap-3 rounded-lg px-1 py-1 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span className="flex flex-col">
        <span className="text-sm font-bold text-brand-dark">{label}</span>
        {description && <span className="text-[11px] font-medium text-slate-400">{description}</span>}
      </span>
    </label>
  );
}

function BadgePill({ badge }) {
  const found = BADGES.find((b) => b.id === badge);
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ${found?.color ?? 'bg-slate-400'}`}>
      {found?.label ?? badge}
    </span>
  );
}

export default function AdminInfoPage({ communes = [], quartiers = [], sectors = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const filteredQuartiers = useMemo(() => {
    if (!form.communeId) return [];
    return quartiers.filter((q) => String(q.communeId) === String(form.communeId));
  }, [form.communeId, quartiers]);

  const filteredSectors = useMemo(() => {
    if (!form.quartierId) return [];
    return sectors.filter((s) => String(s.quartierId) === String(form.quartierId));
  }, [form.quartierId, sectors]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/info/admin`, {
        headers: { ...authHeaders() },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Impossible de charger.');
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
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'communeId') {
        next.quartierId = '';
        next.sectorId = '';
      }
      if (field === 'quartierId') {
        next.sectorId = '';
      }
      return next;
    });
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
          quartierId: form.quartierId || null,
          sectorId: form.sectorId || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Publication impossible');

      setFeedback(
        `Publication réussie. ${json.queued ?? 0} notification(s) en file d'attente.`
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-dark">Publications</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Publier actualités, panels et textes officiels. Le contenu temps réel du réseau n'est pas affecté.
        </p>
      </div>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Section : Contenu */}
        <div className="space-y-5 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-brand-dark">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-xs font-extrabold text-emerald-700">1</span>
            Contenu
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Rubrique" value={form.tab} onChange={(e) => update('tab', e.target.value)}>
              {INFO_TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </SelectField>
            <SelectField label="Badge" value={form.badge} onChange={(e) => update('badge', e.target.value)}>
              {BADGES.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </SelectField>
          </div>

          <TextField label="Titre" value={form.title} onChange={(e) => update('title', e.target.value)} required placeholder="Ex : Coupure programmée à Matoto" />
          <TextField label="Résumé" value={form.summary} onChange={(e) => update('summary', e.target.value)} required placeholder="Résumé court (affiché dans le fil Info)" />
          <TextAreaField label="Texte complet" value={form.body} onChange={(e) => update('body', e.target.value)} required rows={6} placeholder="Détails complets de la publication…" />
        </div>

        {/* Section : Ciblage */}
        <div className="space-y-5 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-brand-dark">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-xs font-extrabold text-blue-700">2</span>
            Ciblage géographique
          </h2>

          <TextField label="Zone affichée" value={form.zoneLabel} onChange={(e) => update('zoneLabel', e.target.value)} placeholder="Grand Conakry" hint="Libellé affiché sur la publication (texte libre)" />

          <div className="grid gap-5 sm:grid-cols-3">
            <SelectField label="Commune" value={form.communeId} onChange={(e) => update('communeId', e.target.value)} hint="Filtre les notifications">
              <option value="">Tout le Grand Conakry</option>
              {communes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SelectField>

            <SelectField label="Quartier" value={form.quartierId} onChange={(e) => update('quartierId', e.target.value)} hint={form.communeId ? '' : 'Sélectionner une commune d\u2019abord'}>
              <option value="">Tous les quartiers</option>
              {filteredQuartiers.map((q) => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </SelectField>

            <SelectField label="Secteur" value={form.sectorId} onChange={(e) => update('sectorId', e.target.value)} hint={form.quartierId ? '' : 'Sélectionner un quartier d\u2019abord'}>
              <option value="">Tous les secteurs</option>
              {filteredSectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </SelectField>
          </div>
        </div>

        {/* Section : Canaux */}
        <div className="space-y-5 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-brand-dark">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-xs font-extrabold text-amber-700">3</span>
            Canaux de diffusion
          </h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <CheckboxField label="Application" description="Visible dans l'onglet Info" checked={form.channelInApp} onChange={(e) => update('channelInApp', e.target.checked)} />
            <CheckboxField label="SMS" description="File d'attente — pas d'envoi réel" checked={form.channelSms} onChange={(e) => update('channelSms', e.target.checked)} />
            <CheckboxField label="WhatsApp" description="File d'attente — pas d'envoi réel" checked={form.channelWhatsapp} onChange={(e) => update('channelWhatsapp', e.target.checked)} />
          </div>

          {(form.channelSms || form.channelWhatsapp) && (
            <TextField label="Message court (max 160 car.)" value={form.shortMessage} onChange={(e) => update('shortMessage', e.target.value.slice(0, 160))} placeholder="EDG: coupure planifiée Matoto 14h-17h." hint={`${form.shortMessage.length}/160 caractères`} />
          )}
        </div>

        {/* Footer form */}
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex-1">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}
            {feedback && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                {feedback}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Publication…
              </>
            ) : 'Publier'}
          </button>
        </div>
      </form>

      {/* Liste des publications */}
      <div>
        <h2 className="mb-4 font-display text-lg font-extrabold text-brand-dark">Publications récentes</h2>
        {loading ? (
          <div className="flex items-center gap-3 py-8 text-sm font-semibold text-slate-400">
            <svg className="h-5 w-5 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Chargement…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
            <p className="text-sm font-bold text-slate-400">Aucune publication pour le moment</p>
            <p className="mt-1 text-xs font-medium text-slate-300">Créez votre première publication ci-dessus.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 sm:p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <BadgePill badge={item.badge ?? 'officiel'} />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{item.tab}</span>
                  </div>
                  <p className="mt-1.5 font-display text-sm font-extrabold text-brand-dark leading-snug">{item.title}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-2">{item.summary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-bold text-slate-400">{item.date}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-300">{item.zone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
