import { estimateRestorationTime, getInstitutionalStatusMessage } from './powerStatus.js';

/** Couleurs charte GNE pour la carte Leaflet */
export const MAP_STATE_COLORS = {
  ONLINE: {
    fill: '#10b981',
    stroke: '#047857',
  },
  OFFLINE: {
    fill: '#c1121f',
    stroke: '#7f0f18',
  },
  UNSTABLE: {
    fill: '#ffb703',
    stroke: '#b45309',
  },
};

export function getCommuneLayerStyle(state, { selected = false } = {}) {
  const palette = MAP_STATE_COLORS[state] ?? {
    fill: '#6b7280',
    stroke: '#374151',
  };
  const dynamicColor = palette.fill;

  return {
    fill: true,
    stroke: true,
    color: dynamicColor,
    weight: selected ? 3 : 2,
    opacity: 1,
    fillColor: dynamicColor,
    fillOpacity: selected ? 0.55 : 0.4,
  };
}

/** Exclut lignes / géométries dégénérées ; découpe les MultiPolygon pour Leaflet. */
export function expandCommuneGeometry(geometry) {
  if (!geometry?.type) return [];

  if (geometry.type === 'Polygon') {
    return geometry.coordinates?.[0]?.length >= 4 ? [geometry] : [];
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .filter((ring) => ring?.[0]?.length >= 4)
      .map((coordinates) => ({ type: 'Polygon', coordinates }));
  }

  return [];
}

/** Point (centroïde secours) ou polygone(s) issus de ST_Union — sans déformation. */
export function classifyCommuneBoundary(geometry, commune = {}) {
  if (!geometry?.type) {
    if (Number.isFinite(commune.lat) && Number.isFinite(commune.lng)) {
      return { kind: 'point', lat: commune.lat, lng: commune.lng };
    }
    return { kind: 'none' };
  }

  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { kind: 'none' };
    return { kind: 'point', lat, lng };
  }

  const polygons = expandCommuneGeometry(geometry);
  if (polygons.length > 0) {
    return { kind: 'polygon', polygons };
  }

  return { kind: 'none' };
}

export function getCommuneMapMessage(commune) {
  return getInstitutionalStatusMessage(commune.state, {
    restorationTime: estimateRestorationTime(),
  });
}

/** Identifiant commune normalisé (évite les écarts BigInt / string / number). */
export function normalizeCommuneId(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Associe une feature GeoJSON aux données API — jamais par index de tableau.
 */
export function resolveCommuneState(apiCommunes, featureProps) {
  if (!Array.isArray(apiCommunes) || !featureProps) return null;

  const featureId = normalizeCommuneId(featureProps.communeId ?? featureProps.id);
  const featureName = String(featureProps.communeName ?? featureProps.name ?? '')
    .trim()
    .toLowerCase();

  if (featureId != null) {
    const byId = apiCommunes.find((c) => normalizeCommuneId(c.id) === featureId);
    if (byId) return byId;
  }

  if (featureName) {
    const byName = apiCommunes.find(
      (c) => String(c.name ?? '').trim().toLowerCase() === featureName
    );
    if (byName) return byName;
  }

  return null;
}

export function buildCommunesFeatureCollection(apiCommunes) {
  const features = [];

  for (const commune of apiCommunes) {
    const classified = classifyCommuneBoundary(commune.boundaryGeoJson, commune);
    if (classified.kind !== 'polygon') continue;

    const communeId = normalizeCommuneId(commune.id);
    const communeName = commune.name ?? '';

    for (const geometry of classified.polygons) {
      features.push({
        type: 'Feature',
        properties: {
          communeId,
          communeName,
        },
        geometry,
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

/** Communes à afficher en pastille (Point ou absence de polygone valide). */
export function getCommuneMarkerTargets(apiCommunes) {
  const markers = [];

  for (const commune of apiCommunes) {
    const classified = classifyCommuneBoundary(commune.boundaryGeoJson, commune);

    if (classified.kind === 'point') {
      markers.push({
        ...commune,
        lat: classified.lat,
        lng: classified.lng,
      });
      continue;
    }

    if (
      classified.kind === 'none' &&
      Number.isFinite(commune.lat) &&
      Number.isFinite(commune.lng)
    ) {
      markers.push(commune);
    }
  }

  return markers;
}
