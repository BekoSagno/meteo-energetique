const TOKEN_KEY = 'gne_auth_token';
const USER_KEY = 'gne_auth_user';

export const AUTH_CHANGE_EVENT = 'gne-auth-change';

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

/** Affichage compact pour la sidebar (ex. 622 00 00 00). */
export function formatPhoneDisplay(phoneNumber) {
  if (!phoneNumber) return '';
  const digits = String(phoneNumber).replace(/\D/g, '');
  const local = digits.startsWith('224') ? digits.slice(3) : digits;
  if (local.length === 9) {
    return `${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  }
  return phoneNumber;
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function saveAuthSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

export function authHeaders() {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
