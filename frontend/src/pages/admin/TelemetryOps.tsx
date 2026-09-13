import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { dataService } from '../../services/dataService';

export const TelemetryOpsPage: React.FC = () => {
  const [alerts, setAlerts] = useState(dataService.getMonitoringAlerts());
  useEffect(() => {
    dataService.fetchAlerts('admin').then(setAlerts).catch(() => setAlerts([]));
  }, []);

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
            {alerts.length === 0 && <p className="text-xs text-slate-500">No live monitoring events have been recorded.</p>}
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
