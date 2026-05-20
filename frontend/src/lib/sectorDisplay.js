/**
 * Affiche un nom de secteur lisible sans doublon quartier/secteur.
 * Ex. quartier "Dixinn Centre" + secteur "Dixinn Centre Centre" → "Dixinn Centre"
 */
export function formatSectorDisplayName(sectorName, quartierName) {
  if (!sectorName) return 'Secteur';

  const sector = sectorName.trim();
  const quartier = quartierName?.trim();

  if (!quartier) return sector;
  if (sector.toLowerCase() === quartier.toLowerCase()) return quartier;

  const sectorParts = sector.split(/\s+/);
  const quartierParts = quartier.split(/\s+/);

  if (sectorParts.length > quartierParts.length) {
    const prefix = sectorParts.slice(0, quartierParts.length).join(' ');
    if (prefix.toLowerCase() === quartier.toLowerCase()) {
      const extra = sectorParts.slice(quartierParts.length).join(' ');
      const lastQuartierWord = quartierParts[quartierParts.length - 1];
      if (extra.toLowerCase() === lastQuartierWord.toLowerCase()) {
        return quartier;
      }
    }
  }

  if (sector.toLowerCase().startsWith(`${quartier.toLowerCase()} `)) {
    const suffix = sector.slice(quartier.length).trim();
    const lastQuartierWord = quartierParts[quartierParts.length - 1];
    if (suffix.toLowerCase() === lastQuartierWord.toLowerCase()) {
      return quartier;
    }
  }

  return sector;
}

/** Fil d'Ariane sans répéter le quartier déjà inclus dans le titre secteur. */
export function buildWeatherBreadcrumb({ region, commune, quartier }, displaySectorName) {
  const parts = [];
  if (region) parts.push(region);
  if (commune) parts.push(commune);
  if (quartier) {
    const q = quartier.trim();
    const showQuartier =
      !displaySectorName ||
      !displaySectorName.toLowerCase().includes(q.toLowerCase());
    if (showQuartier) parts.push(quartier);
  }
  return parts;
}
