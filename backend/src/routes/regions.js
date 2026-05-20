import { Router } from 'express';
import { listRegions } from '../services/regions.js';

export const regionsRouter = Router();

regionsRouter.get('/', async (_req, res, next) => {
  try {
    const regions = await listRegions();
    res.json({ regions, count: regions.length });
  } catch (error) {
    next(error);
  }
});
