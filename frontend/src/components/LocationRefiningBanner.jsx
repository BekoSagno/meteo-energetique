/**
 * Indicateur discret pendant l’affinage GPS / enrichissement API (ne bloque pas l’UI).
 */
export default function LocationRefiningBanner({ active, detail }) {
  if (!active) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-full border border-brand-dark/12 bg-white px-4 py-2 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-yellow"
        aria-hidden="true"
      />
      <span className="text-xs font-semibold text-brand-dark/65">
        {detail ?? 'Affinage de votre position…'}
      </span>
    </div>
  );
}
