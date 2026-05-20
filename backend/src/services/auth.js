import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { saveOtp, verifyOtp } from './otpStore.js';

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

function generateOtpCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function requestOtp(body) {
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);
  const code = generateOtpCode();

  saveOtp(phoneNumber, code);

  console.log(`🔑 CODE OTP POUR ${phoneNumber} : ${code}`);

  return {
    ok: true,
    phoneNumber,
    expiresInSeconds: 300,
    message: 'Code envoyé. Consultez la console du serveur en mode développement.',
  };
}

export async function verifyOtpAndLogin(body) {
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);
  const code = String(body.code ?? '').trim();

  if (!/^\d{4}$/.test(code)) {
    throw createError(400, 'VALIDATION_ERROR', 'Le code doit contenir 4 chiffres.');
  }

  const check = verifyOtp(phoneNumber, code);
  if (!check.ok) {
    const messages = {
      NOT_FOUND: 'Aucun code en cours. Demandez un nouveau code.',
      EXPIRED: 'Code expiré. Demandez un nouveau code.',
      INVALID: 'Code incorrect.',
    };
    throw createError(401, 'OTP_INVALID', messages[check.reason] ?? 'Code invalide.');
  }

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
