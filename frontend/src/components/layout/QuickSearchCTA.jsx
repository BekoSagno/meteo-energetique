import SmartSearch from '../SmartSearch.jsx';

/**
 * Barre de recherche locale verte (variante cta-fixed) — unique CTA recherche hors header.
 */
export default function QuickSearchCTA({ index, indexLoading, onSectorSelect }) {
  return (
    <SmartSearch
      variant="cta-fixed"
      index={index}
      indexLoading={indexLoading}
      onSectorSelect={onSectorSelect}
    />
  );
}
