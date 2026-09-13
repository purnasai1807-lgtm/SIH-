import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Activity,
  ShieldAlert,
  Network,
  Sliders,
  Bell,
  MessageSquare,
  User,
  Settings,
  Building2,
  FileCheck2,
  FileText,
  Users,
  CheckCircle2,
  BarChart3,
  ScrollText,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const lenderLinks = [
    { label: 'Dashboard', path: '/lender/dashboard', icon: LayoutDashboard },
    { label: 'Opportunities', path: '/lender/opportunities', icon: Search },
    { label: 'Portfolio', path: '/lender/portfolio', icon: Briefcase },
    { label: 'Monitoring', path: '/lender/monitoring', icon: Activity },
    { label: 'Risk Analyzer', path: '/lender/risk', icon: ShieldAlert },
    { label: 'Dependency Analyzer', path: '/lender/dependency', icon: Network },
    { label: 'What-If Simulator', path: '/lender/simulator', icon: Sliders },
    { label: 'Alerts', path: '/lender/alerts', icon: Bell },
    { label: 'Messages', path: '/lender/messages', icon: MessageSquare },
    { label: 'Profile', path: '/lender/profile', icon: User },
    { label: 'Settings', path: '/lender/settings', icon: Settings }
  ];

  const borrowerLinks = [
    { label: 'Dashboard', path: '/borrower/dashboard', icon: LayoutDashboard },
    { label: 'Business Profile', path: '/borrower/profile', icon: Building2 },
    { label: 'Trust Health', path: '/borrower/health', icon: Activity },
    { label: 'Financing', path: '/borrower/financing', icon: Briefcase },
    { label: 'Monitoring', path: '/borrower/monitoring', icon: Activity },
    { label: 'Documents', path: '/borrower/documents', icon: FileText },
    { label: 'Alerts', path: '/borrower/alerts', icon: Bell },
    { label: 'Messages', path: '/borrower/messages', icon: MessageSquare },
    { label: 'Profile', path: '/borrower/profile-user', icon: User },
    { label: 'Settings', path: '/borrower/settings', icon: Settings }
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users Directory', path: '/admin/users', icon: Users },
    { label: 'Borrowers Directory', path: '/admin/borrowers', icon: Building2 },
    { label: 'Verification Queue', path: '/admin/verifications', icon: FileCheck2 },
    { label: 'Telemetry Ops', path: '/admin/telemetry', icon: Activity },
  ];

  const currentRole = user?.role || 'lender';
  const links =
    currentRole === 'admin'
      ? adminLinks
      : currentRole === 'borrower'
      ? borrowerLinks
      : lenderLinks;

  const portalName =
    currentRole === 'admin'
      ? 'Admin Operations'
      : currentRole === 'borrower'
      ? 'Borrower Portal'
      : 'Lender Intelligence';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-md group-hover:bg-blue-500 transition">
              CV
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">CodeVest</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
                {portalName}
              </span>
            </div>
          </NavLink>
        </div>

        {/* User preview widget */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{user?.name || 'Guest User'}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="capitalize">{currentRole} Verified</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom footer with CredForge attribution and logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="px-3 py-2 bg-slate-900/40 rounded-lg text-[11px] text-slate-400 flex items-center justify-between">
            <span>Built by <strong>CredForge</strong></span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">v1.2</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-900/60 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
