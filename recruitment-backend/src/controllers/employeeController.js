import { pool } from '../db/pool.js';

export async function listEmployees(req, res) {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT e.*, c.english_name, c.khmer_name, c.phone, c.cv_file_url
      FROM employees e
      JOIN candidates c ON c.id = e.candidate_id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND e.employment_status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.english_name ILIKE $${params.length} OR c.khmer_name ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
    }
    query += ' ORDER BY e.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while listing employees' });
  }
}

export async function getEmployee(req, res) {
  try {
    const { id } = req.params;
    const employee = await pool.query(
      `SELECT e.*, c.english_name, c.khmer_name, c.phone, c.cv_file_url, c.current_address
       FROM employees e JOIN candidates c ON c.id = e.candidate_id WHERE e.id = $1`,
      [id]
    );
    if (employee.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const payments = await pool.query(
      'SELECT * FROM salary_payments WHERE employee_id = $1 ORDER BY paid_at DESC',
      [id]
    );
    res.json({ employee: employee.rows[0], payments: payments.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching employee' });
  }
}

export async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { position, salary, employment_status } = req.body;
    const fields = [];
    const params = [];
    if (position !== undefined) {
      params.push(position);
      fields.push(`position = $${params.length}`);
    }
    if (salary !== undefined) {
      params.push(salary);
      fields.push(`salary = $${params.length}`);
    }
    if (employment_status !== undefined) {
      params.push(employment_status);
      fields.push(`employment_status = $${params.length}`);
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    params.push(id);
    const result = await pool.query(
      `UPDATE employees SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while updating employee' });
  }
}

export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while deleting employee' });
  }
}

export async function addPayment(req, res) {
  try {
    const { id } = req.params;
    const { amount, pay_period, notes } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' });
    }
    const result = await pool.query(
      `INSERT INTO salary_payments (employee_id, amount, pay_period, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, amount, pay_period || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while recording payment' });
  }
}