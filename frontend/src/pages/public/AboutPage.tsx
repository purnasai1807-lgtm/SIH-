import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Award, Users, Building2, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
          About CodeVest
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Pioneering AI Financing Intelligence for Indian Enterprises
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-3xl leading-relaxed">
          CodeVest was conceived and engineered by the <strong>CredForge</strong> team to solve the critical credit friction facing high-performing Indian MSMEs. By replacing outdated annual balance sheet reviews with real-time financial telemetry, continuous monitoring, and transparent risk intelligence, CodeVest establishes a new standard of trust between businesses and capital providers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <Target className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-sm text-slate-900">Our Mission</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            To democratize institutional-grade financing intelligence for India's 63 million MSMEs, making working capital accessible based on actual operating health rather than pledgeable land collateral.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <ShieldCheck className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="font-bold text-sm text-slate-900">CredForge Heritage</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            CredForge brings together financial risk modelers, distributed systems engineers, and regulatory compliance architects to build robust, fraud-resistant fintech software.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <Award className="w-8 h-8 text-amber-600 mb-3" />
          <h3 className="font-bold text-sm text-slate-900">The CodeVest Standard</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Every business on CodeVest undergoes automated verification across GST, MCA, Account Aggregator, and geo-premises audits, ensuring reliable and auditable diligence.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold">The CredForge Code of Ethics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 pt-2 leading-relaxed">
          <div>
            <strong className="text-white block mb-1">1. Absolute Transparency:</strong>
            We do not sell insurance, guarantees, or synthetic credit enhancements. All model signals and downfalls are displayed clearly to lenders.
          </div>
          <div>
            <strong className="text-white block mb-1">2. Zero Collateral Penalties:</strong>
            Thriving businesses with reliable buyer receivables should not be excluded simply because they lack real estate assets.
          </div>
          <div>
            <strong className="text-white block mb-1">3. Continuous Care:</strong>
            Financing does not end at disbursement. Continuous monitoring helps borrowers spot cash flow bottlenecks before distress occurs.
          </div>
          <div>
            <strong className="text-white block mb-1">4. Data Privacy:</strong>
            Business financial telemetry is transmitted over encrypted, consent-based channels governed by RBI Account Aggregator guidelines.
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <Link to="/how-it-works" className="text-xs font-bold text-blue-600 hover:text-blue-700">
          Learn How CodeVest Works →
        </Link>
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
};
