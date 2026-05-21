import AnimateIn from '../motion/AnimateIn.jsx';
import { IconMenu } from '../icons/NavIcons.jsx';
import SmartSearch from '../SmartSearch.jsx';

export default function Header({ onMenuToggle, menuOpen = false, index, indexLoading, onSectorSelect }) {
  return (
    <AnimateIn as="header" animation="slide-down" delay={0} className="z-30 w-full bg-[#004B2B] p-4 text-white shadow-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 hover:bg-white/15 active:scale-95 lg:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          <IconMenu className="h-6 w-6" />
        </button>

        <a href="#accueil" className="header-brand-link">
          <span className="rounded-lg bg-brand-bg px-2.5 py-1.5 shadow-sm transition-shadow duration-300 hover:shadow-glow">
            <img src="/logoGNE.png" alt="Météo Énergétique" className="h-8 w-auto sm:h-9" />
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="header-title text-shine font-display text-lg font-extrabold leading-tight sm:text-xl">
              Météo Énergétique
            </span>
            <span className="header-subtitle text-xs font-semibold text-white/80 sm:text-sm">
              Grand Conakry · la météo du jour en direct
            </span>
          </span>
        </a>

        <AnimateIn animation="fade-in" delay={120} className="w-full min-w-[12rem] flex-1 sm:min-w-[16rem] lg:max-w-2xl">
          <SmartSearch
            key="header-search"
            variant="header"
            index={index}
            indexLoading={indexLoading}
            onSectorSelect={onSectorSelect}
          />
        </AnimateIn>
      </div>
    </AnimateIn>
  );
}
