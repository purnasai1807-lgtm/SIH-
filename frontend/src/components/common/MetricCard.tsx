import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export interface MetricCardProps {
  id?: string;
  title?: string;
  label?: string;
  value: string | number;
  subtitle?: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  } | string;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  tooltip?: string;
  badge?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  label,
  value,
  subtitle,
  subtext,
  trend,
  icon,
  tooltip,
  badge,
  className = ''
}) => {
  const displayTitle = title || label || '';
  const displaySubtitle = subtitle || subtext;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon !== null && ('render' in icon || '$$typeof' in icon))
    ) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-4 h-4" />;
    }
    return null;
  };

  const renderedIcon = renderIcon();

  return (
    <div
      id={id}
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium uppercase tracking-wider">
          <span>{displayTitle}</span>
          {tooltip && (
            <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600">
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        {renderedIcon && (
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {renderedIcon}
          </div>
        )}
        {badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
          {value}
        </div>
        {trend && (
          typeof trend === 'string' ? (
            <div className="flex items-center text-xs font-semibold px-1.5 py-0.5 rounded text-emerald-700 bg-emerald-50">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              <span>{trend}</span>
            </div>
          ) : (
            <div
              className={`flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                trend.isNeutral
                  ? 'text-slate-600 bg-slate-100'
                  : trend.isPositive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
              }`}
            >
              {trend.isNeutral ? (
                <Minus className="w-3 h-3 mr-0.5" />
              ) : trend.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              <span>{trend.value}</span>
            </div>
          )
        )}
      </div>

      {displaySubtitle && <p className="mt-1.5 text-xs text-slate-500 font-normal">{displaySubtitle}</p>}
    </div>
  );
};
