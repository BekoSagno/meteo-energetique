import { useState } from 'react';
import { API_BASE_URL } from '../../lib/constants.js';

export default function AdminLogin({ onSuccess }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devHint, setDevHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleRequest(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevHint(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Accès refusé');
      if (json.devCode) setDevHint(`Code de développement : ${json.devCode}`);
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
        body: JSON.stringify({ phoneNumber: phone, code, purpose: 'admin' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Code invalide');
      if (json.user?.role !== 'edg_staff') {
        throw new Error('Cet espace est réservé au personnel autorisé.');
      }
      onSuccess?.({ token: json.token, user: json.user });
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Serveur injoignable.' : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#003822] px-4">
      <img src="/logoGNE.png" alt="" className="mb-6 h-12 w-auto rounded-lg bg-white px-3 py-1.5" />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-center font-display text-2xl font-extrabold text-brand-dark">
          Administration
        </h1>
        <p className="mt-2 text-center text-sm font-semibold text-brand-dark/65">
          Espace réservé au personnel. Gestion du site public.
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleRequest} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-label mb-2 block">Téléphone professionnel</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="611 00 00 00"
                className="search-input pr-4 text-base"
                required
              />
            </label>
            {error && <p className="text-center text-sm font-bold text-brand-red">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Vérification…' : 'Continuer'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            {devHint && (
              <p className="rounded-lg bg-brand-bg px-3 py-2 text-center text-xs font-semibold">
                {devHint}
              </p>
            )}
            <label className="block">
              <span className="text-label mb-2 block">Code à 4 chiffres</span>
              <input
                value={code}
                maxLength={4}
                inputMode="numeric"
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="search-input pr-4 text-center font-display text-2xl tracking-[0.35em]"
                required
              />
            </label>
            {error && <p className="text-center text-sm font-bold text-brand-red">{error}</p>}
            <button type="submit" disabled={loading || code.length !== 4} className="btn-primary w-full">
              {loading ? 'Connexion…' : 'Accéder au backoffice'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setCode('');
                setError(null);
              }}
              className="w-full text-sm font-bold text-brand-dark/55"
            >
              Changer de numéro
            </button>
          </form>
        )}

        <a href="#accueil" className="mt-6 block text-center text-sm font-bold text-brand-dark/45">
          Retour au site public
        </a>
      </div>
    </div>
  );
}
