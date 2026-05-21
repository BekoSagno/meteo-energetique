import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getCommuneLayerStyle,
  getCommuneMapMessage,
  normalizeCommuneId,
  MAP_STATE_COLORS,
} from '../lib/mapCommuneStyles.js';
import { communeRadius } from '../lib/mapProjection.js';

const CONAKRY_CENTER = [9.565, -13.62];
const DEFAULT_ZOOM = 12;
const SECTOR_ZOOM_THRESHOLD = 14;
const COMMUNE_ZOOM_LEVEL = 14;

function MapInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

/** Recentre sur le Grand Conakry (diaspora / position hors zone). */
function MapGrandConakryView({ active }) {
  const map = useMap();

  useEffect(() => {
    if (!active) return;
    map.flyTo(CONAKRY_CENTER, DEFAULT_ZOOM, { duration: 0.55 });
  }, [active, map]);

  return null;
}

function CommunePopupContent({ commune }) {
  if (!commune) return null;
  const message = getCommuneMapMessage(commune);

  return (
    <div className="gne-map-popup min-w-[220px] max-w-[280px] p-0 font-sans">
      <p className="font-display text-base font-extrabold text-brand-dark">{commune.name}</p>
      <p className="mt-2 text-sm font-semibold leading-snug text-brand-dark/80">{message}</p>
      <p className="mt-3 border-t border-brand-dark/10 pt-2 text-sm text-brand-dark/70">
        <span className="font-display text-lg font-extrabold text-brand-dark">
          {commune.availability}%
        </span>{' '}
        de disponibilité réseau
      </p>
      <p className="mt-2 text-xs font-medium text-brand-dark/50">
        Cliquez pour zoomer et voir les {commune.sectorCount ?? 25} secteurs
      </p>
    </div>
  );
}

function SectorPopupContent({ sector, onViewLive }) {
  if (!sector) return null;
  const state = sector.state ?? sector.powerStatus?.currentState ?? 'ONLINE';
  const palette = MAP_STATE_COLORS[state] ?? { fill: '#6b7280' };
  const locationLine = [sector.quartier?.name, sector.commune?.name].filter(Boolean).join(' · ');

  return (
    <div className="gne-map-popup min-w-[180px] max-w-[240px] p-0 font-sans">
      <p className="font-display text-sm font-extrabold text-brand-dark">{sector.name}</p>
      {locationLine && (
        <p className="mt-1 text-xs font-medium text-brand-dark/55">{locationLine}</p>
      )}
      <p className="mt-2 text-xs font-bold" style={{ color: palette.fill }}>
        {state === 'ONLINE' ? 'Alimenté' : state === 'OFFLINE' ? 'Coupure' : 'Tension instable'}
      </p>
      {onViewLive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewLive(sector);
          }}
          className="mt-3 w-full rounded-lg bg-brand-dark px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-dark/90"
        >
          Voir en temps réel
        </button>
      )}
    </div>
  );
}

function CommuneMapLabel({ commune }) {
  return (
    <div className="gne-map-label">
      <span className="gne-map-label__title">{commune.name}</span>
      <span className="gne-map-label__meta">Commune</span>
    </div>
  );
}

function SectorMapLabel({ sector }) {
  const locationLine = [sector.quartier?.name, sector.commune?.name].filter(Boolean).join(' · ');

  return (
    <div className="gne-map-label">
      <span className="gne-map-label__title">{sector.name}</span>
      {locationLine ? <span className="gne-map-label__meta">{locationLine}</span> : null}
    </div>
  );
}

