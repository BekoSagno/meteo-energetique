import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modale en portail (document.body) — évite les bugs de position fixed
 * dans les ancêtres avec transform / overflow.
 */
export default function Modal({
  open,
  onClose,
  children,
  labelledBy,
  closeOnBackdrop = true,
  zIndex = 9999,
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.();
    }

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-root" style={{ zIndex }} role="presentation">
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Fermer la fenêtre"
        tabIndex={-1}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
