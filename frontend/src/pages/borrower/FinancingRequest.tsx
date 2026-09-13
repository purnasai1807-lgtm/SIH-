import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CheckCircle2, AlertCircle, Building2, Sparkles, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { DownsideToleranceNotice } from '../../components/common/DownsideToleranceNotice';

export const FinancingRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    amount: 2000000,
    tenure: 12,
    purpose: 'Machinery upgrade and vendor inventory stocking for automotive OEM orders',
    repaymentSource: 'Confirmed receivables from Tier-1 auto manufacturers (TVS, Bosch)',
    growthProjection: 'Enables 25% revenue expansion in H2 FY27.'
  });

  // Calculate dynamic readiness
  const monthlyRevenue = 2100000;
  const monthlyExpenses = 1650000;
  const existingDebtMonthly = 120000;

  // Approx EMI at 15.5%
  const ratePerMonth = 0.155 / 12;
  const newEmi = Math.round(
    (formData.amount * ratePerMonth * Math.pow(1 + ratePerMonth, formData.tenure)) /
      (Math.pow(1 + ratePerMonth, formData.tenure) - 1)
  );

  const totalMonthlyDebt = existingDebtMonthly + newEmi;
  const netOperatingIncome = monthlyRevenue - monthlyExpenses;
  const projectedDscr = (netOperatingIncome / (totalMonthlyDebt || 1)).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/borrower/dashboard');
    }, 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Request Business Growth Capital
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit your financing request. Our AI readiness engine pre-scores your DSCR to fast-track lender review.
        </p>
      </div>

      <DownsideToleranceNotice />

      {submitted ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-10 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Financing Request Submitted Successfully
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your request for {formatINR(formData.amount)} has been queued for verification. Lenders on the CodeVest network will be notified immediately.
          </p>
          <div className="text-xs text-emerald-700 font-semibold">
            Redirecting to your dashboard...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Readiness Pre-Score Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                AI Financing Readiness Check
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase">Projected EMI</span>
                <span className="text-lg font-bold text-white mt-0.5 block">{formatINR(newEmi)}/mo</span>
                <span className="text-[10px] text-slate-400 block">At estimated 15.5% p.a.</span>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase">Projected Post-Debt DSCR</span>
                <span className={`text-lg font-black mt-0.5 block ${Number(projectedDscr) >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {projectedDscr}x
                </span>
                <span className="text-[10px] text-slate-400 block">Benchmark: ≥ 1.30x</span>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase">Eligibility Verdict</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High Approval Likelihood
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Backed by verified GST flows</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financing Amount Needed (INR) *
                </label>
                <input
                  type="number"
                  step={100000}
                  min={200000}
                  max={10000000}
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Tenure (Months) *
                </label>
                <select
                  value={formData.tenure}
                  onChange={e => setFormData({ ...formData, tenure: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  <option value={6}>6 Months</option>
                  <option value={9}>9 Months</option>
                  <option value={12}>12 Months (Recommended)</option>
                  <option value={18}>18 Months</option>
                  <option value={24}>24 Months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Purpose of Capital *
              </label>
              <textarea
                rows={3}
                required
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Repayment Source *
              </label>
              <textarea
                rows={2}
                required
                value={formData.repaymentSource}
                onChange={e => setFormData({ ...formData, repaymentSource: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Submit Facility Application
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
