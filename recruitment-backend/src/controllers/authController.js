import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';
import { signToken } from '../utils/jwt.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existing = await pool.query('SELECT id FROM recruiters WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO recruiters (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, passwordHash]
    );

    const recruiter = result.rows[0];
    const token = signToken({ id: recruiter.id, email: recruiter.email, role: recruiter.role });
    res.status(201).json({ recruiter, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await pool.query('SELECT * FROM recruiters WHERE email = $1', [email]);
    const recruiter = result.rows[0];
    if (!recruiter) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, recruiter.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: recruiter.id, email: recruiter.email, role: recruiter.role });
    res.json({
      recruiter: { id: recruiter.id, name: recruiter.name, email: recruiter.email, role: recruiter.role },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
}
