import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const JWT_EXPIRES_IN = '7d';

function createError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

/** Normalise un numéro guinéen (+224…) en clé unique. */
export function normalizePhoneNumber(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');

  if (digits.length < 9) {
    throw createError(400, 'VALIDATION_ERROR', 'Numéro de téléphone invalide.');
  }

  if (digits.startsWith('224')) {
    return `+${digits}`;
  }

  if (digits.startsWith('6') && digits.length === 9) {
    return `+224${digits}`;
  }

  return `+${digits}`;
}

/**
 * Connexion citoyenne : création ou récupération du compte, JWT immédiat (sans OTP).
 */
export async function loginWithPhone(body) {
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);

  let user = await prisma.user.findUnique({
    where: { phoneNumber },
    select: { id: true, phoneNumber: true, name: true, isVerified: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phoneNumber,
        name: null,
        isVerified: true,
      },
      select: { id: true, phoneNumber: true, name: true, isVerified: true },
    });
  } else if (!user.isVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
      select: { id: true, phoneNumber: true, name: true, isVerified: true },
    });
  }

  const token = jwt.sign(
    { userId: user.id, phoneNumber: user.phoneNumber },
    env.jwtSecret,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
    },
  };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    throw createError(401, 'UNAUTHORIZED', 'Session expirée ou invalide. Reconnectez-vous.');
  }
}
