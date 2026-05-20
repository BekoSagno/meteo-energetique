import AnimateIn from './motion/AnimateIn.jsx';
import ScrollReveal from './motion/ScrollReveal.jsx';

const FEATURES = [
  'État du courant par secteur en temps réel',
  'Recherche rapide : commune, quartier ou secteur',
  'Signalements citoyens validés par consensus',
  'Couverture des 13 communes du Grand Conakry',
];

export default function HomeHero() {
  return (
    <ScrollReveal>
    <section id="accueil" className="app-hero relative overflow-hidden px-4 py-10 sm:py-14">
      <div className="hero-blob -left-20 top-8 h-48 w-48 bg-brand-green/30" style={{ animationDelay: '0s' }} />
      <div
        className="hero-blob -right-16 top-24 h-40 w-40 bg-brand-yellow/25"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="hero-blob bottom-4 left-1/3 h-32 w-32 bg-brand-dark/10"
        style={{ animationDelay: '3s' }}
      />

      <div className="relative w-full">
        <AnimateIn animation="scale-in" delay={0}>
          <div className="card-elevated px-6 py-9 sm:px-10 sm:py-11">
            <p className="text-label text-center">Grand Conakry · Guinée</p>

            <h2 className="text-shine-dark mt-4 text-center font-display text-display-sm font-extrabold sm:text-display-md">
              La météo du courant électrique, en direct
            </h2>

            <div
              className="mx-auto mt-5 flex h-2 w-40 overflow-hidden rounded-full"
              aria-hidden
            >
              <span className="flex-1 bg-brand-dark" />
              <span className="flex-1 animate-pulse bg-brand-yellow" />
              <span className="flex-1 bg-brand-green" />
            </div>

            <p className="text-lead mx-auto mt-6 max-w-lg text-center">
              Consultez l&apos;état d&apos;alimentation de votre secteur, signalez une coupure ou une
              baisse de tension, et contribuez à une carte énergétique fiable pour toute la communauté.
            </p>

            <ul className="mx-auto mt-9 max-w-md space-y-0">
              {FEATURES.map((text, i) => (
                <AnimateIn key={text} delay={120 + i * 70} as="li">
                  <div className="interactive-row flex items-start gap-3 border-b border-brand-dark/10 px-2 py-4 last:border-0">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-extrabold text-brand-dark shadow-sm transition-all duration-300">
                      ✓
                    </span>
                    <span className="hover-text-glow text-body-lg font-extrabold leading-snug text-brand-dark">{text}</span>
                  </div>
                </AnimateIn>
              ))}
            </ul>

            <AnimateIn delay={500} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href="#meteo" className="btn-primary">
                Remonter à la météo
              </a>
              <a href="#signaler" className="btn-report">
                Signaler un incident
              </a>
            </AnimateIn>
          </div>
        </AnimateIn>
      </div>
    </section>
    </ScrollReveal>
  );
}
