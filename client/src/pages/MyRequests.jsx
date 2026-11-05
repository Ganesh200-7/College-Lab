import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function MyRequests() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getMyRequests();
      setRecords(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve your request history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <h3><i className="fa-solid fa-clock-rotate-left"></i> My Requisitions & Issuance History</h3>
        <Link to="/equipment" className="btn btn-primary btn-sm">
          <i className="fa-solid fa-plus"></i> Request New Equipment
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: '20px' }}>
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Req #</th>
              <th>Equipment Name</th>
              <th>Lab Category</th>
              <th>Quantity</th>
              <th>Issue Date</th>
              <th>Due / Return Date</th>
              <th>Current Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading your history...
                </td>
              </tr>
            ) : records.length > 0 ? (
              records.map(rec => (
                <tr key={rec.issue_id}>
                  <td><strong>#{rec.issue_id}</strong></td>
                  <td><strong>{rec.equipment_name}</strong></td>
                  <td>{rec.category}</td>
                  <td><strong>{rec.quantity}</strong> unit(s)</td>
                  <td>{rec.issue_date || 'Pending Issue'}</td>
                  <td>{rec.return_date || '—'}</td>
                  <td>
                    {rec.status === 'REQUESTED' && (
                      <span className="badge badge-requested">
                        <i className="fa-solid fa-clock"></i> Pending Review
                      </span>
                    )}
                    {rec.status === 'APPROVED' && (
                      <span className="badge badge-approved">
                        <i className="fa-solid fa-check"></i> Approved (Visit Lab for Pickup)
                      </span>
                    )}
                    {rec.status === 'ISSUED' && (
                      <span className="badge badge-issued">
                        <i className="fa-solid fa-hand-holding-hand"></i> In Your Possession
                      </span>
                    )}
                    {rec.status === 'RETURNED' && (
                      <span className="badge badge-returned">
                        <i className="fa-solid fa-circle-check"></i> Returned
                      </span>
                    )}
                    {rec.status === 'REJECTED' && (
                      <span className="badge badge-rejected">
                        <i className="fa-solid fa-ban"></i> Rejected
                      </span>
                    )}
                    {rec.status === 'DAMAGED' && (
                      <span className="badge badge-damaged">
                        <i className="fa-solid fa-triangle-exclamation"></i> Reported Damaged
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="table-empty">
                  <i className="fa-solid fa-inbox"></i>
                  <p>You have not made any equipment requests yet.</p>
                  <Link to="/equipment" className="btn btn-outline btn-sm" style={{ marginTop: '10px' }}>
                    Explore Lab Equipment
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

