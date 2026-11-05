const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/issuereturn (Admin only)
router.get('/', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    // 1. Approved requests waiting to be handed out
    const [approvedRequests] = await pool.execute(`
      SELECT 
        ir.*, e.name AS equipment_name, e.category, e.available_quantity,
        u.name AS user_name, u.email AS user_email, u.role AS user_role
      FROM issue_records ir
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      JOIN users u ON ir.user_id = u.user_id
      WHERE ir.status = 'APPROVED'
      ORDER BY ir.issue_id ASC
    `);

    // 2. Currently issued items waiting to be returned
    const [issuedItems] = await pool.execute(`
      SELECT 
        ir.*, e.name AS equipment_name, e.category,
        u.name AS user_name, u.email AS user_email, u.role AS user_role
      FROM issue_records ir
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      JOIN users u ON ir.user_id = u.user_id
      WHERE ir.status = 'ISSUED'
      ORDER BY ir.return_date ASC, ir.issue_id DESC
    `);

    // 3. Available equipment for direct counter issue
    const [availableEquipment] = await pool.execute(`
      SELECT * FROM equipment WHERE available_quantity > 0 AND status = 'Available' ORDER BY name
    `);

    // 4. Student and faculty users for direct issue
    const [usersList] = await pool.execute(`
      SELECT user_id, name, email, role FROM users WHERE role IN ('Student', 'Faculty') ORDER BY name
    `);

    res.json({
      approved_requests: approvedRequests,
      issued_items: issuedItems,
      equipment_list: availableEquipment,
      users_list: usersList
    });
  } catch (err) {
    console.error('Fetch issue/return desk error:', err);
    res.status(500).json({ error: 'Failed to retrieve issue and return records.' });
  }
});

