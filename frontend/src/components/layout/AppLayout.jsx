import { useState } from 'react';
import SearchModal from '../SearchModal.jsx';
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
  isSearchOpen: isSearchOpenProp,
  onSearchOpen,
  onSearchClose,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [internalSearchOpen, setInternalSearchOpen] = useState(false);

  const isSearchOpen = isSearchOpenProp ?? internalSearchOpen;
  const openSearch = onSearchOpen ?? (() => setInternalSearchOpen(true));
  const closeSearch = onSearchClose ?? (() => setInternalSearchOpen(false));

  function handleSectorSelect(sector) {
    onSectorSelect(sector);
    setMobileNavOpen(false);
    closeSearch();
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
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pb-28 sm:p-6 sm:pb-32">
              {children}
            </main>
          </div>
        </div>

        <QuickSearchCTA onOpen={openSearch} />

        <SearchModal
          open={isSearchOpen}
          onClose={closeSearch}
          index={index}
          indexLoading={indexLoading}
          onSectorSelect={handleSectorSelect}
        />

        <Footer />
      </div>
    </>
  );
}
