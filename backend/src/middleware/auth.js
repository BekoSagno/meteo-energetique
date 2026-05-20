import { verifyAccessToken } from '../services/auth.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Connexion requise pour signaler un incident.',
    });
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.userId = payload.userId;
    req.phoneNumber = payload.phoneNumber;
    next();
  } catch (error) {
    next(error);
  }
}
