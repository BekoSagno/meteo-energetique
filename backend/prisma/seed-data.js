/**
 * Grand Conakry — 13 communes × 5 quartiers × 5 secteurs
 * Ordre ouest → est (référence cartographique projet) :
 * Kaloum, Dixinn, Matam, Ratoma, Matoto, Gbessia, Tombolia, Lambanyi, Sonfonia, Kassa, Kagbelen, Manéah, Sanoyah
 */

export const REGION_NAME = 'Conakry';

/** Centres mairies — alignés sur backend/src/lib/conakryCenters.js */
export const COMMUNE_CENTERS = {
  Kassa: { lat: 9.47, lng: -13.73 },
  Kaloum: { lat: 9.508, lng: -13.71 },
  Dixinn: { lat: 9.545, lng: -13.675 },
  Matam: { lat: 9.54, lng: -13.655 },
  Ratoma: { lat: 9.595, lng: -13.64 },
  Lambanyi: { lat: 9.605, lng: -13.615 },
  Gbessia: { lat: 9.57, lng: -13.62 },
  Matoto: { lat: 9.585, lng: -13.595 },
  Sonfonia: { lat: 9.62, lng: -13.575 },
  Tombolia: { lat: 9.595, lng: -13.555 },
  Kagbelen: { lat: 9.665, lng: -13.52 },
  Manéah: { lat: 9.645, lng: -13.48 },
  Sanoyah: { lat: 9.615, lng: -13.49 },
};

/**
 * Rayon de dispersion (m) par commune — cohérent avec l'emprise urbaine de Conakry.
 * Presqu'île / côte ouest : court · Matoto (Sangoyah…) : très court · Est périurbain : modéré.
 */
export const COMMUNE_DISPERSION_M = {
  Kaloum: { min: 200, max: 550 },
  Kassa: { min: 200, max: 600 },
  Matam: { min: 200, max: 550 },
  Dixinn: { min: 250, max: 600 },
  Matoto: { min: 200, max: 480 },
  Ratoma: { min: 300, max: 850 },
  Gbessia: { min: 280, max: 650 },
  Tombolia: { min: 280, max: 600 },
  Lambanyi: { min: 300, max: 700 },
  Sonfonia: { min: 280, max: 580 },
  Kagbelen: { min: 320, max: 720 },
  Manéah: { min: 280, max: 520 },
  Sanoyah: { min: 280, max: 480 },
};

/** Océan à l'ouest : orienter les secteurs vers l'est / nord-est. */
const COAST_WEST_COMMUNES = new Set(['Kaloum', 'Kassa', 'Matam', 'Dixinn', 'Matoto', 'Gbessia', 'Ratoma']);

/** Lisière est (mangroves) : orienter vers l'ouest / le centre urbain. */
const EAST_EDGE_COMMUNES = new Set(['Sonfonia', 'Tombolia', 'Kagbelen', 'Manéah', 'Sanoyah']);

function dispersionRangeForCommune(communeName) {
  return COMMUNE_DISPERSION_M[communeName] ?? { min: 300, max: 800 };
}

/** Cap plein (0 = nord) ; évite de pousser les points vers la mer ou les mangroves. */
function bearingForCommune(communeName, seedKey) {
  const u = unitFloat(`${seedKey}:bearing`);
  if (COAST_WEST_COMMUNES.has(communeName)) {
    return -Math.PI / 3 + u * ((5 * Math.PI) / 9);
  }
  if (EAST_EDGE_COMMUNES.has(communeName)) {
    return (5 * Math.PI) / 9 + u * ((5 * Math.PI) / 9);
  }
  return u * 2 * Math.PI;
}

function hashSeed(...parts) {
  let h = 2166136261;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}

function unitFloat(seed) {
  return (hashSeed(seed) % 10000) / 10000;
}

/**
 * Point secteur déterministe autour du centre communal (rayon + direction selon la commune).
 * @param {string} communeName
 * @param {string} quartierName
 * @param {string} sectorName
 */
