import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileCheck2, Building2, Banknote, HelpCircle } from 'lucide-react';
import { ScoreGauge } from '../../components/common/ScoreGauge';

export const TrustVerificationPage: React.FC = () => {
  const pillars = [
    { name: 'Business verification', score: 20, maxScore: 20, insights: ['Registration and identity records are verified.'] },
    { name: 'Financial stability', score: 30, maxScore: 30, insights: ['Financial history and margins are assessed.'] },
    { name: 'Repayment capacity', score: 30, maxScore: 30, insights: ['Repayment performance is included in the score.'] },
    { name: 'Operational stability', score: 10, maxScore: 10, insights: ['Business continuity indicators are monitored.'] },
    { name: 'Dependency risk', score: 5, maxScore: 10, insights: ['Customer and supplier concentration are measured.'] },
    { name: 'Transparency', score: 10, maxScore: 10, insights: ['Explainable evidence accompanies every assessment.'] },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
          Methodology & Scoring
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Trust & Verification Framework
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-3xl leading-relaxed">
          How CodeVest evaluates, weights, and computes the <strong>Business Trust Health Score (0–100)</strong> using multi-source data reconciliations across GSTN, MCA, and RBI-regulated Account Aggregators.
        </p>
      </div>

      {/* Visual Score Card Showcase */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="space-y-3 max-w-md">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Example Assessment</div>
          <h2 className="text-2xl font-bold text-slate-900">ABC Manufacturing Pvt Ltd</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Composite score derived from 36 months of verified GSTR-3B filings, zero cheque bounces across 12 months, Tier-1 CIBIL Commercial rank (784), and a 2.34x Debt Service Coverage Ratio (DSCR).
          </p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <ScoreGauge score={86} size="lg" label="Business Trust Health Score" trendText="+4 pts (Improving)" />
        </div>
      </div>

      {/* Six Pillars Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">The Six Core Pillars</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{pillar.name}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  {pillar.score} / {pillar.maxScore} pts
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${(pillar.score / pillar.maxScore) * 100}%` }}
                />
              </div>
              <ul className="space-y-1 text-xs text-slate-600 pt-1">
                {pillar.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <Link to="/risk-intelligence" className="text-xs font-bold text-blue-600 hover:text-blue-700">
          Explore Continuous Risk Intelligence →
        </Link>
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
};
