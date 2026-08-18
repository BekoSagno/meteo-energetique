import { useState } from 'react';
import ViewPageTitle from '../motion/ViewPageTitle.jsx';
import AnimateIn from '../motion/AnimateIn.jsx';
import { INFO_TABS } from '../../lib/infoContent.js';
import { useInfoPublications } from '../../hooks/useInfoPublications.js';

const BADGE_STYLES = {
  urgent: 'bg-brand-red/10 text-brand-red',
  officiel: 'bg-emerald-50 text-emerald-900',
  expertise: 'bg-brand-yellow/20 text-brand-dark',
  document: 'bg-brand-dark/8 text-brand-dark',
};

const BADGE_LABELS = {
  urgent: 'Urgent',
  officiel: 'Officiel',
  expertise: 'Expertise',
  document: 'Document',
};

function InfoBadge({ type }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${
        BADGE_STYLES[type] ?? BADGE_STYLES.officiel
      }`}
    >
      {BADGE_LABELS[type] ?? 'Info'}
    </span>
  );
}

function InfoList({ items, onOpen }) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm font-semibold text-brand-dark/60">
        Aucun contenu dans cette rubrique pour le moment.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.id}>
          <AnimateIn delay={40 + index * 40}>
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className="w-full rounded-xl border border-brand-dark/10 bg-white px-4 py-4 text-left shadow-sm transition-all hover:border-brand-dark/20 hover:bg-emerald-50/60 hover:shadow-md sm:px-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <InfoBadge type={item.badge} />
                <span className="text-xs font-bold text-brand-dark/50">{item.date}</span>
              </div>
              <p className="mt-2 font-display text-base font-extrabold leading-snug text-brand-dark">
                {item.title}
              </p>
              <p className="mt-1 text-xs font-bold text-brand-dark/55">{item.zone}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-brand-dark/70">
                {item.summary}
              </p>
            </button>
          </AnimateIn>
        </li>
      ))}
    </ul>
  );
}

function InfoDetail({ item, onBack }) {
  return (
    <AnimateIn animation="fade-in">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm font-bold text-brand-dark/60 transition-colors hover:text-brand-dark"
      >
        ← Retour à la liste
      </button>

      <article className="rounded-2xl border border-brand-dark/10 bg-white px-5 py-6 shadow-card sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-2">
          <InfoBadge type={item.badge} />
          <span className="text-xs font-bold text-brand-dark/50">{item.date}</span>
        </div>
        <h2 className="mt-3 font-display text-xl font-extrabold leading-snug text-brand-dark sm:text-2xl">
          {item.title}
        </h2>
        <p className="mt-2 text-sm font-extrabold text-brand-dark/60">{item.zone}</p>
        <div className="mt-5 space-y-3 text-sm font-medium leading-relaxed text-brand-dark/80 whitespace-pre-line">
          {item.body}
        </div>
        {item.documentLabel ? (
          <p className="mt-6 rounded-xl border border-dashed border-brand-dark/20 bg-brand-bg px-4 py-3 text-center text-sm font-bold text-brand-dark/55">
            {item.documentLabel}
          </p>
        ) : null}
        {item.channels && (item.channels.sms || item.channels.whatsapp) ? (
          <p className="mt-4 text-center text-xs font-semibold text-brand-dark/50">
            Canaux prévus
            {item.channels.sms ? ' · SMS' : ''}
            {item.channels.whatsapp ? ' · WhatsApp' : ''}
            {' '}— aucun envoi pour le moment.
          </p>
        ) : null}
      </article>
    </AnimateIn>
  );
}

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState('actualites');
  const [openId, setOpenId] = useState(null);
  const { items } = useInfoPublications(activeTab);
  const openItem = openId ? items.find((item) => item.id === openId) : null;
  const currentTab = INFO_TABS.find((tab) => tab.id === activeTab) ?? INFO_TABS[0];

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setOpenId(null);
  }

  return (
    <section id="info" className="mx-auto w-full max-w-5xl pb-4">
      <ViewPageTitle subtitle="Actualités, panels et textes officiels liés à l’énergie">
        Info
      </ViewPageTitle>

      <div
        className="mb-5 flex gap-1 overflow-x-auto rounded-full bg-gray-100 p-1"
        role="tablist"
        aria-label="Rubriques Info"
      >
        {INFO_TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 whitespace-nowrap rounded-full px-3 py-2.5 text-center text-xs font-extrabold transition-all sm:text-sm ${
                selected
                  ? 'bg-brand-dark text-white shadow-sm'
                  : 'text-brand-dark/60 hover:text-brand-dark'
              }`}
            >
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-center text-xs font-semibold text-brand-dark/55 sm:text-sm">
        {currentTab.description}
      </p>

      {openItem ? (
        <InfoDetail item={openItem} onBack={() => setOpenId(null)} />
      ) : (
        <InfoList items={items} onOpen={setOpenId} />
      )}
    </section>
  );
}
