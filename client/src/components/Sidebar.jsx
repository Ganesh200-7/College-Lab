import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <i className="fa-solid fa-microscope"></i>
        </div>
        <div>
          <h2>LabManager</h2>
          <span>College Lab Equipment</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-section-label">Navigation</div>

        {user.role === 'Admin' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-chart-pie"></i>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/equipment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-boxes-stacked"></i>
              <span>Manage Equipment</span>
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-users-gear"></i>
              <span>Manage Users</span>
            </NavLink>
            <NavLink to="/requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-clipboard-check"></i>
              <span>Equipment Requests</span>
            </NavLink>
            <NavLink to="/issue-return" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-arrow-right-arrow-left"></i>
              <span>Issue and Return</span>
            </NavLink>
          </>
        )}

        {user.role === 'Faculty' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-chalkboard-user"></i>
              <span>Faculty Dashboard</span>
            </NavLink>
            <NavLink to="/equipment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>Browse Equipment</span>
            </NavLink>
            <NavLink to="/my-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span>My Requests & Issues</span>
            </NavLink>
          </>
        )}

        {user.role === 'Student' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-graduation-cap"></i>
              <span>Student Dashboard</span>
            </NavLink>
            <NavLink to="/equipment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>Browse Equipment</span>
            </NavLink>
            <NavLink to="/my-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span>My Requests & History</span>
            </NavLink>
          </>
        )}

        <div className="menu-section-label" style={{ marginTop: '18px' }}>Account</div>
        <button 
          onClick={logout} 
          className="nav-link" 
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" style={{ color: '#f87171' }}></i>
          <span style={{ color: '#f87171' }}>Logout</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name" title={user.name}>{user.name}</div>
            <div className="user-role-tag">{user.role}</div>
          </div>
          <button onClick={logout} className="btn-sidebar-logout" title="Sign Out">
            <i className="fa-solid fa-power-off"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}

