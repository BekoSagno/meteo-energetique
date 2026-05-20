import { useEffect, useMemo, useState } from 'react';
import AnimateIn from './motion/AnimateIn.jsx';
import { IconMap } from './icons/NavIcons.jsx';
import { API_BASE_URL, DEFAULT_LAT, DEFAULT_LNG } from '../lib/constants.js';
import {
  estimateRestorationTime,
  getInstitutionalStatusMessage,
  getPowerStateConfig,
} from '../lib/powerStatus.js';
import { buildWeatherBreadcrumb, formatSectorDisplayName } from '../lib/sectorDisplay.js';

export default function LocalWeather({
  lat = DEFAULT_LAT,
  lng = DEFAULT_LNG,
  refreshTrigger = 0,
  breadcrumb,
  sectorName,
  locationHint,
  knownSector = null,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWeather() {
      setLoading(true);

      try {
        const url = new URL(`${API_BASE_URL}/api/sectors/current`);
        url.searchParams.set('lat', String(lat));
        url.searchParams.set('lng', String(lng));

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Erreur serveur (${response.status})`);
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();

    return () => controller.abort();
  }, [lat, lng, refreshTrigger]);

  const apiSector = data?.sector;
  const quartierName =
    breadcrumb?.quartier ?? apiSector?.quartier?.name ?? knownSector?.quartier?.name;
  const rawName = sectorName ?? apiSector?.name ?? knownSector?.name ?? 'Secteur';

  const displayName = useMemo(
    () => formatSectorDisplayName(rawName, quartierName),
    [rawName, quartierName]
  );

  const breadcrumbLine = useMemo(
    () => buildWeatherBreadcrumb(breadcrumb ?? {}, displayName),
    [breadcrumb, displayName]
  );

  const displayState =
    data?.powerStatus?.currentState ?? knownSector?.state ?? knownSector?.powerStatus?.currentState ?? 'ONLINE';
  const { dotClass, textClass } = getPowerStateConfig(displayState);
  const lastUpdated = data?.powerStatus?.lastUpdated ?? knownSector?.powerStatus?.lastUpdated;
  const statusMessage = useMemo(() => {
    const restorationTime = lastUpdated
      ? estimateRestorationTime(new Date(lastUpdated))
      : estimateRestorationTime();
    return getInstitutionalStatusMessage(displayState, { restorationTime });
  }, [displayState, lastUpdated]);

  if (loading) {
    return (
      <section
        className="card-elevated w-full p-10 lg:p-12"
        aria-busy="true"
        aria-label="Météo locale"
      >
        <div className="shimmer-block mx-auto h-4 w-32 rounded-lg" />
        <div className="shimmer-block mx-auto mt-6 h-10 w-48 rounded-lg" />
        <div className="shimmer-block mx-auto mt-8 h-6 w-28 rounded-full" />
        <p className="mt-8 text-center font-display text-base font-bold text-brand-dark">
          Chargement de la météo…
        </p>
      </section>
    );
  }

  if (!apiSector && !knownSector) {
    return (
      <AnimateIn animation="scale-in">
        <section className="card-elevated w-full p-10">
          <h2 className="text-center font-display text-xl font-extrabold text-brand-dark">
            Météo locale
          </h2>
          <p className="mt-5 text-center text-base font-bold text-brand-red">
            {data?.message ?? 'Aucun secteur cartographié ne correspond à cette position.'}
          </p>
        </section>
      </AnimateIn>
    );
  }

  return (
    <AnimateIn animation="scale-in" delay={80}>
      <section className="card-elevated w-full p-8 lg:p-11" aria-label="Météo locale">
        <p className="text-label text-center">Météo locale</p>

        {breadcrumbLine.length > 0 && (
          <p className="mt-3 text-center text-sm font-bold text-brand-dark">
            {breadcrumbLine.join(' › ')}
          </p>
        )}

        {locationHint && (
          <p className="mt-2 flex animate-fade-in items-center justify-center gap-1.5 text-center text-sm font-semibold text-brand-dark">
            <IconMap className="h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" />
            <span>
              {locationHint.kind === 'gps'
                ? 'Position détectée automatiquement'
                : `Position estimée (${locationHint.place})`}
            </span>
          </p>
        )}

        <h2 className="text-shine-dark mt-4 text-center font-display text-display-sm font-extrabold sm:text-display-md">
          {displayName}
        </h2>

        <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10">
          <span className={`status-dot-live ${textClass}`}>
            <span
              className={`relative z-10 block h-4 w-4 rounded-full ${dotClass} animate-status-pulse`}
              aria-hidden="true"
            />
          </span>
          <p
            className={`max-w-lg text-center font-display text-lg font-extrabold leading-snug sm:text-xl ${textClass}`}
          >
            {statusMessage}
          </p>
        </div>

        {lastUpdated && (
          <p className="mt-8 text-center text-sm font-semibold text-brand-dark/75">
            Dernière analyse réseau{' '}
            {new Date(lastUpdated).toLocaleString('fr-FR', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </p>
        )}
      </section>
    </AnimateIn>
  );
}
