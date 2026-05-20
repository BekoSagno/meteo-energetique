import { verifyAccessToken } from '../services/auth.js';

/**
 * Si un JWT valide est présent, attache userId / phoneNumber.
 * Sinon la requête continue (signalement anonyme).
 */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.userId = payload.userId;
    req.phoneNumber = payload.phoneNumber;
  } catch {
    /* jeton invalide ou expiré : on ignore pour ne pas bloquer l'anonymat */
  }

  next();
}
