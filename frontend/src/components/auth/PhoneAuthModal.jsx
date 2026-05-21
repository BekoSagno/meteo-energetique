import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { API_BASE_URL } from '../../lib/constants.js';

/**
 * Connexion citoyenne en une étape : numéro → JWT (sans code SMS).
 */
export default function PhoneAuthModal({ open, onClose, onSuccess }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setPhone('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? 'Connexion impossible');

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
        Entrez votre numéro pour vous connecter et suivre vos signalements.
      </p>

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-label mb-2 block">Téléphone</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ex. 612 34 56 78"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="search-input text-base"
            required
          />
        </label>
        {error && <p className="text-center text-sm font-bold text-brand-red">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Connexion…' : 'Continuer'}
        </button>
      </form>

      <button
        type="button"
        disabled={loading}
        onClick={onClose}
        className="mt-5 w-full py-2 text-sm font-bold text-brand-dark/45 hover:text-brand-dark"
      >
        Annuler
      </button>
    </Modal>
  );
}
