import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ScoreGauge } from '../../components/common/ScoreGauge';
import { DownsideToleranceNotice } from '../../components/common/DownsideToleranceNotice';
import { formatINR } from '../../utils/formatters';
import { ActivePortfolioPosition, PlatformAlert } from '../../types';

export const PortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState<ActivePortfolioPosition[]>(dataService.getActivePositions());
  const [alerts, setAlerts] = useState<PlatformAlert[]>(dataService.getMonitoringAlerts());
  const [activeTab, setActiveTab] = useState<'positions' | 'telemetry' | 'ledger'>('positions');
  useEffect(() => {
    Promise.all([dataService.fetchPortfolio(), dataService.fetchAlerts('lender')])
      .then(([loadedPositions, loadedAlerts]) => {
        setPositions(loadedPositions);
        setAlerts(loadedAlerts);
      })
      .catch(() => undefined);
  }, []);

  const totalInvested = positions.reduce((sum, p) => sum + p.financedAmount, 0);
  const totalRepaid = positions.reduce((sum, p) => sum + p.totalRepaid, 0);
  const totalOutstanding = Math.max(0, totalInvested - totalRepaid);

  const preferredTolerance = user?.lenderProfile?.preferredDownsideTolerance || 100000;

  const handleResolveAlert = (alertId: string) => {
    dataService.resolveAlert(alertId);
    setAlerts(dataService.getMonitoringAlerts());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Portfolio & Continuous Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry tracking live MSME repayments, Account Aggregator flows, and early warning flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              Promise.all([dataService.fetchPortfolio(), dataService.fetchAlerts('lender')])
                .then(([loadedPositions, loadedAlerts]) => {
                  setPositions(loadedPositions);
                  setAlerts(loadedAlerts);
                })
                .catch(() => undefined);
            }}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Downside Tolerance Notice */}
      <DownsideToleranceNotice tolerance={preferredTolerance} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase font-semibold">Total Capital Financed</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{formatINR(totalInvested)}</span>
          <span className="text-xs text-slate-500 mt-0.5 block">{positions.length} Active Positions</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase font-semibold">Total Repayments Realized</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{formatINR(totalRepaid)}</span>
          <span className="text-xs text-slate-500 mt-0.5 block">Principal & interest collected</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase font-semibold">Current Outstanding Exposure</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{formatINR(totalOutstanding)}</span>
          <span className="text-xs text-slate-500 mt-0.5 block">Net active principal risk</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'positions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Positions ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'telemetry'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> 24/7 Early Warning Telemetry ({alerts.filter(a => !a.isRead).length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'ledger'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Repayment Ledger
        </button>
      </div>

      {/* TAB 1: Positions */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {positions.map(pos => (
            <div
              key={pos.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-sm">
                    {pos.businessName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/lender/opportunities/${pos.businessId}`}
                        className="font-bold text-base text-slate-900 hover:text-blue-600 transition"
                      >
                        {pos.businessName}
                      </Link>
                      <StatusBadge status={pos.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Disbursed: {pos.startDate} • Expected Return: <strong className="text-blue-600">{pos.expectedReturnRate}% p.a.</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{pos.healthScore}/100</div>
                    <div className="text-[10px] text-slate-400">Live Health</div>
                  </div>
                  <ScoreGauge score={pos.healthScore} size="sm" />
                </div>
              </div>

              {/* Progress & Financials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Capital Financed</span>
                  <span className="font-bold text-slate-900">{formatINR(pos.financedAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Repaid To Date</span>
                  <span className="font-bold text-emerald-600">{formatINR(pos.totalRepaid)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Remaining Months</span>
                  <span className="font-bold text-slate-900">{pos.remainingMonths} of {pos.tenureMonths} mo</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Next Due ({pos.nextPaymentDate})</span>
                  <span className="font-bold text-blue-600">
                    {pos.nextPaymentAmount ? formatINR(pos.nextPaymentAmount) : '—'}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">
                  Continuous Telemetry: <strong className="text-emerald-700">GSTR-3B Current • Account Aggregator Synced</strong>
                </span>
                <Link
                  to={`/lender/opportunities/${pos.businessId}`}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  View Details & What-If <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: 24/7 Telemetry & Alerts */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
            <strong>Continuous Monitoring Architecture:</strong> CodeVest actively polls RBI-regulated Account Aggregators (banking velocity) and GSTN filing portals monthly. Deviations from expected cash flow velocity trigger early warning alerts.
          </div>

          <div className="space-y-3">
            {alerts.map(a => (
              <div
                key={a.id}
                className={`p-5 rounded-2xl border transition ${
                  a.isRead
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : a.category === 'Critical'
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-amber-50/60 border-amber-200'
                } space-y-3`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{a.title}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          a.category === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {a.category} Priority
                      </span>
                      {a.businessName && (
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Entity: {a.businessName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{a.message}</p>
                    <div className="text-[10px] text-slate-400">Timestamp: {a.timestamp}</div>
                  </div>

                  {!a.isRead && (
                    <button
                      onClick={() => handleResolveAlert(a.id)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg shrink-0 shadow-xs cursor-pointer"
                    >
                      Acknowledge & Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Repayment Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">Business</th>
                  <th className="p-4">Facility ID</th>
                  <th className="p-4">Next Due Date</th>
                  <th className="p-4">Installment</th>
                  <th className="p-4">Total Repaid</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {positions.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="p-4 font-bold text-slate-900">{p.businessName}</td>
                    <td className="p-4 font-mono text-slate-500">{p.id}</td>
                    <td className="p-4 font-semibold text-blue-600">{p.nextPaymentDate}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {p.nextPaymentAmount ? formatINR(p.nextPaymentAmount) : '—'}
                    </td>
                    <td className="p-4 font-semibold text-emerald-600">{formatINR(p.totalRepaid)}</td>
                    <td className="p-4">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
