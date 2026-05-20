import { Router } from 'express';
import { listQuartiersByCommune } from '../services/quartiers.js';

export const quartiersRouter = Router();

quartiersRouter.get('/', async (req, res, next) => {
  try {
    const quartiers = await listQuartiersByCommune(req.query.communeId);
    res.json({ quartiers, count: quartiers.length });
  } catch (error) {
    next(error);
  }
});
