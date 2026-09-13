import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sliders, Activity, Network, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
          Platform Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          How CodeVest Works
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-3xl leading-relaxed">
          From business onboarding and automated verification to multi-pillar health scores, interactive What-If stress testing, and continuous monitoring — here is the technical workflow powering CodeVest.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center shrink-0 text-lg">
            01
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Automated Business Onboarding & Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Businesses register with CIN, GSTIN, and promoter KYC. CodeVest triggers instant cross-verification with MCA registers, GSTN tax returns (36-month on-time filing verification), and connects bank statements via RBI-regulated Account Aggregators (Setu / Anumati).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center shrink-0 text-lg">
            02
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Multi-Pillar Business Trust Health Score (0–100)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our model synthesizes verified telemetry across six weighted dimensions: Business Verification (20 pts), Financial Stability (20 pts), Cash Flow Velocity (20 pts), Repayment DSCR (20 pts), Operational Track Record (10 pts), and Transparency (10 pts).
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 font-extrabold flex items-center justify-center shrink-0 text-lg">
            03
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Dependency & Risk Dimensioning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We analyze customer concentration (Top-1 and Top-3 billing share), supplier dependencies, and product margins. This protects capital providers from businesses whose revenue depends precariously on single clients.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 font-extrabold flex items-center justify-center shrink-0 text-lg">
            04
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Interactive What-If Simulation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lenders test scenarios before committing capital. What happens if revenue contracts by 20%? What if receivable days elongate by 30 days? Our simulator computes real-time impacts on DSCR, cash flow, and repayment capacity.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center shrink-0 text-lg">
            05
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Continuous 24/7 Monitoring & Early Warnings</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Post-disbursement, CodeVest does not sleep. Ongoing feeds monitor monthly tax filings and daily bank balances. Any deviation—such as customer churn or NACH friction—triggers immediate early warning alerts to lenders and borrowers alike.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <Link to="/trust-verification" className="text-xs font-bold text-blue-600 hover:text-blue-700">
          Explore Trust & Verification Framework →
        </Link>
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
};
