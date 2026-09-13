import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  ArrowRight,
  Users,
  Briefcase
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { userService } from '../../services/userService';
import { dataService, BusinessRecord } from '../../services/dataService';
import { MetricCard } from '../../components/common/MetricCard';
import { formatINR } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [usersCount, setUsersCount] = useState({ total: 0, lenders: 0, borrowers: 0 });
  const [alerts] = useState(dataService.getMonitoringAlerts());

  const loadData = () => {
    const biz = businessService.getBusinesses();
    setBusinesses(biz);
    const users = userService.getAllUsers();
    setUsersCount({
      total: users.length,
      lenders: users.filter(u => u.role === 'lender').length,
      borrowers: users.filter(u => u.role === 'borrower').length
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingVerifications = businesses.filter(b => b.verificationStatus !== 'Verified');

  const handleApprove = (biz: BusinessRecord) => {
    businessService.updateVerificationStatus(biz.id, 'Verified');

    // Create an opportunity if needed
    const existingOpps = dataService.getFinancingRequests();
    if (!existingOpps.some(o => o.id === biz.id)) {
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

    loadData();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-semibold mb-1">
            <Server className="w-3.5 h-3.5" /> CredForge Operations Console
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            CodeVest Platform Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Network oversight, verification pipelines, and continuous risk intelligence telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" /> Users Directory ({usersCount.total})
          </Link>
          <Link
            to="/admin/verifications"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            Review Queue ({pendingVerifications.length})
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Registered MSMEs"
          value={`${businesses.length} Enterprises`}
          subtext={`${businesses.filter(b => b.verificationStatus === 'Verified').length} Verified Active`}
          icon={Building2}
        />
        <MetricCard
          label="Registered Lenders"
          value={`${usersCount.lenders} Capital Partners`}
          subtext="Participating in market"
          icon={Briefcase}
        />
        <MetricCard
          label="Pending Verifications"
          value={`${pendingVerifications.length} Awaiting Audit`}
          subtext="MCA & GSTN cross-check"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Active Telemetry Alerts"
          value={`${alerts.filter(a => !a.isRead).length} Flags`}
          subtext="Continuous operational checks"
          icon={Activity}
        />
      </div>

      {/* Main Grid: Pending Queue & Gateways */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Pending Verification Pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Verification & Diligence Queue</h2>
              <p className="text-xs text-slate-500">Businesses awaiting administrative approval onto live market</p>
            </div>
            <Link to="/admin/verifications" className="text-xs font-bold text-blue-600 hover:underline">
              View All Queue ({pendingVerifications.length}) →
            </Link>
          </div>

          {pendingVerifications.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              No pending verifications. All registered businesses have been reviewed.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingVerifications.slice(0, 3).map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold uppercase">
                          {item.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        GSTIN: {item.gstin} • CIN: {item.cin}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600">
                        Facility: {formatINR(item.requestedAmount || 2500000)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Annual Revenue</span>
                      <span className="font-semibold text-slate-800">{formatINR(item.annualRevenue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location</span>
                      <span className="font-semibold text-slate-800">{item.city}, {item.state}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Established</span>
                      <span className="font-semibold text-slate-800">Year {item.yearEstablished}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                    <Link
                      to="/admin/verifications"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                    >
                      Audit Details
                    </Link>
                    <button
                      onClick={() => handleApprove(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: System Gateways */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Integration Gateways Status</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">GSTN API Gateway</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  OPERATIONAL
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">MCA21 Corporate Registry</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  OPERATIONAL
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Account Aggregator (Setu)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  OPERATIONAL
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">e-Courts Judicial Database</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-sm">Direct Navigation</h3>
            <p className="text-xs text-slate-300">
              Inspect directory listings for all users and enterprises registered on CodeVest.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                to="/admin/users"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-center transition"
              >
                View Users Management →
              </Link>
              <Link
                to="/admin/borrowers"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-center transition"
              >
                View Borrowers Directory →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
