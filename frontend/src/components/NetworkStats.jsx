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
  dashboardTitle = 'État du réseau',
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
  const stateEmoji =
    currentState === 'ONLINE' ? '🟢' : currentState === 'OFFLINE' ? '🔴' : '🟡';

  const statusMessage = useMemo(() => {
    const restorationTime = lastUpdated
      ? estimateRestorationTime(new Date(lastUpdated))
      : estimateRestorationTime();
    return getInstitutionalStatusMessage(currentState, { restorationTime });
  }, [currentState, lastUpdated]);

  return (
    <AnimateIn animation="scale-in" delay={60}>
      <article className="card-elevated w-full overflow-hidden" aria-label="État du réseau">
        {/* ——— Temps réel ——— */}
        <header className="border-b border-brand-dark/10 px-6 py-8 text-center sm:px-10 sm:py-10">
          <p className="text-label">{dashboardTitle}</p>

          {breadcrumbLine.length > 0 && (
            <p className="mt-2 text-sm font-bold text-brand-dark">{breadcrumbLine.join(' › ')}</p>
          )}

          <h2 className="text-shine-dark mt-3 font-display text-display-sm font-extrabold sm:text-display-md">
            {displayName}
          </h2>

          <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border-2 border-brand-dark/15 bg-brand-bg px-4 py-2">
            <span className="text-lg leading-none" aria-hidden="true">
              {stateEmoji}
            </span>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
            <span className={`font-display text-lg font-extrabold ${textClass}`}>{label}</span>
          </div>

          <p
            className={`mx-auto mt-5 max-w-lg text-center font-display text-base font-extrabold leading-snug sm:text-lg ${textClass}`}
          >
            {statusMessage}
          </p>

          <p className="mt-10 text-sm font-bold uppercase tracking-wide text-brand-dark/60">
            Taux de disponibilité aujourd&apos;hui
          </p>
          <p
            className="mt-1 font-display text-[4.5rem] font-extrabold leading-none tracking-tight text-brand-dark sm:text-[5.5rem]"
            aria-live="polite"
          >
            {stats.availabilityToday}
            <span className="text-[0.45em] font-bold text-brand-dark/50">%</span>
          </p>
        </header>

        {/* ——— Frise 24 h ——— */}
        <section className="border-b border-brand-dark/10 px-6 py-8 sm:px-10">
          <h3 className="text-center font-display text-base font-extrabold text-brand-dark">
            Dernières 24 heures
          </h3>
          <p className="mt-1 text-center text-sm font-semibold text-brand-dark/65">
            Vert = courant · Rouge = coupure · Gris = tension instable
          </p>

          <div
            className="mt-6 flex h-9 w-full overflow-hidden rounded-lg border-2 border-brand-dark/15 sm:h-10"
            role="img"
            aria-label="Frise horaire des 24 dernières heures"
          >
            {stats.timeline24h.map((segment) => {
              const widthPercent =
                ((segment.endHour - segment.startHour) / 24) * 100;
              return (
                <div
                  key={`${segment.startHour}-${segment.endHour}-${segment.status}`}
                  className={`h-full min-w-[2px] ${TIMELINE_SEGMENT_CLASS[segment.status] ?? 'bg-brand-dark/20'}`}
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
                className="absolute -translate-x-1/2 text-[10px] font-bold text-brand-dark/55 sm:text-xs"
                style={{ left: `${positionPercent}%` }}
              >
                {timeLabel}
              </span>
            ))}
          </div>
        </section>

        {/* ——— 7 jours ——— */}
        <section className="px-4 py-8 sm:px-8">
          <h3 className="text-center font-display text-base font-extrabold text-brand-dark">
            7 derniers jours
          </h3>

          <ul className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
            {stats.weekDays.map((day) => {
              const statusCfg =
                DAY_STATUS_CONFIG[day.status] ?? DAY_STATUS_CONFIG.stable;

              return (
                <li key={day.date.toISOString()}>
                  <div className="flex flex-col items-center rounded-xl border-2 border-brand-dark/12 bg-brand-bg px-1 py-3 sm:px-2 sm:py-4">
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
      </article>
    </AnimateIn>
  );
}
