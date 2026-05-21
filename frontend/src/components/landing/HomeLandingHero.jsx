import AnimateIn from '../motion/AnimateIn.jsx';

/** Intégré au bloc #meteo : pas de fond ni ombre propres (évite la couture visuelle). */
export default function HomeLandingHero({ embedded = true }) {
  const shell = embedded
    ? 'relative z-10 border-b border-white/10 px-4 py-5 sm:px-6 sm:py-6'
    : 'relative overflow-hidden rounded-2xl bg-brand-dark px-4 py-5 shadow-card sm:px-6 sm:py-6';

  return (
    <section id="presentation" className={shell} aria-labelledby="landing-hero-title">
      <div className="mx-auto max-w-3xl text-center">
        <AnimateIn delay={0}>
          <h1
            id="landing-hero-title"
            className="font-display text-xl font-extrabold leading-snug text-white sm:text-2xl lg:text-[1.65rem]"
          >
            Suivez la météo électrique de votre quartier en temps réel.
          </h1>
        </AnimateIn>

        <AnimateIn delay={50}>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/80 sm:text-[0.95rem]">
            Météo Énergétique cartographie la disponibilité du courant dans le Grand Conakry.
            Planifiez vos activités et agissez pour votre communauté.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
