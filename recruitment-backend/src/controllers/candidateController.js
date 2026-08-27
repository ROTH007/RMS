import { pool } from '../db/pool.js';

// Public: candidate submits CV or QR intake form
export async function createCandidate(req, res) {
  try {
    const {
      khmer_name, english_name, id_card_number, id_card_expiration,
      current_address, phone, position_applied, source,
    } = req.body;

    const cv_file_url = req.file ? `/uploads/${req.file.filename}` : null;

    const candidateResult = await pool.query(
      `INSERT INTO candidates
        (khmer_name, english_name, id_card_number, id_card_expiration, current_address, phone, cv_file_url, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [khmer_name, english_name, id_card_number, id_card_expiration || null, current_address, phone, cv_file_url, source || 'web_form']
    );

    const candidateId = candidateResult.rows[0].id;

    await pool.query(
      `INSERT INTO applications (candidate_id, position_applied, status) VALUES ($1, $2, 'submitted')`,
      [candidateId, position_applied || null]
    );

    res.status(201).json({ message: 'Application submitted', candidate_id: candidateId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while submitting candidate' });
  }
}

// Recruiter: list candidates with their latest application status
export async function listCandidates(req, res) {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT c.*, a.id AS application_id, a.status, a.position_applied, a.created_at AS applied_at
      FROM candidates c
      JOIN applications a ON a.candidate_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.english_name ILIKE $${params.length} OR c.khmer_name ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while listing candidates' });
  }
}

export async function getCandidate(req, res) {
  try {
    const { id } = req.params;
    const candidate = await pool.query('SELECT * FROM candidates WHERE id = $1', [id]);
    if (candidate.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    const applications = await pool.query(
      'SELECT * FROM applications WHERE candidate_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json({ candidate: candidate.rows[0], applications: applications.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching candidate' });
  }
}
