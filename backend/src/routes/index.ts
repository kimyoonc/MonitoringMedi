import { Router } from 'express';
import patientsRouter from './patients';
import plansRouter from './plans';
import visitsRouter from './visits';
import exchangesRouter from './exchanges';
import interactionsRouter from './interactions';
import dashboardRouter from './dashboard';
import notificationsRouter from './notifications';

export const router = Router();

router.use('/patients', patientsRouter);
router.use('/plans', plansRouter);
router.use('/visits', visitsRouter);
router.use('/exchanges', exchangesRouter);
router.use('/interactions', interactionsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/notifications', notificationsRouter);
