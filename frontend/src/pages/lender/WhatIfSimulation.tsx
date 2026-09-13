import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sliders,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Building2,
  HelpCircle,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { simulationService } from '../../services/simulationService';
import { useAuth } from '../../context/AuthContext';
import { DownsideToleranceNotice } from '../../components/common/DownsideToleranceNotice';
import { formatINR } from '../../utils/formatters';
import { ScenarioSimulationInput, FinancingOpportunity } from '../../types';

export const WhatIfSimulationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOppId = searchParams.get('opportunityId') || 'opp-001';

  const { user } = useAuth();
  const opportunities: FinancingOpportunity[] = dataService.getOpportunitiesSync();

  const [selectedOppId, setSelectedOppId] = useState(initialOppId);
  const selectedOpportunity = opportunities.find(o => o.id === selectedOppId) || opportunities[0];
  const dependencyData = dataService.getDependencyAssessmentSync(selectedOpportunity?.id);

  // Simulator Inputs
  const [params, setParams] = useState<ScenarioSimulationInput>({
    revenueChangePercent: -20,
    receivableDelayDays: 30,
    primaryCustomerLoss: false,
    marginContractionPercent: -4
  });

  const preferredTolerance = user?.lenderProfile?.preferredDownsideTolerance || 100000;

  // Compute live scenario
  const result = simulationService.simulateScenario(selectedOpportunity, params);

  const handleReset = () => {
    setParams({
      revenueChangePercent: 0,
      receivableDelayDays: 0,
      primaryCustomerLoss: false,
      marginContractionPercent: 0
    });
  };

  const applyPreset = (type: 'mild' | 'moderate' | 'severe') => {
    if (type === 'mild') {
      setParams({
        revenueChangePercent: -10,
        receivableDelayDays: 15,
        primaryCustomerLoss: false,
        marginContractionPercent: -2
      });
    } else if (type === 'moderate') {
      setParams({
        revenueChangePercent: -20,
        receivableDelayDays: 30,
        primaryCustomerLoss: false,
        marginContractionPercent: -4
      });
    } else {
      setParams({
        revenueChangePercent: -35,
        receivableDelayDays: 60,
        primaryCustomerLoss: true,
        marginContractionPercent: -8
      });
    }
  };

  const baselineReceivableDays = selectedOpportunity?.metrics?.receivableDays || 42;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <Sliders className="w-3.5 h-3.5" /> Decision Support Engine
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Interactive What-If Scenario Simulator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stress-test borrower solvency under adverse revenue, working capital, and supply-chain conditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* Downside Tolerance Notice */}
      <DownsideToleranceNotice tolerance={preferredTolerance} />

      {/* Business Selector & Presets */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400">Selected MSME</label>
            <select
              value={selectedOppId}
              onChange={e => setSelectedOppId(e.target.value)}
              className="font-bold text-sm text-slate-900 bg-transparent border-0 focus:ring-0 p-0 cursor-pointer"
            >
              {opportunities.map(o => (
                <option key={o.id} value={o.id}>
                  {o.businessName} ({o.category} • Health Score: {o.healthScore}/100)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rapid Stress Presets */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <span className="text-xs text-slate-400 font-semibold mr-1">Stress Presets:</span>
          <button
            onClick={() => applyPreset('mild')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Mild (-10%)
          </button>
          <button
            onClick={() => applyPreset('moderate')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Moderate (-20%)
          </button>
          <button
            onClick={() => applyPreset('severe')}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Severe (-35% & Lost Top Client)
          </button>
        </div>
      </div>

      {/* Simulator Interface: Left Controls, Right Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stress Variables */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Simulation Parameters
          </h2>

          {/* 1. Revenue Shock */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Revenue Contraction / Growth</span>
              <span className={`font-bold ${params.revenueChangePercent < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {params.revenueChangePercent > 0 ? '+' : ''}{params.revenueChangePercent}%
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={30}
              step={5}
              value={params.revenueChangePercent}
              onChange={e => setParams({ ...params, revenueChangePercent: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-400">Simulates macro demand drop or customer cutbacks.</p>
          </div>

          {/* 2. Working Capital Elongation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Receivable Cycle Elongation</span>
              <span className="font-bold text-amber-600">+{params.receivableDelayDays} Days</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={params.receivableDelayDays}
              onChange={e => setParams({ ...params, receivableDelayDays: Number(e.target.value) })}
              className="w-full accent-amber-600"
            />
            <p className="text-[11px] text-slate-400">
              Current baseline: {baselineReceivableDays} days. Stressed: {baselineReceivableDays + params.receivableDelayDays} days.
            </p>
          </div>

          {/* 3. Margin Contraction */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Operating Margin Compression</span>
              <span className={`font-bold ${params.marginContractionPercent < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {params.marginContractionPercent}%
              </span>
            </div>
            <input
              type="range"
              min={-10}
              max={5}
              step={1}
              value={params.marginContractionPercent}
              onChange={e => setParams({ ...params, marginContractionPercent: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-400">Simulates raw material inflation or pricing discounts.</p>
          </div>

          {/* 4. Lost Top Customer */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={params.primaryCustomerLoss}
                onChange={e => setParams({ ...params, primaryCustomerLoss: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-rose-600"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  Simulate Total Loss of Primary Customer
                </span>
                <span className="text-slate-500 text-[11px]">
                  Removes {dependencyData?.customerConcentration?.topCustomerName || 'Top Customer'} (
                  {dependencyData?.customerConcentration?.topCustomerPercent || 38}% of sales).
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Right 2 Columns: Output Metrics & Scenario Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* 4 Stressed KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Stressed Debt Service (DSCR)</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${result.projectedDscr < 1.1 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {result.projectedDscr}x
                </span>
                <span className="text-xs text-slate-400">
                  (Baseline: {selectedOpportunity.debtServiceCoverageRatio}x)
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                {result.projectedDscr < 1.0
                  ? 'High risk: Operating cash flow insufficient for debt obligations.'
                  : result.projectedDscr < 1.3
                  ? 'Moderate risk: Thin buffer over debt obligations.'
                  : 'Sufficient headroom to service financing commitments.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Projected Monthly Free Cash Flow</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${result.projectedCashFlow < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {formatINR(result.projectedCashFlow)}
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Net operational cash flow after meeting monthly debt obligations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Default Probability</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${result.estimatedDefaultProbability > 20 ? 'text-rose-600' : result.estimatedDefaultProbability > 10 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {result.estimatedDefaultProbability}%
                </span>
                <span className="text-xs text-slate-400">(Baseline: 3.2%)</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Model assessment of repayment disruption within the facility tenure.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Preferred Downside Tolerance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">
                  {formatINR(preferredTolerance)}
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-700 pt-1">
                {result.downsideToleranceAssessment}
              </p>
            </div>
          </div>

          {/* Model Explanation Box */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Scenario Synthesis & Risk Commentary</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under this scenario ({params.revenueChangePercent}% revenue, +{params.receivableDelayDays} days receivable elongation
              {params.primaryCustomerLoss ? ', primary customer loss' : ''}), {selectedOpportunity.businessName} will maintain a projected DSCR of <strong>{result.projectedDscr}x</strong>.
              {result.projectedDscr < 1.1
                ? ' Repayment risk is severely elevated; structural working capital support or escrow controls would be necessary.'
                : ' The business retains operational solvency due to strong baseline gross margins.'}
            </p>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400">
              <strong>Regulatory Notice:</strong> Scenario simulations are mathematical approximations for decision support. CodeVest does not warrant that actual future financial events will conform to simulated parameters. Preferred downside tolerance is not insurance or an absolute loss cap.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
