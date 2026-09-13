import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface DownsideToleranceNoticeProps {
  amount?: number;
  tolerance?: number;
  compact?: boolean;
}

export const DownsideToleranceNotice: React.FC<DownsideToleranceNoticeProps> = ({
  amount,
  tolerance,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Regulatory & Risk Notice: </span>
          Preferred downside tolerance is a lender-selected risk preference for decision-support and opportunity matching. It does not cap, guarantee, insure, or reimburse actual financial exposure. CodeVest is not an insurance product.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-amber-950 text-xs leading-relaxed">
      <div className="flex items-center gap-2 font-semibold text-amber-900 mb-1">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>Essential Financial & Regulatory Clarification</span>
      </div>

      {amount !== undefined && tolerance !== undefined ? (
        <p className="mb-2 text-slate-800">
          Your total active financing commitment is <strong className="font-bold text-slate-900">{formatINR(amount)}</strong>.
          The indicated preferred downside tolerance of <strong className="font-bold text-slate-900">{formatINR(tolerance)}</strong> is strictly your self-defined risk threshold used by the model for opportunity ranking. It is <span className="underline font-medium">not a guaranteed loss ceiling</span>, capital reserve, recovery fund, or insurance policy.
        </p>
      ) : (
        <p className="mb-2 text-slate-800">
          CodeVest is an intelligence and financing platform connecting verified businesses with lenders. Preferred downside tolerance represents the lender's individual risk preference. It is not an insurance product, capital guarantee, or loss compensation fund.
        </p>
      )}

      <p className="text-[11px] text-amber-800 font-medium">
        Lending involves capital risk. All financing decisions are made at the lender's sole discretion based on verified business intelligence and model risk indicators.
      </p>
    </div>
  );
};