export function dispersedSectorCoordinates(communeName, quartierName, sectorName) {
  const center = COMMUNE_CENTERS[communeName];
  if (!center) {
    throw new Error(`Centre communal inconnu : ${communeName}`);
  }

  const { min, max } = dispersionRangeForCommune(communeName);
  const seedKey = `${communeName}|${quartierName}|${sectorName}`;
  const distanceM = min + unitFloat(seedKey) * (max - min);
  const bearing = bearingForCommune(communeName, seedKey);

  const latRad = (center.lat * Math.PI) / 180;
  const dLat = (distanceM * Math.cos(bearing)) / 111_320;
  const dLng = (distanceM * Math.sin(bearing)) / (111_320 * Math.cos(latRad));

  return {
    lat: center.lat + dLat,
    lng: center.lng + dLng,
  };
}

/** Répartition cible à l'initialisation : 70 % ONLINE, 20 % OFFLINE, 10 % UNSTABLE. */
export const POWER_STATE_WEIGHTS = {
  ONLINE: 0.7,
  OFFLINE: 0.2,
  UNSTABLE: 0.1,
};

/**
 * État réseau initial déterministe par secteur (même graine que les coordonnées, clé distincte).
 * @returns {'ONLINE' | 'OFFLINE' | 'UNSTABLE'}
 */
export function initialPowerStateForSector(communeName, quartierName, sectorName) {
  const roll = unitFloat(`${communeName}|${quartierName}|${sectorName}|power`);
  if (roll < POWER_STATE_WEIGHTS.ONLINE) return 'ONLINE';
  if (roll < POWER_STATE_WEIGHTS.ONLINE + POWER_STATE_WEIGHTS.OFFLINE) return 'OFFLINE';
  return 'UNSTABLE';
}

/** Score de confiance cohérent avec l'état (varié mais reproductible). */
export function initialConfidenceForState(state, communeName, quartierName, sectorName) {
  const u = unitFloat(`${communeName}|${quartierName}|${sectorName}|confidence`);
  if (state === 'ONLINE') return Math.round(82 + u * 18);
  if (state === 'OFFLINE') return Math.round(55 + u * 25);
  return Math.round(45 + u * 30);
}

