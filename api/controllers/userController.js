const db = require('../models/db');
const bcrypt = require('bcryptjs');
const util = require('util');

const query = util.promisify(db.query).bind(db);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const results = await query('SELECT id, name, email, role FROM users');
    res.json(results);
  } catch (err) {
    console.error('getAllUsers Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// CREATE new user
exports.addUser = async (req, res) => {
  const { name, email, password } = req.body;
  // `role` intentionally ignored here too — new users created through this
  // endpoint always default to 'viewer'; role changes should be a separate,
  // admin-only action if you need one.

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'A user with that email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'viewer']
    );

    res.status(201).json({ id: result.insertId, name, email, role: 'viewer' });
  } catch (err) {
    console.error('addUser Error:', err.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// UPDATE user
exports.updateUser = async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const result = await query('UPDATE users SET name = ?, email = ? WHERE id = ?', [
      name,
      email,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id, name, email });
  } catch (err) {
    console.error('updateUser Error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const result = await query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser Error:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
