/**
 * Normalise une chaîne pour la recherche : minuscules, sans accents.
 */
export function normalizeSearchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function textMatchesQuery(text, normalizedQuery) {
  if (!normalizedQuery) return true;
  return normalizeSearchText(text).includes(normalizedQuery);
}

export function sectorMatchesQuery(sector, normalizedQuery) {
  if (!normalizedQuery) return true;
  const fields = [
    sector.name,
    sector.quartier?.name,
    sector.commune?.name,
    sector.region?.name,
  ];
  return fields.some((f) => textMatchesQuery(f, normalizedQuery));
}
