import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
        <p>Loading Administrator Dashboard...</p>
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

  const { stats, category_data, status_data, recent_activity } = data;

  // Chart 1: Category Doughnut
  const categoryChartData = {
    labels: category_data.length ? category_data.map(c => c.category) : ['No Data'],
    datasets: [{
      data: category_data.length ? category_data.map(c => c.total_qty) : [1],
      backgroundColor: ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Chart 2: Status Bar
  const statusChartData = {
    labels: status_data.length ? status_data.map(s => s.status) : ['Available', 'In Use', 'Damaged', 'Maintenance'],
    datasets: [{
      label: 'Units',
      data: status_data.length ? status_data.map(s => s.total) : [0, 0, 0, 0],
      backgroundColor: ['#22c55e', '#38bdf8', '#f43f5e', '#a855f7'],
      borderRadius: 6
    }]
  };

  return (
    <div>
      {/* 7 Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Equipment"
          value={stats.total_equipment}
          sub={`${stats.equipment_types} Distinct Models`}
          iconClass="fa-solid fa-boxes-stacked"
          colorClass="icon-blue"
        />
        <StatCard
          label="Available Equipment"
          value={stats.available_equipment}
          sub="Ready for Issuance"
          iconClass="fa-solid fa-circle-check"
          colorClass="icon-green"
        />
        <StatCard
          label="Issued Equipment"
          value={stats.issued_equipment}
          sub="Currently with Users"
          iconClass="fa-solid fa-hand-holding-hand"
          colorClass="icon-purple"
        />
        <StatCard
          label="Total Students"
          value={stats.total_students}
          sub="Registered Students"
          iconClass="fa-solid fa-graduation-cap"
          colorClass="icon-cyan"
        />
        <StatCard
          label="Total Faculty"
          value={stats.total_faculty}
          sub="Academic Staff"
          iconClass="fa-solid fa-chalkboard-user"
          colorClass="icon-amber"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pending_requests}
          sub={
            stats.pending_requests > 0 ? (
              <Link to="/requests" style={{ color: '#d97706', fontWeight: 600 }}>Needs Review &rarr;</Link>
            ) : 'All Reviewed'
          }
          iconClass="fa-solid fa-hourglass-half"
          colorClass="icon-amber"
        />
        <StatCard
          label="Damaged Equipment"
          value={stats.damaged_equipment}
          sub="Requires Repair"
          iconClass="fa-solid fa-triangle-exclamation"
          colorClass="icon-rose"
        />
      </div>

      {/* Visual Analytics */}
      <div className="dashboard-row">
        <div className="content-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-chart-pie"></i> Equipment by Lab Category</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time Stock</span>
          </div>
          <div className="card-body">
            <div className="chart-wrapper">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                  cutout: '68%'
                }}
              />
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3><i className="fa-solid fa-chart-column"></i> Equipment Status Distribution</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Operational State</span>
          </div>
          <div className="card-body">
            <div className="chart-wrapper">
              <Bar
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="content-card">
        <div className="card-header">
          <h3><i className="fa-solid fa-clock-rotate-left"></i> Recent Equipment Activity & Transactions</h3>
          <Link to="/requests" className="btn btn-outline btn-sm">
            View All Requests <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
          </Link>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Equipment Name</th>
                <th>Requested By</th>
                <th>Role</th>
                <th>Quantity</th>
                <th>Issue Date</th>
                <th>Due / Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent_activity && recent_activity.length > 0 ? (
                recent_activity.map(item => (
                  <tr key={item.issue_id}>
                    <td><strong>#{item.issue_id}</strong></td>
                    <td>
                      <strong>{item.equipment_name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{item.category}</span>
                    </td>
                    <td>{item.user_name}</td>
                    <td>
                      <span className={`role-badge role-badge-${item.user_role.toLowerCase()}`}>
                        {item.user_role}
                      </span>
                    </td>
                    <td><strong>{item.quantity}</strong> unit(s)</td>
                    <td>{item.issue_date || '—'}</td>
                    <td>{item.return_date || '—'}</td>
                    <td>
                      {item.status === 'REQUESTED' && <span className="badge badge-requested"><i className="fa-solid fa-clock"></i> Requested</span>}
                      {item.status === 'APPROVED' && <span className="badge badge-approved"><i className="fa-solid fa-check"></i> Approved</span>}
                      {item.status === 'ISSUED' && <span className="badge badge-issued"><i className="fa-solid fa-hand-holding-hand"></i> Issued</span>}
                      {item.status === 'RETURNED' && <span className="badge badge-returned"><i className="fa-solid fa-rotate-left"></i> Returned</span>}
                      {item.status === 'REJECTED' && <span className="badge badge-rejected"><i className="fa-solid fa-ban"></i> Rejected</span>}
                      {item.status === 'DAMAGED' && <span className="badge badge-damaged"><i className="fa-solid fa-triangle-exclamation"></i> Damaged</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="table-empty">
                    <i className="fa-solid fa-box-open"></i>
                    <p>No recent transactions found.</p>
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

