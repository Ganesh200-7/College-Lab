import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RequestModal from '../components/RequestModal';

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modal
  const [selectedEq, setSelectedEq] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchEquipment();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const list = await api.getEquipment(queryString);
      setEquipment(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch equipment.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchEquipment();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setTimeout(() => {
      api.getEquipment().then(setEquipment);
    }, 50);
  };

  const handleDelete = async (eq) => {
    if (!window.confirm(`Are you sure you want to delete '${eq.name}'? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.deleteEquipment(eq.equipment_id);
      setMessage(res.message);
      fetchEquipment();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (eqId, newStatus) => {
    try {
      const res = await api.updateStatus(eqId, newStatus);
      setMessage(res.message);
      fetchEquipment();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenRequest = (eq) => {
    setSelectedEq(eq);
    setModalOpen(true);
  };

  const handleSuccess = (msg) => {
    setMessage(msg);
    fetchEquipment();
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

      {/* Filter Bar */}
      <div className="filter-bar">
        <form className="filter-form" onSubmit={handleFilterSubmit}>
          <div className="search-input-wrapper">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Search by equipment name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ maxWidth: '200px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ maxWidth: '180px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Damaged">Damaged</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <button type="submit" className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-filter"></i> Apply
          </button>

          {(search || selectedCategory || selectedStatus) && (
            <button type="button" className="btn btn-outline btn-sm" onClick={handleClearFilters}>
              <i className="fa-solid fa-xmark"></i> Clear
            </button>
          )}
        </form>

        {user && user.role === 'Admin' && (
          <Link to="/equipment/add" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> Add New Equipment
          </Link>
        )}
      </div>

      {/* Table Card */}
      <div className="content-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-boxes-stacked"></i> Equipment Master Records</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {equipment.length} item(s)
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment Name</th>
                <th>Category</th>
                <th>Total Quantity</th>
                <th>Available Quantity</th>
                <th>Status</th>
                {user && user.role === 'Admin' ? (
                  <>
                    <th>Quick Status</th>
                    <th style={{ textAlign: 'right' }}>Admin Actions</th>
                  </>
                ) : (
                  <th>Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 8 : 7} style={{ textAlign: 'center', padding: '30px' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading inventory...
                  </td>
                </tr>
              ) : equipment.length > 0 ? (
                equipment.map(eq => (
                  <tr key={eq.equipment_id}>
                    <td><strong>#{eq.equipment_id}</strong></td>
                    <td><strong>{eq.name}</strong></td>
                    <td>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                        {eq.category}
                      </span>
                    </td>
                    <td>{eq.quantity} units</td>
                    <td>
                      {eq.available_quantity > 0 ? (
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{eq.available_quantity}</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>0 (Out of Stock)</span>
                      )} units
                    </td>
                    <td>
                      {eq.status === 'Available' && <span className="badge badge-available"><i className="fa-solid fa-circle-check"></i> Available</span>}
                      {eq.status === 'In Use' && <span className="badge badge-inuse"><i className="fa-solid fa-clock"></i> In Use</span>}
                      {eq.status === 'Damaged' && <span className="badge badge-damaged"><i className="fa-solid fa-triangle-exclamation"></i> Damaged</span>}
                      {eq.status === 'Maintenance' && <span className="badge badge-maintenance"><i className="fa-solid fa-wrench"></i> Maintenance</span>}
                    </td>

                    {user && user.role === 'Admin' ? (
                      <>
                        <td>
                          <select
                            className="form-select"
                            style={{ padding: '4px 8px', fontSize: '12px', height: '30px', width: '125px' }}
                            value={eq.status}
                            onChange={(e) => handleStatusChange(eq.equipment_id, e.target.value)}
                          >
                            <option value="Available">Available</option>
                            <option value="In Use">In Use</option>
                            <option value="Damaged">Damaged</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="btn-group">
                            <Link to={`/equipment/edit/${eq.equipment_id}`} className="btn btn-secondary btn-sm" title="Edit">
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(eq)}
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td>
                        {eq.status === 'Available' && eq.available_quantity > 0 ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenRequest(eq)}
                          >
                            <i className="fa-solid fa-paper-plane"></i> Request
                          </button>
                        ) : (
                          <button type="button" className="btn btn-secondary btn-sm" disabled>
                            Unavailable
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 8 : 7} className="table-empty">
                    <i className="fa-solid fa-box-open"></i>
                    <p>No equipment records found.</p>
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

