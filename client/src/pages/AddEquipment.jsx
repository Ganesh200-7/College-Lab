import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function AddEquipment() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('Available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !category || !quantity) {
      setError('Please fill in name, category, and quantity.');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setError('Quantity must be a positive number.');
      return;
    }

    setLoading(true);
    try {
      await api.addEquipment({
        name,
        category,
        quantity: qty,
        status
      });
      navigate('/equipment');
    } catch (err) {
      setError(err.message || 'Failed to create equipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="content-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-plus-circle"></i> Register New Laboratory Equipment</h3>
          <Link to="/equipment" className="btn btn-outline btn-sm">
            <i className="fa-solid fa-arrow-left"></i> Back to Inventory
          </Link>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Equipment Name / Model *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Digital Storage Oscilloscope 100MHz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Lab Department / Category *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Electronics, Physics, Chemistry..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Units Purchased *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 15"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Operational Status *</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Available">Available (Ready for issuance)</option>
                <option value="Maintenance">Maintenance (Under calibration/inspection)</option>
                <option value="Damaged">Damaged (Requires repair)</option>
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                If marked Available, available stock will initially equal the total quantity.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <Link to="/equipment" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                Save to Equipment Database
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

