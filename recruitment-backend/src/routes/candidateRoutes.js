import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createCandidate, listCandidates, getCandidate, downloadCv } from '../controllers/candidateController.js';
import { requireAuth } from '../middleware/auth.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

const router = Router();

router.post('/', upload.single('cv'), createCandidate); // public
router.get('/', requireAuth, listCandidates);             // recruiter only
router.get('/:id', requireAuth, getCandidate);             // recruiter only
router.get('/:id/cv', requireAuth, downloadCv);            // recruiter only — authenticated download

export default router;