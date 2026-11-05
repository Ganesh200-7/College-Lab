import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import RequestModal from '../components/RequestModal';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEq, setSelectedEq] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getUserDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load faculty dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = (eq) => {
    setSelectedEq(eq);
    setModalOpen(true);
  };

  const handleSuccess = (msg) => {
    setMessage(msg);
    fetchDashboard();
    setTimeout(() => setMessage(''), 6000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
        <p>Loading Faculty Portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fa-solid fa-circle-exclamation"></i>
        <span>{error}</span>
      </div>
    );
  }

  const { stats, my_issued_items, available_equipment } = data;

  return (
    <div>
      {message && (
        <div className="alert alert-success">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-circle-check"></i>
            <span>{message}</span>
          </div>
          <button type="button" className="alert-close" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      {/* Metrics */}
      <div className="stats-grid">
        <StatCard
          label="Active Lab Allocations"
          value={stats.active_issued}
          sub="Units Currently in Practicals"
          iconClass="fa-solid fa-flask-vial"
          colorClass="icon-purple"
        />
        <StatCard
          label="Requisitions in Review"
          value={stats.pending_requests}
          sub="Pending Approval"
          iconClass="fa-solid fa-hourglass-half"
          colorClass="icon-amber"
        />
        <StatCard
          label="Returned Requisitions"
          value={stats.returned_count}
          sub="Archived Practicals"
          iconClass="fa-solid fa-circle-check"
          colorClass="icon-green"
        />
      </div>

      {/* Allocated Equipment */}
      <div className="content-card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <h3><i className="fa-solid fa-microscope"></i> Allocated Department Equipment</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Current allocations for teaching & research</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requisition #</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Units</th>
                <th>Issue Date</th>
                <th>Expected Return</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {my_issued_items && my_issued_items.length > 0 ? (
                my_issued_items.map(item => (
                  <tr key={item.issue_id}>
                    <td><strong>#{item.issue_id}</strong></td>
                    <td><strong>{item.equipment_name}</strong></td>
                    <td>{item.category}</td>
                    <td><strong>{item.quantity}</strong></td>
                    <td>{item.issue_date || '—'}</td>
                    <td><span style={{ color: '#0369a1', fontWeight: 600 }}>{item.return_date || '—'}</span></td>
                    <td><span className="badge badge-issued"><i className="fa-solid fa-circle-check"></i> Issued</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="table-empty">
                    <i className="fa-solid fa-box-open"></i>
                    <p>No equipment currently allocated to your account.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Equipment */}
      <div className="content-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-boxes-stacked"></i> Lab Inventory Available for Request</h3>
          <Link to="/equipment" className="btn btn-outline btn-sm">
            Browse All <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
          </Link>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Department / Category</th>
                <th>Available in Stock</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {available_equipment && available_equipment.length > 0 ? (
                available_equipment.map(eq => (
                  <tr key={eq.equipment_id}>
                    <td><strong>{eq.name}</strong></td>
                    <td>{eq.category}</td>
                    <td>
                      <strong style={{ color: '#16a34a' }}>{eq.available_quantity}</strong> / {eq.quantity} units
                    </td>
                    <td><span className="badge badge-available">Available</span></td>
                    <td>
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenRequest(eq)}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Requisition Item
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="table-empty">
                    <i className="fa-solid fa-box-open"></i>
                    <p>All laboratory equipment is currently in use.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal
        equipment={selectedEq}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

