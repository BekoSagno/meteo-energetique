import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { API_BASE_URL } from '../../lib/constants.js';

/**
 * Connexion citoyenne : numéro → OTP → session.
 */
export default function PhoneAuthModal({ open, onClose, onSuccess, onGoRegister }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devHint, setDevHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setStep('phone');
      setPhone('');
      setCode('');
      setDevHint(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  async function handleRequestOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevHint(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Impossible d’envoyer le code');

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
        body: JSON.stringify({ phoneNumber: phone, code, purpose: 'login' }),
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
    <Modal
      open={open}
      onClose={() => !loading && onClose()}
      labelledBy="phone-auth-modal-title"
      closeOnBackdrop={!loading}
      zIndex={10000}
    >
      <h3
        id="phone-auth-modal-title"
        className="text-center font-display text-xl font-extrabold text-brand-dark"
      >
        Connexion citoyenne
      </h3>
      <p className="mt-2 text-center text-sm font-semibold text-brand-dark">
        {step === 'phone'
          ? 'Entrez votre numéro. Un code à 4 chiffres vous sera envoyé.'
          : `Saisissez le code reçu au ${phone}.`}
      </p>

      {step === 'phone' ? (
        <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
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
          {error && <p className="text-center text-sm font-bold text-brand-red">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Envoi…' : 'Recevoir le code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          {devHint && (
            <p className="rounded-lg bg-brand-bg px-3 py-2 text-center text-xs font-semibold text-brand-dark">
              {devHint}
            </p>
          )}
          <label className="block">
            <span className="text-label mb-2 block">Code à 4 chiffres</span>
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
              setStep('phone');
              setCode('');
              setError(null);
              setDevHint(null);
            }}
            className="w-full text-center text-sm font-bold text-brand-dark/60 hover:text-brand-dark"
          >
            Changer de numéro
          </button>
        </form>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          onClose();
          onGoRegister?.();
        }}
        className="mt-4 w-full text-center text-sm font-extrabold text-brand-dark"
      >
        Pas encore de compte ? S&apos;inscrire
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={onClose}
        className="mt-2 w-full py-2 text-sm font-bold text-brand-dark/45 hover:text-brand-dark"
      >
        Annuler
      </button>
    </Modal>
  );
}
