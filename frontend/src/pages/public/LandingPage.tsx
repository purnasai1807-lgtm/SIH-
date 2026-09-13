import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Activity,
  Network,
  Sliders,
  Bell,
  ArrowRight,
  CheckCircle2,
  Building2,
  Lock,
  Sparkles,
  HelpCircle,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export const LandingPage: React.FC = () => {
  const workflowSteps = [
    { step: '01', title: 'VERIFY', desc: 'MCA, GSTIN 36-mo reconciliation, physical premises audit, and Account Aggregator banking velocity.' },
    { step: '02', title: 'ASSESS', desc: 'Multi-pillar Business Trust Health Score (0-100), DSCR solvency, and concentration ratios.' },
    { step: '03', title: 'FINANCE', desc: 'Lenders evaluate opportunities with custom downside tolerance and transparent risk pricing.' },
    { step: '04', title: 'MONITOR', desc: 'Automated 24/7 continuous telemetry tracking GST filings, bank flows, and supplier/customer shifts.' },
    { step: '05', title: 'ALERT', desc: 'Early warning indicators detect receivable delays, margin compression, or customer loss signals.' },
    { step: '06', title: 'ACT', desc: 'Actionable intelligence for proactive refinancing, credit line adjustments, or escrow protection.' }
  ];

  const threePillars = [
    {
      title: 'Trust Intelligence',
      icon: ShieldCheck,
      badge: 'Pillar 1',
      desc: 'Multi-variable verification combining MCA corporate registry, 36-month GST parity, director KYC, and peer-audited financials into an objective Business Trust Health Score (0–100).'
    },
    {
      title: 'Risk Intelligence',
      icon: Network,
      badge: 'Pillar 2',
      desc: 'Deep multi-dimensional analysis spanning financial, liquidity, repayment DSCR, operational, and customer/supplier dependency risks with transparent evidence signals.'
    },
    {
      title: 'Continuous Monitoring',
      icon: Activity,
      badge: 'Pillar 3',
      desc: 'Not a point-in-time snapshot. Ongoing telemetry via RBI Account Aggregator feeds and GSTN monitors daily banking velocity and flags anomalies before distress occurs.'
    }
  ];

  return (
    <div className="space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Next-Generation Indian Fintech Infrastructure</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-normal">Built by CredForge</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          AI-Powered Business Financing Intelligence
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
          Verify businesses. Understand risk. Monitor continuously. Make informed financing decisions for Indian MSMEs with continuous financial telemetry and early-warning detection.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/lender/signin"
            className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            Explore Lender Portal <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/borrower/signin"
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            Get Business Financing
          </Link>
          <Link
            to="/how-it-works"
            className="w-full sm:w-auto px-5 py-3.5 text-slate-600 hover:text-slate-900 text-sm font-semibold transition"
          >
            How CodeVest Works
          </Link>
        </div>
      </section>

      {/* 2. THREE PRIMARY PORTALS (MANDATED SPECIFICATION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs uppercase tracking-wider font-bold text-blue-600 mb-2">Dedicated Access</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Three Institutional Portals
          </p>
          <p className="text-xs text-slate-500 mt-1">Tailored interfaces for every participant in the financing ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PORTAL 1: LENDER */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Portal 01</div>
              <h3 className="text-xl font-bold text-slate-950 mt-1">Lender Portal</h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                For individuals, institutions, and family offices providing business financing. Evaluate opportunities with multi-pillar trust scores, stress-test with What-If simulations, and monitor portfolios continuously.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified opportunity ranking & match engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customer & supplier dependency analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Continuous 24/7 post-financing monitoring</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-3">
              <Link
                to="/lender/signup"
                className="flex-1 text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Sign Up
              </Link>
              <Link
                to="/lender/signin"
                className="flex-1 text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* PORTAL 2: BORROWER */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Portal 02</div>
              <h3 className="text-xl font-bold text-slate-950 mt-1">Business / Borrower Portal</h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                For verified Indian MSMEs seeking growth financing. Connect GSTIN and bank statements via Account Aggregator, track your Trust Health Score, and unlock fair, non-dilutive capital.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rapid automated verification via GST & MCA</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Financing Readiness Score before submission</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transparent business health indicators</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-3">
              <Link
                to="/borrower/signup"
                className="flex-1 text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Sign Up
              </Link>
              <Link
                to="/borrower/signin"
                className="flex-1 text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* PORTAL 3: ADMIN */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:border-slate-800 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-5 font-bold">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Portal 03</div>
              <h3 className="text-xl font-bold text-slate-950 mt-1">Admin Portal</h3>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                For platform administrators, risk intelligence officers, and verification teams. Oversee pipeline verifications, monitor aggregate portfolio health, and review early-warning alerts.
              </p>

              <div className="mt-4 p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-200">
                <strong>Access Restriction:</strong> Admin registration is restricted and not available to the public. Only authorized CredForge personnel may sign in.
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100">
              <Link
                to="/admin/signin"
                className="block text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Sign In to Admin Console
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISUAL FLOW: VERIFY → ASSESS → FINANCE → MONITOR → ALERT → ACT */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">End-to-End Operational Lifecycle</h2>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">The CodeVest Financing Intelligence Flow</p>
            <p className="text-xs text-slate-400 mt-2">
              Replacing opaque, one-time credit checks with dynamic, real-time data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {workflowSteps.map((w, idx) => (
              <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 relative flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-black text-blue-400/30">{w.step}</div>
                  <h4 className="text-base font-bold text-white mt-1">{w.title}</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{w.desc}</p>
                </div>
                {idx < 5 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-500">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THREE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-wider font-bold text-blue-600 mb-2">Architectural Foundation</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Three Core Pillars of Confidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {threePillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    {p.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DEDICATED TRUST & NON-INSURANCE REGULATORY SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-300/90 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Trust, Risk Transparency & Regulatory Alignment</h3>
              <p className="text-xs text-slate-500">Essential principles governing CodeVest's decision-support technology</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-5">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                1. CodeVest is NOT an Insurance Product
              </h4>
              <p>
                CodeVest does not insure, reimburse, or guarantee investment capital. When a lender indicates a <em>Preferred Downside Tolerance</em> (e.g. ₹20,000 against ₹1,00,000 exposure), this is strictly an individual risk parameter used by our ranking algorithms. It is never a maximum loss cap, recovery guarantee, or insurance policy.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                2. Model-Indicated Decision Support
              </h4>
              <p>
                The Business Trust Health Score (0–100), dependency metrics, and What-If scenario simulations are mathematical models based on verified historical and live telemetry. They are tools for informed decision-making and do not guarantee business outcomes or eliminate credit risk.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                3. Continuous Verification Integrity
              </h4>
              <p>
                Instead of static PDFs, CodeVest validates through GSTN APIs, MCA registries, and RBI-regulated Account Aggregators (Setu / Anumati), ensuring bank statement credits match tax filings with zero circular manipulation.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                4. Capital Allocation Responsibility
              </h4>
              <p>
                Financing commitments are made directly between lenders and verified businesses. Lenders retain full discretion over capital commitments, tenure, and returns without third-party fund pooling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xs uppercase tracking-wider font-bold text-blue-600 mb-2">Frequently Asked Questions</h2>
          <p className="text-2xl font-bold text-slate-900">Understanding CodeVest</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does CodeVest verify businesses?',
              a: 'CodeVest integrates with MCA registers to confirm corporate existence, checks GSTR-1 and GSTR-3B filings for 36 months of tax compliance, verifies bank credits via RBI-regulated Account Aggregators, and requires geo-fenced premises audits.'
            },
            {
              q: 'What is the Business Trust Health Score?',
              a: 'It is an institutional rating from 0 to 100 synthesized across six weighted pillars: Business Verification (20), Financial Stability (20), Cash Flow Health (20), Repayment DSCR (20), Operational Stability (10), and Transparency (10).'
            },
            {
              q: 'What is "Preferred Downside Tolerance"?',
              a: 'It represents the lender\'s self-selected comfort threshold for risk management. IMPORTANT: It is NOT an insurance product, guarantee, or loss ceiling. It simply guides opportunity matching and stress simulations.'
            },
            {
              q: 'How does continuous monitoring work?',
              a: 'After financing is disbursed, CodeVest tracks ongoing tax filings, banking credits, and buyer concentration ratios. If receivable days lengthen or top customers drop, early warning alerts are triggered immediately.'
            }
          ].map((item, idx) => (
            <details key={idx} className="group bg-white rounded-xl border border-slate-200 p-4 open:bg-blue-50/40">
              <summary className="font-semibold text-xs text-slate-900 cursor-pointer flex items-center justify-between">
                <span>{item.q}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">▼</span>
              </summary>
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};
