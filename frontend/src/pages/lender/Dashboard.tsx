import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Sliders,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building2,
  DollarSign,
  Calendar,
  Sparkles,
  Briefcase,
  Layers,
  Lock,
  Check,
  User,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { MetricCard } from '../../components/common/MetricCard';
import { ScoreGauge } from '../../components/common/ScoreGauge';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DownsideToleranceNotice } from '../../components/common/DownsideToleranceNotice';
import { FinanceModal } from '../../components/lender/FinanceModal';
import { formatINR, formatPercent } from '../../utils/formatters';
import { calculateLenderProfileCompletion } from '../../utils/profileCompletion';
import { FinancingOpportunity } from '../../types';

export const LenderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState<FinancingOpportunity[]>(
    dataService.getOpportunitiesSync()
  );
  const [activePositions, setActivePositions] = useState(
    dataService.getActivePositions(user?.id)
  );
  const [alerts] = useState(dataService.getMonitoringAlerts().filter(a => !a.isRead));
  const [selectedOpportunity, setSelectedOpportunity] = useState<FinancingOpportunity | null>(null);

  // Profile completion calculation
  const completion = calculateLenderProfileCompletion(user?.lenderProfile);

  // Aggregates
  const totalInvested = activePositions.reduce((sum, p) => sum + p.financedAmount, 0);
  const totalEarned = activePositions.reduce((sum, p) => sum + p.totalRepaid, 0);
  const averageHealthScore =
    activePositions.length > 0
      ? `${Math.round(activePositions.reduce((sum, p) => sum + p.healthScore, 0) / activePositions.length)} / 100`
      : 'No portfolio yet';

  const preferredTolerance = user?.lenderProfile?.preferredDownsideTolerance || 100000;
  const availableCapital = user?.lenderProfile?.availableCapital || 2500000;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Lender Intelligence Portal
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Investor'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activePositions.length > 0
              ? `Active telemetry monitoring ${activePositions.length} financed businesses across India.`
              : 'Explore verified MSME opportunities below to begin allocating capital.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/lender/what-if"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" /> Scenario Simulator
          </Link>
          <Link
            to="/lender/opportunities"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            Explore Opportunities <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Mandatory Section 3: Profile Completion Banner for Incomplete Lenders */}
      {completion.eligibilityStatus !== 'ELIGIBLE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Profile Completion
                </span>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  completion.statusBadge === 'COMPLETE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {completion.statusBadge}
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {completion.totalPercentage}% Complete
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Complete your lender profile to unlock financing participation and full marketplace verification.
              </h3>
              <p className="text-xs text-slate-500">
                Lenders with incomplete profiles can freely browse opportunities, view trust health metrics, and run simulations, but cannot commit financing until verified.
              </p>
            </div>

            <Link
              to="/lender/profile"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 text-center flex items-center justify-center gap-1.5"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                completion.totalPercentage >= 75 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${completion.totalPercentage}%` }}
            />
          </div>

          {/* Checklist of Incomplete Items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
              user?.lenderProfile?.fullName && user?.lenderProfile?.mobile ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                user?.lenderProfile?.fullName && user?.lenderProfile?.mobile ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {user?.lenderProfile?.fullName && user?.lenderProfile?.mobile ? '✓' : '•'}
              </span>
              <span className="truncate">Personal Information</span>
            </div>

            <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
              user?.lenderProfile?.kycStatus === 'Verified' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                user?.lenderProfile?.kycStatus === 'Verified' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {user?.lenderProfile?.kycStatus === 'Verified' ? '✓' : '•'}
              </span>
              <span className="truncate">Identity & KYC Verification</span>
            </div>

            <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
              user?.lenderProfile?.bankAccount?.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                user?.lenderProfile?.bankAccount?.verificationStatus === 'Verified' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {user?.lenderProfile?.bankAccount?.verificationStatus === 'Verified' ? '✓' : '•'}
              </span>
              <span className="truncate">Bank Account Details</span>
            </div>

            <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
              user?.lenderProfile?.preferredDownsideTolerance ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                user?.lenderProfile?.preferredDownsideTolerance ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {user?.lenderProfile?.preferredDownsideTolerance ? '✓' : '•'}
              </span>
              <span className="truncate">Lending Preferences</span>
            </div>
          </div>
        </div>
      )}

      {/* Downside Tolerance Banner Notice */}
      <DownsideToleranceNotice tolerance={preferredTolerance} />

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Available Capital"
          value={formatINR(availableCapital)}
          subtext="Connected & ready to deploy"
          icon={DollarSign}
        />
        <MetricCard
          label="Active Financed Capital"
          value={formatINR(totalInvested)}
          subtext={activePositions.length > 0 ? `${activePositions.length} active MSME positions` : '0 active deployments'}
          icon={Briefcase}
        />
        <MetricCard
          label="Portfolio Health Score"
          value={averageHealthScore}
          subtext={activePositions.length > 0 ? 'Model-indicated health' : 'Awaiting first commitment'}
          icon={ShieldCheck}
        />
        <MetricCard
          label="Continuous Alerts"
          value={`${alerts.length} Active`}
          subtext="Telemetry early warnings"
          icon={Activity}
        />
      </div>

      {/* Main Grid: Opportunities & Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: High-Scoring Verified Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Verified Opportunities</h2>
              <p className="text-xs text-slate-500">Curated businesses meeting your risk & return profile</p>
            </div>
            <Link
              to="/lender/opportunities"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All ({opportunities.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {opportunities.slice(0, 3).map(opp => (
              <div
                key={opp.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-sm">
                      {opp.businessName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/lender/opportunities/${opp.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-blue-600 transition"
                        >
                          {opp.businessName}
                        </Link>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                          {opp.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {opp.city}, {opp.state} • Established {opp.yearEstablished}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {opp.trustScore.overallScore}/100
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">Verified Health</div>
                    </div>
                    <ScoreGauge score={opp.trustScore.overallScore} size="sm" />
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Requested</span>
                    <span className="font-bold text-slate-900">{formatINR(opp.requestedAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Exp. Return</span>
                    <span className="font-bold text-blue-600">{opp.expectedReturnRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tenure</span>
                    <span className="font-bold text-slate-900">{opp.tenureMonths} Months</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Funded</span>
                    <span className="font-bold text-emerald-600">
                      {formatPercent((opp.fundedAmount / opp.requestedAmount) * 100)}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  <span className="text-slate-500 truncate max-w-[280px]">
                    Purpose: {opp.purpose || opp.useOfFunds}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/lender/opportunities/${opp.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      Diligence Deep-Dive
                    </Link>
                    <button
                      onClick={() => setSelectedOpportunity(opp)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Finance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Active Positions & Continuous Telemetry */}
        <div className="space-y-6">
          {/* Active Positions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Active Portfolio</h3>
              <Link to="/lender/portfolio" className="text-xs font-semibold text-blue-600 hover:underline">
                Manage
              </Link>
            </div>

            {activePositions.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <Layers className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No active positions yet</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  You have not committed capital to any enterprise yet. Browse verified opportunities to begin building your portfolio.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePositions.map(pos => (
                  <div key={pos.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {pos.businessName}
                      </span>
                      <StatusBadge status={pos.status.toLowerCase()} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Invested: {formatINR(pos.financedAmount)}</span>
                      <span className="font-semibold text-emerald-600">
                        {pos.expectedReturnRate}% p.a.
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Next Due: {pos.nextPaymentDate}</span>
                      <span>{pos.nextPaymentAmount ? formatINR(pos.nextPaymentAmount) : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Continuous Early Warning Telemetry */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Early Warning Telemetry</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                Live
              </span>
            </div>

            <div className="space-y-2.5">
              {alerts.map(a => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{a.businessName}</span>
                    <span className="text-[10px] font-semibold text-amber-800 uppercase">
                      {a.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{a.message}</p>
                  <div className="text-[10px] text-slate-400">Detected: {a.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedOpportunity && (
        <FinanceModal
          opportunity={selectedOpportunity}
          userLenderProfile={user?.lenderProfile}
          onClose={() => setSelectedOpportunity(null)}
          onSuccess={() => {
            setOpportunities(dataService.getOpportunitiesSync());
            setActivePositions(dataService.getActivePositions(user?.id));
          }}
        />
      )}
    </div>
  );
};
