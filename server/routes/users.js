const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/users (Admin only)
router.get('/', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = 'SELECT user_id, name, email, role FROM users WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (role && role.trim()) {
      query += ' AND role = ?';
      params.push(role.trim());
    }

    query += ' ORDER BY user_id DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// POST /api/users (Admin only)
router.post('/', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'All fields (name, email, role, password) are required.' });
    }

    if (!['Admin', 'Faculty', 'Student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be Admin, Faculty, or Student.' });
    }

    // Check existing email
    const [existing] = await pool.execute('SELECT user_id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: `A user with email '${email}' already exists.` });
    }

    const hashed = bcrypt.hashSync(password.trim(), 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashed, role]
    );

    res.status(201).json({
      message: `User '${name}' (${role}) registered successfully!`,
      user_id: result.insertId
    });
  } catch (err) {
    console.error('Register user error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// DELETE /api/users/:id (Admin only)
router.delete('/:id', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);

    if (targetId === req.user.user_id) {
      return res.status(400).json({ error: 'You cannot delete your own logged-in administrator account.' });
    }

    // Check if user has active issued equipment
    const [active] = await pool.execute(
      "SELECT COUNT(*) AS count FROM issue_records WHERE user_id = ? AND status = 'ISSUED'",
      [targetId]
    );

    if (active[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user: User currently has active issued equipment that must be returned first.' 
      });
    }

    // Delete user issue records history first, then user
    await pool.execute('DELETE FROM issue_records WHERE user_id = ?', [targetId]);
    await pool.execute('DELETE FROM users WHERE user_id = ?', [targetId]);

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user account.' });
  }
});

module.exports = router;

