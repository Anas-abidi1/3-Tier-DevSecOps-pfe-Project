const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');

// Fail fast — this module should never run without a real secret.
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Promisify DB query
const query = util.promisify(db.query).bind(db);

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  // NOTE: `role` is intentionally NOT read from req.body.
  // Public self-registration must never let the caller choose their own role
  // (previously: `role || 'viewer'` let anyone register as 'admin').

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
    return res.status(400).json({ error: 'Invalid name' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      // Same status/shape as other errors — don't reveal whether the email exists
      // any more precisely than necessary.
      return res.status(409).json({ error: 'Registration failed' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'viewer']
    );

    res.status(201).json({ message: 'User registered', id: result.insertId });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const results = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
};
