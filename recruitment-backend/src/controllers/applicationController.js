import { pool } from '../db/pool.js';

const VALID_STATUSES = [
  'submitted', 'shortlisted', 'interview_scheduled', 'interviewed', 'passed', 'hired', 'rejected',
];

export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const recruiterId = req.recruiter?.id;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const current = await pool.query('SELECT status FROM applications WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const oldStatus = current.rows[0].status;

    await pool.query(
      'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    await pool.query(
      `INSERT INTO status_history (application_id, old_status, new_status, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [id, oldStatus, status, recruiterId]
    );

    res.json({ message: 'Status updated', old_status: oldStatus, new_status: status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while updating status' });
  }
}
