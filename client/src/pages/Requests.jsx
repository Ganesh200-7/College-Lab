import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('REQUESTED');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const list = await api.getRequests(qs);
      setRequests(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req) => {
    try {
      const res = await api.approveRequest(req.issue_id);
      setMessage(res.message);
      fetchRequests();
      setTimeout(() => setMessage(''), 6000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 6000);
    }
  };

  const handleReject = async (req) => {
    if (!window.confirm(`Are you sure you want to reject requisition #${req.issue_id}?`)) {
      return;
    }
    try {
      const res = await api.rejectRequest(req.issue_id);
      setMessage(res.message);
      fetchRequests();
      setTimeout(() => setMessage(''), 6000);
    } catch (err) {
      setError(err.message);
    }
  };

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

      {error && (
        <div className="alert alert-danger">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
          <button type="button" className="alert-close" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '13.5px' }}>Filter by Status:</span>
          <div className="btn-group">
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'REQUESTED' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('REQUESTED')}
            >
              <i className="fa-solid fa-hourglass-half"></i> Pending Review
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'APPROVED' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('APPROVED')}
            >
              <i className="fa-solid fa-check"></i> Approved
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'REJECTED' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('REJECTED')}
            >
              <i className="fa-solid fa-ban"></i> Rejected
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Records
            </button>
          </div>
        </div>

        <Link to="/issue-return" className="btn btn-outline btn-sm">
          <i className="fa-solid fa-arrow-right-arrow-left"></i> Go to Issue & Return Desk &rarr;
        </Link>
      </div>

      {/* Requests Card */}
      <div className="content-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-clipboard-check"></i> Requisitions Log</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {requests.length} requisition(s)
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Req #</th>
                <th>Equipment Requested</th>
                <th>Category</th>
                <th>Requester</th>
                <th>Role</th>
                <th>Quantity</th>
                <th>In-Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Decision Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading requisitions...
                  </td>
                </tr>
              ) : requests.length > 0 ? (
                requests.map(req => (
                  <tr key={req.issue_id}>
                    <td><strong>#{req.issue_id}</strong></td>
                    <td><strong>{req.equipment_name}</strong></td>
                    <td>{req.category}</td>
                    <td>
                      <strong>{req.user_name}</strong>
                      <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)' }}>{req.user_email}</span>
                    </td>
                    <td>
                      <span className={`role-badge role-badge-${req.user_role.toLowerCase()}`}>
                        {req.user_role}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '15px', color: 'var(--primary)' }}>{req.quantity}</strong> unit(s)
                    </td>
                    <td>
                      {req.available_quantity >= req.quantity ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>
                          <i className="fa-solid fa-check"></i> {req.available_quantity} Available
                        </span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>
                          <i className="fa-solid fa-triangle-exclamation"></i> Only {req.available_quantity} Avail
                        </span>
                      )}
                    </td>
                    <td>
                      {req.status === 'REQUESTED' && <span className="badge badge-requested"><i className="fa-solid fa-clock"></i> Pending Review</span>}
                      {req.status === 'APPROVED' && <span className="badge badge-approved"><i className="fa-solid fa-check"></i> Approved</span>}
                      {req.status === 'REJECTED' && <span className="badge badge-rejected"><i className="fa-solid fa-ban"></i> Rejected</span>}
                      {req.status === 'ISSUED' && <span className="badge badge-issued"><i className="fa-solid fa-hand-holding-hand"></i> Issued</span>}
                      {req.status === 'RETURNED' && <span className="badge badge-returned"><i className="fa-solid fa-rotate-left"></i> Returned</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {req.status === 'REQUESTED' ? (
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={req.available_quantity < req.quantity}
                            onClick={() => handleApprove(req)}
                            title={req.available_quantity < req.quantity ? 'Insufficient stock' : 'Approve'}
                          >
                            <i className="fa-solid fa-check"></i> Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(req)}
                            title="Reject"
                          >
                            <i className="fa-solid fa-xmark"></i> Reject
                          </button>
                        </div>
                      ) : req.status === 'APPROVED' ? (
                        <Link to="/issue-return" className="btn btn-primary btn-sm">
                          <i className="fa-solid fa-hand-holding-hand"></i> Ready to Issue
                        </Link>
                      ) : (
                        <span style={{ fontSize: '12.5px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="table-empty">
                    <i className="fa-solid fa-inbox"></i>
                    <p>No equipment requests found for this filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

