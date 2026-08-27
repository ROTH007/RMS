import { Router } from 'express';
import { updateApplicationStatus } from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.patch('/:id/status', requireAuth, updateApplicationStatus);

export default router;
