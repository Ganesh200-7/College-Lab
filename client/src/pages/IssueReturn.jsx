import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ReturnModal from '../components/ReturnModal';

export default function IssueReturn() {
  const [activeTab, setActiveTab] = useState('approved');
  const [data, setData] = useState({
    approved_requests: [],
    issued_items: [],
    equipment_list: [],
    users_list: []
  });
  const [loading, setLoading] = useState(true);

  // Return dates state mapping for approved requests
  const [returnDates, setReturnDates] = useState({});

  // Direct issue form
  const [directEqId, setDirectEqId] = useState('');
  const [directUserId, setDirectUserId] = useState('');
  const [directQty, setDirectQty] = useState(1);
  const [directDate, setDirectDate] = useState('');
  const [submittingDirect, setSubmittingDirect] = useState(false);

  // Return modal
  const [returnItem, setReturnItem] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchDesk();
  }, []);

  const fetchDesk = async () => {
    setLoading(true);
    try {
      const res = await api.getIssueReturnDesk();
      setData(res);
      // Pre-fill default return dates (7 days from today)
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      const defaultDateStr = defaultDueDate.toISOString().split('T')[0];

      const initialDates = {};
      res.approved_requests.forEach(r => {
        initialDates[r.issue_id] = r.return_date || defaultDateStr;
      });
      setReturnDates(initialDates);
      setDirectDate(defaultDateStr);
    } catch (err) {
      setError(err.message || 'Failed to load Issue & Return Desk.');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueApproved = async (issueId) => {
    setError('');
    const returnDate = returnDates[issueId] || todayStr;
    try {
      const res = await api.issueEquipment(issueId, returnDate);
      setMessage(res.message);
      fetchDesk();
      setTimeout(() => setMessage(''), 6000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDirectIssue = async (e) => {
    e.preventDefault();
    setError('');
    setSubmittingDirect(true);

    try {
      const res = await api.directIssue({
        equipment_id: directEqId,
        user_id: directUserId,
        quantity: directQty,
        return_date: directDate
      });
      setMessage(res.message);
      setDirectEqId('');
      setDirectUserId('');
      setDirectQty(1);
      fetchDesk();
      setActiveTab('issued');
      setTimeout(() => setMessage(''), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingDirect(false);
    }
  };

  const openReturnDialog = (item) => {
    setReturnItem(item);
    setReturnModalOpen(true);
  };

  const handleReturnSuccess = (msg) => {
    setMessage(msg);
    fetchDesk();
    setTimeout(() => setMessage(''), 6000);
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

      {/* Tabs Header */}
      <div className="nav-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <i className="fa-solid fa-clipboard-check"></i>
          Approved Requests Ready to Issue
          <span style={{ background: 'var(--primary-light)', color: 'var(--primary-hover)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', marginLeft: '4px' }}>
            {data.approved_requests.length}
          </span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'issued' ? 'active' : ''}`}
          onClick={() => setActiveTab('issued')}
        >
          <i className="fa-solid fa-arrow-right-arrow-left"></i>
          Currently Issued Equipment
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', marginLeft: '4px' }}>
            {data.issued_items.length}
          </span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'direct' ? 'active' : ''}`}
          onClick={() => setActiveTab('direct')}
        >
          <i className="fa-solid fa-bolt"></i>
          Direct Counter Issue
        </button>
      </div>

      {/* Tab 1: Approved Requests */}
      {activeTab === 'approved' && (
        <div className="content-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-check-circle" style={{ color: '#16a34a' }}></i> Approved Requisitions Awaiting Equipment Pickup</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Set due date and confirm handover</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Req #</th>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Requested By</th>
                  <th>Role</th>
                  <th>Quantity</th>
                  <th>Set Return Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.approved_requests.length > 0 ? (
                  data.approved_requests.map(rec => (
                    <tr key={rec.issue_id}>
                      <td><strong>#{rec.issue_id}</strong></td>
                      <td><strong>{rec.equipment_name}</strong></td>
                      <td>{rec.category}</td>
                      <td>
                        <strong>{rec.user_name}</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{rec.user_email}</span>
                      </td>
                      <td>
                        <span className={`role-badge role-badge-${rec.user_role.toLowerCase()}`}>{rec.user_role}</span>
                      </td>
                      <td><strong style={{ color: 'var(--primary)' }}>{rec.quantity}</strong> unit(s)</td>
                      <td>
                        <input
                          type="date"
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '13px', height: '32px', width: '160px' }}
                          value={returnDates[rec.issue_id] || ''}
                          min={todayStr}
                          onChange={(e) => setReturnDates({ ...returnDates, [rec.issue_id]: e.target.value })}
                          required
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleIssueApproved(rec.issue_id)}
                        >
                          <i className="fa-solid fa-hand-holding-hand"></i> Confirm & Issue
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      <i className="fa-solid fa-circle-check"></i>
                      <p>No approved requests waiting for issuance.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Currently Issued Equipment */}
      {activeTab === 'issued' && (
        <div className="content-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-clock-rotate-left"></i> Equipment Currently Issued to Users</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Verify condition and restore inventory</span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Equipment</th>
                  <th>Issued To</th>
                  <th>Role</th>
                  <th>Quantity</th>
                  <th>Date Issued</th>
                  <th>Expected Return</th>
                  <th style={{ textAlign: 'right' }}>Return Verification</th>
                </tr>
              </thead>
              <tbody>
                {data.issued_items.length > 0 ? (
                  data.issued_items.map(item => (
                    <tr key={item.issue_id}>
                      <td><strong>#{item.issue_id}</strong></td>
                      <td><strong>{item.equipment_name}</strong></td>
                      <td>
                        <strong>{item.user_name}</strong>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{item.user_email}</span>
                      </td>
                      <td>
                        <span className={`role-badge role-badge-${item.user_role.toLowerCase()}`}>{item.user_role}</span>
                      </td>
                      <td><strong>{item.quantity}</strong> unit(s)</td>
                      <td>{item.issue_date || '—'}</td>
                      <td><span style={{ fontWeight: 600, color: '#0284c7' }}>{item.return_date || '—'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => openReturnDialog(item)}
                        >
                          <i className="fa-solid fa-arrow-left"></i> Process Return
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      <i className="fa-solid fa-boxes-stacked"></i>
                      <p>No equipment currently in issued status.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Direct Counter Issue */}
      {activeTab === 'direct' && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="content-card">
            <div className="card-header">
              <h3><i className="fa-solid fa-bolt" style={{ color: '#f59e0b' }}></i> Immediate Counter Issue (Walk-In)</h3>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Direct issuance without prior online request</span>
            </div>
            <div className="card-body">
              <form onSubmit={handleDirectIssue}>
                <div className="form-group">
                  <label className="form-label">Select Equipment *</label>
                  <select
                    className="form-select"
                    value={directEqId}
                    onChange={(e) => setDirectEqId(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Choose available equipment --</option>
                    {data.equipment_list.map(eq => (
                      <option key={eq.equipment_id} value={eq.equipment_id}>
                        {eq.name} ({eq.category}) — {eq.available_quantity} Available
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Issue To Student / Faculty *</label>
                  <select
                    className="form-select"
                    value={directUserId}
                    onChange={(e) => setDirectUserId(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Choose recipient user --</option>
                    {data.users_list.map(u => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.name} ({u.role}) — {u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={directQty}
                      onChange={(e) => setDirectQty(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Return Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      min={todayStr}
                      value={directDate}
                      onChange={(e) => setDirectDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '16px' }}
                  disabled={submittingDirect}
                >
                  {submittingDirect ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                  Record Direct Issue & Update Inventory
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Return Verification Modal */}
      <ReturnModal
        item={returnItem}
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSuccess={handleReturnSuccess}
      />
    </div>
  );
}

