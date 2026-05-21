/** Coordonnées par défaut — centre Kaloum, Conakry (aligné sur le seed backend). */
export const DEFAULT_LAT = 9.508;
export const DEFAULT_LNG = -13.71;

/** userId de test (voir npm run db:seed). */
export const DEFAULT_TEST_USER_ID = 1;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
