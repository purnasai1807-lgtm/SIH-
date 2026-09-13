import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, KeyRound, Server, CheckCircle2 } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
          Fintech Grade Infrastructure
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Security, Compliance & Data Governance
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-3xl leading-relaxed">
          CodeVest enforces strict institutional security controls, zero-knowledge bank credentials handling via RBI-regulated Account Aggregators, and tamper-resistant audit logging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">RBI Account Aggregator Framework</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We never see or store your net banking credentials. Banking feeds are retrieved purely via RBI-licensed Account Aggregators (Setu, Anumati, Finvu) with explicit, granular, time-bound consent.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">End-to-End Encryption (AES-256)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All customer documents, tax returns, and identity verification artifacts are encrypted in transit via TLS 1.3 and at rest using AES-256 encryption with automated key rotation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Indian Data Localization</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with RBI Master Directions on Data Storage and Digital Lending Guidelines, all financial data and telemetry reside within Tier-IV data centers located inside India.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Immutable Audit Trail</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every verification check, model score recalculation, and financing intent commitment is permanently logged with cryptographic timestamps for institutional compliance and dispute resolution.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <Link to="/about" className="text-xs font-bold text-blue-600 hover:text-blue-700">
          Read About CredForge Team →
        </Link>
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
};
