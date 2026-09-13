import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { simulationService } from '../../services/simulationService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ScoreGauge } from '../../components/common/ScoreGauge';
import { DownsideToleranceNotice } from '../../components/common/DownsideToleranceNotice';
import { FinanceModal } from '../../components/lender/FinanceModal';
import { formatINR } from '../../utils/formatters';
import { ScorePillarBreakdown, ScenarioSimulationInput } from '../../types';

export const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const opportunity = dataService.getOpportunityByIdSync(id || 'opp-001') || dataService.getOpportunitiesSync()[0];
  const trustScoreData = dataService.getBusinessTrustScoreSync(opportunity?.id);
  const dependencyData = dataService.getDependencyAssessmentSync(opportunity?.id);
  const riskItems = dataService.getRiskItemsSync(opportunity?.id);

  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);

  // Simulation Controls for this specific business
  const [simParams, setSimParams] = useState<ScenarioSimulationInput>({
    revenueChangePercent: -15,
    receivableDelayDays: 20,
    primaryCustomerLoss: false,
    marginContractionPercent: -3
  });

  if (!opportunity) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Opportunity not found</h2>
        <Link to="/lender/opportunities" className="text-xs text-blue-600 font-bold hover:underline">
          ← Back to all opportunities
        </Link>
      </div>
    );
  }

  // Calculate live simulation on the fly
  const simResult = simulationService.simulateScenario(opportunity, simParams);
  const pillars = Object.values(trustScoreData.pillars) as ScorePillarBreakdown[];
  const lenderTolerance = user?.lenderProfile?.preferredDownsideTolerance || 100000;

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/lender/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Opportunities
        </Link>

        <button
          onClick={() => setIsFinanceModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          Commit Capital to this Facility
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {opportunity.category}
            </span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> GST & MCA Verified
            </span>
            <span className="text-xs text-slate-400 font-mono">Entity: {opportunity.legalEntity}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            {opportunity.businessName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {opportunity.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Verified Facility
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Working Capital & Growth
            </span>
          </div>
        </div>

        {/* Big Health Gauge */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex items-center gap-6 shrink-0 self-stretch lg:self-auto justify-center">
          <ScoreGauge
            score={trustScoreData.overallScore}
            size="lg"
            label="Business Trust Health Score"
            trendText="+4 pts vs last quarter"
          />
        </div>
      </div>

      {/* Downside Tolerance Notice */}
      <DownsideToleranceNotice tolerance={lenderTolerance} />

      {/* Financial Core Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase font-semibold">Requested Facility</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {formatINR(opportunity.requestedAmount)}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">{opportunity.tenureMonths} Months Tenure</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase font-semibold">Expected Return</span>
          <span className="text-lg font-bold text-blue-600 mt-1 block">
            {opportunity.expectedReturnRate}% p.a.
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">Disbursed monthly</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase font-semibold">Annual Revenue</span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {formatINR(opportunity.revenueAnnual)}
          </span>
          <span className="text-xs text-emerald-600 font-medium mt-0.5 block">GSTN Reconciled</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase font-semibold">Debt Service (DSCR)</span>
          <span className="text-lg font-bold text-emerald-600 mt-1 block">
            {opportunity.debtServiceCoverageRatio}x
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">Strong repayment headroom</span>
        </div>
      </div>

      {/* Multi-Pillar Score Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Multi-Pillar Verification Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            How CodeVest calculates the {trustScoreData.overallScore}/100 composite score from verified sources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{p.name}</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {p.score} / {p.maxScore}
                </span>
              </div>
              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(p.score / p.maxScore) * 100}%` }}
                />
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 pt-1">
                {p.insights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Customer & Supplier Concentration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Customer Concentration Analytics</h3>
            <p className="text-xs text-slate-500">Evaluating buyer dependency and payment track records</p>
          </div>

          <div className="space-y-3">
            {dependencyData.customerConcentration.customers.map((cust, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-slate-900">{cust.name}</strong>
                  <span className="font-bold text-blue-600">{cust.percentage}% Share</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${cust.percentage}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Status: {cust.status}</span>
                  <span>Tenure: {cust.tenureMonths} mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suppliers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Supplier & Input Dependency</h3>
            <p className="text-xs text-slate-500">Critical raw material sources and substitute availability</p>
          </div>

          <div className="space-y-3">
            {dependencyData.supplierConcentration.suppliers.map((sup, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-slate-900">{sup.name}</strong>
                  <span className="font-bold text-slate-700">{sup.percentage}% Sourcing</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full" style={{ width: `${sup.percentage}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Reliability: <strong className="text-slate-800">{sup.reliability}</strong></span>
                  <span>Top Supplier: {dependencyData.supplierConcentration.topSupplierName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive What-If Simulator for This Business */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Decision Support Simulator
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Live Scenario Stress-Test for {opportunity.businessName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust variables below to see immediate modeled impacts on DSCR, cash flow, and downside tolerance.
            </p>
          </div>
          <Link
            to={`/lender/what-if?opportunityId=${opportunity.id}`}
            className="text-xs font-semibold text-blue-400 hover:underline hidden sm:block"
          >
            Open Full Screen Sandbox →
          </Link>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Revenue */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Revenue Shock</span>
              <span className="font-bold text-rose-400">{simParams.revenueChangePercent}%</span>
            </div>
            <input
              type="range"
              min={-40}
              max={20}
              step={5}
              value={simParams.revenueChangePercent}
              onChange={e => setSimParams({ ...simParams, revenueChangePercent: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Receivable Delay */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Receivable Delay</span>
              <span className="font-bold text-amber-400">+{simParams.receivableDelayDays} Days</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={simParams.receivableDelayDays}
              onChange={e => setSimParams({ ...simParams, receivableDelayDays: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Margin Compression */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Margin Shift</span>
              <span className="font-bold text-rose-400">{simParams.marginContractionPercent}%</span>
            </div>
            <input
              type="range"
              min={-8}
              max={4}
              step={1}
              value={simParams.marginContractionPercent}
              onChange={e => setSimParams({ ...simParams, marginContractionPercent: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Lost Top Customer Toggle */}
          <div className="flex items-center pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={simParams.primaryCustomerLoss}
                onChange={e => setSimParams({ ...simParams, primaryCustomerLoss: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Simulate Top Customer Loss</span>
            </label>
          </div>
        </div>

        {/* Live Stressed Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Projected Stressed DSCR</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black ${simResult.projectedDscr < 1.1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simResult.projectedDscr}x
              </span>
              <span className="text-[11px] text-slate-400">(Baseline: {opportunity.debtServiceCoverageRatio}x)</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Debt service coverage under simulated stress
            </span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Estimated Default Probability</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black ${simResult.estimatedDefaultProbability > 15 ? 'text-rose-400' : 'text-slate-200'}`}>
                {simResult.estimatedDefaultProbability}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Risk score adjustment given parameters
            </span>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Downside Tolerance Comparison</span>
            <span className="text-sm font-bold text-white block mt-1">
              Threshold: {formatINR(lenderTolerance)}
            </span>
            <span className="text-[11px] text-blue-300 block mt-1">
              {simResult.downsideToleranceAssessment}
            </span>
          </div>
        </div>
      </div>

      {/* Identified Risk Factors */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Identified Risk Factors & Mitigants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {riskItems.map(item => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{item.category}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.severity === 'High' || item.severity === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : item.severity === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.severity}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
              <div className="text-[11px] text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                Mitigant: {item.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isFinanceModalOpen && (
        <FinanceModal
          opportunity={opportunity}
          userLenderProfile={user?.lenderProfile}
          onClose={() => setIsFinanceModalOpen(false)}
          onSuccess={() => {
            navigate('/lender/portfolio');
          }}
        />
      )}
    </div>
  );
};
