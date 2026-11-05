import React, { useState } from 'react';
import { api } from '../services/api';

export default function RequestModal({ equipment, isOpen, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !equipment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (qty > equipment.available_quantity) {
      setError(`Cannot request ${qty}. Only ${equipment.available_quantity} available.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitRequest({
        equipment_id: equipment.equipment_id,
        quantity: qty
      });
      onSuccess(res.message);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4><i className="fa-solid fa-hand-holding-hand" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Request Lab Equipment</h4>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '14px' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                <span>{error}</span>
              </div>
            )}
            <p style={{ marginBottom: '14px', color: 'var(--text-muted)' }}>
              Submitting requisition for: <strong style={{ color: 'var(--text-main)' }}>{equipment.name}</strong>
            </p>
            <div style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', marginBottom: '16px', fontSize: '13px' }}>
              <i className="fa-solid fa-info-circle" style={{ color: '#0284c7', marginRight: '6px' }}></i>
              Available in Lab Stock: <strong style={{ color: '#0284c7' }}>{equipment.available_quantity}</strong> units
            </div>
            <div className="form-group">
              <label className="form-label">Required Quantity</label>
              <input 
                type="number" 
                className="form-control" 
                value={quantity} 
                min="1" 
                max={equipment.available_quantity}
                onChange={(e) => setQuantity(e.target.value)} 
                required 
              />
              <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                Enter the number of units required for your practical.
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
              Submit Requisition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

