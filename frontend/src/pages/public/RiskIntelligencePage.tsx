import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Network, Sliders, Activity, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from '../../components/common/RiskBadge';

const riskCategories = [
  { id: 'verification', category: 'Business verification', severity: 'Low' as const, explanation: 'Identity, registration, and ownership records are reconciled against verified business documents.', evidenceSignal: 'Verification status and document review history.' },
  { id: 'financial', category: 'Financial stability', severity: 'Moderate' as const, explanation: 'Revenue, expenses, debt, and cash-flow history are evaluated together rather than in isolation.', evidenceSignal: 'Financial profiles and profitability margin.' },
  { id: 'repayment', category: 'Repayment capacity', severity: 'Moderate' as const, explanation: 'Repayment behaviour and current obligations indicate the ability to service new exposure.', evidenceSignal: 'Repayment records and outstanding obligations.' },
  { id: 'dependency', category: 'Dependency concentration', severity: 'Moderate' as const, explanation: 'Customer and supplier concentration can expose a business to a single-point failure.', evidenceSignal: 'Dependency records and concentration index.' },
  { id: 'monitoring', category: 'Continuous deterioration', severity: 'Low' as const, explanation: 'Material changes between financial and dependency readings create explainable alerts.', evidenceSignal: 'Monitoring events and deterioration thresholds.' },
];

export const RiskIntelligencePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
          Risk Analytics
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Risk Intelligence & Continuous Monitoring
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-3xl leading-relaxed">
          CodeVest tracks ten comprehensive risk dimensions in real time. We replace static credit assessments with continuous telemetry across bank flows, customer concentration, and supply-chain vulnerabilities.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">The 10 Monitored Risk Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskCategories.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{item.category}</span>
                <RiskBadge severity={item.severity} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                <strong className="text-slate-900">Evidence Signal: </strong>{item.evidenceSignal}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <Link to="/lender/opportunities" className="text-xs font-bold text-blue-600 hover:text-blue-700">
          View Live Financing Opportunities →
        </Link>
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
};
