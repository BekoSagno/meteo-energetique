import { useMemo, useState } from 'react';
import ViewPageTitle from '../motion/ViewPageTitle.jsx';
import { API_BASE_URL } from '../../lib/constants.js';

export default function RegisterPage({
  communes = [],
  quartiers = [],
  sectors = [],
  onSuccess,
  onGoLogin,
}) {
  const [step, setStep] = useState('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [quartierId, setQuartierId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [notifySms, setNotifySms] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);
  const [code, setCode] = useState('');
  const [devHint, setDevHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredQuartiers = useMemo(
    () => quartiers.filter((q) => String(q.communeId) === String(communeId)),
    [quartiers, communeId]
  );

  const filteredSectors = useMemo(
    () =>
      sectors.filter(
        (s) =>
          String(s.quartierId ?? s.quartier?.id) === String(quartierId) &&
          String(s.communeId ?? s.commune?.id) === String(communeId)
      ),
    [sectors, communeId, quartierId]
  );

  function handleCommuneChange(value) {
    setCommuneId(value);
    setQuartierId('');
    setSectorId('');
  }

  function handleQuartierChange(value) {
    setQuartierId(value);
    setSectorId('');
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevHint(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber: phone,
          communeId: Number(communeId),
          quartierId: Number(quartierId),
          sectorId: Number(sectorId),
          notifySms,
          notifyWhatsapp,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Inscription impossible');

      if (json.devCode) {
        setDevHint(`Code de développement : ${json.devCode}`);
      }
      setStep('otp');
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Serveur injoignable.' : err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, code, purpose: 'register' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Code invalide');

      onSuccess?.({ token: json.token, user: json.user });
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Serveur injoignable.' : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="inscription" className="mx-auto w-full max-w-lg pb-4">
      <ViewPageTitle subtitle="Facultatif — pour recevoir plus tard les alertes de votre zone">
        Inscription
      </ViewPageTitle>

      <article className="rounded-2xl border border-brand-dark/10 bg-white px-5 py-6 shadow-card sm:px-8 sm:py-8">
        {step === 'form' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <label className="block">
              <span className="text-label mb-2 block">Prénom</span>
              <input
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="search-input pr-4 text-base"
                required
              />
            </label>
            <label className="block">
              <span className="text-label mb-2 block">Nom</span>
              <input
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="search-input pr-4 text-base"
                required
              />
            </label>
            <label className="block">
              <span className="text-label mb-2 block">Téléphone</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ex. 612 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="search-input pr-4 text-base"
                required
              />
            </label>

            <label className="block">
              <span className="text-label mb-2 block">Commune</span>
              <select
                value={communeId}
                onChange={(e) => handleCommuneChange(e.target.value)}
                className="search-input appearance-none pr-8 text-base"
                required
              >
                <option value="">Choisir une commune</option>
                {communes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {communeId ? (
              <label className="block">
                <span className="text-label mb-2 block">Quartier</span>
                <select
                  value={quartierId}
                  onChange={(e) => handleQuartierChange(e.target.value)}
                  className="search-input appearance-none pr-8 text-base"
                  required
                >
                  <option value="">Choisir un quartier</option>
                  {filteredQuartiers.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {quartierId ? (
              <label className="block">
                <span className="text-label mb-2 block">Secteur</span>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="search-input appearance-none pr-8 text-base"
                  required
                >
                  <option value="">Choisir un secteur</option>
                  {filteredSectors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <fieldset className="space-y-2 rounded-xl border border-brand-dark/10 bg-brand-bg px-4 py-3">
              <legend className="text-xs font-extrabold uppercase tracking-wide text-brand-dark/55">
                Alertes (plus tard)
              </legend>
              <label className="flex items-start gap-2 text-sm font-semibold text-brand-dark">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="mt-0.5"
                />
                Recevoir les alertes par SMS
              </label>
              <label className="flex items-start gap-2 text-sm font-semibold text-brand-dark">
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="mt-0.5"
                />
                Recevoir les alertes par WhatsApp
              </label>
            </fieldset>

            {error && <p className="text-center text-sm font-bold text-brand-red">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Envoi du code…' : 'Recevoir le code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-center text-sm font-semibold text-brand-dark/75">
              Saisissez le code à 4 chiffres envoyé au {phone}.
            </p>
            {devHint && (
              <p className="rounded-lg bg-brand-bg px-3 py-2 text-center text-xs font-semibold text-brand-dark">
                {devHint}
              </p>
            )}
            <label className="block">
              <span className="text-label mb-2 block">Code OTP</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="• • • •"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="search-input pr-4 text-center font-display text-2xl tracking-[0.4em]"
                required
              />
            </label>
            {error && <p className="text-center text-sm font-bold text-brand-red">{error}</p>}
            <button type="submit" disabled={loading || code.length !== 4} className="btn-primary w-full">
              {loading ? 'Vérification…' : 'Valider'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep('form');
                setCode('');
                setError(null);
                setDevHint(null);
              }}
              className="w-full text-center text-sm font-bold text-brand-dark/60 hover:text-brand-dark"
            >
              Modifier mes informations
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm font-semibold text-brand-dark/60">
          Déjà inscrit ?{' '}
          <button
            type="button"
            onClick={onGoLogin}
            className="font-extrabold text-brand-dark underline-offset-2 hover:underline"
          >
            Se connecter
          </button>
        </p>
      </article>
    </section>
  );
}
