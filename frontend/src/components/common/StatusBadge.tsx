import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = (status || '').toLowerCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  if (['active', 'verified', 'healthy', 'approved', 'strong'].includes(norm)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dot = 'bg-emerald-500';
  } else if (['pending', 'in review', 'watch', 'adequate'].includes(norm)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
  } else if (['flagged', 'strained', 'action required', 'requires action'].includes(norm)) {
    style = 'bg-orange-50 text-orange-700 border-orange-200';
    dot = 'bg-orange-500';
  } else if (['at risk', 'critical', 'rejected', 'impaired'].includes(norm)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500';
  } else if (['completed', 'resolved'].includes(norm)) {
    style = 'bg-blue-50 text-blue-700 border-blue-200';
    dot = 'bg-blue-500';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${style} ${px} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{status}</span>
    </span>
  );
};
