import { Router } from 'express';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { submitUserReport } from '../services/reports.js';

export const reportsRouter = Router();

/**
 * POST /api/reports
 * Signalement anonyme : { reportType, lat, lng } — aucun OTP ni JWT requis.
 * JWT optionnel : si fourni, le signalement est lié au compte (user_id non null).
 */
reportsRouter.post('/', optionalAuth, async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.userId != null) {
      payload.userId = req.userId;
    }
    const result = await submitUserReport(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
