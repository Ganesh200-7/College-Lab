import React from 'react';

export default function StatCard({ label, value, sub, iconClass, colorClass }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      <div className={`stat-icon ${colorClass || 'icon-blue'}`}>
        <i className={iconClass}></i>
      </div>
    </div>
  );
}

