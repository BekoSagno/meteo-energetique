import {
  IconClose,
  IconHome,
  IconInfo,
  IconMail,
  IconMap,
  IconReport,
  IconUser,
} from '../icons/NavIcons.jsx';
import { formatPhoneDisplay, formatUserDisplayName } from '../../lib/auth.js';
import CommuneQuickPicker from './CommuneQuickPicker.jsx';

const PRIMARY_LINKS = [
  { label: 'La Météo du Jour', icon: IconHome, href: '#accueil' },
  { label: 'Carte énergétique', icon: IconMap, href: '#carte' },
  { label: 'Info', icon: IconInfo, href: '#info' },
  { label: 'Signaler une coupure', icon: IconReport, action: 'report' },
];

const SECONDARY_LINKS = [
  { label: 'À propos', icon: IconInfo, href: '#apropos' },
  { label: 'Nous contacter', icon: IconMail, href: '#contact' },
];

export default function MobileNav({
  open,
  onClose,
  onLoginClick,
  onLogout,
  onReportClick,
  authUser = null,
  communes = [],
  sectors = [],
  selectedCommuneId,
  onCommuneSelect,
}) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] animate-fade-in bg-brand-dark/50 backdrop-blur-sm"
        aria-label="Fermer le menu"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 left-0 z-[70] flex w-[min(100%,320px)] animate-slide-in-left flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
      >
        <div className="app-header relative flex h-14 shrink-0 items-center justify-center px-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-lg text-white transition-transform duration-300 hover:scale-110 active:scale-95"
            aria-label="Fermer"
          >
            <IconClose />
          </button>
          <span className="rounded-lg bg-brand-bg px-2 py-1 shadow-sm">
            <img src="/logoGNE.png" alt="Météo Énergétique" className="h-7 w-auto object-contain" />
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <div className="lg:hidden">
            {PRIMARY_LINKS.map(({ label, icon: Icon, href, action }, i) => {
              if (action === 'report') {
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      onReportClick?.();
                      onClose();
                    }}
                    className="drawer-nav-link drawer-nav-link--report opacity-0"
                    style={{
                      animation: 'fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                      animationDelay: `${0.05 + i * 0.05}s`,
                      opacity: 0,
                    }}
                  >
                    <Icon className="h-6 w-6 shrink-0 text-brand-dark" />
                    <span className="font-display text-base">{label}</span>
                  </button>
                );
              }

              return (
                <a
                  key={label}
                  href={href}
                  onClick={onClose}
                  className="drawer-nav-link opacity-0"
                  style={{
                    animation: 'fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                    animationDelay: `${0.05 + i * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  <Icon className="h-6 w-6 shrink-0 text-brand-dark" />
                  <span className="font-display text-base">{label}</span>
                </a>
              );
            })}
          </div>

          <CommuneQuickPicker
            communes={communes}
            sectors={sectors}
            selectedCommuneId={selectedCommuneId}
            onCommuneSelect={onCommuneSelect}
            onAfterSelect={onClose}
          />

          <div className="my-2 border-t border-brand-dark/10 lg:hidden" />
          {SECONDARY_LINKS.map(({ label, icon: Icon, href }, i) => (
            <a
              key={label}
              href={href}
              onClick={onClose}
              className="drawer-nav-link border-b-0 py-3.5 opacity-0 lg:hidden"
              style={{
                animation: 'fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                animationDelay: `${0.25 + i * 0.05}s`,
                opacity: 0,
              }}
            >
              <Icon className="h-5 w-5 text-brand-dark" />
              <span className="text-sm">{label}</span>
            </a>
          ))}

          {authUser ? (
            <div className="border-t border-brand-dark/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-dark/55">Compte</p>
              <p className="mt-1 font-display text-base font-extrabold text-brand-dark">
                {formatUserDisplayName(authUser)}
              </p>
              <p className="text-sm font-semibold text-brand-dark/55">
                {formatPhoneDisplay(authUser.phoneNumber)}
              </p>
              <button
                type="button"
                onClick={() => {
                  onLogout?.();
                  onClose();
                }}
                className="mt-2 text-sm font-bold text-brand-red hover:underline"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <a
                href="#inscription"
                onClick={onClose}
                className="flex w-full items-center gap-4 border-t border-brand-dark/10 px-5 py-4 font-semibold text-brand-dark transition-all hover:bg-brand-bg"
              >
                <IconUser className="h-5 w-5 text-brand-dark" />
                <span className="text-sm font-bold">S&apos;inscrire</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  onLoginClick?.();
                  onClose();
                }}
                className="flex w-full items-center gap-4 px-5 py-4 font-semibold text-brand-dark transition-all hover:bg-brand-bg"
              >
                <IconUser className="h-5 w-5 text-brand-dark" />
                <span className="text-sm font-bold">Se connecter</span>
              </button>
            </>
          )}
        </nav>

        <div className="shrink-0 border-t border-brand-dark/10 px-5 py-4">
          <p className="font-display text-sm font-bold text-brand-dark">Météo Énergétique</p>
          <p className="mt-1 text-sm font-medium text-brand-dark/80">Grand Conakry · temps réel</p>
        </div>
      </aside>
    </>
  );
}
