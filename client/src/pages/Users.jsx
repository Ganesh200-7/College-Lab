import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedRole) params.append('role', selectedRole);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const list = await api.getUsers(qs);
      setUsers(list);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await api.addUser({ name, email, role, password });
      setMessage(res.message);
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to register user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Are you sure you want to delete user account '${u.name}'?`)) {
      return;
    }
    try {
      const res = await api.deleteUser(u.user_id);
      setMessage(res.message);
      fetchUsers();
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

      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Register User Card */}
        <div className="content-card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <h3><i className="fa-solid fa-user-plus"></i> Register New User</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. jdoe@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role *</label>
                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Default Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span style={{ fontSize: '11.5px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                  Passwords are encrypted using bcrypt hashing in Node.js.
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={submitting}>
                {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-user-check"></i>}
                Register Account
              </button>
            </form>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="content-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-users"></i> System User Accounts</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Total: {users.length} User(s)
            </span>
          </div>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div className="search-input-wrapper" style={{ minWidth: '200px' }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ maxWidth: '160px' }}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Faculty">Faculty</option>
                <option value="Student">Student</option>
              </select>

              <button type="submit" className="btn btn-secondary btn-sm">Filter</button>
              {(search || selectedRole) && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSearch('');
                    setSelectedRole('');
                    api.getUsers().then(setUsers);
                  }}
                >
                  Reset
                </button>
              )}
            </form>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                      <i className="fa-solid fa-spinner fa-spin"></i> Loading users...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map(u => (
                    <tr key={u.user_id}>
                      <td><strong>#{u.user_id}</strong></td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-badge-${u.role.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {u.user_id === currentUser?.user_id ? (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(You)</span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u)}
                            title="Delete User"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-empty">
                      <i className="fa-solid fa-users-slash"></i>
                      <p>No matching users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

