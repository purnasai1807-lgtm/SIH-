import React from 'react';
import { Calendar, CheckCircle2, Download, Clock, ShieldCheck, Banknote } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { DownsideToleranceNotice } from '../../components/common/DownsideToleranceNotice';

export const BorrowerRepaymentsPage: React.FC = () => {
  const schedule = [
    { installment: 1, date: '2026-07-01', amount: 135000, status: 'paid', ref: 'CMS7721890' },
    { installment: 2, date: '2026-08-01', amount: 135000, status: 'paid', ref: 'CMS8812903' },
    { installment: 3, date: '2026-09-01', amount: 135000, status: 'paid', ref: 'CMS9931442' },
    { installment: 4, date: '2026-10-01', amount: 135000, status: 'upcoming', ref: 'Pending eNACH' },
    { installment: 5, date: '2026-11-01', amount: 135000, status: 'scheduled', ref: 'Scheduled' },
    { installment: 6, date: '2026-12-01', amount: 135000, status: 'scheduled', ref: 'Scheduled' }
  ];

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Repayment Ledger & eNACH Mandates
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track automated monthly installments, download GST-compliant interest receipts, and verify bank debits.
        </p>
      </div>

      {/* eNACH Mandate Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Active eNACH / NPCI Mandate</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Debit Account: HDFC Bank Current A/C ••4412 • UMRN: HDFC000299102941
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase">Next Auto-Debit</span>
          <span className="text-base font-bold text-slate-900 block">{formatINR(135000)}</span>
          <span className="text-xs text-blue-600 block">On Oct 01, 2026</span>
        </div>
      </div>

      <DownsideToleranceNotice />

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
          Monthly Installment Schedule
        </div>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
            <tr>
              <th className="p-4">Installment #</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Reference / UTR</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {schedule.map(s => (
              <tr key={s.installment} className="hover:bg-slate-50/60">
                <td className="p-4 font-bold text-slate-900">Installment #{s.installment}</td>
                <td className="p-4 font-semibold text-slate-800">{s.date}</td>
                <td className="p-4 font-bold text-slate-900">{formatINR(s.amount)}</td>
                <td className="p-4 font-mono text-slate-500">{s.ref}</td>
                <td className="p-4">
                  {s.status === 'paid' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      ✓ Paid via eNACH
                    </span>
                  )}
                  {s.status === 'upcoming' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      Upcoming
                    </span>
                  )}
                  {s.status === 'scheduled' && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Scheduled
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {s.status === 'paid' ? (
                    <button
                      onClick={() => alert(`Downloading statutory receipt for Installment #${s.installment}...`)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
