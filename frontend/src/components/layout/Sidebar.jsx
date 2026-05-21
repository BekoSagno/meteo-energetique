import AnimateIn from '../motion/AnimateIn.jsx';
import {
  IconBolt,
  IconHome,
  IconMap,
  IconReport,
  IconUser,
} from '../icons/NavIcons.jsx';
import { formatPhoneDisplay } from '../../lib/auth.js';
import CommuneQuickPicker from './CommuneQuickPicker.jsx';

const NAV_ITEMS = [
  { id: 'home', label: 'La Météo du Jour', icon: IconHome, href: '#accueil', title: 'Météo du jour en direct' },
  { id: 'map', label: 'Carte', icon: IconMap, href: '#carte' },
  { id: 'report', label: 'Signaler', icon: IconReport, action: 'report' },
  { id: 'status', label: 'Historique', icon: IconBolt, href: '#reseau', title: 'Tendances sur 7 jours' },
];

function NavLink({ item, isActive, onReportClick, delay = 0 }) {
  const { label, icon: Icon, href, action, title } = item;
  const activeClass = isActive ? 'app-nav-item--active' : '';
  const itemClass = `app-nav-item w-full ${activeClass}`;

  if (action === 'report') {
    return (
      <AnimateIn animation="slide-right" delay={delay} as="li" className="list-none">
        <button
          type="button"
          onClick={onReportClick}
          className={`${itemClass} app-nav-item--report`}
          title={title ?? label}
        >
          <Icon className="h-6 w-6 shrink-0" />
          <span className="max-w-full text-center text-sm font-extrabold leading-snug">{label}</span>
        </button>
      </AnimateIn>
    );
  }

  return (
    <AnimateIn animation="slide-right" delay={delay} as="li" className="list-none">
      <a
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={itemClass}
        title={title ?? label}
      >
        <Icon className="h-6 w-6 shrink-0" />
        <span className="max-w-full text-center text-sm font-extrabold leading-snug">{label}</span>
      </a>
    </AnimateIn>
  );
}

export default function Sidebar({
  onLoginClick,
  onLogout,
  onReportClick,
  activeView = 'accueil',
  authUser = null,
  communes = [],
  sectors = [],
  selectedCommuneId,
  onCommuneSelect,
}) {
  const connected = Boolean(authUser);
  const phoneDisplay = connected ? formatPhoneDisplay(authUser.phoneNumber) : '';

  return (
    <AnimateIn
      animation="slide-right"
      delay={60}
      as="aside"
      className="app-sidebar hidden w-56 shrink-0 flex-col justify-between self-start border-r border-gray-100 bg-white/50 p-4 py-6 backdrop-blur-sm lg:sticky lg:top-0 lg:flex"
    >
      <div className="flex flex-col gap-0.5">
        <nav aria-label="Navigation principale">
          <ul className="m-0 flex list-none flex-col gap-0 p-0">
            {NAV_ITEMS.map((item, index) => {
              const isActive =
                (item.id === 'status' && activeView === 'reseau') ||
                (item.id === 'map' && activeView === 'carte') ||
                (item.id === 'home' && activeView === 'accueil');

              return (
                <NavLink
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  onReportClick={onReportClick}
                  delay={80 + index * 55}
                />
              );
            })}
          </ul>
        </nav>

        <CommuneQuickPicker
          variant="sidebar"
          communes={communes}
          sectors={sectors}
          selectedCommuneId={selectedCommuneId}
          onCommuneSelect={onCommuneSelect}
        />
      </div>

      <div className="mt-3 shrink-0 border-t border-gray-100/80 pt-3">
        {connected ? (
          <div className="flex flex-col items-center gap-1 px-0.5">
            <span
              className="max-w-full text-center text-xs font-extrabold leading-snug text-brand-dark sm:text-sm"
              title={authUser.phoneNumber}
            >
              {phoneDisplay}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-bold text-red-500 transition-colors duration-300 hover:text-red-600 hover:underline sm:text-sm"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button type="button" onClick={onLoginClick} className="app-nav-item w-full">
            <IconUser className="h-6 w-6 shrink-0" />
            <span className="max-w-full text-center text-sm font-extrabold leading-snug">Se connecter</span>
          </button>
        )}
      </div>
    </AnimateIn>
  );
}
