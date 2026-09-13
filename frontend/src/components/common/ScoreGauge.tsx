import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  trendText?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  label = 'Business Trust Health Score',
  trendText
}) => {
  const radius = size === 'lg' ? 64 : size === 'md' ? 46 : 30;
  const strokeWidth = size === 'lg' ? 9 : size === 'md' ? 7 : 5;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  // Colors based on score
  let strokeColor = '#16A34A'; // Green 80+
  let statusText = 'Healthy';
  let textColor = 'text-emerald-700';
  let bgBadge = 'bg-emerald-50 border-emerald-200 text-emerald-700';

  if (score < 60) {
    strokeColor = '#DC2626'; // Red <60
    statusText = 'Critical';
    textColor = 'text-red-700';
    bgBadge = 'bg-red-50 border-red-200 text-red-700';
  } else if (score < 75) {
    strokeColor = '#F59E0B'; // Amber 60-74
    statusText = 'Watch';
    textColor = 'text-amber-700';
    bgBadge = 'bg-amber-50 border-amber-200 text-amber-700';
  } else if (score < 85) {
    strokeColor = '#0284C7'; // Blue 75-84
    statusText = 'Moderate';
    textColor = 'text-sky-700';
    bgBadge = 'bg-sky-50 border-sky-200 text-sky-700';
  }

  const dimension = radius * 2 + 8;

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg height={dimension} width={dimension} className="-rotate-90">
          <circle
            stroke="#E2E8F0"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span
            className={`font-extrabold tracking-tight ${
              size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-sm'
            } text-slate-900`}
          >
            {score}
          </span>
          {size !== 'sm' && <span className="text-[10px] font-semibold text-slate-400 -mt-1">/ 100</span>}
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${bgBadge}`}>
              {statusText}
            </span>
            {trendText && <span className="text-xs font-medium text-slate-500">{trendText}</span>}
          </div>
          <span className="text-sm font-semibold text-slate-800 mt-1">{label}</span>
          <span className="text-xs text-slate-500">Continuous model assessment</span>
        </div>
      )}
    </div>
  );
};
