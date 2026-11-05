import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Dynamic titles based on pathname
  const getPageTitle = (path) => {
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('equipment/add')) return 'Register New Equipment';
    if (path.includes('equipment/edit')) return 'Edit Lab Equipment';
    if (path === '/equipment') return 'Laboratory Equipment Directory';
    if (path.includes('users')) return 'User Account Management';
    if (path.includes('requests')) return 'Equipment Requisitions & Approvals';
    if (path.includes('issue-return')) return 'Issue & Return Desk';
    if (path.includes('my-requests')) return 'My Requisitions & History';
    return 'College Lab Equipment Management';
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          pageTitle={getPageTitle(location.pathname)} 
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

