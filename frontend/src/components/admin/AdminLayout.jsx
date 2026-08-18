const LINKS = [
  { id: 'dashboard', href: '#admin', label: 'Tableau de bord' },
  { id: 'info', href: '#admin-info', label: 'Publications Info' },
  { id: 'users', href: '#admin-users', label: 'Utilisateurs' },
  { id: 'reports', href: '#admin-reports', label: 'Signalements' },
  { id: 'queue', href: '#admin-queue', label: 'File d’envoi' },
];

export default function AdminLayout({ section, userName, onLogout, children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 text-brand-dark">
      <aside className="hidden w-60 shrink-0 flex-col bg-[#003822] text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-brand-yellow">
            Administration
          </p>
          <p className="mt-1 font-display text-lg font-extrabold">Météo Énergétique</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-bold ${
                section === link.id ? 'bg-white text-brand-dark' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-xs font-semibold text-white/70">{userName}</p>
          <a href="#accueil" className="mt-2 block text-xs font-bold text-brand-yellow hover:underline">
            Voir le site public
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 text-xs font-bold text-red-300 hover:underline"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <p className="font-display text-base font-extrabold lg:hidden">Admin</p>
          <nav className="flex gap-2 overflow-x-auto lg:hidden">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                  section === link.id ? 'bg-brand-dark text-white' : 'bg-slate-100 text-brand-dark/70'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a href="#accueil" className="hidden text-sm font-bold text-brand-dark/60 hover:text-brand-dark lg:block">
            Site public
          </a>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
