import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar, pageTitle }) {
  const { user } = useAuth();
  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="top-navbar">
      <div className="nav-left">
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle Navigation">
          <i className="fa-solid fa-bars"></i>
        </button>
        <h1 className="page-title">{pageTitle || 'Dashboard'}</h1>
      </div>

      <div className="nav-right">
        {user && (
          <span className="role-pill">
            <i className="fa-solid fa-shield-halved"></i>
            {user.role}
          </span>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          <i className="fa-regular fa-calendar-days" style={{ marginRight: '5px' }}></i>
          {todayStr}
        </span>
      </div>
    </header>
  );
}

