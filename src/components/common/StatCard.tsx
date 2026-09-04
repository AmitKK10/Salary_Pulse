import React, { ReactNode } from 'react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  accentColor?: 'amber' | 'emerald' | 'rose' | 'blue' | 'slate';
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  onClick,
  className = '',
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-[#161616] border border-[#262626] p-4 rounded-xl shadow-lg transition-all duration-200 hover:border-[#333333] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-[#737373] uppercase tracking-widest font-semibold">{title}</p>
            {badge && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-2xl font-semibold text-white tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-[#1A1A1A] border border-[#262626] text-[#D4AF37] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-[#1F1F1F] flex items-center justify-between text-xs">
          {subtitle && <span className="text-[#737373] text-[11px] truncate max-w-[200px]">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center font-medium text-[11px] ${
                trend.isNeutral
                  ? 'text-[#737373]'
                  : trend.isPositive
                  ? 'text-[#10B981]'
                  : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
