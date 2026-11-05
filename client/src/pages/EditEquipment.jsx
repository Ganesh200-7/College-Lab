import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function EditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [status, setStatus] = useState('Available');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const data = await api.getEquipmentById(id);
      setName(data.name);
      setCategory(data.category);
      setQuantity(data.quantity);
      setAvailableQuantity(data.available_quantity);
      setStatus(data.status);
    } catch (err) {
      setError(err.message || 'Failed to load equipment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(quantity, 10);
    const availQty = parseInt(availableQuantity, 10);

    if (isNaN(qty) || isNaN(availQty) || qty < 0 || availQty < 0) {
      setError('Quantities cannot be negative numbers.');
      return;
    }

    if (availQty > qty) {
      setError('Available quantity cannot be greater than total quantity.');
      return;
    }

    setSaving(true);
    try {
      await api.updateEquipment(id, {
        name,
        category,
        quantity: qty,
        available_quantity: availQty,
        status
      });
      navigate('/equipment');
    } catch (err) {
      setError(err.message || 'Failed to update equipment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px' }}></i>
        <p>Loading equipment #{id}...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="content-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-pen-to-square"></i> Edit Equipment #{id}</h3>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lab Department / Category *</label>
              <input
                type="text"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total Inventory Quantity *</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available In-Stock Quantity *</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                  required
                />
                <span style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                  Must be &le; total quantity.
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operational Status *</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Available">Available (In Stock & Functional)</option>
                <option value="In Use">In Use (Fully allocated to labs)</option>
                <option value="Damaged">Damaged (Requires repair / defective)</option>
                <option value="Maintenance">Maintenance (Calibrating / testing)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <Link to="/equipment" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                Save Modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

