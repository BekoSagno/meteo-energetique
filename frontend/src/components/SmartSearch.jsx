import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../lib/constants.js';
import { getPowerStateConfig } from '../lib/powerStatus.js';
import { normalizeSearchText, sectorMatchesQuery, textMatchesQuery } from '../lib/search.js';

function SearchResultRow({ name, meta, onClick, trailing }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-brand-green/8 active:bg-brand-green/12"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-brand-dark">{name}</span>
          {meta && (
            <span className="mt-0.5 block truncate text-xs font-medium text-brand-dark/45">{meta}</span>
          )}
        </span>
        {trailing}
      </button>
    </li>
  );
}

function UnifiedResultsList({ items, emptyMessage = 'Aucun résultat' }) {
  if (!items.length) {
    return (
      <p className="px-3 py-3 text-center text-sm font-semibold text-brand-red">{emptyMessage}</p>
    );
  }

  return (
    <ul className="py-1">
      {items.map((item) => (
        <SearchResultRow
          key={item.key}
          name={item.name}
          meta={item.meta}
          onClick={item.onClick}
          trailing={item.trailing}
        />
      ))}
    </ul>
  );
}

function PickerPanel({
  title,
  subtitle,
  items,
  onSelect,
  onBack,
  renderRight,
  panelClass = 'mt-2',
  compact = false,
  getItemMeta,
}) {
  if (compact) {
    return (
      <div className={panelClass}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-2 px-3 text-xs font-semibold text-brand-green hover:underline"
          >
            ← Retour
          </button>
        )}
        {title && (
          <p className="mb-1 px-3 text-xs font-semibold text-brand-dark/50">{title}</p>
        )}
        <ul className="max-h-[min(48vh,18rem)] overflow-y-auto">
          {items.map((item) => (
            <SearchResultRow
              key={item.id}
              name={item.name}
              meta={getItemMeta?.(item)}
              onClick={() => onSelect(item)}
              trailing={renderRight?.(item)}
            />
          ))}
        </ul>
      </div>
    );
  }

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
  const isModal = variant === 'modal';
  const isCtaFixed = variant === 'cta-fixed';
  const isCta = variant === 'cta' || isCtaFixed;
  const inputId = isHeader
    ? 'smart-search-header'
    : isModal
      ? 'smart-search-modal'
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

  const mergedModalResults = useMemo(() => {
    if (!isModal || !searchResults) return [];

    const communeNameById = new Map(index.communes.map((c) => [c.id, c.name]));
    const items = [];

    for (const r of searchResults.regions) {
      items.push({
        key: `r-${r.id}`,
        name: r.name,
        meta: 'Région',
        onClick: () => handleRegionClick(r),
      });
    }

    for (const c of searchResults.communes) {
      items.push({
        key: `c-${c.id}`,
        name: c.name,
        meta: 'Commune',
        onClick: () => handleCommuneClick(c),
      });
    }

    for (const q of searchResults.quartiers) {
      const communeName = q.commune?.name ?? communeNameById.get(q.communeId) ?? '';
      items.push({
        key: `q-${q.id}`,
        name: q.name,
        meta: communeName ? `Quartier · ${communeName}` : 'Quartier',
        onClick: () => selectQuartier(q),
      });
    }

    for (const s of searchResults.sectors.slice(0, 16)) {
      const { label: powerLabel, dotClass } = getPowerStateConfig(s.state ?? 'ONLINE');
      items.push({
        key: `s-${s.id}`,
        name: s.name,
        meta: `Secteur · ${powerLabel}`,
        onClick: () => selectSector(s),
        trailing: (
          <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
        ),
      });
    }

    return items;
  }, [isModal, searchResults, index.communes]);

  const inputClass = isHeader
    ? 'search-input-header'
    : isModal
      ? 'search-input search-input-modal'
      : isCtaFixed
        ? 'search-input search-input-cta-fixed'
        : isCta
          ? 'search-input search-input-cta'
          : 'search-input rounded-2xl px-5 py-4 text-base shadow-sm';

  const panelPos = isHeader
    ? 'absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] sm:w-96'
    : isModal
      ? 'mt-3 max-h-[min(52vh,20rem)] overflow-y-auto rounded-xl border border-brand-dark/10 bg-white/98 shadow-md'
      : isCtaFixed
        ? 'absolute bottom-full left-0 right-0 z-[70] mb-2 max-h-[min(50vh,22rem)] overflow-y-auto rounded-xl border-2 border-brand-dark/15 bg-white shadow-2xl'
        : 'absolute left-0 right-0 z-30 mt-2';
  const pickerPanelClass = isHeader || isCtaFixed ? panelPos : isModal ? panelPos : 'mt-2';

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
            isModal || isCtaFixed
              ? 'Indiquez une commune, un quartier, un secteur…'
              : isHeader || isCta
                ? 'Indiquer une commune, un quartier, un secteur…'
                : 'Rechercher une région, une commune ou un quartier…'
          }
          disabled={indexLoading}
          className={inputClass}
        />
        {(isHeader || isCta || isModal) && (
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
        <p className="mt-2 text-center text-xs font-semibold text-brand-dark/50">
          {isModal ? 'Chargement des secteurs…' : 'Loading...'}
        </p>
      )}

      {open && picker?.type === 'communes' && (
        <PickerPanel
          panelClass={pickerPanelClass}
          compact={isModal}
          title={isModal ? picker.region.name : `Communes — ${picker.region.name}`}
          subtitle="Choisissez une commune"
          items={picker.items}
          onSelect={handleCommuneClick}
          onBack={() => setPicker(null)}
          getItemMeta={() => 'Commune'}
        />
      )}

      {open && picker?.type === 'quartiers' && (
        <PickerPanel
          panelClass={pickerPanelClass}
          compact={isModal}
          title={isModal ? picker.commune.name : `Quartiers — ${picker.commune.name}`}
          subtitle="Choisissez un quartier"
          items={picker.items}
          onSelect={(q) => selectQuartier(q, { showSectorList: true })}
          onBack={() => {
            const region =
              index.regions.find((r) => r.id === picker.commune.regionId) ?? index.regions[0];
            if (region) handleRegionClick(region);
            else setPicker(null);
          }}
          getItemMeta={() => 'Quartier'}
        />
      )}

      {open && picker?.type === 'sectors' && (
        <PickerPanel
          panelClass={pickerPanelClass}
          compact={isModal}
          title={isModal ? picker.quartier.name : `Secteurs — ${picker.quartier.name}`}
          subtitle="Choisissez un secteur"
          items={picker.items}
          onSelect={selectSector}
          onBack={() => handleCommuneClick(picker.quartier.commune ?? { id: picker.quartier.communeId, name: '' })}
          getItemMeta={(s) => `Secteur · ${getPowerStateConfig(s.state ?? 'ONLINE').label}`}
          renderRight={(s) => {
            const { dotClass } = getPowerStateConfig(s.state ?? 'ONLINE');
            return <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />;
          }}
        />
      )}

      {open && !picker && normalizedQuery && (
        <div
          className={`${panelPos} ${isModal ? '' : 'animate-scale-in overflow-hidden rounded-xl border-2 border-brand-dark/15 bg-white shadow-lg opacity-0'}`}
        >
          {isModal ? (
            <UnifiedResultsList items={mergedModalResults} />
          ) : !hasSearchResults ? (
            <p className="px-4 py-4 text-center text-sm font-semibold text-brand-red">
              Aucun résultat
            </p>
          ) : (
            <>
              {searchResults.regions.length > 0 && (
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
              )}

              {searchResults.communes.length > 0 && (
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
              )}

              {searchResults.quartiers.length > 0 && (
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
              )}

              {searchResults.sectors.length > 0 && (
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
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
