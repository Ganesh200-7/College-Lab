const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/dashboard/admin
router.get('/admin', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    // 1. Equipment Summary
    const [eqSummary] = await pool.execute(`
      SELECT 
        COALESCE(SUM(quantity), 0) AS total_qty,
        COUNT(*) AS total_types,
        COALESCE(SUM(available_quantity), 0) AS total_avail
      FROM equipment
    `);

    // 2. Issued Equipment
    const [issuedSummary] = await pool.execute(`
      SELECT 
        COUNT(*) AS active_records,
        COALESCE(SUM(quantity), 0) AS issued_qty
      FROM issue_records 
      WHERE status = 'ISSUED'
    `);

    // 3. User counts
    const [usersSummary] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN role = 'Student' THEN 1 ELSE 0 END) AS total_students,
        SUM(CASE WHEN role = 'Faculty' THEN 1 ELSE 0 END) AS total_faculty
      FROM users
    `);

    // 4. Pending Requests
    const [pendingSummary] = await pool.execute(`
      SELECT COUNT(*) AS count FROM issue_records WHERE status = 'REQUESTED'
    `);

    // 5. Damaged Equipment
    const [damagedSummary] = await pool.execute(`
      SELECT 
        COUNT(*) AS count, 
        COALESCE(SUM(quantity), 0) AS qty 
      FROM equipment 
      WHERE status = 'Damaged'
    `);

    // 6. Category breakdown for Chart.js
    const [categories] = await pool.execute(`
      SELECT category, COALESCE(SUM(quantity), 0) AS total_qty
      FROM equipment
      GROUP BY category
      ORDER BY total_qty DESC
    `);

    // 7. Status breakdown for Chart.js
    const [statuses] = await pool.execute(`
      SELECT status, COUNT(*) AS count, COALESCE(SUM(quantity), 0) AS total
      FROM equipment
      GROUP BY status
    `);

    // 8. Recent 6 Transactions
    const [recentActivity] = await pool.execute(`
      SELECT 
        ir.issue_id, ir.quantity, ir.issue_date, ir.return_date, ir.status,
        e.name AS equipment_name, e.category,
        u.name AS user_name, u.role AS user_role
      FROM issue_records ir
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      JOIN users u ON ir.user_id = u.user_id
      ORDER BY ir.issue_id DESC
      LIMIT 6
    `);

    res.json({
      stats: {
        total_equipment: parseInt(eqSummary[0].total_qty, 10),
        equipment_types: parseInt(eqSummary[0].total_types, 10),
        available_equipment: parseInt(eqSummary[0].total_avail, 10),
        issued_equipment: parseInt(issuedSummary[0].issued_qty, 10),
        total_students: parseInt(usersSummary[0].total_students || 0, 10),
        total_faculty: parseInt(usersSummary[0].total_faculty || 0, 10),
        pending_requests: parseInt(pendingSummary[0].count, 10),
        damaged_equipment: parseInt(damagedSummary[0].qty, 10)
      },
      category_data: categories,
      status_data: statuses,
      recent_activity: recentActivity
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin dashboard data.' });
  }
});

// GET /api/dashboard/user (For Students and Faculty)
router.get('/user', verifyToken, async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [activeIssued] = await pool.execute(
      "SELECT COUNT(*) AS count, COALESCE(SUM(quantity), 0) AS total_qty FROM issue_records WHERE user_id = ? AND status = 'ISSUED'",
      [userId]
    );

    const [pendingRequests] = await pool.execute(
      "SELECT COUNT(*) AS count FROM issue_records WHERE user_id = ? AND status = 'REQUESTED'",
      [userId]
    );

    const [returnedCount] = await pool.execute(
      "SELECT COUNT(*) AS count FROM issue_records WHERE user_id = ? AND status = 'RETURNED'",
      [userId]
    );

    const [myIssuedItems] = await pool.execute(`
      SELECT ir.*, e.name AS equipment_name, e.category
      FROM issue_records ir
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      WHERE ir.user_id = ? AND ir.status = 'ISSUED'
      ORDER BY ir.issue_date DESC
    `, [userId]);

    const [recentRequests] = await pool.execute(`
      SELECT ir.*, e.name AS equipment_name, e.category
      FROM issue_records ir
      JOIN equipment e ON ir.equipment_id = e.equipment_id
      WHERE ir.user_id = ?
      ORDER BY ir.issue_id DESC
      LIMIT 8
    `, [userId]);

    const [availableEquipment] = await pool.execute(`
      SELECT * FROM equipment 
      WHERE available_quantity > 0 AND status = 'Available' 
      ORDER BY category, name
    `);

    res.json({
      stats: {
        active_issued: parseInt(activeIssued[0].total_qty, 10),
        pending_requests: parseInt(pendingRequests[0].count, 10),
        returned_count: parseInt(returnedCount[0].count, 10)
      },
      my_issued_items: myIssuedItems,
      recent_requests: recentRequests,
      available_equipment: availableEquipment
    });
  } catch (err) {
    console.error('User dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve user dashboard data.' });
  }
});

module.exports = router;

