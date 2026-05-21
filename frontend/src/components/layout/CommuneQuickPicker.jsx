import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { aggregateCommuneFromSectors } from '../../lib/communeRanking.js';
import { getPowerStateConfig } from '../../lib/powerStatus.js';

function normalizeId(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function idsMatch(a, b) {
  const na = normalizeId(a);
  const nb = normalizeId(b);
  if (na === null || nb === null) return false;
  return na === nb;
}

function CommuneIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

const PANEL_Z = 260;

/** @param {'sidebar' | 'sidebar-wide' | 'drawer'} variant */
export default function CommuneQuickPicker({
  variant = 'drawer',
  communes = [],
  sectors = [],
  selectedCommuneId,
  onCommuneSelect,
  onAfterSelect,
}) {
  const [expanded, setExpanded] = useState(false);
  const [fixedPanelCss, setFixedPanelCss] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const isSidebar = variant === 'sidebar' || variant === 'sidebar-wide';
  const isSidebarWide = variant === 'sidebar-wide';
  const isCompactSidebar = variant === 'sidebar';

  const updateFixedPanelPlacement = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const left = rect.right + gap;
    const maxPanelW = 16 * 16;
    const panelWidth = Math.min(maxPanelW, Math.max(200, vw - left - 12));
    const maxHFromBottom = rect.bottom - 12;
    const maxHeight = Math.min(vh * 0.62, Math.max(120, maxHFromBottom));

    setFixedPanelCss({
      position: 'fixed',
      left: `${Math.min(left, vw - panelWidth - 8)}px`,
      bottom: `${vh - rect.bottom}px`,
      width: `${panelWidth}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: PANEL_Z,
    });
  }, []);

  useLayoutEffect(() => {
    if (!expanded || !isCompactSidebar) {
      setFixedPanelCss(null);
      return;
    }
    updateFixedPanelPlacement();
  }, [expanded, isCompactSidebar, updateFixedPanelPlacement, communes.length]);

  useEffect(() => {
    if (!expanded || !isCompactSidebar) return;
    const onResize = () => updateFixedPanelPlacement();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [expanded, isCompactSidebar, updateFixedPanelPlacement]);

  useEffect(() => {
    if (!expanded || !isCompactSidebar) return;
    function onPointerDown(e) {
      const t = e.target;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setExpanded(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [expanded, isCompactSidebar]);

  /** État majoritaire des secteurs (aligné carte / API), pas « un seul OFFLINE = commune rouge ». */
  function communeState(communeId) {
    return aggregateCommuneFromSectors(sectors, communeId).state;
  }

  function handlePick(commune) {
    const candidates = sectors.filter((s) => idsMatch(s.communeId, commune.id));
    const sector =
      candidates.find((s) => /centre/i.test(String(s.name ?? ''))) ?? candidates[0];
    onCommuneSelect?.(commune, sector);
    onAfterSelect?.();
    setExpanded(false);
  }

  const listHeadline = (
    <p
      className={`mb-1.5 font-bold uppercase tracking-wide text-brand-dark/45 ${
        isCompactSidebar ? 'px-1 text-[10px]' : isSidebar ? 'px-1 text-[9px]' : 'px-2 text-[10px]'
      }`}
    >
      Grand Conakry · {communes.length}
    </p>
  );

  const listItems = (
    <ul
      className={`min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain ${
        isSidebar && !isCompactSidebar ? 'max-h-none' : isCompactSidebar ? '' : 'max-h-56'
      }`}
    >
      {communes.map((commune) => {
        const state = communeState(commune.id);
        const { dotClass, label } = getPowerStateConfig(state);
        const selected = idsMatch(commune.id, selectedCommuneId);

        return (
          <li key={commune.id}>
            <button
              type="button"
              onClick={() => handlePick(commune)}
              className={`interactive-row flex w-full items-center gap-2 text-left ${
                isCompactSidebar || isSidebarWide
                  ? 'rounded-lg px-2 py-2 text-sm font-bold'
                  : isSidebar
                    ? 'px-1 py-1.5 text-[10px] font-bold'
                    : 'px-3 py-3 text-sm font-bold'
              } ${
                selected
                  ? 'rounded-lg bg-emerald-50 font-extrabold text-emerald-900'
                  : 'font-bold text-brand-dark/90'
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${dotClass}`}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{commune.name}</span>
              <span className="sr-only">{label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const fixedPortal =
    expanded &&
    isCompactSidebar &&
    fixedPanelCss &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={panelRef}
        id="sidebar-commune-picker-panel"
        role="region"
        aria-label="Liste des communes du Grand Conakry"
        style={fixedPanelCss}
        className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-brand-dark/15 bg-white p-2 shadow-xl"
      >
        {listHeadline}
        {listItems}
      </div>,
      document.body
    );

  return (
    <div
      className={
        isCompactSidebar
          ? 'relative shrink-0 border-t border-brand-dark/10'
          : isSidebarWide
            ? 'mt-1 flex flex-col border-t border-brand-dark/10 pt-2'
            : isSidebar
              ? 'flex min-h-0 flex-1 flex-col border-t border-brand-dark/10'
              : 'border-b border-brand-dark/10'
      }
    >
      <button
        ref={isCompactSidebar ? triggerRef : undefined}
        type="button"
        onClick={() => setExpanded((o) => !o)}
        aria-expanded={expanded}
        aria-controls={isCompactSidebar ? 'sidebar-commune-picker-panel' : undefined}
        className={
          isSidebarWide
            ? 'sidebar-nav-link flex w-full items-center justify-between gap-2 text-left'
            : isSidebar
              ? 'app-nav-item relative flex w-full shrink-0 flex-row items-center justify-between gap-1'
              : 'drawer-nav-link'
        }
      >
        {isSidebar && !isSidebarWide ? (
          <span className="flex min-w-0 flex-1 items-center justify-start gap-2">
            <CommuneIcon className="h-6 w-6 shrink-0 text-brand-dark" />
            <span className="min-w-0 truncate text-sm font-extrabold leading-snug">Communes</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CommuneIcon className={`shrink-0 text-brand-dark ${isSidebar ? 'h-5 w-5' : 'h-6 w-6'}`} />
            <span>{isSidebarWide ? 'Communes' : 'Communes'}</span>
          </span>
        )}
        {!isSidebar && (
          <span
            className={`text-brand-dark/50 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            ▾
          </span>
        )}
        {isSidebar && (
          <span className="shrink-0 text-brand-dark/45 text-xs transition-transform duration-200" aria-hidden="true">
            {isCompactSidebar ? (expanded ? '▴' : '▾') : '▾'}
          </span>
        )}
      </button>

      {fixedPortal}

      {expanded && !isCompactSidebar && (
        <div
          className={
            isSidebarWide
              ? 'max-h-48 overflow-y-auto overscroll-contain px-1.5 pb-2'
              : isSidebar
                ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-1.5 pb-2'
                : 'border-t border-brand-dark/5 bg-brand-bg/60 px-3 pb-3 pt-2'
          }
        >
          {listHeadline}
          {listItems}
        </div>
      )}
    </div>
  );
}
