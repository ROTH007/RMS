import { pool } from '../db/pool.js';

export async function monthlyStats(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('month', a.created_at) AS month,
        COUNT(*) AS submitted,
        COUNT(*) FILTER (WHERE a.status IN ('shortlisted','interview_scheduled','interviewed','passed','hired')) AS shortlisted,
        COUNT(*) FILTER (WHERE a.status IN ('interview_scheduled','interviewed','passed','hired')) AS interview_scheduled,
        COUNT(*) FILTER (WHERE a.status IN ('interviewed','passed','hired')) AS interviewed,
        COUNT(*) FILTER (WHERE a.status IN ('passed','hired')) AS passed,
        COUNT(*) FILTER (WHERE a.status = 'hired') AS hired
      FROM applications a
      GROUP BY 1
      ORDER BY 1 DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while computing stats' });
  }
}
