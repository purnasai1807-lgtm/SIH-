import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSignInPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(usernameOrEmail, password, 'admin');
    setIsLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please check administrator credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-900">
      <div className="w-full max-w-md bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 bg-black/40 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
              CV
            </div>
            <span className="text-sm font-bold tracking-tight text-white">CodeVest Control Center</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Administrator Sign In</h1>
          <p className="text-xs text-slate-400 mt-1">Platform operations, verification queue & risk intelligence</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Username or Official Email *
            </label>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={e => setUsernameOrEmail(e.target.value)}
              placeholder="Enter administrator ID or email"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Admin Password *</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 pr-10 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Remember session</span>
            </label>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>Encrypted Protocol</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Control Center'}
          </button>

          <div className="pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            Restricted access. All administrative operations are logged with cryptographic audit signatures.
          </div>
        </form>
      </div>
    </div>
  );
};
