import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Components
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import Equipment from './pages/Equipment';
import AddEquipment from './pages/AddEquipment';
import EditEquipment from './pages/EditEquipment';
import Users from './pages/Users';
import Requests from './pages/Requests';
import IssueReturn from './pages/IssueReturn';
import MyRequests from './pages/MyRequests';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px' }}></i>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

// Role-based Dashboard Dispatcher
function DashboardDispatcher() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Admin') return <AdminDashboard />;
  if (user.role === 'Faculty') return <FacultyDashboard />;
  return <StudentDashboard />;
}

// Role-restricted Route Guard
function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated Application Layout Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardDispatcher />} />
            
            {/* Equipment Routes */}
            <Route path="equipment" element={<Equipment />} />
            <Route 
              path="equipment/add" 
              element={
                <RoleRoute roles={['Admin']}>
                  <AddEquipment />
                </RoleRoute>
              } 
            />
            <Route 
              path="equipment/edit/:id" 
              element={
                <RoleRoute roles={['Admin']}>
                  <EditEquipment />
                </RoleRoute>
              } 
            />

            {/* Admin Management Routes */}
            <Route 
              path="users" 
              element={
                <RoleRoute roles={['Admin']}>
                  <Users />
                </RoleRoute>
              } 
            />
            <Route 
              path="requests" 
              element={
                <RoleRoute roles={['Admin']}>
                  <Requests />
                </RoleRoute>
              } 
            />
            <Route 
              path="issue-return" 
              element={
                <RoleRoute roles={['Admin']}>
                  <IssueReturn />
                </RoleRoute>
              } 
            />

            {/* Student & Faculty Personal Routes */}
            <Route path="my-requests" element={<MyRequests />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
