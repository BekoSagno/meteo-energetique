export function mapCurrentToSector(json) {
  if (!json?.sector) return null;
  return {
    id: json.sector.id,
    name: json.sector.name,
    regionId: json.sector.regionId,
    communeId: json.sector.communeId,
    quartierId: json.sector.quartierId,
    region: json.sector.region,
    commune: json.sector.commune,
    quartier: json.sector.quartier,
    state: json.powerStatus?.currentState,
    powerStatus: json.powerStatus,
    coordinates: json.coordinates ?? null,
  };
}

export function mapListSector(sector) {
  return sector;
}
