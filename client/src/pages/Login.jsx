import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    setActiveRoleTab(role);
    if (role === 'admin') {
      setEmail('admin@college.edu');
      setPassword('admin123');
    } else if (role === 'faculty') {
      setEmail('prof.sharma@college.edu');
      setPassword('faculty123');
    } else if (role === 'student') {
      setEmail('rahul.kumar@college.edu');
      setPassword('student123');
    }
  };

  return (
    <div className="split-login-container">
      {/* Left Showcase Banner */}
      <div className="login-visual-panel">
        <div className="visual-content">
          <Link to="/" className="visual-brand">
            <div className="brand-icon">
              <i className="fa-solid fa-microscope"></i>
            </div>
            <div>
              <h3>LabManager</h3>
              <span>Institutional Portal</span>
            </div>
          </Link>

          <div className="visual-hero-text">
            <h2>Streamlined Precision for College Laboratories</h2>
            <p>
              Log in to manage equipment inventory, submit and review digital requisitions, 
              and maintain full accountability across all academic practicals.
            </p>
          </div>

          <div className="visual-features">
            <div className="visual-feature-item">
              <i className="fa-solid fa-circle-check"></i>
              <span>Live Available Stock & Condition Auditing</span>
            </div>
            <div className="visual-feature-item">
              <i className="fa-solid fa-circle-check"></i>
              <span>1-Click Digital Requisition & Approval Queues</span>
            </div>
            <div className="visual-feature-item">
              <i className="fa-solid fa-circle-check"></i>
              <span>Transactional Due-Date & Damage Tracking</span>
            </div>
          </div>

          <div className="visual-footer-quote">
            <p>"Ensuring zero equipment loss and 100% lab readiness for every student practical."</p>
            <span>— Central Laboratory Management Council</span>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="login-form-panel">
        <div className="login-form-box">
          <div className="login-top-bar">
            <Link to="/" className="back-link">
              <i className="fa-solid fa-arrow-left"></i> Back to Home
            </Link>
            <span className="secure-badge">
              <i className="fa-solid fa-lock"></i> 256-bit Secure
            </span>
          </div>

          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Please enter your college credentials to access your lab portal.</p>
          </div>

          {/* 1-Click Demo Credential Selector */}
          <div className="demo-selector-banner">
            <div className="demo-header-label">
              <i className="fa-solid fa-bolt" style={{ color: '#f59e0b' }}></i>
              <span>Quick Demo Autofill:</span>
            </div>
            <div className="demo-pill-group">
              <button
                type="button"
                className={`demo-pill ${activeRoleTab === 'admin' ? 'active-admin' : ''}`}
                onClick={() => fillCredentials('admin')}
              >
                <i className="fa-solid fa-shield-halved" style={{ color: '#ef4444' }}></i>
                Admin
              </button>
              <button
                type="button"
                className={`demo-pill ${activeRoleTab === 'faculty' ? 'active-faculty' : ''}`}
                onClick={() => fillCredentials('faculty')}
              >
                <i className="fa-solid fa-chalkboard-user" style={{ color: '#f59e0b' }}></i>
                Faculty
              </button>
              <button
                type="button"
                className={`demo-pill ${activeRoleTab === 'student' ? 'active-student' : ''}`}
                onClick={() => fillCredentials('student')}
              >
                <i className="fa-solid fa-graduation-cap" style={{ color: '#0284c7' }}></i>
                Student
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-envelope" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                College Email Address
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-solid fa-lock" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-light)'
                  }}
                  title="Toggle Password Visibility"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '15px', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i> Sign In to Lab Portal
                </>
              )}
            </button>
          </form>

          <div className="form-footer-note">
            <p>
              Protected by role-based authentication. <br />
              Need help? Contact the <a href="mailto:lab-support@college.edu">Lab Administrator</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
