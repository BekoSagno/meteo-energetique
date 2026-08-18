import { Router } from 'express';
import {
  requestAdminOtp,
  requestLoginOtp,
  startRegistration,
  verifyOtpAndComplete,
} from '../services/auth.js';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Body: { firstName, lastName, phoneNumber, communeId, quartierId, sectorId, notifySms?, notifyWhatsapp? }
 */
authRouter.post('/register', async (req, res, next) => {
  try {
    const result = await startRegistration(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/request-otp
 * Body: { phoneNumber } — connexion d’un compte existant.
 */
authRouter.post('/request-otp', async (req, res, next) => {
  try {
    const result = await requestLoginOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/admin/request-otp', async (req, res, next) => {
  try {
    const result = await requestAdminOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { phoneNumber, code, purpose: "register" | "login" | "admin" }
 */
authRouter.post('/verify-otp', async (req, res, next) => {
  try {
    const result = await verifyOtpAndComplete(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
