/**
 * Charge le GeoJSON admin3 Guinée et construit les géométries WGS84 pour les 13 communes
 * du Grand Conakry telles qu’utilisées dans l’app (noms affichés avec accents).
 *
 * Source : propriétés adm3_name / adm2_name du fichier OCHA HDX (gin_admin3_em).
 *
 * Rappel : le fichier 2016 ne contient que 5 communes sous « Conakry » (GN002001) ;
 * les communes issues du découpage de Matoto et des bandes est du Grand Conakry sont
 * dérivées comme indiqué dans les commentaires ci-dessous.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} s */
export function escapeSqlString(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "''");
}

/** @param {string} s */
export function normalizeAdmName(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

const GEOJSON_PATH = path.join(__dirname, '../data/conakry_communes.geojson');

/** @returns {import('geojson').FeatureCollection} */
export function readConakryCommunesGeoJson() {
  const raw = fs.readFileSync(GEOJSON_PATH, 'utf8');
  const fc = JSON.parse(raw);
  if (fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) {
    throw new Error('conakry_communes.geojson : FeatureCollection attendue');
  }
  return fc;
}

/**
 * @param {import('geojson').Feature[]} features
 * @param {(p: Record<string, unknown>) => boolean} pred
 */
function findFeature(features, pred) {
  const f = features.find((feat) => pred(/** @type {Record<string, unknown>} */ (feat.properties ?? {})));
  return f ?? null;
}

/**
 * Dérive 5 bandes disjointes ouest→est depuis le polygone historique Matoto (GN00200104).
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {object} geometry Matoto.geometry (GeoJSON)
 */
export async function matotoLongitudeSlicesAsGeoJson(prisma, geometry) {
  const escaped = escapeSqlString(JSON.stringify(geometry));
  const rows = await prisma.$queryRawUnsafe(`
    WITH m AS (
      SELECT ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON('${escaped}'), 4326)) AS g
    ),
    ex AS (
      SELECT
        m.g,
        ST_XMin(ST_Envelope(m.g)) AS x0,
        ST_XMax(ST_Envelope(m.g)) AS x1,
        ST_YMin(ST_Envelope(m.g)) AS y0,
        ST_YMax(ST_Envelope(m.g)) AS y1
      FROM m
    ),
    bands AS (
      SELECT
        gs.i AS i,
        ST_Multi(
          ST_CollectionExtract(
            ST_MakeValid(
              ST_Intersection(
                ex.g,
                ST_MakeEnvelope(
                  ex.x0 + (ex.x1 - ex.x0) * (gs.i::float / 5.0),
                  ex.y0,
                  ex.x0 + (ex.x1 - ex.x0) * ((gs.i + 1)::float / 5.0),
                  ex.y1,
                  4326
                )
              )
            ),
            3
          )
        ) AS geom
      FROM ex
      CROSS JOIN generate_series(0, 4) AS gs(i)
    )
    SELECT i, ST_AsGeoJSON(geom)::text AS gj
    FROM bands
    WHERE geom IS NOT NULL AND NOT ST_IsEmpty(geom)
    ORDER BY i
  `);
  /** @type {Map<number, object>} */
  const byIndex = new Map();
  for (const row of rows) {
    const i = Number(row.i);
    try {
      byIndex.set(i, JSON.parse(String(row.gj)));
    } catch {
      continue;
    }
  }
  if (byIndex.size < 5) {
    throw new Error(
      `Découpe Matoto : ${byIndex.size}/5 bandes valides — vérifier le GeoJSON ou la géométrie Matoto.`
    );
  }
  return byIndex;
}

/**
 * Dérive une géométrie pour Kassa : îles après découpage du MultiPolygon Kaloum si possible ;
 * sinon intersection Kaloum ∩ enveloppe élargie côte sud.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {object} kaloumGeometry Kaloum.geometry
 */
const KASSA_CLIP_ENVELOPE = {
  xmin: -13.78,
  ymin: 9.295,
  xmax: -13.38,
  ymax: 9.545,
};

export async function kassaGeometryFromKaloum(prisma, kaloumGeometry) {
  const escaped = escapeSqlString(JSON.stringify(kaloumGeometry));
  const { xmin, ymin, xmax, ymax } = KASSA_CLIP_ENVELOPE;
  const rows = await prisma.$queryRawUnsafe(`
    WITH kal AS (
      SELECT ST_Multi(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON('${escaped}'), 4326))) AS g
    ),
    dumped AS (
      SELECT dd.geom AS part
      FROM kal k,
      LATERAL ST_Dump(k.g) AS dd
      WHERE GeometryType(dd.geom) IN ('POLYGON', 'MULTIPOLYGON')
        AND dd.geom IS NOT NULL
        AND NOT ST_IsEmpty(dd.geom)
    ),
    ranked AS (
      SELECT
        ST_Multi(ST_MakeValid(part)) AS part,
        ROW_NUMBER() OVER (ORDER BY ST_Area(part::geography) DESC NULLS LAST) AS rk
      FROM dumped
    ),
    offshore_agg AS (
      SELECT ST_Multi(ST_UnaryUnion(ST_Collect(part))) AS geom FROM ranked WHERE rk > 1
    ),
    bbox_only AS (
      SELECT
        ST_Multi(
          ST_CollectionExtract(
            ST_MakeValid(
              ST_Intersection(
                kal.g,
                ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 4326)
              )
            ),
            3
          )
        ) AS geom
      FROM kal
    ),
    chosen AS (
      SELECT CASE
        WHEN oa.geom IS NOT NULL AND NOT ST_IsEmpty(oa.geom)
        THEN oa.geom
        ELSE bb.geom
      END AS geom
      FROM offshore_agg oa CROSS JOIN bbox_only bb
    )
    SELECT ST_AsGeoJSON(ST_MakeValid(chosen.geom))::text AS gj
    FROM chosen
    WHERE chosen.geom IS NOT NULL
      AND NOT ST_IsEmpty(chosen.geom)
    LIMIT 1
  `);
  if (!rows?.length || !rows[0].gj) {
    throw new Error(
      'Impossible de dériver la géométrie Kassa depuis Kaloum ; ajuster les enveloppes dans load-conakry-geojson.js.'
    );
  }
  return JSON.parse(String(rows[0].gj));
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @returns {Promise<Record<string, import('geojson').Geometry>>}
 */
export async function buildGrandConakryCommuneGeometries(prisma) {
  const fc = readConakryCommunesGeoJson();
  const feats = fc.features ?? [];

  const byConakry = (adm3Norm) =>
    findFeature(feats, (p) => normalizeAdmName(p.adm3_name) === adm3Norm && p.adm2_name === 'Conakry');

  const byCoyah = (adm3Norm) =>
    findFeature(feats, (p) => normalizeAdmName(p.adm3_name) === adm3Norm && p.adm2_name === 'Coyah');

  const kaloumF = byConakry('kaloum');
  const dixinF = byConakry('dixinn');
  const matamF = byConakry('matam');
  const ratomaF = byConakry('ratoma');
  const matotoF = byConakry('matoto');

  if (!kaloumF?.geometry || !matotoF?.geometry) {
    throw new Error(
      'GeoJSON : géométries Kaloum ou Matoto absentes sous adm2_name=Conakry — fichier invalide.'
    );
  }
  const required = [
    ['Dixinn', dixinF],
    ['Matam', matamF],
    ['Ratoma', ratomaF],
  ];
  for (const [name, f] of required) {
    if (!f?.geometry) throw new Error(`GeoJSON : commune administrative « ${name} » introuvable.`);
  }

  /** @type {Record<string, import('geojson').Geometry>} */
  const out = {
    Kaloum: /** @type {import('geojson').Geometry} */ (kaloumF.geometry),
    Dixinn: /** @type {import('geojson').Geometry} */ (dixinF.geometry),
    Matam: /** @type {import('geojson').Geometry} */ (matamF.geometry),
    Ratoma: /** @type {import('geojson').Geometry} */ (ratomaF.geometry),
  };

  const maneahF = byCoyah('maneah');
  if (!maneahF?.geometry) {
    throw new Error('GeoJSON : Maneah (Coyah, GN00500103) introuvable.');
  }
  out['Manéah'] = /** @type {import('geojson').Geometry} */ (maneahF.geometry);

  /** Périurbanisation est Grand Conakry : Wonkifong (Coyah) → Kagbelen ; Kouria → Sanoyah. */
  const wonkifongF = byCoyah('wonkifong');
  const kouriaF = byCoyah('kouria');
  if (!wonkifongF?.geometry) throw new Error('GeoJSON : Wonkifong introuvable (Kagbelen).');
  if (!kouriaF?.geometry) throw new Error('GeoJSON : Kouria introuvable (Sanoyah).');
  out.Kagbelen = /** @type {import('geojson').Geometry} */ (wonkifongF.geometry);
  out.Sanoyah = /** @type {import('geojson').Geometry} */ (kouriaF.geometry);

  const slices = await matotoLongitudeSlicesAsGeoJson(prisma, /** @type {object} */ (matotoF.geometry));

  /** Bandes ouest→est sur l’historique Matoto : Gbéssia, Tombolia, cœur Matoto, Lambanyi, Sonfonia. */
  out.Gbessia = slices.get(0);
  out.Tombolia = slices.get(1);
  out.Matoto = slices.get(2);
  out.Lambanyi = slices.get(3);
  out.Sonfonia = slices.get(4);

  out.Kassa = await kassaGeometryFromKaloum(prisma, /** @type {object} */ (kaloumF.geometry));

  return out;
}
