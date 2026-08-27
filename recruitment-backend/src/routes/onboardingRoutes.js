import { Router } from 'express';
import {
  submitOnboarding,
  listOnboarding,
  exportOnboardingExcel,
  exportCandidatesExcel,
} from '../controllers/onboardingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', submitOnboarding); // public — candidate submits
router.get('/', requireAuth, listOnboarding); // recruiter view
router.get('/export', requireAuth, exportOnboardingExcel); // recruiter Excel download
router.get('/export-candidates', requireAuth, exportCandidatesExcel); // recruiter Excel download — candidate pipeline

export default router;