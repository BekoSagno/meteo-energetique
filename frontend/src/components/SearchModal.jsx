import { useEffect, useRef } from 'react';
import Modal from './ui/Modal.jsx';
import SmartSearch from './SmartSearch.jsx';

/**
 * Modale de recherche locale (commune, quartier, secteur).
 * Le header conserve sa propre barre SmartSearch (variant header).
 */
export default function SearchModal({
  open,
  onClose,
  index,
  indexLoading,
  onSectorSelect,
}) {
  const closeRef = useRef(onClose);

  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      document.getElementById('smart-search-modal')?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [open]);

  function handleSectorSelect(sector) {
    onSectorSelect?.(sector);
    closeRef.current?.();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="search-modal-title"
      closeOnBackdrop
      zIndex={10000}
      panelClassName="modal-panel--search"
    >
      <div className="flex items-start justify-between gap-3 border-b border-brand-dark/8 pb-4">
        <div>
          <h2
            id="search-modal-title"
            className="font-display text-xl font-extrabold text-brand-dark sm:text-2xl"
          >
            Recherche
          </h2>
          <p className="mt-1 text-sm font-medium text-brand-dark/55">
            Commune, quartier ou secteur à Grand Conakry
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-dark/10 text-brand-dark/60 transition-colors hover:border-brand-dark/25 hover:bg-brand-bg hover:text-brand-dark"
          aria-label="Fermer la recherche"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        <SmartSearch
          variant="modal"
          index={index}
          indexLoading={indexLoading}
          onSectorSelect={handleSectorSelect}
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-xl border-2 border-brand-dark/10 py-3 text-center text-sm font-bold text-brand-dark/55 transition-colors hover:bg-brand-bg hover:text-brand-dark"
      >
        Fermer
      </button>
    </Modal>
  );
}
