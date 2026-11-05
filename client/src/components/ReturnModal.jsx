import React, { useState } from 'react';
import { api } from '../services/api';

export default function ReturnModal({ item, isOpen, onClose, onSuccess }) {
  const [condition, setCondition] = useState('Good');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.returnEquipment(item.issue_id, condition);
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
          <h4><i className="fa-solid fa-rotate-left" style={{ color: '#16a34a', marginRight: '8px' }}></i> Return Verification Desk</h4>
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
              Verifying return of: <strong style={{ color: 'var(--text-main)' }}>{item.equipment_name}</strong> ({item.quantity} units)
            </p>
            <div className="form-group">
              <label className="form-label">Physical Condition Upon Return *</label>
              <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="Good">Good / Functional (Restores available inventory)</option>
                <option value="Damaged">Damaged / Defective (Marks equipment Damaged, stock withheld)</option>
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px', display: 'block' }}>
                Damaged items are automatically recorded in the database transaction and prevented from being re-issued.
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
              Confirm Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

