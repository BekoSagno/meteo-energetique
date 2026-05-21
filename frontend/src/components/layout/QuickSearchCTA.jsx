/**
 * FAB recherche — cercle fixe bas-droite, ouvre SearchModal.
 */
export default function QuickSearchCTA({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-xl text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-brand-dark hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
      aria-haspopup="dialog"
      aria-label="Rechercher une commune, un quartier ou un secteur"
    >
      <span aria-hidden="true">🔍</span>
    </button>
  );
}
