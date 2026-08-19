import { useState } from 'react';

const LINKS = [
  { id: 'dashboard', href: '#admin', label: 'Tableau de bord', icon: DashboardIcon },
  { id: 'info', href: '#admin-info', label: 'Publications', icon: PublishIcon },
  { id: 'users', href: '#admin-users', label: 'Utilisateurs', icon: UsersIcon },
  { id: 'reports', href: '#admin-reports', label: 'Signalements', icon: ReportsIcon },
  { id: 'queue', href: '#admin-queue', label: "File d'envoi", icon: QueueIcon },
];

function DashboardIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

function PublishIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );
}

function ReportsIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  );
}

function QueueIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

function SidebarContent({ section, userName, onLogout }) {
  return (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <img src="/logoGNE.png" alt="" className="h-8 w-8 rounded-lg bg-white/10 p-0.5" />
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-yellow/80">
              Administration
            </p>
            <p className="font-display text-sm font-extrabold leading-tight">Météo Énergétique</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = section === link.id;
          return (
            <a
              key={link.id}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                active
                  ? 'bg-white text-brand-dark shadow-sm'
                  : 'text-white/70 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-emerald-600' : ''}`} />
              {link.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-extrabold">
            {(userName ?? 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white/90">{userName}</p>
            <p className="text-[10px] font-medium text-white/40">Personnel EDG</p>
          </div>
        </div>
        <div className="mt-3 flex gap-3">
          <a href="#accueil" className="text-[11px] font-bold text-brand-yellow hover:underline">
            Site public
          </a>
          <button type="button" onClick={onLogout} className="text-[11px] font-bold text-red-300 hover:underline">
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminLayout({ section, userName, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-brand-dark">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-b from-[#003822] to-[#002A1A] text-white lg:flex">
        <SidebarContent section={section} userName={userName} onLogout={onLogout} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 flex w-72 flex-col bg-gradient-to-b from-[#003822] to-[#002A1A] text-white">
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 text-white/60 hover:text-white">
              <CloseIcon className="h-6 w-6" />
            </button>
            <SidebarContent section={section} userName={userName} onLogout={() => { setMobileOpen(false); onLogout(); }} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-lg lg:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden">
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <h1 className="font-display text-base font-extrabold text-brand-dark lg:hidden">
              {LINKS.find((l) => l.id === section)?.label ?? 'Admin'}
            </h1>
          </div>

          <nav className="hidden gap-1 lg:flex">
            {LINKS.map((link) => {
              const active = section === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <a href="#accueil" className="text-xs font-bold text-slate-400 hover:text-slate-600">
            ← Site public
          </a>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
