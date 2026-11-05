const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// POST /api/requests (Student & Faculty submit request)
router.post('/', verifyToken, checkRole('Student', 'Faculty'), async (req, res) => {
  try {
    const { equipment_id, quantity } = req.body;
    const userId = req.user.user_id;

    if (!equipment_id || !quantity) {
      return res.status(400).json({ error: 'Equipment ID and quantity are required.' });
    }

    const reqQty = parseInt(quantity, 10);
    if (isNaN(reqQty) || reqQty <= 0) {
      return res.status(400).json({ error: 'Requested quantity must be at least 1.' });
    }

    // Check equipment availability
    const [eqRows] = await pool.execute('SELECT * FROM equipment WHERE equipment_id = ?', [equipment_id]);
    if (eqRows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found.' });
    }

    const eq = eqRows[0];
    if (eq.status !== 'Available') {
      return res.status(400).json({ error: `Equipment '${eq.name}' is currently ${eq.status} and cannot be requested.` });
    }

    if (reqQty > eq.available_quantity) {
      return res.status(400).json({ 
        error: `Cannot request ${reqQty} units. Only ${eq.available_quantity} units are currently available.` 
      });
    }

    // Check pending request
    const [pending] = await pool.execute(
      "SELECT issue_id FROM issue_records WHERE equipment_id = ? AND user_id = ? AND status = 'REQUESTED'",
      [equipment_id, userId]
    );

    if (pending.length > 0) {
      return res.status(400).json({ 
        error: `You already have a pending requisition for '${eq.name}'. Please await Admin approval.` 
      });
    }

    // Insert record with status 'REQUESTED'
    const [result] = await pool.execute(
      'INSERT INTO issue_records (equipment_id, user_id, issue_date, return_date, quantity, status) VALUES (?, ?, NULL, NULL, ?, ?)',
      [equipment_id, userId, reqQty, 'REQUESTED']
    );

    res.status(201).json({
      message: `Equipment requisition for ${reqQty}x '${eq.name}' submitted successfully! Awaiting Admin review.`,
      issue_id: result.insertId
    });
  } catch (err) {
    console.error('Submit request error:', err);
    res.status(500).json({ error: 'Failed to submit equipment request.' });
  }
});

// GET /api/requests (Admin: view all requests)
router.get('/', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        ir.*, e.name AS equipment_name, e.category, e.available_quantity,
        u.name AS user_name, u.email AS user_email, u.role AS user_role
      FROM issue_records ir
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      JOIN users u ON ir.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      query += ' AND ir.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ir.issue_id DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Fetch requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve requests.' });
  }
});

// GET /api/requests/my (Student & Faculty personal requests)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ir.*, e.name AS equipment_name, e.category, e.available_quantity
      FROM issue_records ir
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      WHERE ir.user_id = ?
      ORDER BY ir.issue_id DESC
    `, [req.user.user_id]);

    res.json(rows);
  } catch (err) {
    console.error('Fetch my requests error:', err);
    res.status(500).json({ error: 'Failed to retrieve your request history.' });
  }
});

// PATCH /api/requests/:id/approve (Admin)
router.patch('/:id/approve', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const issueId = req.params.id;

    const [rows] = await pool.execute(`
      SELECT ir.*, e.name AS equipment_name, e.available_quantity
      FROM issue_records ir 
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      WHERE ir.issue_id = ?
    `, [issueId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    const rec = rows[0];
    if (rec.status !== 'REQUESTED') {
      return res.status(400).json({ error: `Cannot approve request with current status '${rec.status}'.` });
    }

    if (rec.available_quantity < rec.quantity) {
      return res.status(400).json({ 
        error: `Insufficient inventory! Only ${rec.available_quantity} available, but ${rec.quantity} requested.` 
      });
    }

    await pool.execute("UPDATE issue_records SET status = 'APPROVED' WHERE issue_id = ?", [issueId]);

    res.json({ message: `Request #${issueId} for '${rec.equipment_name}' approved successfully!` });
  } catch (err) {
    console.error('Approve request error:', err);
    res.status(500).json({ error: 'Failed to approve request.' });
  }
});

// PATCH /api/requests/:id/reject (Admin)
router.patch('/:id/reject', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const issueId = req.params.id;
    await pool.execute("UPDATE issue_records SET status = 'REJECTED' WHERE issue_id = ?", [issueId]);
    res.json({ message: `Request #${issueId} has been rejected.` });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ error: 'Failed to reject request.' });
  }
});

module.exports = router;

