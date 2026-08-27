import { Router } from 'express';
import { monthlyStats } from '../controllers/statsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/monthly', requireAuth, monthlyStats);

export default router;
