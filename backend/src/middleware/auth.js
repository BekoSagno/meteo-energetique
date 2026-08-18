import { verifyAccessToken } from '../services/auth.js';
import { prisma } from '../lib/prisma.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Connexion requise.',
    });
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.userId = payload.userId;
    req.phoneNumber = payload.phoneNumber;
    req.role = payload.role;
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireEdgStaff(req, res, next) {
  requireAuth(req, res, async (err) => {
    if (err) return next(err);
    if (res.headersSent) return;

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, role: true },
      });
      if (!user || user.role !== 'edg_staff') {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Accès réservé au personnel EDG.',
        });
      }
      req.role = 'edg_staff';
      next();
    } catch (error) {
      next(error);
    }
  });
}
