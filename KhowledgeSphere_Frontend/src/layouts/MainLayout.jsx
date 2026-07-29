import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './MainLayout.css';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className={`layout-root ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="layout-main">
        <Navbar onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
