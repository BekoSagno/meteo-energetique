import ScrollReveal from '../motion/ScrollReveal.jsx';

const NAV_LINKS = [
  { href: '#accueil', label: 'La Météo du Jour' },
  { href: '#carte', label: 'Carte' },
  { href: '#signaler', label: 'Signalements' },
  { href: '#info', label: 'Info' },
];

const LEGAL_LINKS = [
  { href: '#confidentialite', label: 'Confidentialité' },
  { href: '#cgu', label: 'CGU' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <ScrollReveal
      as="footer"
      className="z-30 mt-auto w-full border-t border-brand-dark/10 bg-brand-dark text-white"
      role="contentinfo"
    >
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-8 lg:py-12">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src="/logoGNE.png"
              alt=""
              className="h-11 w-auto rounded-lg bg-brand-bg px-2 py-1"
            />
            <span className="font-display text-lg font-extrabold tracking-tight">
              Météo Énergétique
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-white/75">
            Promouvoir la transparence énergétique et inciter au comportement citoyen à Conakry.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-yellow">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="link-footer text-sm font-semibold">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-yellow">
            Légal
          </h3>
          <ul className="mt-4 space-y-2.5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="link-footer text-sm font-semibold">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-yellow">
            Contact
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold text-white/85">
            <li>
              <a href="mailto:contact@meteo-energetique.gn" className="link-footer">
                contact@meteo-energetique.gn
              </a>
            </li>
            <li>Conakry, Guinée</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center">
        <p className="text-xs font-semibold tracking-wide text-white/45">
          © 2024–{year} MÉTÉO ÉNERGÉTIQUE. Tous droits réservés.
        </p>
        <a href="#admin" className="mt-2 inline-block text-[11px] font-semibold text-white/30 hover:text-white/55">
          Espace administration
        </a>
      </div>
    </ScrollReveal>
  );
}
