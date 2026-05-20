import { Router } from 'express';
import { listCommunesByRegion } from '../services/communes.js';

export const communesRouter = Router();

communesRouter.get('/', async (req, res, next) => {
  try {
    const communes = await listCommunesByRegion(req.query.regionId);
    res.json({ communes, count: communes.length });
  } catch (error) {
    next(error);
  }
});
