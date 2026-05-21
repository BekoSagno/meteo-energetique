import { useEffect, useRef, useState } from 'react';
import AnimateIn from './components/motion/AnimateIn.jsx';
import PageTransition from './components/motion/PageTransition.jsx';
import NetworkStats from './components/NetworkStats.jsx';
import InteractiveNetworkMap from './components/InteractiveNetworkMap.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import PhoneAuthModal from './components/auth/PhoneAuthModal.jsx';
import ReportButton from './components/ReportButton.jsx';
import TopCommunes from './components/TopCommunes.jsx';
import ViewPageTitle from './components/motion/ViewPageTitle.jsx';
import LocationRefiningBanner from './components/LocationRefiningBanner.jsx';
import HomeLandingHero from './components/landing/HomeLandingHero.jsx';
import CitizenEngagementSection from './components/landing/CitizenEngagementSection.jsx';
import ReadyToActBanner from './components/landing/ReadyToActBanner.jsx';
import { fetchFallbackSector, INSTANT_PLACEHOLDER_SECTOR } from './lib/defaultSector.js';
import { useAppView } from './hooks/useAppView.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useSearchIndex } from './hooks/useSearchIndex.js';
import { DEFAULT_LAT, DEFAULT_LNG } from './lib/constants.js';
import { formatSectorDisplayName } from './lib/sectorDisplay.js';
import { useAuthSession } from './hooks/useAuthSession.js';

