const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/auth');

// GET /api/equipment/categories (Distinct categories)
router.get('/categories', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT DISTINCT category FROM equipment ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// GET /api/equipment (Search & Filters)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = 'SELECT * FROM equipment WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      query += ' AND (name LIKE ? OR category LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (category && category.trim()) {
      query += ' AND category = ?';
      params.push(category.trim());
    }

    if (status && status.trim()) {
      query += ' AND status = ?';
      params.push(status.trim());
    }

    query += ' ORDER BY equipment_id DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Fetch equipment error:', err);
    res.status(500).json({ error: 'Failed to retrieve equipment records.' });
  }
});

// GET /api/equipment/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM equipment WHERE equipment_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment details.' });
  }
});

// POST /api/equipment (Admin only)
router.post('/', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const { name, category, quantity, status } = req.body;

    if (!name || !category || quantity === undefined || quantity === null) {
      return res.status(400).json({ error: 'Name, category, and quantity are required.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }

    const eqStatus = status || 'Available';
    const availableQty = (eqStatus === 'Available') ? qty : 0;

    const [result] = await pool.execute(
      'INSERT INTO equipment (name, category, quantity, available_quantity, status) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), category.trim(), qty, availableQty, eqStatus]
    );

    res.status(201).json({
      message: `Equipment '${name}' created successfully!`,
      equipment_id: result.insertId
    });
  } catch (err) {
    console.error('Create equipment error:', err);
    res.status(500).json({ error: 'Failed to add equipment.' });
  }
});

// PUT /api/equipment/:id (Admin only)
router.put('/:id', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const { name, category, quantity, available_quantity, status } = req.body;
    const eqId = req.params.id;

    if (!name || !category || quantity === undefined || available_quantity === undefined) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const qty = parseInt(quantity, 10);
    const availQty = parseInt(available_quantity, 10);

    if (isNaN(qty) || isNaN(availQty) || qty < 0 || availQty < 0) {
      return res.status(400).json({ error: 'Quantities cannot be negative.' });
    }

    if (availQty > qty) {
      return res.status(400).json({ error: 'Available quantity cannot exceed total quantity.' });
    }

    let finalStatus = status || 'Available';
    if (availQty === 0 && finalStatus === 'Available') {
      finalStatus = 'In Use';
    } else if (availQty > 0 && finalStatus === 'In Use') {
      finalStatus = 'Available';
    }

    await pool.execute(
      'UPDATE equipment SET name = ?, category = ?, quantity = ?, available_quantity = ?, status = ? WHERE equipment_id = ?',
      [name.trim(), category.trim(), qty, availQty, finalStatus, eqId]
    );

    res.json({ message: `Equipment '${name}' updated successfully!` });
  } catch (err) {
    console.error('Update equipment error:', err);
    res.status(500).json({ error: 'Failed to update equipment.' });
  }
});

// DELETE /api/equipment/:id (Admin only)
router.delete('/:id', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const eqId = req.params.id;

    // Check active issues
    const [active] = await pool.execute(
      "SELECT COUNT(*) AS count FROM issue_records WHERE equipment_id = ? AND status IN ('REQUESTED', 'APPROVED', 'ISSUED')",
      [eqId]
    );

    if (active[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete equipment: There are active requests or issued items linked to this equipment.' 
      });
    }

    // Delete linked history records first to satisfy FK
    await pool.execute('DELETE FROM issue_records WHERE equipment_id = ?', [eqId]);
    await pool.execute('DELETE FROM equipment WHERE equipment_id = ?', [eqId]);

    res.json({ message: 'Equipment deleted successfully.' });
  } catch (err) {
    console.error('Delete equipment error:', err);
    res.status(500).json({ error: 'Failed to delete equipment.' });
  }
});

// PATCH /api/equipment/:id/status (Admin quick status toggle)
router.patch('/:id/status', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const eqId = req.params.id;
    const valid = ['Available', 'In Use', 'Damaged', 'Maintenance'];

    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    if (status === 'Damaged' || status === 'Maintenance') {
      await pool.execute(
        'UPDATE equipment SET status = ?, available_quantity = 0 WHERE equipment_id = ?',
        [status, eqId]
      );
    } else if (status === 'Available') {
      await pool.execute(
        'UPDATE equipment SET status = ?, available_quantity = quantity WHERE equipment_id = ?',
        [status, eqId]
      );
    } else {
      await pool.execute(
        'UPDATE equipment SET status = ? WHERE equipment_id = ?',
        [status, eqId]
      );
    }

    res.json({ message: `Status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

module.exports = router;

