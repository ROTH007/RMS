import { Router } from 'express';
import { getInterview, upsertInterview } from '../controllers/interviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:id', requireAuth, getInterview); // :id = application id
router.put('/:id', requireAuth, upsertInterview);

export default router;