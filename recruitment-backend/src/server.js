import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { startTelegramPolling } from './utils/telegram.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/interviews', interviewRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'Recruitment API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startTelegramPolling();
});