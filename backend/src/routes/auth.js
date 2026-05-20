import { Router } from 'express';
import { requestOtp, verifyOtpAndLogin } from '../services/auth.js';

export const authRouter = Router();

/**
 * POST /api/auth/request-otp
 * Body: { phoneNumber: "612345678" | "+224612345678" }
 */
authRouter.post('/request-otp', async (req, res, next) => {
  try {
    const result = await requestOtp(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { phoneNumber, code: "1234" }
 */
authRouter.post('/verify-otp', async (req, res, next) => {
  try {
    const result = await verifyOtpAndLogin(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
