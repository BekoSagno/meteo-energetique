import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { OTP_EXPIRES_IN_SECONDS, saveOtp, verifyOtp } from './otpStore.js';

const JWT_EXPIRES_IN = '7d';

const USER_SELECT = {
  id: true,
  phoneNumber: true,
  firstName: true,
  lastName: true,
  name: true,
  communeId: true,
  quartierId: true,
  defaultSectorId: true,
  notifySms: true,
  notifyWhatsapp: true,
  notifyInApp: true,
  isVerified: true,
  role: true,
  commune: { select: { id: true, name: true } },
  quartier: { select: { id: true, name: true } },
  defaultSector: { select: { id: true, name: true, communeId: true, quartierId: true } },
};

function createError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

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

function fullName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(' ').trim() || null;
}

function parsePositiveInt(value, field) {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    throw createError(400, 'VALIDATION_ERROR', `${field} invalide.`);
  }
  return parsed;
}

function publicUser(user) {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    communeId: user.communeId,
    quartierId: user.quartierId,
    defaultSectorId: user.defaultSectorId,
    commune: user.commune,
    quartier: user.quartier,
    defaultSector: user.defaultSector,
    notifySms: user.notifySms,
    notifyWhatsapp: user.notifyWhatsapp,
    notifyInApp: user.notifyInApp,
    role: user.role,
  };
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, phoneNumber: user.phoneNumber, role: user.role },
    env.jwtSecret,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function otpResponse(phoneNumber) {
  const payload = {
    ok: true,
    phoneNumber,
    expiresInSeconds: OTP_EXPIRES_IN_SECONDS,
    message: 'Code envoyé. Consultez vos SMS (simulé en développement : voir la console serveur).',
  };
  return payload;
}

async function assertSectorHierarchy(communeId, quartierId, sectorId) {
  const sector = await prisma.sector.findUnique({
    where: { id: sectorId },
    select: { id: true, communeId: true, quartierId: true },
  });
  if (!sector) {
    throw createError(400, 'VALIDATION_ERROR', 'Secteur introuvable.');
  }
  if (sector.communeId !== communeId || sector.quartierId !== quartierId) {
    throw createError(400, 'VALIDATION_ERROR', 'Le secteur ne correspond pas à la commune / au quartier choisis.');
  }
}

/**
 * Inscription : enregistre le dossier en attente et envoie un OTP.
 */
export async function startRegistration(body) {
  const firstName = String(body.firstName ?? '').trim();
  const lastName = String(body.lastName ?? '').trim();
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);
  const communeId = parsePositiveInt(body.communeId, 'communeId');
  const quartierId = parsePositiveInt(body.quartierId, 'quartierId');
  const sectorId = parsePositiveInt(body.sectorId ?? body.defaultSectorId, 'sectorId');
  const notifySms = Boolean(body.notifySms);
  const notifyWhatsapp = Boolean(body.notifyWhatsapp);

  if (firstName.length < 2) {
    throw createError(400, 'VALIDATION_ERROR', 'Le prénom est requis.');
  }
  if (lastName.length < 2) {
    throw createError(400, 'VALIDATION_ERROR', 'Le nom est requis.');
  }

  const existing = await prisma.user.findUnique({
    where: { phoneNumber },
    select: { id: true },
  });
  if (existing) {
    throw createError(409, 'ALREADY_REGISTERED', 'Ce numéro a déjà un compte. Connectez-vous.');
  }

  await assertSectorHierarchy(communeId, quartierId, sectorId);

  const code = generateOtpCode();
  saveOtp(phoneNumber, code, {
    purpose: 'register',
    payload: {
      firstName,
      lastName,
      phoneNumber,
      communeId,
      quartierId,
      sectorId,
      notifySms,
      notifyWhatsapp,
    },
  });

  console.log(`🔑 CODE OTP INSCRIPTION POUR ${phoneNumber} : ${code}`);

  const result = otpResponse(phoneNumber);
  if (!env.isProduction) result.devCode = code;
  return result;
}

/**
 * Connexion admin : OTP uniquement pour un compte edg_staff.
 */
export async function requestAdminOtp(body) {
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);

  const user = await prisma.user.findUnique({
    where: { phoneNumber },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'edg_staff') {
    throw createError(403, 'FORBIDDEN', 'Cet espace est réservé au personnel autorisé.');
  }

  const code = generateOtpCode();
  saveOtp(phoneNumber, code, { purpose: 'admin' });
  console.log(`🔑 CODE OTP ADMIN POUR ${phoneNumber} : ${code}`);

  const result = otpResponse(phoneNumber);
  if (!env.isProduction) result.devCode = code;
  return result;
}

/**
 * Connexion citoyenne : OTP uniquement si le compte existe.
 */
export async function requestLoginOtp(body) {
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);

  const user = await prisma.user.findUnique({
    where: { phoneNumber },
    select: { id: true },
  });
  if (!user) {
    throw createError(404, 'NOT_FOUND', 'Aucun compte pour ce numéro. Inscrivez-vous.');
  }

  const code = generateOtpCode();
  saveOtp(phoneNumber, code, { purpose: 'login' });
  console.log(`🔑 CODE OTP CONNEXION POUR ${phoneNumber} : ${code}`);

  const result = otpResponse(phoneNumber);
  if (!env.isProduction) result.devCode = code;
  return result;
}

export async function verifyOtpAndComplete(body) {
  const phoneNumber = normalizePhoneNumber(body.phoneNumber);
  const code = String(body.code ?? '').trim();
  const purpose =
    body.purpose === 'register' ? 'register' : body.purpose === 'admin' ? 'admin' : 'login';

  if (!/^\d{4}$/.test(code)) {
    throw createError(400, 'VALIDATION_ERROR', 'Le code doit contenir 4 chiffres.');
  }

  const check = verifyOtp(phoneNumber, code, purpose);
  if (!check.ok) {
    const messages = {
      NOT_FOUND: 'Aucun code en cours. Demandez un nouveau code.',
      EXPIRED: 'Code expiré. Demandez un nouveau code.',
      INVALID: 'Code incorrect.',
    };
    throw createError(401, 'OTP_INVALID', messages[check.reason] ?? 'Code invalide.');
  }

  let user;

  if (purpose === 'register') {
    const data = check.payload;
    if (!data) {
      throw createError(400, 'VALIDATION_ERROR', 'Dossier d’inscription introuvable. Recommencez.');
    }

    user = await prisma.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        name: fullName(data.firstName, data.lastName),
        communeId: data.communeId,
        quartierId: data.quartierId,
        defaultSectorId: data.sectorId,
        notifySms: data.notifySms,
        notifyWhatsapp: data.notifyWhatsapp,
        notifyInApp: true,
        isVerified: true,
        role: 'citizen',
      },
      select: USER_SELECT,
    });
  } else {
    user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: USER_SELECT,
    });
    if (!user) {
      throw createError(404, 'NOT_FOUND', 'Compte introuvable.');
    }
    if (!user.isVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
        select: USER_SELECT,
      });
    }
    if (purpose === 'admin' && user.role !== 'edg_staff') {
      throw createError(403, 'FORBIDDEN', 'Cet espace est réservé au personnel autorisé.');
    }
  }

  return {
    token: signToken(user),
    user: publicUser(user),
  };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    throw createError(401, 'UNAUTHORIZED', 'Session expirée ou invalide. Reconnectez-vous.');
  }
}
