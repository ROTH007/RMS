import { Router } from 'express';
import { draftMessage, sendMessageToCandidate } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/draft', requireAuth, draftMessage);
router.post('/send', requireAuth, sendMessageToCandidate);

export default router;