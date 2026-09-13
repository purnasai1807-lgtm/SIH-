import React from 'react';
import { RiskSeverity } from '../../types';

interface RiskBadgeProps {
  severity: RiskSeverity | string;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ severity, size = 'sm' }) => {
  const norm = (severity || 'Moderate').toLowerCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  if (norm === 'low') {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dot = 'bg-emerald-500';
  } else if (norm === 'moderate') {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
    dot = 'bg-amber-500';
  } else if (norm === 'high') {
    style = 'bg-orange-50 text-orange-800 border-orange-200';
    dot = 'bg-orange-500';
  } else if (norm === 'critical') {
    style = 'bg-red-50 text-red-800 border-red-200';
    dot = 'bg-red-500';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${style} ${px} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{severity} Risk</span>
    </span>
  );
};