/** @type {Array<{ commune: string, quartiers: Array<{ name: string, sectors: string[] }> }>} */
export const GRAND_CONAKRY_TREE = [
  {
    commune: 'Kaloum',
    quartiers: [
      { name: 'Almamya', sectors: ['Almamya Centre', 'Almamya Marché', 'Almamya Mosquée', 'Almamya Port', 'Almamya Gare'] },
      { name: 'Boulbinet', sectors: ['Boulbinet Centre', 'Boulbinet Marché', 'Boulbinet Mosquée', 'Boulbinet Nord', 'Boulbinet Sud'] },
      { name: 'Coronthie', sectors: ['Coronthie Centre', 'Coronthie Marché', 'Coronthie Mosquée', 'Coronthie Port', 'Coronthie Gare'] },
      { name: 'Sandervalia', sectors: ['Sandervalia Centre', 'Sandervalia Marché', 'Sandervalia Mosquée', 'Sandervalia Lycée', 'Sandervalia Plateau'] },
      { name: 'Tombo', sectors: ['Tombo Centre', 'Tombo Marché', 'Tombo Mosquée', 'Tombo Port', 'Tombo Gare'] },
    ],
  },
  {
    commune: 'Dixinn',
    quartiers: [
      { name: 'Camayenne', sectors: ['Camayenne Centre', 'Camayenne Marché', 'Camayenne Mosquée', 'Camayenne Gare', 'Camayenne Plage'] },
      { name: 'Dixinn Centre', sectors: ['Dixinn Centre Centre', 'Dixinn Centre Marché', 'Dixinn Centre Mosquée', 'Dixinn Centre Université', 'Dixinn Centre Cité'] },
      { name: 'Hafia 1', sectors: ['Hafia 1 Centre', 'Hafia 1 Marché', 'Hafia 1 Mosquée', 'Hafia 1 École', 'Hafia 1 Plateau'] },
      { name: 'Landréah', sectors: ['Landréah Centre', 'Landréah Marché', 'Landréah Mosquée', 'Landréah Gare', 'Landréah Cité'] },
      { name: 'Belle-Vue', sectors: ['Belle-Vue Centre', 'Belle-Vue Marché', 'Belle-Vue Mosquée', 'Belle-Vue Plage', 'Belle-Vue Plateau'] },
    ],
  },
  {
    commune: 'Matam',
    quartiers: [
      { name: 'Bonfi', sectors: ['Bonfi Centre', 'Bonfi Marché', 'Bonfi Mosquée', 'Bonfi Gare', 'Bonfi Port'] },
      { name: 'Coléah', sectors: ['Coléah Centre', 'Coléah Marché', 'Coléah Mosquée', 'Coléah Cité', 'Coléah Lido'] },
      { name: 'Madina', sectors: ['Madina Centre', 'Madina Marché', 'Madina Mosquée', 'Madina Gare', 'Madina École'] },
      { name: 'Mafanco', sectors: ['Mafanco Centre', 'Mafanco Marché', 'Mafanco Mosquée', 'Mafanco Carrefour', 'Mafanco Port'] },
      { name: 'Matam Centre', sectors: ['Matam Centre Centre', 'Matam Centre Marché', 'Matam Centre Mosquée', 'Matam Centre Gare', 'Matam Centre École'] },
    ],
  },
  {
    commune: 'Ratoma',
    quartiers: [
      { name: 'Taouyah', sectors: ['Taouyah Centre', 'Taouyah Marché', 'Taouyah Mosquée', 'Taouyah Gare', 'Taouyah Sud'] },
      { name: 'Kipé', sectors: ['Kipé Centre', 'Kipé Marché', 'Kipé Mosquée', 'Kipé Carrefour', 'Kipé Plage'] },
      { name: 'Kaporo Rails', sectors: ['Kaporo Rails Centre', 'Kaporo Rails Marché', 'Kaporo Rails Mosquée', 'Kaporo Rails Dispensaire', 'Kaporo Rails 1'] },
      { name: 'Ratoma Centre', sectors: ['Ratoma Centre Centre', 'Ratoma Centre Marché', 'Ratoma Centre Mosquée', 'Ratoma Centre Gare', 'Ratoma Centre Sud'] },
      { name: 'Hamdallaye', sectors: ['Hamdallaye Centre', 'Hamdallaye Marché', 'Hamdallaye Mosquée', 'Hamdallaye Carrefour', 'Hamdallaye Plage'] },
    ],
  },
  {
    commune: 'Matoto',
    quartiers: [
      { name: 'Matoto Centre', sectors: ['Matoto Centre Centre', 'Matoto Centre Marché', 'Matoto Centre Mosquée', 'Matoto Centre Gare', 'Matoto Centre Plateau'] },
      { name: 'Kissosso', sectors: ['Kissosso Centre', 'Kissosso Marché', 'Kissosso Mosquée', 'Kissosso Carrefour', 'Kissosso Nord'] },
      { name: 'Sangoyah', sectors: ['Sangoyah Centre', 'Sangoyah Marché', 'Sangoyah Mosquée', 'Sangoyah Sud', 'Sangoyah École'] },
      { name: 'Simbaya', sectors: ['Simbaya Centre', 'Simbaya Marché', 'Simbaya Mosquée', 'Simbaya Gare', 'Simbaya Carrefour'] },
      { name: 'Matoto Marché', sectors: ['Matoto Marché Centre', 'Matoto Marché Marché', 'Matoto Marché Mosquée', 'Matoto Marché Nord', 'Matoto Marché Sud'] },
    ],
  },
  {
    commune: 'Gbessia',
    quartiers: [
      { name: 'Gbessia Centre', sectors: ['Gbessia Centre Centre', 'Gbessia Centre Marché', 'Gbessia Centre Mosquée', 'Gbessia Centre Gare', 'Gbessia Centre Nord'] },
      { name: 'Dabondy', sectors: ['Dabondy Centre', 'Dabondy Marché', 'Dabondy Permanence', 'Dabondy Mosquée', 'Dabondy Sud'] },
      { name: 'Yimbaya', sectors: ['Yimbaya Centre', 'Yimbaya Marché', 'Yimbaya Mosquée', 'Yimbaya Tannerie', 'Yimbaya Nord'] },
      { name: 'Tanènè', sectors: ['Tanènè Centre', 'Tanènè Marché', 'Tanènè Mosquée', 'Tanènè Rails', 'Tanènè Port'] },
      { name: "Cité de l'Air", sectors: ["Cité de l'Air Centre", "Cité de l'Air Marché", "Cité de l'Air Mosquée", "Cité de l'Air Gare", "Cité de l'Air Sud"] },
    ],
  },
  {
    commune: 'Tombolia',
    quartiers: [
      { name: 'Tombolia', sectors: ['Tombolia Centre', 'Tombolia Marché', 'Tombolia Mosquée', 'Tombolia Gare', 'Tombolia Sud'] },
      { name: 'Enta', sectors: ['Enta Centre', 'Enta Marché', 'Enta Mosquée', 'Enta Fassa', 'Enta Nord'] },
      { name: 'Dabompa', sectors: ['Dabompa Centre', 'Dabompa Marché', 'Dabompa Mosquée', 'Dabompa Village', 'Dabompa Sud'] },
      { name: 'Lansanayah', sectors: ['Lansanayah Centre', 'Lansanayah Marché', 'Lansanayah Mosquée', 'Lansanayah Gare', 'Lansanayah Nord'] },
      { name: 'Tombolia Plateau', sectors: ['Tombolia Plateau Centre', 'Tombolia Plateau Marché', 'Tombolia Plateau Mosquée', 'Tombolia Plateau Plateau', 'Tombolia Plateau Sud'] },
    ],
  },
  {
    commune: 'Lambanyi',
    quartiers: [
      { name: 'Lambanyi', sectors: ['Lambanyi Centre', 'Lambanyi Marché', 'Lambanyi Mosquée', 'Lambanyi Carrefour', 'Lambanyi Gare'] },
      { name: 'Nongo', sectors: ['Nongo Centre', 'Nongo Marché', 'Nongo Mosquée', 'Nongo Taady', 'Nongo Sud'] },
      { name: 'Yembeya', sectors: ['Yembeya Centre', 'Yembeya Marché', 'Yembeya Mosquée', 'Yembeya Rails', 'Yembeya Nord'] },
      { name: 'Wanindara', sectors: ['Wanindara Centre', 'Wanindara Marché', 'Wanindara Mosquée', 'Wanindara Fossidet', 'Wanindara Gare'] },
      { name: 'Yattaya', sectors: ['Yattaya Centre', 'Yattaya Marché', 'Yattaya Mosquée', 'Yattaya Carrefour', 'Yattaya Nord'] },
    ],
  },
  {
    commune: 'Sonfonia',
    quartiers: [
      { name: 'Sonfonia Gare', sectors: ['Sonfonia Gare Centre', 'Sonfonia Gare Marché', 'Sonfonia Gare Mosquée', 'Sonfonia Gare Gare', 'Sonfonia Gare Sud'] },
      { name: 'Sonfonia Centre', sectors: ['Sonfonia Centre Centre', 'Sonfonia Centre Marché', 'Sonfonia Centre Mosquée', 'Sonfonia Centre Carrefour', 'Sonfonia Centre Sud'] },
      { name: 'Kobayah', sectors: ['Kobayah Centre', 'Kobayah Marché', 'Kobayah Mosquée', 'Kobayah Gare', 'Kobayah Sud'] },
      { name: 'Yattaya Fossidet', sectors: ['Yattaya Fossidet Centre', 'Yattaya Fossidet Marché', 'Yattaya Fossidet Mosquée', 'Yattaya Fossidet Fossidet', 'Yattaya Fossidet Sud'] },
      { name: 'Sonfonia T7', sectors: ['Sonfonia T7 Centre', 'Sonfonia T7 Marché', 'Sonfonia T7 Mosquée', 'Sonfonia T7 Carrefour', 'Sonfonia T7 Sud'] },
    ],
  },
  {
    commune: 'Kassa',
    quartiers: [
      { name: 'Kassa Centre', sectors: ['Kassa Centre Centre', 'Kassa Centre Marché', 'Kassa Centre Mosquée', 'Kassa Centre Port', 'Kassa Centre Nord'] },
      { name: 'Fotoba', sectors: ['Fotoba Centre', 'Fotoba Marché', 'Fotoba Plage', 'Fotoba Port', 'Fotoba Sud'] },
      { name: 'Kakoutoulaye', sectors: ['Kakoutoulaye Centre', 'Kakoutoulaye Marché', 'Kakoutoulaye Mosquée', 'Kakoutoulaye Port', 'Kakoutoulaye Nord'] },
      { name: 'Room', sectors: ['Room Centre', 'Room Marché', 'Room Mosquée', 'Room Port', 'Room Sud'] },
      { name: 'Boulaye', sectors: ['Boulaye Centre', 'Boulaye Marché', 'Boulaye Mosquée', 'Boulaye Nord', 'Boulaye Sud'] },
    ],
  },
  {
    commune: 'Kagbelen',
    quartiers: [
      { name: 'Kagbelen Centre', sectors: ['Kagbelen Centre Centre', 'Kagbelen Centre Marché', 'Kagbelen Centre Mosquée', 'Kagbelen Centre Gare', 'Kagbelen Centre Sud'] },
      { name: 'Dubréka Rail', sectors: ['Dubréka Rail Centre', 'Dubréka Rail Marché', 'Dubréka Rail Mosquée', 'Dubréka Rail Rail 1', 'Dubréka Rail Nord'] },
      { name: 'Kagbelen Plateau', sectors: ['Kagbelen Plateau Centre', 'Kagbelen Plateau Marché', 'Kagbelen Plateau Mosquée', 'Kagbelen Plateau Plateau', 'Kagbelen Plateau Sud'] },
      { name: 'Kountia', sectors: ['Kountia Centre', 'Kountia Marché', 'Kountia Mosquée', 'Kountia Gare', 'Kountia Nord'] },
      { name: 'Keitayah', sectors: ['Keitayah Centre', 'Keitayah Marché', 'Keitayah Mosquée', 'Keitayah Sud', 'Keitayah Nord'] },
    ],
  },
  {
    commune: 'Manéah',
    quartiers: [
      { name: 'Tanènè', sectors: ['Tanènè Centre', 'Tanènè Marché', 'Tanènè Mosquée', 'Tanènè Gare', 'Tanènè Sud'] },
      { name: 'Manéah Centre', sectors: ['Manéah Centre Centre', 'Manéah Centre Marché', 'Manéah Centre Mosquée', 'Manéah Centre Route', 'Manéah Centre Nord'] },
      { name: 'Fily', sectors: ['Fily Centre', 'Fily Marché', 'Fily Mosquée', 'Fily Gare', 'Fily Sud'] },
      { name: 'Maférinyah Route', sectors: ['Maférinyah Route Centre', 'Maférinyah Route Marché', 'Maférinyah Route Mosquée', 'Maférinyah Route Route', 'Maférinyah Route Nord'] },
      { name: 'Coyah Rail', sectors: ['Coyah Rail Centre', 'Coyah Rail Marché', 'Coyah Rail Mosquée', 'Coyah Rail Rail', 'Coyah Rail Sud'] },
    ],
  },
  {
    commune: 'Sanoyah',
    quartiers: [
      { name: 'Sanoyah Centre', sectors: ['Sanoyah Centre Centre', 'Sanoyah Centre Marché', 'Sanoyah Centre Mosquée', 'Sanoyah Centre Gare', 'Sanoyah Centre Sud'] },
      { name: 'Sanoyah Gare', sectors: ['Sanoyah Gare Centre', 'Sanoyah Gare Marché', 'Sanoyah Gare Mosquée', 'Sanoyah Gare Gare', 'Sanoyah Gare Nord'] },
      { name: 'Yorokoguia', sectors: ['Yorokoguia Centre', 'Yorokoguia Marché', 'Yorokoguia Mosquée', 'Yorokoguia Nord', 'Yorokoguia Sud'] },
      { name: 'Fadiguiya', sectors: ['Fadiguiya Centre', 'Fadiguiya Marché', 'Fadiguiya Mosquée', 'Fadiguiya Gare', 'Fadiguiya Sud'] },
      { name: 'Negueyah', sectors: ['Negueyah Centre', 'Negueyah Marché', 'Negueyah Mosquée', 'Negueyah Nord', 'Negueyah Sud'] },
    ],
  },
];


export function kitIdFromNames(commune, quartier, sector) {
  const slug = (s) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 12);
  return `KIT-${slug(commune)}-${slug(quartier)}-${slug(sector)}`.slice(0, 50);
}
