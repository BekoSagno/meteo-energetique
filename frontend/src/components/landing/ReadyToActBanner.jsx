import ScrollReveal from '../motion/ScrollReveal.jsx';

export default function ReadyToActBanner({ onDiscoverMap }) {
  return (
    <ScrollReveal>
      <section
        id="agir"
        className="relative overflow-hidden rounded-2xl bg-brand-dark px-6 py-12 text-center shadow-card sm:px-10 sm:py-14"
        aria-labelledby="ready-title"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-green/20 via-transparent to-brand-yellow/10"
          aria-hidden
        />

        <div className="relative mx-auto max-w-2xl">
          <h2
            id="ready-title"
            className="font-display text-2xl font-extrabold text-white sm:text-3xl"
          >
            Prêt à faire la{' '}
            <span className="bg-gradient-to-r from-brand-yellow to-amber-300 bg-clip-text text-transparent">
              différence
            </span>{' '}
            ?
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-white/80 sm:text-lg">
            Ne soyez plus spectateur des coupures. Devenez un acteur de la transparence énergétique
            de votre secteur en quelques secondes.
          </p>
          <button
            type="button"
            onClick={onDiscoverMap}
            className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-white/25 bg-white px-6 py-3.5 text-sm font-extrabold text-brand-dark shadow-lg transition-all hover:scale-[1.02] hover:bg-brand-bg hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-yellow/60 focus:ring-offset-2 focus:ring-offset-brand-dark"
          >
            <span aria-hidden="true">🔗</span>
            Découvrir la carte interactive
          </button>
        </div>
      </section>
    </ScrollReveal>
  );
}
