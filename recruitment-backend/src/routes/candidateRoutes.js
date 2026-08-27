import { Router } from 'express';
import multer from 'multer';
import { createCandidate, listCandidates, getCandidate } from '../controllers/candidateController.js';
import { requireAuth } from '../middleware/auth.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/', upload.single('cv'), createCandidate); // public
router.get('/', requireAuth, listCandidates);            // recruiter only
router.get('/:id', requireAuth, getCandidate);           // recruiter only

export default router;
