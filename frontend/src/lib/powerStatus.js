const STATE_CONFIG = {
  ONLINE: {
    label: 'Alimenté',
    dotClass: 'bg-brand-green',
    textClass: 'text-brand-green',
  },
  OFFLINE: {
    label: 'Coupure',
    dotClass: 'bg-brand-red',
    textClass: 'text-brand-red',
  },
  UNSTABLE: {
    label: 'Baisse de tension',
    dotClass: 'bg-brand-yellow',
    textClass: 'text-brand-yellow',
  },
};

export function getPowerStateConfig(state) {
  return (
    STATE_CONFIG[state] ?? {
      label: 'État inconnu',
      dotClass: 'bg-brand-dark/40',
      textClass: 'text-brand-dark',
    }
  );
}

/** Heure estimée de rétablissement (analyse réseau, +2 h arrondi au quart d'heure). */
export function estimateRestorationTime(fromDate = new Date()) {
  const eta = new Date(fromDate);
  eta.setHours(eta.getHours() + 2);
  const minutes = eta.getMinutes();
  const roundedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;
  if (minutes >= 45) eta.setHours(eta.getHours() + 1);
  eta.setMinutes(roundedMinutes, 0, 0);
  const h = eta.getHours();
  const m = String(eta.getMinutes()).padStart(2, '0');
  return `${h}h${m}`;
}

/**
 * Messages institutionnels affichés sur la carte météo (ton officiel, sans dimension communautaire).
 */
export function getInstitutionalStatusMessage(state, { restorationTime } = {}) {
  switch (state) {
    case 'OFFLINE':
      return `\u23F3 R\u00e9tablissement du courant estim\u00e9 \u00e0 ${restorationTime ?? estimateRestorationTime()} dans votre zone.`;
    case 'ONLINE':
      return 'Surveillance du r\u00e9seau : Secteur stable et sous tension.';
    case 'UNSTABLE':
      return '\u26A0\uFE0F Alerte r\u00e9seau : Instabilit\u00e9 de la tension d\u00e9tect\u00e9e dans ce secteur.';
    default:
      return 'Surveillance du r\u00e9seau en cours sur ce secteur.';
  }
}
