import ScrollReveal from '../motion/ScrollReveal.jsx';

const SECTION_SHELL =
  'relative overflow-hidden rounded-2xl bg-brand-dark px-5 py-10 shadow-card sm:px-8 sm:py-12';
const SECTION_GRADIENT =
  'pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-green/20 via-transparent to-brand-yellow/10';
const INNER_CARD =
  'rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition-shadow hover:bg-white/[0.14]';

const STEPS = [
  {
    n: 1,
    title: 'Sélectionner',
    text: 'Trouvez votre commune, quartier ou secteur sur la carte ou via la recherche.',
  },
  {
    n: 2,
    title: 'Constater',
    text: 'Vérifiez le taux de disponibilité actuel mis à jour en temps réel.',
  },
  {
    n: 3,
    title: 'Signaler',
    text: 'Une coupure ou une baisse de tension ? Signalez-le en un clic.',
  },
  {
    n: 4,
    title: 'Impacter',
    text: 'Votre signalement met instantanément à jour la carte pour tout Conakry.',
  },
];

const REASSURANCE_CARDS = [
  {
    icon: '🤝',
    title: 'Données collaboratives',
    text: "Aucune donnée nominative n'est obligatoire. Les signalements reposent sur la transparence et l'entraide communautaire.",
  },
  {
    icon: '🗺️',
    title: 'Réseau intelligent',
    text: "Une infrastructure PostGIS connectée calcule instantanément l'état du réseau pour 325 secteurs cartographiés.",
  },
  {
    icon: '📱',
    title: '100 % accessible',
    text: 'Conçu pour être ultra-léger et rapide à charger, même sur smartphone avec une connexion 3G/4G limitée.',
  },
];

export default function CitizenEngagementSection() {
  return (
    <ScrollReveal>
      <section id="engagement" className={SECTION_SHELL} aria-labelledby="engagement-title">
        <div className={SECTION_GRADIENT} aria-hidden />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-brand-yellow">
            Engagement citoyen
          </p>
          <h2
            id="engagement-title"
            className="mt-3 font-display text-2xl font-extrabold text-white sm:text-3xl"
          >
            Comportement citoyen & transparence
          </h2>
          <p className="mt-3 text-base font-medium leading-relaxed text-white/80">
            Quatre gestes simples pour transformer votre observation en donnée utile à toute la
            communauté.
          </p>
        </div>

        <div className="relative mt-12 grid gap-12 lg:grid-cols-2 lg:gap-14 lg:items-start">
          <div>
            <h3 className="mb-8 font-display text-lg font-extrabold text-white">
              Parcours de signalement
            </h3>
            <ol className="relative space-y-6 pl-0">
              <span
                className="absolute bottom-[1.125rem] left-[1.125rem] top-[1.125rem] w-0.5 -translate-x-1/2 bg-gradient-to-b from-brand-green/80 via-white/35 to-brand-green/80"
                aria-hidden
              />
              {STEPS.map((step) => (
                <li key={step.n} className="relative flex items-center gap-5">
                  <span
                    className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-green/60 bg-brand-dark font-display text-sm font-extrabold text-white shadow-sm ring-2 ring-white/10"
                    aria-hidden
                  >
                    {step.n}
                  </span>
                  <div className="min-w-0 flex-1 py-1">
                    <h4 className="font-display text-base font-extrabold leading-tight text-white">
                      {step.title}
                    </h4>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-white/75">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="mb-2 font-display text-lg font-extrabold text-white lg:mt-0">
              Pourquoi nous faire confiance
            </h3>
            {REASSURANCE_CARDS.map((card) => (
              <article key={card.title} className={INNER_CARD}>
                <div className="flex gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl"
                    aria-hidden
                  >
                    {card.icon}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-display text-base font-extrabold text-white">
                      {card.title}
                    </h4>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-white/75">
                      {card.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
