import { pool } from '../db/pool.js';

export async function getInterview(req, res) {
  try {
    const { id } = req.params; // application id
    const result = await pool.query(
      'SELECT * FROM interviews WHERE application_id = $1 ORDER BY id DESC LIMIT 1',
      [id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching interview' });
  }
}

export async function upsertInterview(req, res) {
  try {
    const { id } = req.params; // application id
    const { scheduled_at, location, notes } = req.body;
    const recruiterId = req.recruiter?.id;

    const existing = await pool.query(
      'SELECT id FROM interviews WHERE application_id = $1 ORDER BY id DESC LIMIT 1',
      [id]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE interviews SET scheduled_at = $1, location = $2, notes = $3, interviewer_id = $4 WHERE id = $5 RETURNING *`,
        [scheduled_at || null, location || null, notes || null, recruiterId, existing.rows[0].id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO interviews (application_id, scheduled_at, location, notes, interviewer_id)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [id, scheduled_at || null, location || null, notes || null, recruiterId]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while saving interview' });
  }
}