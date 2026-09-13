import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Mail, Phone, Calendar, UserCheck, CheckCircle2 } from 'lucide-react';
import { userService } from '../../services/userService';
import { User, UserRole } from '../../types';
import { formatINR } from '../../utils/formatters';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setUsers(userService.getAllUsers());
  }, []);

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.borrowerProfile?.businessName && u.borrowerProfile.businessName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" /> Identity & Access Management
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Users</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time directory of verified lenders, business operators, and platform administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-200 text-slate-800 font-bold px-3 py-1 rounded-lg">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, username..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          {(['all', 'lender', 'borrower', 'admin'] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
                roleFilter === role
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role === 'all' ? 'All Roles' : `${role}s`} (
              {role === 'all' ? users.length : users.filter(u => u.role === role).length})
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Username</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Associated Entity</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(user => {
                const isLender = user.role === 'lender';
                const isBorrower = user.role === 'borrower';
                const isAdmin = user.role === 'admin';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase">
                          {user.name ? user.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isAdmin
                            ? 'bg-purple-100 text-purple-800'
                            : isLender
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-slate-700 font-medium">@{user.username}</td>

                    <td className="p-4 text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {isBorrower && user.borrowerProfile && (
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {user.borrowerProfile.businessName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            GSTIN: {user.borrowerProfile.gstin}
                          </span>
                        </div>
                      )}
                      {isLender && user.lenderProfile && (
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {user.lenderProfile.investorType || 'Individual Investor'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Available: {formatINR(user.lenderProfile.availableCapital || 2500000)}
                          </span>
                        </div>
                      )}
                      {isAdmin && (
                        <span className="text-slate-400 italic">CodeVest Administrative Master</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
