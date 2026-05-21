import { Router } from 'express';
import {
  isWithinGrandConakryCoverage,
  isWithinGuinea,
} from '../lib/conakryBounds.js';
import { parseCoordinates } from '../lib/geo.js';
import {
  findSectorAtCoordinates,
  listSectorsWithStatus,
} from '../services/sectors.js';

export const sectorsRouter = Router();

sectorsRouter.get('/current', async (req, res, next) => {
  try {
    const { latitude, longitude } = parseCoordinates(req.query.lat, req.query.lng);

    if (!isWithinGrandConakryCoverage(latitude, longitude)) {
      return res.json({
        sector: null,
        powerStatus: null,
        coordinates: { lat: latitude, lng: longitude },
        inCoverage: false,
        outOfGuinea: !isWithinGuinea(latitude, longitude),
        message:
          'Position hors du Grand Conakry couvert. Utilisez la carte ou la recherche pour explorer le réseau.',
      });
    }

    const sector = await findSectorAtCoordinates(latitude, longitude);

    if (!sector) {
      return res.json({
        sector: null,
        powerStatus: null,
        coordinates: { lat: latitude, lng: longitude },
        inCoverage: true,
        outOfGuinea: false,
        message:
          'Aucun secteur cartographié ne correspond à votre position. Vous êtes peut-être en dehors des zones couvertes.',
      });
    }

    res.json({
      sector: {
        id: sector.id,
        name: sector.name,
        regionId: sector.regionId,
        communeId: sector.communeId,
        quartierId: sector.quartierId,
        region: sector.region,
        commune: sector.commune,
        quartier: sector.quartier,
      },
      powerStatus: sector.powerStatus,
      coordinates: { lat: latitude, lng: longitude },
      inCoverage: true,
      outOfGuinea: false,
    });
  } catch (error) {
    next(error);
  }
});

sectorsRouter.get('/', async (req, res, next) => {
  try {
    const sectors = await listSectorsWithStatus({
      quartierId: req.query.quartierId,
      communeId: req.query.communeId,
      regionId: req.query.regionId,
    });
    res.json({ sectors, count: sectors.length });
  } catch (error) {
    next(error);
  }
});
