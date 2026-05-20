import { useCallback, useState } from 'react';
import AnimateIn from './motion/AnimateIn.jsx';
import Modal from './ui/Modal.jsx';
import { API_BASE_URL, DEFAULT_LAT, DEFAULT_LNG } from '../lib/constants.js';
import { authHeaders } from '../lib/auth.js';

const REPORT_OPTIONS = [
  {
    type: 'TOTAL_DARKNESS',
    emoji: '🔴',
    title: 'Coupure totale',
    description: 'Plus aucune lumière dans le quartier',
    accentClass: 'hover:border-brand-red hover:bg-brand-red/10',
  },
  {
    type: 'LOW_VOLTAGE',
    emoji: '🟡',
    title: 'Baisse de tension',
    description: 'Lumières faibles ou instables',
    accentClass: 'hover:border-brand-yellow hover:bg-brand-yellow/15',
  },
];

export default function ReportButton({
  lat = DEFAULT_LAT,
  lng = DEFAULT_LNG,
  onConsensusReached,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value) => {
      const next = typeof value === 'function' ? value(open) : value;
      if (isControlled) onOpenChange?.(next);
      else setInternalOpen(next);
    },
    [isControlled, onOpenChange, open]
  );

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const closeModal = useCallback(() => {
    if (submitting) return;
    setOpen(false);
    setFeedback(null);
  }, [submitting, setOpen]);

  function handleMainClick() {
    setOpen(true);
  }

  async function submitReport(reportType) {
    setSubmitting(true);
    setFeedback(null);

    try {
      const headers = { 'Content-Type': 'application/json', ...authHeaders() };
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reportType, lat, lng }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(json.message ?? `Erreur serveur (${response.status})`);
      }

      if (json.consensus?.reached) {
        setFeedback({
          type: 'success',
          message: `Consensus atteint (${json.consensus.reportCount}/3) — état mis à jour.`,
        });
        onConsensusReached?.();
      } else {
        setFeedback({
          type: 'info',
          message: `Signalement enregistré (${json.consensus?.reportCount ?? '?'}/3).`,
        });
      }

      setTimeout(() => closeModal(), 1400);
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err.message === 'Failed to fetch'
            ? 'Serveur injoignable. Lancez l’API backend.'
            : err.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const modal = (
    <Modal
      open={open}
      onClose={closeModal}
      labelledBy="report-modal-title"
      closeOnBackdrop={!submitting}
    >
      <h3
        id="report-modal-title"
        className="text-center font-display text-xl font-extrabold text-brand-dark"
      >
        Que constatez-vous ?
      </h3>
      <p className="mt-2 text-center text-sm font-semibold leading-snug text-brand-dark">
        Vérifiez que votre compteur prépayé est rechargé avant de signaler une coupure.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {REPORT_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            disabled={submitting}
            onClick={() => submitReport(option.type)}
            className={`flex items-start gap-3 rounded-xl border-2 border-brand-dark bg-brand-bg px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${option.accentClass}`}
          >
            <span className="text-2xl leading-none" aria-hidden="true">
              {option.emoji}
            </span>
            <span>
              <span className="block font-display text-base font-bold text-brand-dark">
                {option.title}
              </span>
              <span className="mt-0.5 block text-sm font-medium text-brand-dark">
                {option.description}
              </span>
            </span>
          </button>
        ))}
      </div>

      {submitting && (
        <p className="mt-4 text-center font-display text-base font-bold text-brand-dark">
          Envoi en cours…
        </p>
      )}

      {feedback && !submitting && (
        <p
          className={`mt-4 text-center text-base font-bold ${
            feedback.type === 'error'
              ? 'text-brand-red'
              : feedback.type === 'success'
                ? 'text-brand-green'
                : 'text-brand-dark'
          }`}
        >
          {feedback.message}
        </p>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={closeModal}
        className="mt-5 w-full rounded-lg py-2.5 text-center text-sm font-bold text-brand-dark/55 transition-colors hover:bg-brand-bg hover:text-brand-dark disabled:opacity-50"
      >
        Annuler
      </button>
    </Modal>
  );

  if (!showTrigger) {
    return modal;
  }

  return (
    <AnimateIn delay={200} className="w-full">
      <section className="w-full">
        <button
          type="button"
          onClick={handleMainClick}
          className="btn-report w-full py-4 text-base"
        >
          Signaler un changement d&apos;état
        </button>
        {modal}
      </section>
    </AnimateIn>
  );
}
