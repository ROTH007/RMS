import { pool } from '../db/pool.js';
import { sendTelegramMessage } from '../utils/telegram.js';
import { t } from '../bot/i18n.js';

async function getCandidateLanguage(candidateId) {
  const res = await pool.query(
    'SELECT language FROM bot_users WHERE candidate_id = $1 ORDER BY created_at DESC LIMIT 1',
    [candidateId]
  );
  return res.rows[0]?.language || 'en';
}

async function getInterview(applicationId) {
  if (!applicationId) return null;
  const res = await pool.query('SELECT * FROM interviews WHERE application_id = $1 ORDER BY id DESC LIMIT 1', [
    applicationId,
  ]);
  return res.rows[0] || null;
}

export async function draftMessage(req, res) {
  try {
    const { candidateId, applicationId, messageType } = req.body;
    const candidateRes = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (candidateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    const candidate = candidateRes.rows[0];
    const name = candidate.english_name || candidate.khmer_name || 'there';
    const lang = await getCandidateLanguage(candidateId);

    let content = '';
    if (messageType === 'interview_invite') {
      const interview = await getInterview(applicationId);
      content = t(lang, 'draftInterviewInvite', { name, interview });
    } else if (messageType === 'orientation_invite') {
      const onboardingLink = `${process.env.CLIENT_URL}/onboarding?candidate=${candidateId}`;
      content = t(lang, 'draftOrientationInvite', { name, link: onboardingLink });
    } else if (messageType === 'not_passed') {
      content = t(lang, 'draftNotPassed', { name });
    } else if (messageType === 'further_interview') {
      content = t(lang, 'draftFurtherInterview', { name });
    } else if (messageType === 'selected') {
      content = t(lang, 'draftSelected', { name });
    }

    res.json({ content, language: lang });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while drafting message' });
  }
}

export async function sendMessageToCandidate(req, res) {
  try {
    const { candidateId, applicationId, messageType, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const candidateRes = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (candidateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    const candidate = candidateRes.rows[0];

    let delivery_status = 'no_telegram_linked';
    if (candidate.telegram_chat_id) {
      try {
        await sendTelegramMessage(candidate.telegram_chat_id, content);
        delivery_status = 'sent';
      } catch (err) {
        delivery_status = 'failed';
      }
    }

    const logged = await pool.query(
      `INSERT INTO messages (candidate_id, application_id, message_type, content, delivery_status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [candidateId, applicationId, messageType || 'custom', content, delivery_status]
    );

    res.json(logged.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while sending message' });
  }
}