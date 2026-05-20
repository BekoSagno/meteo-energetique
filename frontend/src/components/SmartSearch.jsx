import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../lib/constants.js';
import { getPowerStateConfig } from '../lib/powerStatus.js';
import { normalizeSearchText, sectorMatchesQuery, textMatchesQuery } from '../lib/search.js';

function PickerPanel({ title, subtitle, items, onSelect, onBack, renderRight, panelClass = 'mt-2' }) {
  return (
    <div className={`${panelClass} animate-scale-in rounded-xl border-2 border-brand-dark/15 bg-white shadow-lg opacity-0`}>
      <div className="flex items-center justify-between border-b border-brand-dark/5 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-brand-dark">{title}</p>
          {subtitle && <p className="text-xs font-medium text-brand-dark/70">{subtitle}</p>}
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-brand-dark hover:underline"
          >
            Retour
          </button>
        )}
      </div>
      <ul className="max-h-56 overflow-y-auto py-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-medium hover:bg-brand-bg"
            >
              <span className="text-brand-dark">{item.name}</span>
              {renderRight?.(item)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SmartSearch({
  index,
  indexLoading,
  onSectorSelect,
  variant = 'default',
}) {
  const isHeader = variant === 'header';
  const isCtaFixed = variant === 'cta-fixed';
  const isCta = variant === 'cta' || isCtaFixed;
  const inputId = isHeader
    ? 'smart-search-header'
    : isCtaFixed
      ? 'smart-search-cta-fixed'
      : isCta
        ? 'smart-search-cta'
        : 'smart-search';
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [picker, setPicker] = useState(null);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const wrapperRef = useRef(null);

  const normalizedQuery = useMemo(() => normalizeSearchText(query.trim()), [query]);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return null;

    return {
      regions: index.regions.filter((r) => textMatchesQuery(r.name, normalizedQuery)),
      communes: index.communes.filter((c) => textMatchesQuery(c.name, normalizedQuery)),
      quartiers: index.quartiers.filter((q) => textMatchesQuery(q.name, normalizedQuery)),
      sectors: index.sectors.filter((s) => sectorMatchesQuery(s, normalizedQuery)),
    };
  }, [index, normalizedQuery]);

  const hasSearchResults =
    searchResults &&
    (searchResults.regions.length > 0 ||
      searchResults.communes.length > 0 ||
      searchResults.quartiers.length > 0 ||
      searchResults.sectors.length > 0);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setPicker(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectSector(sector) {
    onSectorSelect(sector);
    setQuery('');
    setOpen(false);
    setPicker(null);
  }

  async function selectQuartier(quartier, { showSectorList = false } = {}) {
    setLoadingSectors(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sectors?quartierId=${quartier.id}`);
      if (!res.ok) throw new Error('Erreur chargement secteurs');
      const { sectors } = await res.json();
      if (!sectors.length) return;

      if (showSectorList && sectors.length > 1) {
        setPicker({ type: 'sectors', quartier, items: sectors });
        setOpen(true);
        return;
      }

      const preferred =
        sectors.find((s) => normalizeSearchText(s.name).includes('centre')) ?? sectors[0];
      selectSector(preferred);
    } finally {
      setLoadingSectors(false);
    }
  }

  function handleRegionClick(region) {
    const communes = index.communes.filter((c) => c.regionId === region.id);
    setPicker({ type: 'communes', region, items: communes });
    setQuery(region.name);
    setOpen(true);
  }

  function handleCommuneClick(commune) {
    const quartiers = index.quartiers.filter((q) => q.communeId === commune.id);
    setPicker({
      type: 'quartiers',
      commune,
      items: quartiers,
    });
    setQuery(`${commune.name}, ${index.regions[0]?.name ?? 'Conakry'}`);
    setOpen(true);
  }

  const inputClass = isHeader
    ? 'search-input-header'
    : isCtaFixed
      ? 'search-input search-input-cta-fixed'
      : isCta
        ? 'search-input search-input-cta'
        : 'search-input rounded-2xl px-5 py-4 text-base shadow-sm';

  const panelPos = isHeader
    ? 'absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] sm:w-96'
    : isCtaFixed
      ? 'absolute bottom-full left-0 right-0 z-[70] mb-2 max-h-[min(50vh,22rem)] overflow-y-auto rounded-xl border-2 border-brand-dark/15 bg-white shadow-2xl'
      : 'absolute left-0 right-0 z-30 mt-2';
  const pickerPanelClass = isHeader || isCtaFixed ? panelPos : 'mt-2';

  function ResultGroup({ label, children }) {
    if (!children) return null;
    return (
      <div className="border-b border-brand-dark/5 last:border-0">
        <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-dark">
          {label}
        </p>
        {children}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Rechercher une région, une commune ou un quartier
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPicker(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            isCtaFixed
              ? 'Indiquez une commune, un quartier, un secteur…'
              : isHeader || isCta
                ? 'Indiquer une commune, un quartier, un secteur…'
                : 'Rechercher une région, une commune ou un quartier…'
          }
          disabled={indexLoading}
          className={inputClass}
        />
        {(isHeader || isCta) && (
          <span
            className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${
              isHeader || isCtaFixed ? 'text-white/90' : 'text-brand-dark/45'
            }`}
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" strokeLinecap="round" />
            </svg>
          </span>
        )}
      </div>

      {indexLoading && !isHeader && (
        <p className="mt-2 text-center text-xs font-semibold text-brand-dark/50">
          Chargement de l&apos;index…
        </p>
      )}

      {loadingSectors && !isHeader && !isCta && (
        <p className="mt-2 text-center text-xs text-brand-dark/40">Loading...</p>
      )}

      {open && picker?.type === 'communes' && (
        <PickerPanel
          panelClass={pickerPanelClass}
          title={`Communes — ${picker.region.name}`}
          subtitle="Choisissez une commune"
          items={picker.items}
          onSelect={handleCommuneClick}
          onBack={() => setPicker(null)}
        />
      )}

      {open && picker?.type === 'quartiers' && (
        <PickerPanel
          panelClass={pickerPanelClass}
          title={`Quartiers — ${picker.commune.name}`}
          subtitle="Choisissez un quartier"
          items={picker.items}
          onSelect={(q) => selectQuartier(q, { showSectorList: true })}
          onBack={() => {
            const region =
              index.regions.find((r) => r.id === picker.commune.regionId) ?? index.regions[0];
            if (region) handleRegionClick(region);
            else setPicker(null);
          }}
        />
      )}

      {open && picker?.type === 'sectors' && (
        <PickerPanel
          panelClass={pickerPanelClass}
          title={`Secteurs — ${picker.quartier.name}`}
          subtitle="Choisissez un secteur"
          items={picker.items}
          onSelect={selectSector}
          onBack={() => handleCommuneClick(picker.quartier.commune ?? { id: picker.quartier.communeId, name: '' })}
          renderRight={(s) => {
            const { label, dotClass } = getPowerStateConfig(s.state ?? 'ONLINE');
            return (
              <span className="flex items-center gap-1 text-xs text-brand-dark/50">
                <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                {label}
              </span>
            );
          }}
        />
      )}

      {open && !picker && normalizedQuery && (
        <div
          className={`${panelPos} animate-scale-in overflow-hidden rounded-xl border-2 border-brand-dark/15 bg-white shadow-lg opacity-0`}
        >
          {!hasSearchResults ? (
            <p className="px-4 py-4 text-center text-sm font-semibold text-brand-red">
              Aucun résultat
            </p>
          ) : (
            <>
              <ResultGroup label="Régions">
                {searchResults.regions.map((r) => (
                  <button
                    key={`r-${r.id}`}
                    type="button"
                    onClick={() => handleRegionClick(r)}
                    className="flex w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-brand-bg"
                  >
                    <span className="font-medium text-brand-dark">{r.name}</span>
                    <span className="ml-auto text-xs text-brand-dark/40">Région</span>
                  </button>
                ))}
              </ResultGroup>

              <ResultGroup label="Communes">
                {searchResults.communes.map((c) => (
                  <button
                    key={`c-${c.id}`}
                    type="button"
                    onClick={() => handleCommuneClick(c)}
                    className="flex w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-brand-bg"
                  >
                    <span className="text-brand-dark">{c.name}</span>
                    <span className="ml-auto text-xs text-brand-dark/40">Commune</span>
                  </button>
                ))}
              </ResultGroup>

              <ResultGroup label="Quartiers">
                {searchResults.quartiers.map((q) => (
                  <button
                    key={`q-${q.id}`}
                    type="button"
                    onClick={() => selectQuartier(q)}
                    className="flex w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-brand-bg"
                  >
                    <span className="text-brand-dark">{q.name}</span>
                    <span className="ml-auto text-xs text-brand-dark/40">
                      {q.commune?.name}
                    </span>
                  </button>
                ))}
              </ResultGroup>

              <ResultGroup label="Secteurs">
                {searchResults.sectors.slice(0, 12).map((s) => (
                  <button
                    key={`s-${s.id}`}
                    type="button"
                    onClick={() => selectSector(s)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-medium hover:bg-brand-bg"
                  >
                    <span className="text-brand-dark">{s.name}</span>
                    <span className="text-xs text-brand-dark/40">
                      {s.commune?.name} · {getPowerStateConfig(s.state ?? 'ONLINE').label}
                    </span>
                  </button>
                ))}
              </ResultGroup>
            </>
          )}
        </div>
      )}
    </div>
  );
}
