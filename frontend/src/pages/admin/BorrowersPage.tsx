import React, { useState, useEffect } from 'react';
import { Building2, Search, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { businessService } from '../../services/businessService';
import { BusinessRecord } from '../../services/dataService';
import { formatINR } from '../../utils/formatters';

export const BorrowersPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setBusinesses(businessService.getBusinesses());
  }, []);

  const filtered = businesses.filter(b => {
    if (statusFilter !== 'all' && b.verificationStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.gstin.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5" /> Enterprise Network
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">MSME Borrowers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered businesses, statutory filings, verification statuses, and financing capacity.
          </p>
        </div>

        <Link
          to="/admin/verifications"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          Open Verification Queue
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search business, GSTIN, city..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          {['all', 'Verified', 'Pending', 'In Review'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Businesses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-4">Enterprise</th>
                <th className="p-4">Sector & Location</th>
                <th className="p-4">Statutory IDs</th>
                <th className="p-4">Annual Revenue</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(biz => (
                <tr key={biz.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{biz.name}</div>
                    <div className="text-[11px] text-slate-400">Est. {biz.yearEstablished}</div>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-slate-800 block">{biz.category}</span>
                    <span className="text-[11px] text-slate-500">{biz.city}, {biz.state}</span>
                  </td>

                  <td className="p-4 font-mono text-slate-600">
                    <div>GSTIN: {biz.gstin}</div>
                    <div className="text-[10px] text-slate-400">CIN: {biz.cin}</div>
                  </td>

                  <td className="p-4 font-bold text-slate-900">
                    {formatINR(biz.annualRevenue)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        biz.verificationStatus === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {biz.verificationStatus === 'Verified' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {biz.verificationStatus}
                    </span>
                  </td>

                  <td className="p-4">
                    <Link
                      to="/admin/verifications"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Audit & Diligence <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
