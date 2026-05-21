import { Router } from 'express';
import { loginWithPhone } from '../services/auth.js';

export const authRouter = Router();

/**
 * POST /api/auth/login
 * Body: { phoneNumber: "612345678" | "+224612345678" }
 * Connexion immédiate — aucun code SMS.
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    const result = await loginWithPhone(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