// POST /api/issuereturn/issue/:id (Admin: issue approved item with transaction)
router.post('/issue/:id', verifyToken, checkRole('Admin'), async (req, res) => {
  let conn;
  try {
    const issueId = req.params.id;
    let { return_date } = req.body;

    if (!return_date) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return_date = d.toISOString().split('T')[0];
    }

    const todayStr = new Date().toISOString().split('T')[0];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.execute(`
      SELECT ir.*, e.name AS equipment_name, e.available_quantity
      FROM issue_records ir 
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      WHERE ir.issue_id = ? FOR UPDATE
    `, [issueId]);

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Record not found.' });
    }

    const rec = rows[0];
    if (!['APPROVED', 'REQUESTED'].includes(rec.status)) {
      await conn.rollback();
      return res.status(400).json({ error: `Cannot issue item with status '${rec.status}'.` });
    }

    if (rec.available_quantity < rec.quantity) {
      await conn.rollback();
      return res.status(400).json({ 
        error: `Cannot issue: Only ${rec.available_quantity} available, but ${rec.quantity} required.` 
      });
    }

    // 1. Update issue_records
    await conn.execute(
      "UPDATE issue_records SET status = 'ISSUED', issue_date = ?, return_date = ? WHERE issue_id = ?",
      [todayStr, return_date, issueId]
    );

    // 2. Decrement equipment available_quantity and update status if 0
    await conn.execute(`
      UPDATE equipment 
      SET available_quantity = available_quantity - ?,
          status = CASE WHEN (available_quantity - ?) = 0 THEN 'In Use' ELSE status END
      WHERE equipment_id = ?
    `, [rec.quantity, rec.quantity, rec.equipment_id]);

    await conn.commit();
    res.json({ 
      message: `Equipment '${rec.equipment_name}' (${rec.quantity} units) issued successfully! Due on ${return_date}.` 
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Issue equipment error:', err);
    res.status(500).json({ error: 'Failed to issue equipment due to transaction error.' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/issuereturn/direct (Admin: direct counter issue with transaction)
router.post('/direct', verifyToken, checkRole('Admin'), async (req, res) => {
  let conn;
  try {
    const { equipment_id, user_id, quantity, return_date } = req.body;

    if (!equipment_id || !user_id || !quantity) {
      return res.status(400).json({ error: 'Equipment, user, and quantity are required.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than zero.' });
    }

    let dueDate = return_date;
    if (!dueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      dueDate = d.toISOString().split('T')[0];
    }

    const todayStr = new Date().toISOString().split('T')[0];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [eqRows] = await conn.execute(
      'SELECT * FROM equipment WHERE equipment_id = ? FOR UPDATE',
      [equipment_id]
    );

    if (eqRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Selected equipment does not exist.' });
    }

    const eq = eqRows[0];
    if (eq.available_quantity < qty) {
      await conn.rollback();
      return res.status(400).json({ error: `Cannot issue: Only ${eq.available_quantity} units available.` });
    }

    // Insert issue record
    const [insResult] = await conn.execute(`
      INSERT INTO issue_records (equipment_id, user_id, issue_date, return_date, quantity, status)
      VALUES (?, ?, ?, ?, ?, 'ISSUED')
    `, [equipment_id, user_id, todayStr, dueDate, qty]);

    // Decrement equipment stock
    await conn.execute(`
      UPDATE equipment 
      SET available_quantity = available_quantity - ?,
          status = CASE WHEN (available_quantity - ?) = 0 THEN 'In Use' ELSE status END
      WHERE equipment_id = ?
    `, [qty, qty, equipment_id]);

    await conn.commit();
    res.status(201).json({ 
      message: `Direct issue completed! ${qty} unit(s) of '${eq.name}' issued.`,
      issue_id: insResult.insertId
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Direct issue error:', err);
    res.status(500).json({ error: 'Failed to record direct issue.' });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/issuereturn/return/:id (Admin: process return with transaction)
router.post('/return/:id', verifyToken, checkRole('Admin'), async (req, res) => {
  let conn;
  try {
    const issueId = req.params.id;
    const { condition } = req.body; // 'Good' or 'Damaged'
    const todayStr = new Date().toISOString().split('T')[0];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.execute(`
      SELECT ir.*, e.name AS equipment_name, e.status AS current_eq_status
      FROM issue_records ir 
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      WHERE ir.issue_id = ? FOR UPDATE
    `, [issueId]);

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Record not found.' });
    }

    const rec = rows[0];
    if (rec.status !== 'ISSUED') {
      await conn.rollback();
      return res.status(400).json({ error: `Record #${issueId} is not currently in ISSUED status.` });
    }

    const qty = rec.quantity;
    const eqId = rec.equipment_id;

    if (condition === 'Good' || !condition) {
      // Normal return: restore available quantity
      await conn.execute(
        "UPDATE issue_records SET status = 'RETURNED', return_date = ? WHERE issue_id = ?",
        [todayStr, issueId]
      );
      await conn.execute(`
        UPDATE equipment 
        SET available_quantity = available_quantity + ?,
            status = CASE WHEN status = 'In Use' THEN 'Available' ELSE status END
        WHERE equipment_id = ?
      `, [qty, eqId]);

      await conn.commit();
      res.json({ message: `Equipment '${rec.equipment_name}' (${qty} units) returned in good condition. Stock restored!` });
    } else {
      // Damaged return: flag DAMAGED, do not restore stock to available
      await conn.execute(
        "UPDATE issue_records SET status = 'DAMAGED', return_date = ? WHERE issue_id = ?",
        [todayStr, issueId]
      );
      await conn.execute(
        "UPDATE equipment SET status = 'Damaged' WHERE equipment_id = ?",
        [eqId]
      );

      await conn.commit();
      res.json({ message: `Equipment '${rec.equipment_name}' returned as DAMAGED. Stock not restored, flagged for repair.` });
    }
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Return equipment error:', err);
    res.status(500).json({ error: 'Failed to process return transaction.' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;

