import { pool } from '../db/pool.js';
import { t } from '../bot/i18n.js';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const APPLY_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export async function sendTelegramMessage(chatId, text, replyMarkup) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN not set');
  }
  const body = { chat_id: chatId, text };
  if (replyMarkup) body.reply_markup = replyMarkup;
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || 'Telegram send failed');
  }
  return data;
}

async function answerCallbackQuery(callbackQueryId) {
  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId }),
    });
  } catch (err) {
    // non-critical
  }
}

function languageKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🇬🇧 English', callback_data: 'lang_en' },
        { text: '🇰🇭 ខ្មែរ', callback_data: 'lang_kh' },
      ],
    ],
  };
}

function mainMenuKeyboard(lang) {
  return {
    keyboard: [
      [t(lang, 'btnSubmitCv'), t(lang, 'btnMyApplication')],
      [t(lang, 'btnInterviewInfo'), t(lang, 'btnInterviewStatus')],
      [t(lang, 'btnContactHelp'), t(lang, 'btnChangeLanguage')],
    ],
    resize_keyboard: true,
  };
}

async function getBotUser(chatId) {
  const res = await pool.query('SELECT * FROM bot_users WHERE chat_id = $1', [String(chatId)]);
  return res.rows[0] || null;
}

async function upsertBotUser(chatId, fields) {
  const existing = await getBotUser(chatId);
  if (existing) {
    const sets = [];
    const params = [];
    Object.entries(fields).forEach(([k, v]) => {
      params.push(v);
      sets.push(`${k} = $${params.length}`);
    });
    params.push(String(chatId));
    await pool.query(`UPDATE bot_users SET ${sets.join(', ')} WHERE chat_id = $${params.length}`, params);
  } else {
    await pool.query(`INSERT INTO bot_users (chat_id, language, candidate_id) VALUES ($1, $2, $3)`, [
      String(chatId),
      fields.language || 'en',
      fields.candidate_id || null,
    ]);
  }
}

async function linkCandidate(chatId, candidateId) {
  await pool.query('UPDATE candidates SET telegram_chat_id = $1 WHERE id = $2', [String(chatId), candidateId]);
  await upsertBotUser(chatId, { candidate_id: candidateId });
}

async function findCandidateByPhone(digits) {
  const res = await pool.query(`SELECT * FROM candidates WHERE phone LIKE '%' || $1 || '%' LIMIT 1`, [digits]);
  return res.rows[0] || null;
}

async function latestApplication(candidateId) {
  const res = await pool.query('SELECT * FROM applications WHERE candidate_id = $1 ORDER BY created_at DESC LIMIT 1', [
    candidateId,
  ]);
  return res.rows[0] || null;
}

async function latestInterview(applicationId) {
  if (!applicationId) return null;
  const res = await pool.query('SELECT * FROM interviews WHERE application_id = $1 ORDER BY id DESC LIMIT 1', [
    applicationId,
  ]);
  return res.rows[0] || null;
}

async function showMainMenu(chatId, lang) {
  await sendTelegramMessage(chatId, t(lang, 'mainMenuPrompt'), mainMenuKeyboard(lang));
}

async function handleStart(chatId, payload) {
  let botUser = await getBotUser(chatId);
  let lang = botUser?.language || 'en';

  if (payload) {
    const candidateId = parseInt(payload, 10);
    if (!Number.isNaN(candidateId)) {
      const candRes = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
      if (candRes.rows.length > 0) {
        await linkCandidate(chatId, candidateId);
        botUser = await getBotUser(chatId);
        lang = botUser?.language || 'en';
        if (!botUser?.language) {
          await sendTelegramMessage(chatId, t('en', 'chooseLanguage'), languageKeyboard());
          return;
        }
        const name = candRes.rows[0].english_name || candRes.rows[0].khmer_name || '';
        await sendTelegramMessage(chatId, t(lang, 'connectedWelcome', { name }));
        await showMainMenu(chatId, lang);
        return;
      }
    }
  }

  if (!botUser) {
    await upsertBotUser(chatId, { language: 'en' });
    await sendTelegramMessage(chatId, t('en', 'chooseLanguage'), languageKeyboard());
    return;
  }

  await showMainMenu(chatId, lang);
}

async function handleLanguageChoice(chatId, lang, callbackQueryId) {
  await upsertBotUser(chatId, { language: lang });
  if (callbackQueryId) await answerCallbackQuery(callbackQueryId);
  await sendTelegramMessage(chatId, t(lang, 'languageSet'));
  await showMainMenu(chatId, lang);
}

