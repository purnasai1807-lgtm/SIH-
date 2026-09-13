import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, Building2 } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { ScoreGauge } from '../../components/common/ScoreGauge';
import { formatINR } from '../../utils/formatters';
import { ScorePillarBreakdown } from '../../types';

export const BusinessHealthPage: React.FC = () => {
  const trustScore = dataService.getBusinessTrustScoreSync();
  const pillars: ScorePillarBreakdown[] = Object.values(trustScore.pillars);

  const actionableRecommendations = [
    {
      title: 'Reduce Top Customer Concentration',
      impact: '+3 points',
      current: 'Primary customer represents 28% of quarterly billing',
      advice: 'Onboarding 1 new buyer generating >10% of revenue will diversify credit exposure.'
    },
    {
      title: 'Shorten Receivable Collection Cycle',
      impact: '+2 points',
      current: 'Average collection cycle is 42 days',
      advice: 'Targeting 35 days on corporate invoices will boost cash flow velocity pillar.'
    },
    {
      title: 'Provide ISO 9001:2015 Recertification',
      impact: '+1 point',
      current: 'Expires in 4 months',
      advice: 'Uploading renewal audit documents will ensure maximum transparency points.'
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Model Diligence
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Business Trust Health Score & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Transparent view into how lenders evaluate your creditworthiness, operating stability, and cash flow velocity.
        </p>
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 max-w-lg">
          <div className="text-xs font-bold uppercase text-emerald-700">Tier-1 Institutional Rating</div>
          <h2 className="text-2xl font-bold text-slate-950">Overall Health Score: 86 / 100</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your score places your business in the top 8% of verified Indian manufacturing MSMEs on CodeVest, unlocking prime financing interest rates (14% – 16% p.a.).
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <ScoreGauge score={86} size="lg" label="Trust Score" trendText="+4 pts (Improving)" />
        </div>
      </div>

      {/* Six Pillars */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Six Pillar Score Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{p.name}</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {p.score} / {p.maxScore} pts
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(p.score / p.maxScore) * 100}%` }}
                />
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-1">
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

      {/* Actionable Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">AI Score Optimization Guidance</h3>
        </div>
        <p className="text-xs text-slate-500">
          Actionable operational steps to raise your Business Trust Health Score above 90.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {actionableRecommendations.map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{r.title}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {r.impact}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{r.current}</p>
              <p className="text-xs text-slate-700 pt-1 border-t border-slate-200/70">{r.advice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
