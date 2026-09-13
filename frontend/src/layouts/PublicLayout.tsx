import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Shield, Building2, Users, Lock, ChevronRight, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CodeVestAssistant } from '../components/common/CodeVestAssistant';

export const PublicLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white font-extrabold text-lg shadow-sm border border-slate-800 group-hover:bg-blue-600 transition-colors">
              CV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-950">CodeVest</span>
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                  Fintech
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                AI Business Financing & Lender Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <Link to="/about" className="hover:text-blue-600 transition">About</Link>
            <Link to="/how-it-works" className="hover:text-blue-600 transition">How It Works</Link>
            <Link to="/trust-verification" className="hover:text-blue-600 transition">Trust & Verification</Link>
            <Link to="/risk-intelligence" className="hover:text-blue-600 transition">Risk Intelligence</Link>
            <Link to="/security" className="hover:text-blue-600 transition">Security</Link>
            <Link to="/faq" className="hover:text-blue-600 transition">FAQ</Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={
                    user.role === 'admin'
                      ? '/admin/dashboard'
                      : user.role === 'borrower'
                      ? '/borrower/dashboard'
                      : '/lender/dashboard'
                  }
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/lender/signin"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Lender Sign In
                </Link>
                <Link
                  to="/borrower/signin"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Borrower Sign In
                </Link>
                <Link
                  to="/lender/signup"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global AI Assistant Floating Button */}
      <CodeVestAssistant />

      {/* Institutional Fintech Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                  CV
                </div>
                <span className="text-lg font-bold text-white tracking-tight">CodeVest</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                AI-powered business financing intelligence platform connecting verified Indian enterprises with lenders. Built with real-time financial telemetry, continuous health monitoring, and transparent risk intelligence.
              </p>
              <div className="pt-2 text-slate-500 font-medium text-[11px]">
                A product developed by the <strong className="text-slate-300">CredForge</strong> engineering and design team.
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Portals</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/lender/signin" className="hover:text-white transition">Lender Sign In</Link></li>
                <li><Link to="/lender/signup" className="hover:text-white transition">Lender Registration</Link></li>
                <li><Link to="/borrower/signin" className="hover:text-white transition">Borrower Sign In</Link></li>
                <li><Link to="/borrower/signup" className="hover:text-white transition">Borrower Onboarding</Link></li>
                <li><Link to="/admin/signin" className="hover:text-white transition">Admin Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Intelligence</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/trust-verification" className="hover:text-white transition">Trust Health Score</Link></li>
                <li><Link to="/risk-intelligence" className="hover:text-white transition">Continuous Monitoring</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition">Dependency Analyzer</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition">What-If Simulator</Link></li>
                <li><Link to="/security" className="hover:text-white transition">Account Aggregator & GST</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Compliance & Trust</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/security" className="hover:text-white transition">Security Architecture</Link></li>
                <li><Link to="/trust-verification" className="hover:text-white transition">Non-Insurance Policy</Link></li>
                <li><Link to="/about" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/about" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">Lender Disclosures</Link></li>
              </ul>
            </div>
          </div>

          {/* Regulatory Disclaimer Bar */}
          <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <p className="font-semibold text-slate-300">
              IMPORTANT REGULATORY NOTICE:
            </p>
            <p>
              CodeVest is a financial intelligence and matchmaking technology platform built by CredForge. CodeVest is NOT an insurance product, non-banking financial company (NBFC), or deposit-taking institution. CodeVest does not insure, guarantee, cap, or compensate lender losses.
            </p>
            <p>
              Preferred Downside Tolerance is purely a lender-selected risk preference used for decision-support and opportunity ranking. All business financing carries inherent commercial risk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-slate-400 text-xs">
              <div>© {new Date().getFullYear()} CodeVest. All rights reserved. Built by CredForge.</div>
              <div className="mt-2 sm:mt-0 flex gap-4">
                <span>Designed for Indian Fintech & MSME Ecosystem</span>
                <span>ISO 27001 & SOC-2 Aligned Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
