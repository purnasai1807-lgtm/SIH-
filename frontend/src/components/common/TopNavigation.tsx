import React from 'react';
import { Menu, Bell, Search, ShieldCheck, ChevronRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { dataService } from '../../services/dataService';

interface TopNavigationProps {
  onMobileMenuClick: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ onMobileMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const alerts = dataService.getAlerts();
  const unreadCount = alerts.filter(a => !a.isRead).length;

  // Format breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/" className="hover:text-blue-600 font-medium">CodeVest</Link>
          {pathParts.map((part, index) => {
            const path = `/${pathParts.slice(0, index + 1).join('/')}`;
            const isLast = index === pathParts.length - 1;
            const label = part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            return (
              <React.Fragment key={path}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                {isLast ? (
                  <span className="font-semibold text-slate-900">{label}</span>
                ) : (
                  <Link to={path} className="hover:text-blue-600">
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right section: Search, Alerts, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search simulation */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search business, GSTIN, risk metrics..."
            className="w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        {/* Alerts Bell */}
        <Link
          to={user?.role === 'admin' ? '/admin/alerts' : user?.role === 'borrower' ? '/borrower/alerts' : '/lender/alerts'}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </Link>

        {/* Role badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 capitalize">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>{user?.role || 'Lender'}</span>
        </div>

        {/* User profile quick view */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.name || 'Authorized User'}
            </div>
            <div className="text-[11px] text-slate-500">
              {user?.role === 'borrower'
                ? user.borrowerProfile?.businessName || 'Verified Borrower'
                : user?.role === 'admin'
                ? 'Platform Ops'
                : 'Capital Provider'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
