import { useCallback, useEffect, useState } from 'react';
import {
  AUTH_CHANGE_EVENT,
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  saveAuthSession,
} from '../lib/auth.js';

export function useAuthSession() {
  const [user, setUser] = useState(() => getAuthUser());
  const [token, setToken] = useState(() => getAuthToken());

  const refresh = useCallback(() => {
    setUser(getAuthUser());
    setToken(getAuthToken());
  }, []);

  useEffect(() => {
    function onAuthChange() {
      refresh();
    }

    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    window.addEventListener('storage', onAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
      window.removeEventListener('storage', onAuthChange);
    };
  }, [refresh]);

  const login = useCallback((session) => {
    saveAuthSession(session);
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    clearAuthSession();
    refresh();
  }, [refresh]);

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
    refresh,
  };
}
