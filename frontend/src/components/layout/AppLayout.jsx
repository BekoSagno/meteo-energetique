import { useState } from 'react';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import MobileNav from './MobileNav.jsx';
import QuickSearchCTA from './QuickSearchCTA.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout({
  children,
  index,
  indexLoading,
  onSectorSelect,
  onCommuneSelect,
  onLoginClick,
  onLogout,
  onReportClick,
  activeView = 'accueil',
  authUser = null,
  selectedCommuneId,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleSectorSelect(sector) {
    onSectorSelect(sector);
    setMobileNavOpen(false);
  }

  function handleCommuneSelect(commune, sector) {
    onCommuneSelect?.(commune, sector);
    setMobileNavOpen(false);
  }

  function handleReportClick() {
    setMobileNavOpen(false);
    onReportClick?.();
  }

  return (
    <>
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onReportClick={handleReportClick}
        authUser={authUser}
        communes={index.communes}
        sectors={index.sectors}
        selectedCommuneId={selectedCommuneId}
        onCommuneSelect={handleCommuneSelect}
      />

      <div className="flex min-h-screen flex-col bg-brand-bg text-brand-dark">
        <Header
          onMenuToggle={() => setMobileNavOpen((o) => !o)}
          menuOpen={mobileNavOpen}
          index={index}
          indexLoading={indexLoading}
          onSectorSelect={handleSectorSelect}
        />

        <div className="flex w-full flex-1">
          <Sidebar
            onLoginClick={onLoginClick}
            onLogout={onLogout}
            onReportClick={handleReportClick}
            activeView={activeView}
            authUser={authUser}
            communes={index.communes}
            sectors={index.sectors}
            selectedCommuneId={selectedCommuneId}
            onCommuneSelect={handleCommuneSelect}
          />

          <div className="app-main-column relative z-0 flex min-w-0 flex-1 flex-col">
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pb-24 sm:p-6 sm:pb-28">
              {children}
            </main>
          </div>
        </div>

        <div
          className="pointer-events-none fixed bottom-7 left-0 right-0 z-50 flex justify-center px-4 pb-4 sm:pb-20 lg:left-56 lg:px-3"
          role="search"
          aria-label="Recherche locale"
        >
          <div className="pointer-events-auto w-full max-w-xl sm:max-w-2xl">
            <QuickSearchCTA
              index={index}
              indexLoading={indexLoading}
              onSectorSelect={handleSectorSelect}
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
