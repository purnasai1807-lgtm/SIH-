import React, { useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { dataService } from '../../services/dataService';

export const TelemetryOpsPage: React.FC = () => {
  const [alerts, setAlerts] = useState(dataService.getMonitoringAlerts());

  const eventFeed = [
    { time: '10:42 AM', entity: 'ABC Manufacturing Pvt Ltd', type: 'AA_BALANCE_SYNC', detail: 'HDFC Current Account balance ₹14.8L synced via Setu AA gateway. Trend: Normal.' },
    { time: '09:15 AM', entity: 'Delta Solar Power Systems', type: 'GST_FILING_OK', detail: 'GSTR-3B for August reconciled with electronic ledger. Tax paid: ₹3.42L.' },
    { time: 'Yesterday', entity: 'Zenith MedTech Solutions', type: 'CONCENTRATION_ALERT', detail: 'Primary buyer Apollo Hospital deferred billing cycle by 14 days. Early warning alert issued.' },
    { time: 'Yesterday', entity: 'Kaveri Agro Logistics', type: 'MANDATE_SUCCESS', detail: 'Auto-debit test ping via NPCI eNACH successful.' }
  ];

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          24/7 Continuous Telemetry Operations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live event bus capturing Account Aggregator balance velocity, GST reconciliation, and early risk flags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Telemetry Event Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Live Telemetry Event Bus</h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600 animate-pulse" /> STREAMING
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {eventFeed.map((e, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{e.entity}</span>
                  <span className="font-mono text-[10px] text-slate-400">{e.time}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{e.detail}</p>
                <div className="text-[10px] font-mono text-blue-700 font-semibold">{e.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Active System Flags */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Active High-Priority Alerts</h3>

            <div className="space-y-3">
              {alerts.map(a => (
                <div key={a.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-950">{a.businessName || a.title}</strong>
                    <span className="text-[10px] uppercase font-bold text-amber-800">{a.category}</span>
                  </div>
                  <p className="text-amber-900 text-[11px] leading-relaxed">{a.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
