import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Activity,
  TrendingUp,
  FileCheck2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Clock,
  UploadCloud,
  FileText,
  ShieldAlert,
  Eye,
  EyeOff,
  Lock,
  Globe2,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { ScoreGauge } from '../../components/common/ScoreGauge';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatINR } from '../../utils/formatters';
import { calculateBorrowerProfileCompletion } from '../../utils/profileCompletion';
import { ScorePillarBreakdown } from '../../types';

export const BorrowerDashboard: React.FC = () => {
  const { user } = useAuth();
  const profile = user?.borrowerProfile;

  const completion = calculateBorrowerProfileCompletion(profile);
  const isDiscoverable = completion.visibilityStatus === 'DISCOVERABLE';
  const isPending = !isDiscoverable;
  const trustScore = dataService.getBusinessTrustScoreSync();
  const activePositions = dataService.getActivePositions();
  const myFacility = !isDiscoverable ? null : activePositions[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5" /> Business Telemetry Portal
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {profile?.businessName || 'Your Business Enterprise'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GSTIN: <span className="font-mono text-slate-700">{profile?.gstin || 'GSTIN Pending'}</span> • CIN/Reg: <span className="font-mono text-slate-700">{profile?.cin || 'CIN Pending'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/borrower/profile"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            Manage Profile
          </Link>
          <Link
            to="/borrower/financing-request"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" /> Request Capital
          </Link>
        </div>
      </div>

      {/* Mandatory Section 5: Profile Completion Banner for Incomplete Borrower Profiles */}
      {!isDiscoverable && (
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
                <span className="text-xs font-bold text-emerald-600">
                  {completion.totalPercentage}% Complete
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Your business profile is not yet complete. Complete your profile and verification to become visible to lenders and eligible for financing.
              </h3>
              <p className="text-xs text-slate-500">
                Borrower accounts remain private and concealed from lenders until all statutory registrations, banking feeds, and audit telemetry are submitted.
              </p>
            </div>

            <Link
              to="/borrower/profile"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 text-center flex items-center justify-center gap-1.5"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                completion.totalPercentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${completion.totalPercentage}%` }}
            />
          </div>

          {/* Checklist of Required Sections */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            {[
              { label: 'Authorized Person', done: !!(profile?.authorizedPersonName && profile?.mobile) },
              { label: 'Business Identity', done: !!(profile?.businessName && profile?.industry) },
              { label: 'Statutory (PAN/GST)', done: !!(profile?.pan && profile?.gstin) },
              { label: 'Financial Information', done: !!(profile?.annualRevenue && profile?.monthlyRevenue) },
              { label: 'Bank Account Details', done: !!(profile?.bankAccount?.accountNumber) },
              { label: 'Business Operations', done: !!(profile?.employeesCount) },
              { label: 'Financing Requirements', done: !!(profile?.requestedAmount) },
              { label: 'Document Center', done: !!(profile?.documents && profile?.documents.some(d => d.status === 'Uploaded' || d.status === 'Verified')) }
            ].map((sec, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  sec.done ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  sec.done ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {sec.done ? '✓' : '•'}
                </span>
                <span className="truncate">{sec.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Section 9: Borrower Dashboard Marketplace Visibility Card */}
      <div className={`p-5 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        completion.visibilityStatus === 'DISCOVERABLE'
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : completion.visibilityStatus === 'UNDER_VERIFICATION'
          ? 'bg-blue-50/70 border-blue-200 text-blue-950'
          : completion.visibilityStatus === 'REQUIRES_ACTION'
          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            completion.visibilityStatus === 'DISCOVERABLE'
              ? 'bg-emerald-100 text-emerald-700'
              : completion.visibilityStatus === 'UNDER_VERIFICATION'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-200 text-slate-700'
          }`}>
            {completion.visibilityStatus === 'DISCOVERABLE' ? (
              <Globe2 className="w-5 h-5" />
            ) : completion.visibilityStatus === 'UNDER_VERIFICATION' ? (
              <Clock className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Marketplace Visibility Status
              </span>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                completion.visibilityStatus === 'DISCOVERABLE'
                  ? 'bg-emerald-600 text-white'
                  : completion.visibilityStatus === 'UNDER_VERIFICATION'
                  ? 'bg-blue-600 text-white'
                  : completion.visibilityStatus === 'REQUIRES_ACTION'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}>
                {completion.visibilityStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              {completion.visibilityStatus === 'PRIVATE' && (
                'Your profile is private and hidden from lenders. Complete profile requirements to request verification.'
              )}
              {completion.visibilityStatus === 'UNDER_VERIFICATION' && (
                'Verification in progress. Automated telemetry and credit analysis underway.'
              )}
              {completion.visibilityStatus === 'DISCOVERABLE' && (
                'Your business is visible to verified lenders on the CodeVest marketplace.'
              )}
              {completion.visibilityStatus === 'REQUIRES_ACTION' && (
                'Action required on submitted information before verification can be granted.'
              )}
            </p>
          </div>
        </div>

        <Link
          to="/borrower/profile"
          className="px-4 py-2 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-xs transition shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <span>Update Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Trust Health Score"
          value={!isDiscoverable ? 'Assessment Pending' : `${trustScore.overallScore} / 100`}
          subtext={!isDiscoverable ? 'Awaiting regulatory audit' : 'Grade: Tier-1 Verified'}
          trend={!isDiscoverable ? 'Baseline queue' : '+4 pts this quarter'}
          icon={ShieldCheck}
        />
        <MetricCard
          label="Active Financing"
          value={!isDiscoverable ? 'No active request' : formatINR(myFacility?.financedAmount || 1500000)}
          subtext={!isDiscoverable ? 'Submit request to lenders' : '12-Month Working Capital'}
          icon={TrendingUp}
        />
        <MetricCard
          label="Verification Status"
          value={completion.verificationStatus.replace(/_/g, ' ')}
          subtext={isDiscoverable ? 'All registries clear' : 'MCA & GSTN cross-check'}
          icon={Calendar}
        />
        <MetricCard
          label="Monitoring Engine"
          value={!isDiscoverable ? 'Awaiting Activation' : 'Live Connected'}
          subtext={!isDiscoverable ? 'Activates on verification' : 'Last sync: 2 hours ago'}
          icon={Activity}
        />
      </div>

      {/* Main Grid: Business Trust Health & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Trust Health Score Detailed View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Business Trust Health Score Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isPending
                    ? 'Preliminary assessment baseline based on your registered parameters.'
                    : 'Lenders review this model score to evaluate financing eligibility and rates.'}
                </p>
              </div>

              <ScoreGauge
                score={isPending ? 72 : trustScore.overallScore}
                size="md"
                label="Trust Score"
                trendText={isPending ? 'Initial Model' : 'Improving'}
              />
            </div>

            {/* 6 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(Object.values(trustScore.pillars) as ScorePillarBreakdown[]).map((pillar, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{pillar.name}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {isPending ? Math.round(pillar.score * 0.85) : pillar.score} / {pillar.maxScore}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{
                        width: `${((isPending ? Math.round(pillar.score * 0.85) : pillar.score) / pillar.maxScore) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{pillar.insights[0]}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Want to raise your score to 90+?</span>
              <Link to="/borrower/health" className="font-bold text-emerald-700 hover:underline">
                View AI Improvement Checklist →
              </Link>
            </div>
          </div>

          {/* Active Facility or Request Capital CTA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {myFacility ? 'Current Financing Facility' : 'Capital Facility Status'}
                </h3>
                <p className="text-xs text-slate-500">
                  {myFacility ? 'Working Capital & Machinery Purchase' : 'No active financing commitments currently disbursed.'}
                </p>
              </div>
              <StatusBadge status={myFacility ? 'active' : 'pending'} />
            </div>

            {myFacility ? (
              <div className="p-4 bg-slate-50 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Disbursed</span>
                  <span className="font-bold text-slate-900">{formatINR(myFacility.financedAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Repaid</span>
                  <span className="font-bold text-emerald-600">{formatINR(myFacility.totalRepaid)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Outstanding</span>
                  <span className="font-bold text-slate-900">{formatINR(myFacility.financedAmount - myFacility.totalRepaid)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Rate</span>
                  <span className="font-bold text-blue-600">{myFacility.expectedReturnRate}% p.a.</span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Ready to request business capital?</span>
                  <span className="text-slate-500">
                    Apply for up to ₹50,00,000 based on your projected receivables and GST filing telemetry.
                  </span>
                </div>
                <Link
                  to="/borrower/financing-request"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 text-center transition"
                >
                  Create Request
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Statutory Verification Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Statutory Verification Checks</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-950">MCA Corporate Registry</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded">
                  {isPending ? 'IN PROGRESS' : 'ACTIVE'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-950">GST 36-Mo Filings</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded">
                  {isPending ? 'VERIFYING' : '100% ON-TIME'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-950">Account Aggregator Feed</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded">
                  {isPending ? 'CONNECTING' : 'SYNCED'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-950">Director PAN & Aadhaar</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-sm">Need Additional Growth Capital?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Complete your verification queue to unlock pre-approved working capital facilities up to ₹35,00,000 without collateral.
            </p>
            <Link
              to="/borrower/financing-request"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs mt-2"
            >
              Apply in 2 Minutes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
