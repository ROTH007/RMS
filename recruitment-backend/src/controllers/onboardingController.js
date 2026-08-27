import { pool } from '../db/pool.js';

export async function submitOnboarding(req, res) {
  try {
    const {
      candidate_id,
      full_legal_name,
      date_of_birth,
      emergency_contact_name,
      emergency_contact_phone,
      bank_name,
      bank_account_number,
      start_date_preference,
      notes,
    } = req.body;

    if (!candidate_id || !full_legal_name) {
      return res.status(400).json({ error: 'candidate_id and full_legal_name are required' });
    }

    const result = await pool.query(
      `INSERT INTO onboarding_forms
        (candidate_id, full_legal_name, date_of_birth, emergency_contact_name, emergency_contact_phone, bank_name, bank_account_number, start_date_preference, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        candidate_id,
        full_legal_name,
        date_of_birth || null,
        emergency_contact_name,
        emergency_contact_phone,
        bank_name,
        bank_account_number,
        start_date_preference || null,
        notes,
      ]
    );
    res.status(201).json({ message: 'Onboarding info submitted', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while submitting onboarding info' });
  }
}

export async function listOnboarding(req, res) {
  try {
    const result = await pool.query(`
      SELECT o.*, c.english_name, c.khmer_name, c.phone
      FROM onboarding_forms o
      JOIN candidates c ON c.id = o.candidate_id
      ORDER BY o.submitted_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while listing onboarding submissions' });
  }
}

export async function exportOnboardingExcel(req, res) {
  try {
    const XLSX = await import('xlsx');
    const result = await pool.query(`
      SELECT
        c.english_name AS "English Name",
        c.khmer_name AS "Khmer Name",
        c.phone AS "Phone",
        o.full_legal_name AS "Full Legal Name",
        o.date_of_birth AS "Date of Birth",
        o.emergency_contact_name AS "Emergency Contact",
        o.emergency_contact_phone AS "Emergency Contact Phone",
        o.bank_name AS "Bank Name",
        o.bank_account_number AS "Bank Account Number",
        o.start_date_preference AS "Preferred Start Date",
        o.notes AS "Notes",
        o.submitted_at AS "Submitted At"
      FROM onboarding_forms o
      JOIN candidates c ON c.id = o.candidate_id
      ORDER BY o.submitted_at DESC
    `);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Onboarding');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="onboarding-export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while exporting to Excel' });
  }
}

export async function exportCandidatesExcel(req, res) {
  try {
    const XLSX = await import('xlsx');
    const result = await pool.query(`
      SELECT
        c.english_name AS "English Name",
        c.khmer_name AS "Khmer Name",
        c.phone AS "Phone",
        c.id_card_number AS "ID Card Number",
        c.current_address AS "Current Address",
        a.position_applied AS "Position Applied",
        a.status AS "Status",
        c.source AS "Source",
        a.created_at AS "Applied At"
      FROM candidates c
      JOIN applications a ON a.candidate_id = c.id
      ORDER BY a.created_at DESC
    `);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="candidates-export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while exporting candidates' });
  }
}