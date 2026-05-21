/**
 * Données fictives pour NetworkStats (en attendant l’API historique).
 * @param {number} [seed] — id secteur pour varier légèrement les valeurs
 */
export function getNetworkStatsMock(seed = 1) {
  const offset = (seed % 7) * 2;

  const availabilityToday = Math.min(98, Math.max(62, 84 - offset + (seed % 3)));

  const timeline24h = buildTimeline24h(seed);

  const weekDays = buildWeekDays(seed);

  return { availabilityToday, timeline24h, weekDays };
}

/** Segments horaires sur 24 h : 'online' | 'offline' | 'unstable' */
function buildTimeline24h(seed) {
  const patterns = [
    [0, 5, 'online'],
    [5, 7, 'offline'],
    [7, 12, 'online'],
    [12, 13, 'unstable'],
    [13, 17, 'online'],
    [17, 19, 'offline'],
    [19, 24, 'online'],
  ];

  const shifted = patterns.map(([start, end, status], i) => {
    const shift = (seed + i) % 3;
    return [
      Math.min(24, start + shift),
      Math.min(24, end + shift),
      status,
    ];
  });

  return normalizeTimeline(shifted);
}

function normalizeTimeline(ranges) {
  const hours = Array.from({ length: 24 }, () => 'online');

  for (const [start, end, status] of ranges) {
    for (let h = start; h < end && h < 24; h += 1) {
      hours[h] = status;
    }
  }

  const segments = [];
  let i = 0;
  while (i < 24) {
    const status = hours[i];
    let j = i + 1;
    while (j < 24 && hours[j] === status) j += 1;
    segments.push({ startHour: i, endHour: j, status });
    i = j;
  }

  return segments;
}

function buildWeekDays(seed) {
  const statuses = ['stable', 'stable', 'unstable', 'stable', 'major_outage', 'stable', 'unstable'];
  const baseAvail = [91, 88, 76, 86, 58, 92, 78];

  const today = new Date();
  const days = [];

  for (let d = 6; d >= 0; d -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const idx = (date.getDay() + seed) % 7;
    const label = date
      .toLocaleDateString('fr-FR', { weekday: 'short' })
      .replace('.', '')
      .slice(0, 3);
    const availability = Math.min(99, Math.max(45, baseAvail[idx] - (seed % 5) + (6 - d)));

    days.push({
      date,
      label,
      status: statuses[(idx + seed) % statuses.length],
      availability,
    });
  }

  return days;
}

/** Repères horaires sous la frise (dernières 24 h jusqu’à maintenant). */
export function getTimelineHourMarkers() {
  const now = new Date();
  const steps = 6;

  return Array.from({ length: steps }, (_, i) => {
    const hoursAgo = 24 - (i / (steps - 1)) * 24;
    const d = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return {
      key: i,
      label: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      positionPercent: (i / (steps - 1)) * 100,
    };
  });
}

export const DAY_STATUS_CONFIG = {
  stable: {
    label: 'Stable',
    dotClass: 'bg-brand-green',
    ringClass: 'ring-brand-green/40',
  },
  unstable: {
    label: 'Instable',
    dotClass: 'bg-brand-yellow',
    ringClass: 'ring-brand-yellow/50',
  },
  major_outage: {
    label: 'Coupure majeure',
    dotClass: 'bg-brand-red',
    ringClass: 'ring-brand-red/40',
  },
};

export const TIMELINE_SEGMENT_CLASS = {
  online: 'bg-brand-dark',
  offline: 'bg-brand-red',
  unstable: 'bg-brand-yellow',
};
