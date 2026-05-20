import { Router } from 'express';
import { parseCoordinates } from '../lib/geo.js';
import {
  findSectorAtCoordinates,
  listSectorsWithStatus,
} from '../services/sectors.js';

export const sectorsRouter = Router();

sectorsRouter.get('/current', async (req, res, next) => {
  try {
    const { latitude, longitude } = parseCoordinates(req.query.lat, req.query.lng);
    const sector = await findSectorAtCoordinates(latitude, longitude);

    if (!sector) {
      return res.json({
        sector: null,
        powerStatus: null,
        coordinates: { lat: latitude, lng: longitude },
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
