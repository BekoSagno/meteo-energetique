import { useMemo } from 'react';
import AnimateIn from './motion/AnimateIn.jsx';
import { useNetworkMap } from '../hooks/useNetworkMap.js';
import {
  getAvailabilityDotClass,
  pickSectorForCommune,
  rankCommunes,
  aggregateCommuneFromSectors,
} from '../lib/communeRanking.js';

function AvailabilityDot({ availability, className = '' }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${getAvailabilityDotClass(availability)} ${className}`}
      aria-hidden="true"
    />
  );
}

function PodiumPlace({ commune, place, isSelected, onSelect }) {
  const isFirst = place === 1;
  const isSecond = place === 2;

  const podiumOrder = isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3';
  const heightClass = isFirst ? 'min-h-[9.5rem] pt-6' : 'min-h-[7.5rem] pt-8';

  const borderClass = isFirst
    ? 'border-2 border-brand-yellow bg-gradient-to-b from-brand-yellow/15 to-white ring-2 ring-brand-yellow/50 shadow-glow-yellow'
    : 'border-2 border-brand-dark bg-gradient-to-b from-brand-dark/5 to-white ring-1 ring-brand-dark/25';

  const badgeClass = isFirst
    ? 'bg-brand-yellow text-brand-dark shadow-glow-yellow'
    : 'bg-brand-dark text-white';

  return (
    <button
      type="button"
      onClick={() => onSelect(commune)}
      className={`group interactive-row flex flex-1 flex-col items-center rounded-2xl px-3 pb-4 text-center transition-all duration-300 ${podiumOrder} ${heightClass} ${borderClass} ${
        isSelected ? 'ring-4 ring-brand-green/40' : ''
      }`}
      aria-pressed={isSelected}
      aria-label={`${place}e place : ${commune.name}, ${commune.availability} pour cent de disponibilité`}
    >
      <span
        className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full font-display text-lg font-extrabold ${badgeClass}`}
      >
        {place}
      </span>
      <span className="group-hover-text-glow font-display text-sm font-extrabold leading-tight text-brand-dark sm:text-base">
        {commune.name}
      </span>
      <span className="mt-2 flex items-center gap-2">
        <AvailabilityDot availability={commune.availability} className="h-3 w-3" />
        <span className="font-display text-xl font-extrabold text-brand-dark sm:text-2xl">
          {commune.availability}
          <span className="text-sm font-bold text-brand-dark/50">%</span>
        </span>
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-brand-dark/45">
        dispo.
      </span>
    </button>
  );
}

function RankListItem({ commune, isSelected, onSelect }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(commune)}
        className={`group interactive-row flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ${
          isSelected ? 'bg-brand-bg ring-2 ring-brand-green/35' : ''
        }`}
        aria-pressed={isSelected}
      >
        <span className="w-6 shrink-0 text-center font-display text-sm font-extrabold text-brand-dark/55">
          {commune.rank}
        </span>
        <span className="group-hover-text-glow min-w-0 flex-1 truncate font-display text-sm font-extrabold text-brand-dark">
          {commune.name}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <AvailabilityDot availability={commune.availability} />
          <span className="font-display text-sm font-extrabold tabular-nums text-brand-dark">
            {commune.availability}%
          </span>
        </span>
      </button>
    </li>
  );
}

export default function TopCommunes({
  regionId,
  communes: communesMeta = [],
  sectors = [],
  selectedCommuneId,
  onCommuneSelect,
  refreshKey = 0,
}) {
  const today = new Date().toISOString().slice(0, 10);

  const { data, loading, error } = useNetworkMap({
    moment: 'live',
    date: today,
    regionId,
    refreshKey,
  });

  const ranked = useMemo(() => {
    if (data?.communes?.length) {
      return rankCommunes(data.communes);
    }

    if (!communesMeta.length || !sectors.length) return [];

    const fallback = communesMeta.map((c) => {
      const { availability, state } = aggregateCommuneFromSectors(sectors, c.id);
      const rep = sectors.find((s) => s.communeId === c.id);
      return {
        id: c.id,
        name: c.name,
        availability,
        state,
        representativeSectorId: rep?.id ?? null,
      };
    });

    return rankCommunes(fallback);
  }, [data, communesMeta, sectors]);

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  function handleSelect(commune) {
    const sector = pickSectorForCommune(commune, sectors);
    onCommuneSelect?.(
      { id: commune.id, name: commune.name, ...commune },
      sector
    );
    requestAnimationFrame(() => {
      document.getElementById('accueil')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <AnimateIn delay={280} className="w-full">
      <article
        className="relative overflow-hidden rounded-2xl bg-brand-dark shadow-card"
        aria-label="Top communes du Grand Conakry"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-green/20 via-transparent to-brand-yellow/10"
          aria-hidden
        />
        <header className="relative border-b border-white/10 px-5 py-4 sm:px-6">
          <p className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
            Top Communes — La Météo du Jour
          </p>
          <p className="mt-1 text-sm font-semibold text-white/80">
            Classement en direct · {ranked.length || 13} communes du Grand Conakry
          </p>
        </header>

        <div className="relative bg-white/95 p-4 sm:p-5">
          {loading && (
            <div className="space-y-4" aria-busy="true">
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="shimmer-block h-32 flex-1 rounded-2xl" />
                ))}
              </div>
              <div className="shimmer-block h-40 rounded-xl" />
            </div>
          )}

          {error && !loading && (
            <p className="py-6 text-center text-sm font-bold text-brand-red">{error}</p>
          )}

          {!loading && !error && ranked.length === 0 && (
            <p className="py-6 text-center text-sm font-bold text-brand-dark/60">
              Aucune donnée de classement disponible.
            </p>
          )}

          {!loading && ranked.length > 0 && (
            <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:gap-6">
              <section className="md:flex-[1.15]" aria-label="Podium">
                <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-widest text-brand-dark/50">
                  Podium
                </p>
                <div className="flex items-end justify-center gap-2 sm:gap-3">
                  {podium.map((commune) => (
                    <PodiumPlace
                      key={commune.id}
                      commune={commune}
                      place={commune.rank}
                      isSelected={commune.id === selectedCommuneId}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </section>

              {rest.length > 0 && (
                <section className="md:flex-1" aria-label="Classement 4 à 13">
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-brand-dark/50">
                    Classement complet
                  </p>
                  <ul className="max-h-64 space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-brand-dark/10 bg-white p-2 md:max-h-72">
                    {rest.map((commune) => (
                      <RankListItem
                        key={commune.id}
                        commune={commune}
                        isSelected={commune.id === selectedCommuneId}
                        onSelect={handleSelect}
                      />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {!loading && ranked.length > 0 && (
            <p className="mt-4 text-center text-xs font-semibold text-brand-dark/50">
              Cliquez sur une commune pour afficher sa météo locale en direct
            </p>
          )}
        </div>
      </article>
    </AnimateIn>
  );
}
