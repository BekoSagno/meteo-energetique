const OTP_TTL_MS = 5 * 60 * 1000;

/** @type {Map<string, { code: string, expiresAt: number }>} */
const store = new Map();

export function saveOtp(phone, code) {
  store.set(phone, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

export function verifyOtp(phone, code) {
  const entry = store.get(phone);
  if (!entry) return { ok: false, reason: 'NOT_FOUND' };
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return { ok: false, reason: 'EXPIRED' };
  }
  if (entry.code !== code) {
    return { ok: false, reason: 'INVALID' };
  }
  store.delete(phone);
  return { ok: true };
}

export function clearExpiredOtps() {
  const now = Date.now();
  for (const [phone, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(phone);
  }
}
