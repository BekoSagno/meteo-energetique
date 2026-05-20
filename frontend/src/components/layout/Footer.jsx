import ScrollReveal from '../motion/ScrollReveal.jsx';

export default function Footer() {
  return (
    <ScrollReveal as="footer" className="z-30 mt-auto w-full bg-[#004B2B] text-white" role="contentinfo">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 sm:grid-cols-2 sm:px-6 sm:py-10 lg:grid-cols-4">
        <div>
          <img
            src="/logoGNE.png"
            alt=""
            className="mb-4 h-12 w-auto rounded bg-brand-bg px-2 py-1"
          />
          <p className="text-base font-semibold leading-relaxed text-white/90">
            Plateforme citoyenne de suivi de la disponibilité électrique par secteur à Conakry.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-white transition-colors duration-300 hover:text-brand-yellow">
            Navigation
          </h3>
          <ul className="space-y-2.5 text-base font-semibold text-white/85">
            <li>
              <a href="#accueil" className="link-footer">
                Tableau de bord
              </a>
            </li>
            <li>
              <a href="#accueil" className="link-footer">
                Présentation
              </a>
            </li>
            <li>
              <a href="#signaler" className="link-footer">
                Signaler une coupure
              </a>
            </li>
            <li>
              <a href="#apropos" className="link-footer">
                À propos
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-white transition-colors duration-300 hover:text-brand-yellow">
            Couverture
          </h3>
          <ul className="space-y-2.5 text-base font-semibold text-white/85">
            <li>13 communes du Grand Conakry</li>
            <li>325 secteurs cartographiés</li>
            <li>Kits IoT & signalements communautaires</li>
            <li>Données PostGIS temps réel</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-white transition-colors duration-300 hover:text-brand-yellow">
            Contact
          </h3>
          <ul className="space-y-2.5 text-base font-semibold text-white/85">
            <li>
              <a href="mailto:contact@meteo-energetique.gn" className="link-footer">
                contact@meteo-energetique.gn
              </a>
            </li>
            <li>Conakry, Guinée</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-5xl border-t border-white/15 px-4 py-4 text-center text-sm font-semibold text-white/60 sm:px-6">
        © {new Date().getFullYear()} Météo Énergétique — Tous droits réservés. Données à titre
        informatif.
      </div>
    </ScrollReveal>
  );
}
