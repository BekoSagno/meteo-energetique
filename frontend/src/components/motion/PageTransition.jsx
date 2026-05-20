/**
 * Animation d''entrée à chaque changement de vue (hash).
 * @param {boolean} stagger — décalage progressif des enfants directs (.page-stagger)
 */
export default function PageTransition({ viewKey, children, className = '', stagger = true }) {
  return (
    <div
      key={viewKey}
      className={`animate-page-enter opacity-0 ${stagger ? 'page-stagger' : ''} ${className}`.trim()}
      role="region"
      aria-live="polite"
    >
      {children}
    </div>
  );
}
