import { useEffect, useRef, useState } from 'react';
import AnimateIn from './components/motion/AnimateIn.jsx';
import PageTransition from './components/motion/PageTransition.jsx';
import NetworkStats from './components/NetworkStats.jsx';
import InteractiveNetworkMap from './components/InteractiveNetworkMap.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import OtpAuthModal from './components/auth/OtpAuthModal.jsx';
import ReportButton from './components/ReportButton.jsx';
import TopCommunes from './components/TopCommunes.jsx';
import ViewPageTitle from './components/motion/ViewPageTitle.jsx';
import { fetchFallbackSector } from './lib/defaultSector.js';
import { useAppView } from './hooks/useAppView.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useSearchIndex } from './hooks/useSearchIndex.js';
import { DEFAULT_LAT, DEFAULT_LNG } from './lib/constants.js';
import { formatSectorDisplayName } from './lib/sectorDisplay.js';
import { useAuthSession } from './hooks/useAuthSession.js';

function App() {
  const [selectedSector, setSelectedSector] = useState(null);
  const [locationMode, setLocationMode] = useState(null);
  const [weatherRefresh, setWeatherRefresh] = useState(0);
  const [fallbackLoading, setFallbackLoading] = useState(true);
  const [otpOpen, setOtpOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  /** Commune choisie sur la carte : zoom local uniquement, pas de navigation. */
  const [mapFocusedCommuneId, setMapFocusedCommuneId] = useState(null);
  const userHasChosen = useRef(false);

  const { view, isReseau, isCarte, isAccueil, navigateTo } = useAppView();
  const { user: authUser, login, logout } = useAuthSession();
  const geo = useGeolocation({ enabled: true });
  const { index, loading: indexLoading, error: indexError } = useSearchIndex();

  async function ensureDefaultSector() {
    if (userHasChosen.current) return;
    try {
      const fallback = await fetchFallbackSector();
      if (fallback && !userHasChosen.current) {
        setSelectedSector((prev) => prev ?? fallback);
        setLocationMode((mode) => (mode === 'gps' ? 'gps' : 'fallback'));
      }
    } catch {
      /* le hook géoloc tentera aussi le repli */
    } finally {
      setFallbackLoading(false);
    }
  }

  useEffect(() => {
    ensureDefaultSector();
  }, []);

  useEffect(() => {
    if (geo.sector && !userHasChosen.current) {
      setSelectedSector(geo.sector);
      setLocationMode(geo.locationMode);
      setFallbackLoading(false);
    }
  }, [geo.sector, geo.locationMode]);

  useEffect(() => {
    if (geo.loading || userHasChosen.current || selectedSector) return;
    ensureDefaultSector();
  }, [geo.loading, selectedSector]);

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
    setFallbackLoading(false);

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
    setFallbackLoading(false);
    navigateTo('accueil');
    window.setTimeout(scrollToLiveDashboard, 150);
  }

  function handleCommuneSelect(_commune, sector) {
    userHasChosen.current = true;
    if (sector) {
      setSelectedSector(sector);
      setLocationMode(null);
      setFallbackLoading(false);
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

  const bootstrapping = (geo.loading || fallbackLoading) && !selectedSector;
  const selectedCommuneId = selectedSector?.communeId ?? selectedSector?.commune?.id;
  const selectedSectorId = selectedSector?.id ?? null;

  const networkStatsProps = {
    key: selectedSector?.id ?? 'default',
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
      onLoginClick={() => setOtpOpen(true)}
      onLogout={logout}
      onReportClick={handleReportFromNav}
      authUser={authUser}
      activeView={view}
      selectedCommuneId={selectedCommuneId}
    >
      <OtpAuthModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onSuccess={(session) => {
          login(session);
          setOtpOpen(false);
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
              focusedCommuneId={mapFocusedCommuneId}
              selectedSectorId={selectedSectorId}
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
            {bootstrapping ? (
              <div className="card-elevated p-12">
                <div className="shimmer-block mx-auto h-5 w-40 rounded-lg" />
                <p className="mt-6 text-center font-display text-base font-bold text-brand-dark">
                  Chargement des statistiques…
                </p>
              </div>
            ) : (
              <NetworkStats {...networkStatsProps} dashboardTitle="État du réseau" />
            )}
          </section>
        </PageTransition>
      ) : isAccueil ? (
        <PageTransition viewKey="accueil">
          <section id="accueil" className="mx-auto w-full max-w-5xl pb-4">
            {indexError && (
              <p className="mb-4 text-center text-sm font-semibold text-brand-red">{indexError}</p>
            )}

            {bootstrapping ? (
              <div className="card-elevated p-12">
                <div className="shimmer-block mx-auto h-5 w-40 rounded-lg" />
                <p className="mt-6 text-center font-display text-base font-bold text-brand-dark">
                  Chargement du tableau de bord…
                </p>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-6">
                <NetworkStats
                  {...networkStatsProps}
                  dashboardTitle="Tableau de bord — temps réel"
                />

                <div id="signaler">
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
              </div>
            )}
          </section>
        </PageTransition>
      ) : null}
    </AppLayout>
  );
}

export default App;

