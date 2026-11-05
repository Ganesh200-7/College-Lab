import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import RequestModal from '../components/RequestModal';

export default function StudentDashboard() {
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
      setError(err.message || 'Failed to load student dashboard.');
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
        <p>Loading Student Dashboard...</p>
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
          label="Currently In Possession"
          value={stats.active_issued}
          sub="Active Issued Equipment"
          iconClass="fa-solid fa-hand-holding-hand"
          colorClass="icon-blue"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pending_requests}
          sub="Awaiting Admin Review"
          iconClass="fa-solid fa-hourglass-half"
          colorClass="icon-amber"
        />
        <StatCard
          label="Returned History"
          value={stats.returned_count}
          sub="Completed Practicals"
          iconClass="fa-solid fa-circle-check"
          colorClass="icon-green"
        />
      </div>

      {/* Active Issued Items */}
      <div className="content-card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <h3><i className="fa-solid fa-microchip"></i> My Active Issued Equipment</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Return on or before due date</span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Issue Date</th>
                <th>Due Date</th>
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
                    <td><strong>{item.quantity}</strong> unit(s)</td>
                    <td>{item.issue_date || '—'}</td>
                    <td><span style={{ color: '#dc2626', fontWeight: 600 }}>{item.return_date || '—'}</span></td>
                    <td>
                      <span className="badge badge-issued"><i className="fa-solid fa-circle-dot"></i> Issued</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="table-empty">
                    <i className="fa-solid fa-box-open"></i>
                    <p>You have no equipment currently issued.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Equipment for Requisition */}
      <div className="content-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-boxes-stacked"></i> Available Lab Equipment Catalog</h3>
          <Link to="/equipment" className="btn btn-outline btn-sm">
            Full Catalog <i className="fa-solid fa-magnifying-glass" style={{ marginLeft: '4px' }}></i>
          </Link>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Lab Category</th>
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
                      <span style={{ fontWeight: 700, color: '#16a34a' }}>{eq.available_quantity}</span> / {eq.quantity} units
                    </td>
                    <td><span className="badge badge-available"><i className="fa-solid fa-circle-check"></i> Available</span></td>
                    <td>
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenRequest(eq)}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Request Item
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="table-empty">
                    <i className="fa-solid fa-box-open"></i>
                    <p>No equipment currently available for request.</p>
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

