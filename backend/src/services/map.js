import { prisma } from '../lib/prisma.js';

import { COMMUNE_CENTERS, CONAKRY_MAP_BOUNDS } from '../lib/conakryCenters.js';



const VALID_MOMENTS = ['live', 'peak_yesterday', 'last_night'];



function createError(status, code, message) {

  const err = new Error(message);

  err.status = status;

  err.code = code;

  return err;

}



export function validateMapQuery(query) {

  const moment = String(query.moment ?? 'live').trim();

  if (!VALID_MOMENTS.includes(moment)) {

    throw createError(

      400,

      'VALIDATION_ERROR',

      `moment invalide. Valeurs : ${VALID_MOMENTS.join(', ')}`

    );

  }



  let date = query.date ? String(query.date).slice(0, 10) : null;

  if (!date) {

    date = new Date().toISOString().slice(0, 10);

  }



  return { moment, date };

}



/**
 * État communal = tendance majoritaire des secteurs (~70 % ONLINE attendu au seed).
 * Ne pas passer en UNSTABLE dès qu’un seul secteur est hors ligne.
 */
function aggregateCommuneState(counts) {
  const total = counts.online + counts.unstable + counts.offline + counts.unknown;
  if (total === 0) return { state: 'ONLINE', availability: 100 };

  const availability = Math.round(
    ((counts.online + counts.unstable * 0.5) / total) * 100
  );

  const onlineShare = counts.online / total;
  const offlineShare = counts.offline / total;
  const unstableShare = counts.unstable / total;

  if (offlineShare >= 0.35) {
    return { state: 'OFFLINE', availability };
  }

  if (
    unstableShare >= 0.25 &&
    unstableShare >= offlineShare &&
    unstableShare > onlineShare
  ) {
    return { state: 'UNSTABLE', availability: Math.max(availability - 8, 0) };
  }

  if (offlineShare >= 0.2 && offlineShare > onlineShare) {
    return { state: 'OFFLINE', availability };
  }

  if (unstableShare >= 0.15 && unstableShare > onlineShare) {
    return { state: 'UNSTABLE', availability: Math.max(availability - 8, 0) };
  }

  return { state: 'ONLINE', availability };
}



/** Variation déterministe pour les moments historiques (MVP). */

function applyMomentOverlay(commune, moment, date) {

  if (moment === 'live') return commune;



  const seed =

    commune.id * 17 +

    date.split('').reduce((a, c) => a + c.charCodeAt(0), 0) +

    (moment === 'peak_yesterday' ? 41 : 73);



  const roll = seed % 100;

  let state = commune.state;

  let availability = commune.availability;



  if (moment === 'peak_yesterday') {

    if (roll < 22) state = 'OFFLINE';

    else if (roll < 48) state = 'UNSTABLE';

    availability = Math.max(42, availability - 12 - (seed % 18));

  } else if (moment === 'last_night') {

    if (roll < 15) state = 'OFFLINE';

    else if (roll < 35) state = 'UNSTABLE';

    availability = Math.max(38, availability - 8 - (seed % 12));

  }



  return { ...commune, state, availability };

}



export async function getCommuneMapData({ moment, date, regionId } = {}) {

  const regionFilter =

    regionId != null

      ? `AND c.region_id = ${Number.parseInt(String(regionId), 10)}`

      : '';



  const rows = await prisma.$queryRawUnsafe(`

    SELECT

      c.id,

      c.name,

      COUNT(s.id)::int AS "sectorCount",

      COUNT(*) FILTER (WHERE ps.current_state = 'ONLINE')::int AS online,

      COUNT(*) FILTER (WHERE ps.current_state = 'UNSTABLE')::int AS unstable,

      COUNT(*) FILTER (WHERE ps.current_state = 'OFFLINE')::int AS offline,

      COUNT(*) FILTER (WHERE ps.current_state IS NULL)::int AS unknown,

      (

        SELECT s2.id

        FROM sectors s2

        LEFT JOIN power_status ps2 ON ps2.sector_id = s2.id

        WHERE s2.commune_id = c.id AND s2.boundary IS NOT NULL

        ORDER BY

          CASE COALESCE(ps2.current_state, 'ONLINE')

            WHEN 'OFFLINE' THEN 3

            WHEN 'UNSTABLE' THEN 2

            ELSE 1

          END DESC,

          s2.id ASC

        LIMIT 1

      ) AS "representativeSectorId"

    FROM communes c

    INNER JOIN sectors s ON s.commune_id = c.id

    LEFT JOIN power_status ps ON ps.sector_id = s.id

    WHERE s.boundary IS NOT NULL

    ${regionFilter}

    GROUP BY c.id, c.name

    ORDER BY c.id ASC

  `);



  let communes = rows.map((row) => {

    const counts = {

      online: row.online,

      unstable: row.unstable,

      offline: row.offline,

      unknown: row.unknown,

    };

    const { state, availability } = aggregateCommuneState(counts);

    const center = COMMUNE_CENTERS[row.name] ?? { lat: 9.565, lng: -13.62 };



    return {

      id: Number(row.id),

      name: row.name,

      lat: center.lat,

      lng: center.lng,

      geometryKind: 'point',

      sectorCount: row.sectorCount,

      state,

      availability,

      representativeSectorId: row.representativeSectorId

        ? Number(row.representativeSectorId)

        : null,

      counts,

    };

  });



  communes = communes.map((c) => applyMomentOverlay(c, moment, date));



  return {

    moment,

    date,

    communes,

    bounds: CONAKRY_MAP_BOUNDS,

  };

}

