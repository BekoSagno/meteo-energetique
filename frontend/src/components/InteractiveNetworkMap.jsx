import { useMemo, useState } from 'react';
import AnimateIn from './motion/AnimateIn.jsx';
import ConakryNetworkLeaflet from './ConakryNetworkLeaflet.jsx';
import { getPowerStateConfig } from '../lib/powerStatus.js';
import { buildMapDayTabs, useNetworkMap } from '../hooks/useNetworkMap.js';
import { resolveCommuneState } from '../lib/mapCommuneStyles.js';

const MOMENTS = [
  { id: 'live', label: 'En direct', icon: '⚡' },
  { id: 'peak_yesterday', label: 'Heures de pointe', icon: '📈' },
  { id: 'last_night', label: 'Nuit dernière', icon: '🌙' },
];

const LEGEND = [
  { state: 'ONLINE', label: 'Alimenté' },
  { state: 'OFFLINE', label: 'Coupure' },
  { state: 'UNSTABLE', label: 'Baisse de tension' },
];

function MapLegend() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-bold text-brand-dark/70">
      {LEGEND.map(({ state, label }) => {
        const { dotClass } = getPowerStateConfig(state);
        return (
          <li key={state} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-full ${dotClass}`} aria-hidden="true" />
            {label}
          </li>
        );
      })}
    </ul>
  );
}

export default function InteractiveNetworkMap({
  sectors = [],
  regionId,
  focusedCommuneId = null,
  selectedSectorId,
  onCommuneFocus,
  onSectorSelect,
  refreshKey = 0,
}) {
  const dayTabs = useMemo(() => buildMapDayTabs(7), []);
  const todayKey = dayTabs[dayTabs.length - 1]?.dateKey;

  const [selectedDate, setSelectedDate] = useState(
    () => todayKey ?? new Date().toISOString().slice(0, 10)
  );
  const [moment, setMoment] = useState('live');

  const effectiveMoment = selectedDate === todayKey ? moment : 'live';

  const { data, loading, error } = useNetworkMap({
    moment: effectiveMoment,
    date: selectedDate,
    regionId,
    refreshKey,
  });

  const communes = data?.communes ?? [];

  function handleCommuneClick(communeRef) {
    if (!communeRef) {
      onCommuneFocus?.(null);
      return;
    }
    const commune =
      resolveCommuneState(communes, {
        communeId: communeRef?.id ?? communeRef?.communeId,
        communeName: communeRef?.name ?? communeRef?.communeName,
      }) ?? null;
    if (!commune) return;
    onCommuneFocus?.(commune);
  }

  function handleSectorClick(sectorRef) {
    const sector =
      sectors.find((s) => s.id === sectorRef?.id) ??
      sectors.find(
        (s) =>
          s.name === sectorRef?.name &&
          (s.communeId === sectorRef?.communeId || s.commune?.id === sectorRef?.commune?.id)
      ) ??
      sectorRef;
    if (!sector) return;
    onSectorSelect?.(sector);
  }

  return (
    <AnimateIn animation="scale-in" delay={40}>
      <article
        className="overflow-hidden rounded-2xl border border-brand-dark/8 bg-white shadow-card"
        aria-label="Carte énergétique du Grand Conakry"
      >
        <header className="border-b border-brand-dark/5 bg-brand-bg px-4 pt-5 sm:px-6">
          <p className="text-center font-display text-lg font-extrabold tracking-tight text-brand-dark">
            Carte du réseau
          </p>
          <p className="mt-1 text-center text-sm font-medium text-brand-dark/55">
            Grand Conakry · {communes.length || 13} communes · OpenStreetMap
          </p>

          <div
            className="mt-5 flex gap-1 overflow-x-auto pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Sélection du jour"
          >
            {dayTabs.map((tab) => {
              const selected = tab.dateKey === selectedDate;
              return (
                <button
                  key={tab.dateKey}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setSelectedDate(tab.dateKey);
                    if (!tab.isToday) setMoment('live');
                  }}
                  className={`min-w-[4.75rem] shrink-0 rounded-t-lg bg-white px-4 py-3 text-sm capitalize transition-colors ${
                    selected
                      ? 'border-b-2 border-brand-dark font-bold text-brand-dark'
                      : 'font-medium text-brand-dark/50 hover:text-brand-dark/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        <section className="bg-brand-bg px-4 py-4 sm:px-6 sm:py-5">
          {loading && (
            <div
              className="gne-leaflet-map flex items-center justify-center rounded-xl border border-brand-dark/10 bg-white/80"
              aria-busy="true"
            >
              <p className="text-sm font-bold text-brand-dark/60">Chargement de la carte…</p>
            </div>
          )}

          {error && !loading && (
            <p className="py-12 text-center text-sm font-bold text-brand-red">{error}</p>
          )}

          {!loading && !error && (
            <>
              <ConakryNetworkLeaflet
                communes={communes}
                sectors={sectors}
                focusedCommuneId={focusedCommuneId}
                selectedSectorId={selectedSectorId}
                onCommuneClick={handleCommuneClick}
                onSectorClick={handleSectorClick}
              />
              <p className="mt-3 text-center text-xs font-medium text-brand-dark/50">
                Zoomez (niveau 14+) pour voir les secteurs · Cliquez une commune pour les isoler ·
                Cliquez un secteur pour l&apos;état en temps réel
              </p>
            </>
          )}
        </section>

        <footer className="border-t border-brand-dark/5 bg-white px-4 py-5 sm:px-6">
          <div
            className="mx-auto flex max-w-md justify-between gap-1 rounded-full bg-gray-100 p-1"
            role="tablist"
            aria-label="Moment de la journée"
          >
            {MOMENTS.map((m) => {
              const selected = moment === m.id;
              const disabled = selectedDate !== todayKey && m.id !== 'live';

              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  disabled={disabled}
                  onClick={() => setMoment(m.id)}
                  className={`flex-1 whitespace-nowrap rounded-full px-2 py-2 text-center text-xs font-bold transition-all duration-300 sm:px-4 sm:text-sm ${
                    selected
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'text-brand-dark/60 hover:text-brand-dark'
                  } ${disabled ? 'cursor-not-allowed opacity-35' : ''}`}
                >
                  <span className="mr-0.5 sm:mr-1" aria-hidden="true">
                    {m.icon}
                  </span>
                  <span className="hidden sm:inline">{m.label}</span>
                  <span className="sm:hidden">
                    {m.id === 'live' ? 'Direct' : m.id === 'peak_yesterday' ? 'Pointe' : 'Nuit'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <MapLegend />
          </div>
        </footer>
      </article>
    </AnimateIn>
  );
}
