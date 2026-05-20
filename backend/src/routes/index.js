import { Router } from 'express';
import { authRouter } from './auth.js';
import { communesRouter } from './communes.js';
import { healthRouter } from './health.js';
import { mapRouter } from './map.js';
import { quartiersRouter } from './quartiers.js';
import { regionsRouter } from './regions.js';
import { reportsRouter } from './reports.js';
import { sectorsRouter } from './sectors.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    name: 'Météo Énergétique API',
    version: '1.0.0',
  });
});

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/regions', regionsRouter);
apiRouter.use('/communes', communesRouter);
apiRouter.use('/quartiers', quartiersRouter);
apiRouter.use('/sectors', sectorsRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/map', mapRouter);
