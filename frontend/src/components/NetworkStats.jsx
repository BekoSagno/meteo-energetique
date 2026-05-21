import { useMemo } from 'react';
import AnimateIn from './motion/AnimateIn.jsx';
import {
  estimateRestorationTime,
  getInstitutionalStatusMessage,
  getPowerStateConfig,
} from '../lib/powerStatus.js';
import {
  DAY_STATUS_CONFIG,
  getNetworkStatsMock,
  getTimelineHourMarkers,
  TIMELINE_SEGMENT_CLASS,
} from '../lib/networkStatsMock.js';
import { buildWeatherBreadcrumb, formatSectorDisplayName } from '../lib/sectorDisplay.js';

export default function NetworkStats({
  sectorName,
  quartierName,
  breadcrumb,
  currentState = 'ONLINE',
  sectorId = 1,
  lastUpdated = null,
  dashboardTitle = 'La Météo du Jour — Temps réel',
  embedded = false,
}) {
  const stats = useMemo(() => getNetworkStatsMock(sectorId), [sectorId]);
  const markers = useMemo(() => getTimelineHourMarkers(), []);

  const displayName = useMemo(
    () => formatSectorDisplayName(sectorName, quartierName),
    [sectorName, quartierName]
  );

  const breadcrumbLine = useMemo(
    () => buildWeatherBreadcrumb(breadcrumb ?? {}, displayName),
    [breadcrumb, displayName]
  );

  const { label, dotClass, textClass } = getPowerStateConfig(currentState);

  const statusMessage = useMemo(() => {
    const restorationTime = lastUpdated
      ? estimateRestorationTime(new Date(lastUpdated))
      : estimateRestorationTime();
    return getInstitutionalStatusMessage(currentState, { restorationTime });
  }, [currentState, lastUpdated]);

  const articleClass = embedded
    ? 'w-full overflow-hidden rounded-none border-0 bg-transparent shadow-none'
    : 'w-full overflow-hidden rounded-2xl border-2 border-brand-dark/15 bg-brand-bg shadow-card';

  const headerClass = embedded
    ? 'relative z-10 border-b border-white/10 px-6 py-6 text-center sm:px-10 sm:py-7'
    : 'relative bg-brand-dark px-6 py-8 text-center sm:px-10 sm:py-9';

  return (
    <AnimateIn animation="scale-in" delay={embedded ? 30 : 60}>
      <article className={articleClass} aria-label="La Météo du Jour">
        <header className={headerClass}>
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.12em] text-brand-yellow">
            {dashboardTitle}
          </p>

          {breadcrumbLine.length > 0 && (
            <p className="mt-2 text-sm font-bold text-white/85">
              {breadcrumbLine.join(' › ')}
            </p>
          )}

          <h2 className="mt-3 font-display text-display-sm font-extrabold text-white sm:text-display-md">
            {displayName}
          </h2>

          <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-sm">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
            <span className={`font-display text-lg font-extrabold ${textClass}`}>{label}</span>
          </div>

          <p className="mx-auto mt-5 max-w-lg text-center font-display text-base font-semibold leading-snug text-white/90 sm:text-lg">
            {statusMessage}
          </p>
        </header>

        <div className="bg-brand-bg px-6 py-8 sm:px-10 sm:py-10">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-dark/55">
              Taux de disponibilité aujourd&apos;hui
            </p>
            <p
              className="mt-1 font-display text-[4.5rem] font-extrabold leading-none tracking-tight text-brand-dark sm:text-[5.5rem]"
              aria-live="polite"
            >
              {stats.availabilityToday}
              <span className="text-[0.45em] font-bold text-brand-dark/45">%</span>
            </p>
          </div>

          <section className="mt-10 border-t border-brand-dark/10 pt-10">
            <h3 className="text-center font-display text-base font-extrabold text-brand-dark">
              Dernières 24 heures
            </h3>
            <p className="mt-1 text-center text-sm font-semibold text-brand-dark/60">
              Vert = courant · Rouge = coupure · Jaune = tension instable
            </p>

            <div
              className="mt-6 flex h-9 w-full overflow-hidden rounded-lg border-2 border-brand-dark/12 bg-white sm:h-10"
              role="img"
              aria-label="Frise horaire des 24 dernières heures"
            >
              {stats.timeline24h.map((segment) => {
                const widthPercent =
                  ((segment.endHour - segment.startHour) / 24) * 100;
                const segClass =
                  TIMELINE_SEGMENT_CLASS[segment.status] ?? 'bg-brand-dark/15';
                return (
                  <div
                    key={`${segment.startHour}-${segment.endHour}-${segment.status}`}
                    className={`h-full min-w-[2px] ${segClass}`}
                    style={{ width: `${widthPercent}%` }}
                    title={`${segment.startHour}h–${segment.endHour}h : ${segment.status}`}
                  />
                );
              })}
            </div>

            <div className="relative mt-3 h-5 w-full">
              {markers.map(({ key, label: timeLabel, positionPercent }) => (
                <span
                  key={key}
                  className="absolute -translate-x-1/2 text-[10px] font-bold text-brand-dark/50 sm:text-xs"
                  style={{ left: `${positionPercent}%` }}
                >
                  {timeLabel}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-10 border-t border-brand-dark/10 pt-10">
            <h3 className="text-center font-display text-base font-extrabold text-brand-dark">
              7 derniers jours
            </h3>

            <ul className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
              {stats.weekDays.map((day) => {
                const statusCfg =
                  DAY_STATUS_CONFIG[day.status] ?? DAY_STATUS_CONFIG.stable;

                return (
                  <li key={day.date.toISOString()}>
                    <div className="flex flex-col items-center rounded-xl border-2 border-brand-dark/10 bg-white px-1 py-3 shadow-sm sm:px-2 sm:py-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-brand-dark sm:text-xs">
                        {day.label}
                      </span>
                      <span
                        className={`mt-2 h-3 w-3 rounded-full ring-2 ${statusCfg.dotClass} ${statusCfg.ringClass}`}
                        title={statusCfg.label}
                        aria-label={statusCfg.label}
                      />
                      <span className="mt-2 font-display text-sm font-extrabold text-brand-dark sm:text-base">
                        {day.availability}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </article>
    </AnimateIn>
  );
}
