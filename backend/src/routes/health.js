import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { isMqttConnected } from '../mqtt/client.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        mqtt: isMqttConnected() ? 'up' : 'down',
      },
    });
  } catch (error) {
    next(error);
  }
});
