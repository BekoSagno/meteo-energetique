import { Router } from 'express';
import { requireEdgStaff } from '../middleware/auth.js';
import {
  getAdminOverview,
  listAdminOutbox,
  listAdminReports,
  listAdminUsers,
} from '../services/admin.js';

export const adminRouter = Router();

adminRouter.use(requireEdgStaff);

adminRouter.get('/overview', async (_req, res, next) => {
  try {
    const overview = await getAdminOverview();
    res.json({ overview });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await listAdminUsers();
    res.json({ users, count: users.length });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/reports', async (_req, res, next) => {
  try {
    const reports = await listAdminReports();
    res.json({ reports, count: reports.length });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/outbox', async (_req, res, next) => {
  try {
    const items = await listAdminOutbox();
    res.json({ items, count: items.length });
  } catch (error) {
    next(error);
  }
});