function App() {
  const [selectedSector, setSelectedSector] = useState(INSTANT_PLACEHOLDER_SECTOR);
  const [locationMode, setLocationMode] = useState('fallback');
  const [weatherRefresh, setWeatherRefresh] = useState(0);
  const [apiRefining, setApiRefining] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  /** Commune choisie sur la carte : zoom local uniquement, pas de navigation. */
  const [mapFocusedCommuneId, setMapFocusedCommuneId] = useState(null);
  const userHasChosen = useRef(false);

  const { view, isReseau, isCarte, isAccueil, navigateTo } = useAppView();
  const { user: authUser, login, logout } = useAuthSession();
  const geo = useGeolocation({ enabled: true });
  const { index, loading: indexLoading, error: indexError } = useSearchIndex();

  useEffect(() => {
    if (userHasChosen.current) return;

    const controller = new AbortController();

    (async () => {
      try {
        const fallback = await fetchFallbackSector(controller.signal);
        if (fallback && !userHasChosen.current && !controller.signal.aborted) {
          setSelectedSector((prev) => {
            if (userHasChosen.current) return prev;
            return fallback;
          });
          setLocationMode((mode) => {
            if (mode === 'gps' || mode === 'diaspora') return mode;
            return 'fallback';
          });
        }
      } catch {
        /* le placeholder Kaloum reste affiché */
      } finally {
        if (!controller.signal.aborted) setApiRefining(false);
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!geo.sector || userHasChosen.current) return;
    setSelectedSector(geo.sector);
    setLocationMode(geo.locationMode ?? 'gps');
    setApiRefining(false);
  }, [geo.sector, geo.locationMode]);

  useEffect(() => {
    if (!geo.diasporaView || userHasChosen.current) return;
    setMapFocusedCommuneId(null);
  }, [geo.diasporaView]);

  function scrollToLiveDashboard() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('accueil')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /** Recherche / sidebar / TopCommunes — met à jour le secteur sans quitter la vue courante. */
  function handleSectorSelect(sector) {
    if (!sector) return;
    userHasChosen.current = true;
    setSelectedSector(sector);
    setLocationMode(null);
    setApiRefining(false);

    const hash = window.location.hash.replace(/^#/, '') || 'accueil';
    if (hash !== 'accueil' && hash !== 'meteo' && hash !== 'signaler') {
      navigateTo('accueil');
      window.setTimeout(scrollToLiveDashboard, 150);
    } else if (view === 'accueil') {
      scrollToLiveDashboard();
    }
  }

  /** Clic commune sur la carte : zoom uniquement, affiche les secteurs de cette commune. */
  function handleMapCommuneFocus(commune) {
    if (!commune) {
      setMapFocusedCommuneId(null);
      return;
    }
    const id = commune?.id ?? commune?.communeId;
    setMapFocusedCommuneId(id != null ? Number(id) : null);
  }

  /** Clic secteur sur la carte : ouvre le tableau de bord temps réel de ce secteur. */
  function handleMapSectorSelect(sector) {
    if (!sector) return;
    userHasChosen.current = true;
    setSelectedSector(sector);
    setLocationMode(null);
    setApiRefining(false);
    navigateTo('accueil');
    window.setTimeout(scrollToLiveDashboard, 150);
  }

  function handleCommuneSelect(_commune, sector) {
    userHasChosen.current = true;
    if (sector) {
      setSelectedSector(sector);
      setLocationMode(null);
      setApiRefining(false);
    }
  }

  function handleReportFromNav() {
    setReportModalOpen(true);
  }

  const conakryRegionId = index.regions.find((r) => r.name === 'Conakry')?.id ?? index.regions[0]?.id;

  function handleConsensusReached() {
    setWeatherRefresh((n) => n + 1);
  }

  const lat = selectedSector?.coordinates?.lat ?? DEFAULT_LAT;
  const lng = selectedSector?.coordinates?.lng ?? DEFAULT_LNG;

  const currentState =
    selectedSector?.powerStatus?.currentState ?? selectedSector?.state ?? 'ONLINE';

  const quartierName = selectedSector?.quartier?.name;
  const sectorDisplayName = formatSectorDisplayName(selectedSector?.name, quartierName);
  const lastUpdated =
    selectedSector?.powerStatus?.lastUpdated ?? selectedSector?.lastUpdated ?? null;

  const breadcrumb = {
    region: selectedSector?.region?.name,
    commune: selectedSector?.commune?.name,
    quartier: quartierName,
  };

  const refiningLocation =
    !userHasChosen.current && (apiRefining || geo.refining);
  const refiningDetail =
    geo.refining && apiRefining
      ? 'Connexion au serveur et affinage GPS…'
      : geo.refining
        ? 'Détection de votre secteur (GPS)…'
        : apiRefining
          ? 'Synchronisation des données Conakry…'
          : undefined;

  const selectedCommuneId = selectedSector?.communeId ?? selectedSector?.commune?.id;
  const selectedSectorId = selectedSector?.id ?? null;
  const diasporaMapView = locationMode === 'diaspora' || geo.diasporaView;

  const networkStatsProps = {
    sectorId: selectedSector?.id ?? 1,
    sectorName: selectedSector?.name ?? sectorDisplayName,
    quartierName,
    breadcrumb,
    currentState,
    lastUpdated,
  };

  const reportModal = (
    <ReportButton
      lat={lat}
      lng={lng}
      open={reportModalOpen}
      onOpenChange={setReportModalOpen}
      showTrigger={false}
      onConsensusReached={handleConsensusReached}
    />
  );

  return (
    <AppLayout
      index={index}
      indexLoading={indexLoading}
      onSectorSelect={handleSectorSelect}
      onCommuneSelect={handleCommuneSelect}
      onLoginClick={() => setAuthOpen(true)}
      onLogout={logout}
      onReportClick={handleReportFromNav}
      authUser={authUser}
      activeView={view}
      selectedCommuneId={selectedCommuneId}
    >
      <PhoneAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(session) => {
          login(session);
          setAuthOpen(false);
        }}
      />

      {reportModal}

      {isCarte ? (
        <PageTransition viewKey="carte">
          <section id="carte" className="w-full pb-4">
            <ViewPageTitle subtitle="Cartographie interactive des 13 communes et 325 secteurs">
              Carte énergétique
            </ViewPageTitle>
            {indexError && (
              <p className="mb-4 text-center text-sm font-semibold text-brand-red">{indexError}</p>
            )}
            <InteractiveNetworkMap
              sectors={index.sectors}
              regionId={conakryRegionId}
              focusedCommuneId={diasporaMapView ? null : mapFocusedCommuneId}
              selectedSectorId={selectedSectorId}
              forceGlobalView={diasporaMapView}
              onCommuneFocus={handleMapCommuneFocus}
              onSectorSelect={handleMapSectorSelect}
              refreshKey={weatherRefresh}
            />
          </section>
        </PageTransition>
      ) : isReseau ? (
        <PageTransition viewKey="reseau">
          <section id="reseau" className="w-full pb-4">
            <ViewPageTitle subtitle="Indicateurs et disponibilité par secteur en temps réel">
              État du réseau
            </ViewPageTitle>
            {indexError && (
              <p className="mb-4 text-center text-sm font-semibold text-brand-red">{indexError}</p>
            )}
            <LocationRefiningBanner active={refiningLocation} detail={refiningDetail} />
            <NetworkStats
              key={selectedSector?.id ?? 'default'}
              {...networkStatsProps}
              dashboardTitle="La Météo du Jour — Temps réel"
            />
          </section>
        </PageTransition>
      ) : isAccueil ? (
        <PageTransition viewKey="accueil">
          <section id="accueil" className="mx-auto w-full max-w-5xl pb-4 pt-0">
            {indexError && (
              <p className="mb-4 text-center text-sm font-semibold text-brand-red">{indexError}</p>
            )}

            <div className="flex w-full flex-col gap-10 sm:gap-12">
              <div
                id="meteo"
                className="scroll-mt-20 overflow-hidden rounded-2xl border-2 border-brand-dark/15 bg-brand-bg shadow-card"
              >
                <div className="relative bg-brand-dark">
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-green/15 via-transparent to-brand-yellow/8"
                    aria-hidden
                  />
                  <HomeLandingHero embedded />
                  {refiningLocation && (
                    <div className="relative z-10 border-b border-white/10 px-4 py-2 sm:px-6">
                      <LocationRefiningBanner active detail={refiningDetail} />
                    </div>
                  )}
                  <NetworkStats
                    key={selectedSector?.id ?? 'default'}
                    {...networkStatsProps}
                    embedded
                    dashboardTitle="L'ÉTAT ACTUEL DU COURANT"
                  />
                </div>
              </div>

              <div id="signaler" className="scroll-mt-24">
                <AnimateIn delay={200} className="w-full">
                  <button
                    type="button"
                    onClick={handleReportFromNav}
                    className="btn-report w-full py-4 text-base"
                  >
                    Signaler un changement d&apos;état
                  </button>
                </AnimateIn>
              </div>

              <TopCommunes
                regionId={conakryRegionId}
                communes={index.communes}
                sectors={index.sectors}
                selectedCommuneId={selectedCommuneId}
                onCommuneSelect={handleCommuneSelect}
                refreshKey={weatherRefresh}
              />

              <CitizenEngagementSection />

              <ReadyToActBanner onDiscoverMap={() => navigateTo('carte')} />
            </div>
          </section>
        </PageTransition>
      ) : null}
    </AppLayout>
  );
}

export default App;

