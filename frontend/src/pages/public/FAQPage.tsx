import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, AlertTriangle } from 'lucide-react';
import { DOWNSIDE_TOLERANCE_DISCLAIMER } from '../../utils/formatters';

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      category: 'General & Platform Identity',
      items: [
        {
          q: 'What is CodeVest?',
          a: 'CodeVest is an AI-powered business financing intelligence platform built by the CredForge team. It connects verified Indian enterprises seeking non-dilutive financing with institutional and professional lenders using continuous risk telemetry.'
        },
        {
          q: 'Who builds and maintains CodeVest?',
          a: 'CodeVest is built and maintained by the CredForge engineering and financial design team.'
        }
      ]
    },
    {
      category: 'Financing & Regulatory Disclaimers',
      items: [
        {
          q: 'Is CodeVest an insurance product or credit guarantee fund?',
          a: 'NO. CodeVest is NOT an insurance product, and does not provide credit guarantees, loss compensation, or capital protection funds. All lending involves direct commercial credit risk.'
        },
        {
          q: 'What does "Preferred Downside Tolerance" mean?',
          a: DOWNSIDE_TOLERANCE_DISCLAIMER
        },
        {
          q: 'Are returns guaranteed?',
          a: 'No. Stated returns are illustrative model expectations based on borrower loan agreements. Repayment depends entirely on the operating cash flows and contract performance of the borrower.'
        }
      ]
    },
    {
      category: 'Verification & Monitoring',
      items: [
        {
          q: 'How does continuous monitoring differ from traditional credit checks?',
          a: 'Traditional credit bureaus provide historical point-in-time scores. CodeVest connects live Account Aggregator banking velocity and monthly GSTN tax filings to detect changes in customer concentration, receivable delays, or cash flow stress in real time.'
        },
        {
          q: 'What is the Business Trust Health Score?',
          a: 'A dynamic composite rating from 0 to 100 spanning Business Verification (20), Financial Stability (20), Cash Flow Health (20), Repayment DSCR (20), Operational Stability (10), and Transparency (10).'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
          Knowledge Base
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Everything you need to know about CodeVest financing intelligence, verification, and risk policies.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((sec, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{sec.category}</h2>
            <div className="space-y-2.5">
              {sec.items.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900">{item.q}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
};
