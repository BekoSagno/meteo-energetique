import { Router } from 'express';
import { requireEdgStaff } from '../middleware/auth.js';
import {
  createInfoPublication,
  listAllInfoForStaff,
  listPublishedInfo,
} from '../services/info.js';

export const infoRouter = Router();

infoRouter.get('/', async (req, res, next) => {
  try {
    const items = await listPublishedInfo({ tab: req.query.tab });
    res.json({ items, count: items.length });
  } catch (error) {
    next(error);
  }
});

infoRouter.get('/admin', requireEdgStaff, async (_req, res, next) => {
  try {
    const items = await listAllInfoForStaff();
    res.json({ items, count: items.length });
  } catch (error) {
    next(error);
  }
});

infoRouter.post('/', requireEdgStaff, async (req, res, next) => {
  try {
    const result = await createInfoPublication(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
