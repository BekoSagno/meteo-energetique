import { useCallback, useEffect, useState } from 'react';

/** Vues principales pilotées par le hash (#meteo, #reseau, …). */
export function resolveViewFromHash(hash = '') {
  const id = hash.replace(/^#/, '') || 'accueil';
  if (id === 'reseau') return 'reseau';
  if (id === 'carte') return 'carte';
  if (id === 'meteo' || id === 'accueil' || id === 'signaler') return 'accueil';
  return 'accueil';
}

export function useAppView() {
  const [view, setView] = useState(() =>
    typeof window !== 'undefined' ? resolveViewFromHash(window.location.hash) : 'accueil'
  );

  useEffect(() => {
    function onHashChange() {
      setView(resolveViewFromHash(window.location.hash));
    }

    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
      reseau: '#reseau',
      signaler: '#signaler',
    };
    const hash = hashes[target] ?? '#accueil';
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    setView(resolveViewFromHash(hash));
  }, []);

  return {
    view,
    isReseau: view === 'reseau',
    isCarte: view === 'carte',
    isAccueil: view === 'accueil',
    isMeteo: view === 'accueil',
    navigateTo,
  };
}
