/**
 * Utilitaires classement communes (alignés sur backend map.js).
 */

export function getAvailabilityLevel(availability) {
  if (availability > 80) return 'high';
  if (availability >= 50) return 'medium';
  return 'low';
}

export function getAvailabilityDotClass(availability) {
  const level = getAvailabilityLevel(availability);
  if (level === 'high') {
    return 'bg-brand-green shadow-[0_0_10px_rgba(16,185,129,0.65)]';
  }
  if (level === 'medium') {
    return 'bg-brand-yellow shadow-[0_0_10px_rgba(255,183,3,0.55)]';
  }
  return 'bg-brand-red shadow-[0_0_10px_rgba(193,18,31,0.55)]';
}

/** Trie les communes par taux de disponibilité décroissant. */
export function rankCommunes(communes = []) {
  return [...communes]
    .sort((a, b) => b.availability - a.availability || a.name.localeCompare(b.name, 'fr'))
    .map((commune, index) => ({ ...commune, rank: index + 1 }));
}

/** Sélectionne un secteur représentatif pour une commune. */
export function pickSectorForCommune(commune, sectors = []) {
  if (!commune) return null;
  const repId = commune.representativeSectorId;
  if (repId != null) {
    const found = sectors.find((s) => s.id === repId);
    if (found) return found;
  }
  return sectors.find((s) => s.communeId === commune.id) ?? null;
}

function normalizeCommuneId(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Calcule disponibilité à partir des secteurs (repli si API indisponible). */
export function aggregateCommuneFromSectors(sectors, communeId) {
  const cid = normalizeCommuneId(communeId);
  const list = sectors.filter((s) => normalizeCommuneId(s.communeId) === cid);
  const counts = { online: 0, unstable: 0, offline: 0, unknown: 0 };

  for (const s of list) {
    const st = s.state ?? s.powerStatus?.currentState ?? 'ONLINE';
    if (st === 'ONLINE') counts.online += 1;
    else if (st === 'UNSTABLE') counts.unstable += 1;
    else if (st === 'OFFLINE') counts.offline += 1;
    else counts.unknown += 1;
  }

  const total = counts.online + counts.unstable + counts.offline + counts.unknown;
  if (total === 0) return { availability: 100, state: 'ONLINE' };

  let availability = Math.round(((counts.online + counts.unstable * 0.5) / total) * 100);
  let state = 'ONLINE';

  const onlineShare = counts.online / total;
  const offlineShare = counts.offline / total;
  const unstableShare = counts.unstable / total;

  if (offlineShare >= 0.35) {
    state = 'OFFLINE';
  } else if (
    unstableShare >= 0.25 &&
    unstableShare >= offlineShare &&
    unstableShare > onlineShare
  ) {
    state = 'UNSTABLE';
    availability = Math.max(availability - 8, 0);
  } else if (offlineShare >= 0.2 && offlineShare > onlineShare) {
    state = 'OFFLINE';
  } else if (unstableShare >= 0.15 && unstableShare > onlineShare) {
    state = 'UNSTABLE';
    availability = Math.max(availability - 8, 0);
  } else {
    state = 'ONLINE';
  }

  return { availability, state };
}
