import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, Building2, AlertTriangle, Search, Filter } from 'lucide-react';
import { businessService } from '../../services/businessService';
import { dataService, BusinessRecord } from '../../services/dataService';
import { formatINR } from '../../utils/formatters';

export const VerificationQueuePage: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    setBusinesses(businessService.getBusinesses());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = (biz: BusinessRecord, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'Verified' : 'Action Required';
    businessService.updateVerificationStatus(biz.id, newStatus);

    // If approved and not yet in opportunities list, create an opportunity
    if (action === 'approve') {
      const existingOpps = dataService.getFinancingRequests();
      const oppExists = existingOpps.some(o => o.id === biz.id);
      if (!oppExists) {
        dataService.addFinancingRequest({
          id: biz.id,
          businessName: biz.name,
          legalEntity: biz.legalEntity || 'Private Limited',
          industry: biz.industry || 'Manufacturing',
          category: biz.category,
          location: `${biz.city}, ${biz.state}`,
          requestedAmount: biz.requestedAmount || 2500000,
          tenureMonths: 12,
          purpose: 'Working capital and raw material procurement to fulfill confirmed customer orders.',
          expectedReturnRate: 16.5,
          healthScore: biz.healthScore || 84,
          trustScore: 84,
          riskLevel: 'Low',
          revenueAnnual: biz.annualRevenue || 35000000,
          monthlyGrowthRate: 8.5,
          debtServiceCoverageRatio: 2.1,
          dependencyRisk: 'Low',
          monitoringStatus: 'Active',
          suggestedAction: 'Prime Match',
          repaymentSource: 'Predictable recurring enterprise buyer invoicing cycles',
          growthPlanSummary: 'Expansion of manufacturing volume to satisfy tier-1 buyer order backlogs.',
          metrics: {
            monthlyRevenue: biz.monthlyRevenue || 2900000,
            monthlyExpenses: biz.monthlyExpenses || 2200000,
            netMargin: 18.2,
            receivableDays: 38,
            payableDays: 45,
            cashRunwayMonths: 5.5
          },
          monthlyPerformance: [
            { month: 'Oct 25', revenue: 2600000, expenses: 2000000, cashFlow: 600000 },
            { month: 'Nov 25', revenue: 2750000, expenses: 2100000, cashFlow: 650000 },
            { month: 'Dec 25', revenue: 2850000, expenses: 2150000, cashFlow: 700000 },
            { month: 'Jan 26', revenue: 2900000, expenses: 2200000, cashFlow: 700000 },
            { month: 'Feb 26', revenue: 2850000, expenses: 2180000, cashFlow: 670000 },
            { month: 'Mar 26', revenue: 2980000, expenses: 2240000, cashFlow: 740000 }
          ]
        });
      }
    }

    loadData();
    setFeedback(
      action === 'approve'
        ? `Successfully approved ${biz.name} and listed on the live marketplace.`
        : `Marked ${biz.name} as Action Required.`
    );
    setTimeout(() => setFeedback(null), 4000);
  };

  const filtered = businesses.filter(b => {
    if (filter === 'pending' && b.verificationStatus === 'Verified') return false;
    if (filter === 'verified' && b.verificationStatus !== 'Verified') return false;
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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          MSME Verification & Diligence Queue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Multi-source regulatory audits before onboarding businesses onto the live financing marketplace.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search business, GSTIN..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending / In Review ({businesses.filter(b => b.verificationStatus !== 'Verified').length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'verified'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Verified Active ({businesses.filter(b => b.verificationStatus === 'Verified').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Records ({businesses.length})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No businesses match the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => {
            const isVerified = item.verificationStatus === 'Verified';
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{item.name}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.city}, {item.state} • GSTIN: <span className="font-mono text-slate-700">{item.gstin}</span> • CIN: <span className="font-mono text-slate-700">{item.cin}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Requested Facility</span>
                    <span className="text-base font-bold text-slate-900 block">{formatINR(item.requestedAmount || 2500000)}</span>
                    <span className="text-xs text-slate-500">Annual Rev: {formatINR(item.annualRevenue)}</span>
                  </div>
                </div>

                {/* Checklist Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>MCA Corporate Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>GST 36-Mo Parity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Director NSDL KYC</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bank Velocity Synced</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Premises Geo-Audit</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    Verification State:{' '}
                    <strong className={`uppercase ${isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {item.verificationStatus}
                    </strong>
                  </span>

                  {!isVerified ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(item, 'reject')}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-rose-700 hover:bg-rose-50 font-semibold transition cursor-pointer"
                      >
                        Action Required
                      </button>
                      <button
                        onClick={() => handleAction(item, 'approve')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition cursor-pointer"
                      >
                        Approve & List on Market
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live on Marketplace
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
