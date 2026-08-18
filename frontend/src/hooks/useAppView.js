import { useCallback, useEffect, useState } from 'react';

/** Vues principales pilotées par le hash (#meteo, #info, …). */
export function resolveViewFromHash(hash = '') {
  const id = hash.replace(/^#/, '') || 'accueil';
  if (id === 'info' || id === 'reseau') return 'info';
  if (id === 'inscription') return 'inscription';
  if (id.startsWith('admin')) return 'admin';
  if (id === 'carte') return 'carte';
  if (id === 'meteo' || id === 'accueil' || id === 'signaler') return 'accueil';
  return 'accueil';
}

export function useAppView() {
  const [hashId, setHashId] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') || 'accueil' : 'accueil'
  );

  useEffect(() => {
    function onHashChange() {
      const id = window.location.hash.replace(/^#/, '') || 'accueil';
      setHashId(id);
    }

    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const view = resolveViewFromHash(`#${hashId}`);

  const scrollToSignaler = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById('signaler')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, []);

  useEffect(() => {
    if (view !== 'accueil') return;
    if (window.location.hash === '#signaler') {
      scrollToSignaler();
    }
  }, [view, scrollToSignaler]);

  const navigateTo = useCallback((target) => {
    const hashes = {
      accueil: '#accueil',
      meteo: '#accueil',
      carte: '#carte',
      info: '#info',
      inscription: '#inscription',
      admin: '#admin',
      reseau: '#info',
      signaler: '#signaler',
    };
    const hash = hashes[target] ?? '#accueil';
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    setHashId(hash.replace(/^#/, ''));
  }, []);

  return {
    view,
    hashId,
    isInfo: view === 'info',
    isInscription: view === 'inscription',
    isAdmin: view === 'admin',
    isCarte: view === 'carte',
    isAccueil: view === 'accueil',
    isMeteo: view === 'accueil',
    navigateTo,
  };
}
