import React from 'react';

interface ProgressBarProps {
  id?: string;
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  color?: 'amber' | 'emerald' | 'rose' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  id,
  value,
  label,
  sublabel,
  color = 'amber',
  size = 'md',
  showPercentage = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  const fillMap = {
    amber: 'bg-[#D4AF37]',
    emerald: 'bg-[#10B981]',
    rose: 'bg-rose-500',
    blue: 'bg-sky-500',
  };

  return (
    <div id={id} className="w-full space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-[#A3A3A3] text-[11px]">{label}</span>}
          <div className="flex items-center gap-2">
            {sublabel && <span className="text-[#737373] text-[11px] font-mono">{sublabel}</span>}
            {showPercentage && (
              <span className="font-bold text-white font-mono text-[11px]">{Math.round(clampedValue)}%</span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-[#262626] ${heightStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fillMap[color]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
