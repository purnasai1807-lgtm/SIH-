import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Sidebar } from '../components/common/Sidebar';
import { TopNavigation } from '../components/common/TopNavigation';
import { CodeVestAssistant } from '../components/common/CodeVestAssistant';

export const LenderLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const activeUser = user || authService.getCurrentUser();

  if (isLoading && !activeUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading CodeVest Lender Intelligence...</span>
        </div>
      </div>
    );
  }

  // Protect route
  if (!activeUser) {
    return <Navigate to="/lender/signin" state={{ from: location }} replace />;
  }

  // Strict role protection: only lenders allowed
  if (activeUser.role !== 'lender') {
    return <Navigate to={activeUser.role === 'borrower' ? '/borrower/dashboard' : '/admin/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopNavigation onMobileMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global AI Assistant */}
      <CodeVestAssistant />
    </div>
  );
};