async function handleMenuPress(chatId, text) {
  const botUser = await getBotUser(chatId);
  const lang = botUser?.language || 'en';
  const candidateId = botUser?.candidate_id;

  if (text === t(lang, 'btnChangeLanguage')) {
    await sendTelegramMessage(chatId, t(lang, 'chooseLanguage'), languageKeyboard());
    return true;
  }

  if (text === t(lang, 'btnContactHelp')) {
    await sendTelegramMessage(chatId, t(lang, 'contactHelp'));
    return true;
  }

  if (text === t(lang, 'btnSubmitCv')) {
    await sendTelegramMessage(chatId, t(lang, 'submitCvPrompt', { formUrl: APPLY_URL }));
    return true;
  }

  if (text === t(lang, 'btnMyApplication')) {
    if (!candidateId) {
      await sendTelegramMessage(chatId, t(lang, 'notLinkedYet', { formUrl: APPLY_URL }));
      return true;
    }
    const app = await latestApplication(candidateId);
    if (!app) {
      await sendTelegramMessage(chatId, t(lang, 'notLinkedYet', { formUrl: APPLY_URL }));
      return true;
    }
    await sendTelegramMessage(chatId, t(lang, 'myApplication', { position: app.position_applied, status: app.status }));
    return true;
  }

  if (text === t(lang, 'btnInterviewInfo')) {
    if (!candidateId) {
      await sendTelegramMessage(chatId, t(lang, 'notLinkedYet', { formUrl: APPLY_URL }));
      return true;
    }
    const app = await latestApplication(candidateId);
    const interview = app ? await latestInterview(app.id) : null;
    if (interview && interview.scheduled_at) {
      const d = new Date(interview.scheduled_at);
      await sendTelegramMessage(
        chatId,
        t(lang, 'interviewScheduled', {
          date: d.toLocaleDateString(),
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: interview.location,
        })
      );
    } else {
      await sendTelegramMessage(chatId, t(lang, 'interviewNotScheduled'));
    }
    return true;
  }

  if (text === t(lang, 'btnInterviewStatus')) {
    if (!candidateId) {
      await sendTelegramMessage(chatId, t(lang, 'notLinkedYet', { formUrl: APPLY_URL }));
      return true;
    }
    const app = await latestApplication(candidateId);
    await sendTelegramMessage(chatId, t(lang, 'interviewStatus', { status: app?.status }));
    return true;
  }

  return false;
}

let offset = 0;

async function pollTelegramUpdates() {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  try {
    const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=25`);
    const data = await res.json();
    if (!data.ok) return;

    for (const update of data.result) {
      offset = update.update_id + 1;

      if (update.callback_query) {
        const cq = update.callback_query;
        const chatId = cq.message.chat.id;
        if (cq.data === 'lang_en') await handleLanguageChoice(chatId, 'en', cq.id);
        else if (cq.data === 'lang_kh') await handleLanguageChoice(chatId, 'kh', cq.id);
        continue;
      }

      const msg = update.message;
      if (!msg || !msg.text) continue;
      const chatId = msg.chat.id;
      const text = msg.text.trim();

      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const payload = parts.length > 1 ? parts[1] : null;
        await handleStart(chatId, payload);
        continue;
      }

      const handledAsMenu = await handleMenuPress(chatId, text);
      if (handledAsMenu) continue;

      const digitsOnly = text.replace(/\D/g, '');
      if (digitsOnly.length >= 8) {
        const candidate = await findCandidateByPhone(digitsOnly.slice(-8));
        const botUser = await getBotUser(chatId);
        const lang = botUser?.language || 'en';
        if (candidate) {
          await linkCandidate(chatId, candidate.id);
          const name = candidate.english_name || candidate.khmer_name || '';
          await sendTelegramMessage(chatId, t(lang, 'connectedWelcome', { name }));
          await showMainMenu(chatId, lang);
        } else {
          await sendTelegramMessage(chatId, t(lang, 'notLinkedYet', { formUrl: APPLY_URL }));
        }
      }
    }
  } catch (err) {
    console.error('Telegram polling error:', err.message);
  }
}

export function startTelegramPolling() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('TELEGRAM_BOT_TOKEN not set — Telegram bot disabled');
    return;
  }
  console.log('Telegram bot polling started');
  setInterval(pollTelegramUpdates, 3000);
}