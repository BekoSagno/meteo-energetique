import { Router } from 'express';
import { getCommuneMapData, validateMapQuery } from '../services/map.js';

export const mapRouter = Router();

/**
 * GET /api/map/communes
 * Query: moment=live|peak_yesterday|last_night, date=YYYY-MM-DD, regionId?
 */
mapRouter.get('/communes', async (req, res, next) => {
  try {
    const { moment, date } = validateMapQuery(req.query);
    const data = await getCommuneMapData({
      moment,
      date,
      regionId: req.query.regionId,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});
