import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Highlighted departments
  const departments = [
    { name: 'Electronics & Communication', icon: 'fa-microchip', color: '#0284c7', count: '5 Instruments' },
    { name: 'Physics & Optics', icon: 'fa-atom', color: '#8b5cf6', count: '3 Setups' },
    { name: 'Chemistry & Bio-Analysis', icon: 'fa-flask-vial', color: '#10b981', count: '3 Analyzers' },
    { name: 'Computer Science & Networking', icon: 'fa-network-wired', color: '#06b6d4', count: '3 Hardware Units' },
    { name: 'Mechanical & Materials Lab', icon: 'fa-gears', color: '#f59e0b', count: '2 Testers' }
  ];

  // Highlights features
  const features = [
    {
      title: 'Real-Time Inventory Control',
      desc: 'Instant visibility into in-stock, allocated, and maintenance equipment with automatic stock decrement on issue.',
      icon: 'fa-boxes-stacked',
      color: '#0284c7'
    },
    {
      title: 'Digital Requisition Workflow',
      desc: 'Students and faculty submit equipment requests online. Lab admins approve or reject based on live stock.',
      icon: 'fa-clipboard-check',
      color: '#10b981'
    },
    {
      title: 'Issue & Return Desk',
      desc: 'Record expected return dates, enforce condition audits upon return, and isolate damaged units automatically.',
      icon: 'fa-arrow-right-arrow-left',
      color: '#8b5cf6'
    },
    {
      title: 'Institutional Analytics',
      desc: 'Interactive visual distributions by department and status using Chart.js for data-driven lab procurement.',
      icon: 'fa-chart-pie',
      color: '#f59e0b'
    }
  ];

  const steps = [
    { step: '01', title: 'Browse & Request', desc: 'Students or faculty view available stock and submit requests with desired quantity.' },
    { step: '02', title: 'Admin Approval', desc: 'Lab administrators review requests and verify stock availability before approval.' },
    { step: '03', title: 'Counter Issue', desc: 'Approved items are physically issued at the lab counter with an agreed return due date.' },
    { step: '04', title: 'Return & Audit', desc: 'Returned items are checked for condition. Functional items restore stock; damaged items are flagged.' }
  ];

  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <div className="brand-icon">
              <i className="fa-solid fa-microscope"></i>
            </div>
            <div>
              <h3>LabManager</h3>
              <span>College Laboratory Portal</span>
            </div>
          </div>

          <div className="landing-nav-links">
            <a href="#departments">Departments</a>
            <a href="#features">Key Features</a>
            <a href="#workflow">How It Works</a>
          </div>

          <div className="landing-nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                <i className="fa-solid fa-gauge-high"></i> Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                <i className="fa-solid fa-right-to-bracket"></i> Sign In to Portal
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">
          <i className="fa-solid fa-shield-halved"></i>
          <span>Institutional Laboratory & Equipment Management Portal</span>
        </div>

        <h1 className="hero-title">
          Smart Lab Inventory & Digital Requisitions for Modern Engineering
        </h1>

        <p className="hero-subtitle">
          A full-stack, enterprise-grade inventory system connecting Students, Faculty Researchers, and 
          Lab Administrators with real-time instrument tracking, seamless approvals, and audit-ready issue & return workflows.
        </p>

        <div className="hero-cta-group">
          {user ? (
            <Link to="/dashboard" className="btn btn-hero-primary">
              <i className="fa-solid fa-gauge-high"></i> Open Your Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-hero-primary">
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Portal
            </Link>
          )}
          <a href="#departments" className="btn btn-hero-secondary">
            <i className="fa-solid fa-compass"></i> Explore Lab Categories
          </a>
        </div>

        {/* Live Metrics Row */}
        <div className="hero-stats-row">
          <div className="hero-stat-card">
            <div className="stat-number">100+</div>
            <div className="stat-caption">Precision Instruments</div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-number">5</div>
            <div className="stat-caption">Lab Departments</div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-caption">Paperless Approvals</div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-number">ACID</div>
            <div className="stat-caption">Transactional Integrity</div>
          </div>
        </div>
      </section>

      {/* Role Showcase */}
      <section className="landing-section" style={{ backgroundColor: '#ffffff' }}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Role-Based Governance</span>
            <h2>Tailored Workspaces for Every Academic Role</h2>
            <p>Each user gets a dedicated, permission-controlled dashboard designed specifically for their lab responsibilities.</p>
          </div>

          <div className="roles-grid">
            {/* Admin */}
            <div className="role-card role-card-admin">
              <div className="role-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3>Lab Administrators</h3>
              <p>Complete authority over laboratory inventory, user accounts, and requisition queues.</p>
              <ul className="role-features-list">
                <li><i className="fa-solid fa-check"></i> Master Equipment CRUD Operations</li>
                <li><i className="fa-solid fa-check"></i> Review & Approve/Reject Requisitions</li>
                <li><i className="fa-solid fa-check"></i> Physical Issue & Return Verification</li>
                <li><i className="fa-solid fa-check"></i> Flag Damaged Units & Track Repairs</li>
                <li><i className="fa-solid fa-check"></i> Real-time Chart.js Analytics</li>
              </ul>
              <Link to="/login" className="role-link">Login as Admin &rarr;</Link>
            </div>

            {/* Faculty */}
            <div className="role-card role-card-faculty">
              <div className="role-icon">
                <i className="fa-solid fa-chalkboard-user"></i>
              </div>
              <h3>Faculty & Researchers</h3>
              <p>Streamlined requisitions for department practicals, advanced research, and curriculum demos.</p>
              <ul className="role-features-list">
                <li><i className="fa-solid fa-check"></i> Browse Complete Department Stock</li>
                <li><i className="fa-solid fa-check"></i> Submit Requisitions with Desired Units</li>
                <li><i className="fa-solid fa-check"></i> Track Requisition Statuses Live</li>
                <li><i className="fa-solid fa-check"></i> Monitor Active Allocations & Due Dates</li>
                <li><i className="fa-solid fa-check"></i> Full Archive of Past Lab Practicals</li>
              </ul>
              <Link to="/login" className="role-link">Login as Faculty &rarr;</Link>
            </div>

            {/* Student */}
            <div className="role-card role-card-student">
              <div className="role-icon">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <h3>Students & Scholars</h3>
              <p>Fast, transparent access to lab equipment for coursework experiments and capstone projects.</p>
              <ul className="role-features-list">
                <li><i className="fa-solid fa-check"></i> Instant Stock Availability Search</li>
                <li><i className="fa-solid fa-check"></i> 1-Click Equipment Requisition</li>
                <li><i className="fa-solid fa-check"></i> Monitor Requisition Approvals</li>
                <li><i className="fa-solid fa-check"></i> Due Date Alerts for Handed-Over Items</li>
                <li><i className="fa-solid fa-check"></i> Historical Return Receipt Logs</li>
              </ul>
              <Link to="/login" className="role-link">Login as Student &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Departments */}
      <section className="landing-section" id="departments">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Laboratory Directory</span>
            <h2>Integrated Academic Departments</h2>
            <p>Our centralized system synchronizes equipment across all science and engineering laboratories.</p>
          </div>

          <div className="departments-grid">
            {departments.map((dept, idx) => (
              <div key={idx} className="department-card">
                <div className="dept-icon" style={{ color: dept.color, backgroundColor: `${dept.color}15` }}>
                  <i className={`fa-solid ${dept.icon}`}></i>
                </div>
                <h4>{dept.name}</h4>
                <span className="dept-count">{dept.count} Cataloged</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-section" id="features" style={{ backgroundColor: '#ffffff' }}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Core Capabilities</span>
            <h2>Built for Reliability, Accuracy & Speed</h2>
            <p>Eliminate manual paper logs, avoid stock stockouts, and maintain 100% equipment accountability.</p>
          </div>

          <div className="features-grid">
            {features.map((f, idx) => (
              <div key={idx} className="feature-box">
                <div className="feature-icon" style={{ color: f.color, backgroundColor: `${f.color}15` }}>
                  <i className={`fa-solid ${f.icon}`}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section className="landing-section" id="workflow">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Execution Pipeline</span>
            <h2>How the Equipment Requisition Flow Works</h2>
            <p>A structured 4-step lifecycle ensuring full auditability and preventing lost assets.</p>
          </div>

          <div className="workflow-steps-grid">
            {steps.map((s, idx) => (
              <div key={idx} className="workflow-card">
                <div className="workflow-num">{s.step}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Demo / Ready to get started Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to Explore the College Lab Management System?</h2>
          <p>
            Experience the system in action with our instant 1-click demo accounts for Administrator, Faculty, or Student.
          </p>
          <div style={{ marginTop: '24px' }}>
            <Link to="/login" className="btn btn-hero-primary">
              <i className="fa-solid fa-right-to-bracket"></i> Launch Login Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <div className="landing-brand">
              <div className="brand-icon">
                <i className="fa-solid fa-microscope"></i>
              </div>
              <div>
                <h3>LabManager</h3>
                <span>College Laboratory Portal</span>
              </div>
            </div>
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              Department of Laboratory Sciences & Engineering. <br />
              Centralized inventory governance and digital requisition management.
            </p>
          </div>

          <div className="footer-col">
            <h5>Quick Portals</h5>
            <ul>
              <li><Link to="/login">Admin Control Center</Link></li>
              <li><Link to="/login">Faculty Requisitions</Link></li>
              <li><Link to="/login">Student Equipment Desk</Link></li>
              <li><a href="#departments">Department Directory</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Operating Hours</h5>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
              <strong>Monday – Friday:</strong> 8:00 AM – 6:00 PM<br />
              <strong>Saturday:</strong> 9:00 AM – 2:00 PM<br />
              <strong>Sunday & Holidays:</strong> Closed
            </p>
          </div>

          <div className="footer-col">
            <h5>Technical Architecture</h5>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
              <span className="badge badge-available" style={{ marginBottom: '6px' }}>React 18 + Vite</span><br />
              <span className="badge badge-issued" style={{ marginBottom: '6px' }}>Node.js + Express API</span><br />
              <span className="badge badge-approved">MySQL Transaction Pool</span>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} College Lab Equipment Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

