const OTP_TTL_MS = 5 * 60 * 1000;

/** @type {Map<string, { code: string, expiresAt: number, purpose: string, payload?: object }>} */
const store = new Map();

export function saveOtp(phone, code, { purpose = 'login', payload = null } = {}) {
  store.set(phone, {
    code,
    purpose,
    payload,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

export function peekOtp(phone) {
  return store.get(phone) ?? null;
}

export function verifyOtp(phone, code, expectedPurpose) {
  const entry = store.get(phone);
  if (!entry) return { ok: false, reason: 'NOT_FOUND' };
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return { ok: false, reason: 'EXPIRED' };
  }
  if (expectedPurpose && entry.purpose !== expectedPurpose) {
    return { ok: false, reason: 'INVALID' };
  }
  if (entry.code !== String(code)) {
    return { ok: false, reason: 'INVALID' };
  }
  store.delete(phone);
  return { ok: true, payload: entry.payload ?? null, purpose: entry.purpose };
}

export const OTP_EXPIRES_IN_SECONDS = OTP_TTL_MS / 1000;