function getSectorCoordinates(sector) {
  const lat = sector.coordinates?.lat ?? sector.lat;
  const lng = sector.coordinates?.lng ?? sector.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function normalizeSectorId(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function ProgressiveMapMarkers({
  communes,
  sectors,
  focusedCommuneId,
  selectedSectorId,
  onCommuneClick,
  onSectorClick,
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const syncZoom = () => setZoom(map.getZoom());
    const onZoomEnd = () => {
      const z = map.getZoom();
      setZoom(z);
      if (z < SECTOR_ZOOM_THRESHOLD) {
        onCommuneClick?.(null);
      }
    };
    map.on('zoom', syncZoom);
    map.on('zoomend', onZoomEnd);
    syncZoom();
    return () => {
      map.off('zoom', syncZoom);
      map.off('zoomend', onZoomEnd);
    };
  }, [map, onCommuneClick]);

  const focusedCommune = normalizeCommuneId(focusedCommuneId);
  const isSectorLevel = zoom >= SECTOR_ZOOM_THRESHOLD;
  const showCommunes = !isSectorLevel || focusedCommune != null;
  const showSectors = isSectorLevel;
  const selectedSector = normalizeSectorId(selectedSectorId);
  const sectorLabelsPermanent = focusedCommune != null;

  const visibleSectors = sectors.filter((s) => {
    if (!getSectorCoordinates(s)) return false;
    if (focusedCommune == null) return true;
    return (
      normalizeCommuneId(s.communeId) === focusedCommune ||
      normalizeCommuneId(s.commune?.id) === focusedCommune
    );
  });

  const handleCommuneClick = (commune) => {
    if (!commune) {
      onCommuneClick?.(null);
      return;
    }
    if (Number.isFinite(commune.lat) && Number.isFinite(commune.lng)) {
      map.flyTo([commune.lat, commune.lng], COMMUNE_ZOOM_LEVEL, { duration: 0.55 });
      setZoom(COMMUNE_ZOOM_LEVEL);
    }
    onCommuneClick?.(commune);
  };

  return (
    <>
      {showCommunes &&
        communes.map((commune) => {
          if (!Number.isFinite(commune.lat) || !Number.isFinite(commune.lng)) return null;
          if (isSectorLevel && focusedCommune != null && normalizeCommuneId(commune.id) !== focusedCommune) {
            return null;
          }

          const style = getCommuneLayerStyle(commune.state, {
            selected: normalizeCommuneId(commune.id) === focusedCommune,
          });
          const radius = isSectorLevel ? communeRadius(commune.sectorCount, 12) : communeRadius(commune.sectorCount, 16);

          return (
            <CircleMarker
              key={`commune-${normalizeCommuneId(commune.id)}-${commune.state}`}
              center={[commune.lat, commune.lng]}
              radius={radius}
              pathOptions={{
                fill: true,
                stroke: true,
                color: style.fillColor,
                weight: style.weight,
                opacity: style.opacity,
                fillColor: style.fillColor,
                fillOpacity: style.fillOpacity,
              }}
              eventHandlers={{
                click: () => handleCommuneClick(commune),
              }}
            >
              <Tooltip
                permanent
                direction="top"
                offset={[0, -(radius + 6)]}
                className="gne-map-label-tooltip"
                opacity={1}
              >
                <CommuneMapLabel commune={commune} />
              </Tooltip>
              <Popup className="gne-leaflet-popup">
                <CommunePopupContent commune={commune} />
              </Popup>
            </CircleMarker>
          );
        })}

      {showSectors &&
        visibleSectors.map((sector) => {
          const coords = getSectorCoordinates(sector);
          if (!coords) return null;

          const state = sector.state ?? sector.powerStatus?.currentState ?? 'ONLINE';
          const isSelected = normalizeSectorId(sector.id) === selectedSector;
          const style = getCommuneLayerStyle(state, { selected: isSelected });
          const markerRadius = isSelected ? 9 : zoom >= 16 ? 6 : 5;

          return (
            <CircleMarker
              key={`sector-${sector.id}-${state}-${isSelected ? 'sel' : ''}`}
              center={[coords.lat, coords.lng]}
              radius={markerRadius}
              pathOptions={{
                fill: true,
                stroke: true,
                color: isSelected ? '#004b2b' : style.fillColor,
                weight: isSelected ? 3 : 1.5,
                opacity: 0.95,
                fillColor: style.fillColor,
                fillOpacity: isSelected ? 1 : 0.85,
              }}
              eventHandlers={{
                click: () => onSectorClick?.(sector),
              }}
            >
              <Tooltip
                permanent={sectorLabelsPermanent}
                direction="top"
                offset={[0, -(markerRadius + 8)]}
                className="gne-map-label-tooltip gne-map-label-tooltip--sector"
                opacity={1}
              >
                <SectorMapLabel sector={sector} />
              </Tooltip>
              <Popup className="gne-leaflet-popup">
                <SectorPopupContent sector={sector} onViewLive={onSectorClick} />
              </Popup>
            </CircleMarker>
          );
        })}
    </>
  );
}

export default function ConakryNetworkLeaflet({
  communes: apiCommunes = [],
  sectors = [],
  focusedCommuneId = null,
  selectedSectorId,
  forceGlobalView = false,
  onCommuneClick,
  onSectorClick,
  className = '',
}) {
  return (
    <div
      className={`gne-leaflet-map overflow-hidden rounded-xl border border-brand-dark/10 ${className}`}
      aria-label="Carte interactive du Grand Conakry"
    >
      <MapContainer
        center={CONAKRY_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl
      >
        <MapInvalidateSize />
        <MapGrandConakryView active={forceGlobalView} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ProgressiveMapMarkers
          communes={apiCommunes}
          sectors={sectors}
          focusedCommuneId={focusedCommuneId}
          selectedSectorId={selectedSectorId}
          onCommuneClick={onCommuneClick}
          onSectorClick={onSectorClick}
        />
      </MapContainer>
    </div>
  );
}

export { SECTOR_ZOOM_THRESHOLD, COMMUNE_ZOOM_LEVEL, CONAKRY_CENTER, DEFAULT_ZOOM };
