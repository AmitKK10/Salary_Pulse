// ============================================================================
// SALARYPULSE — HIGH-PRECISION WORK PROGRESS DONUT / PIE CHART
// Displays exact seconds-level progress across Daily (8h), Weekly (48h), and
// Monthly (208h) targets with normal hours, overtime, breaks, and remaining.
// ============================================================================

import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Coffee, 
  Target, 
  Layers,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatSecondsToClock, formatSecondsToDetailed, formatSecondsToHMS } from '../../utils/formatters';

export type DonutTimeframe = 'today' | 'week' | 'month';

interface WorkProgressDonutProps {
  todayActiveSeconds: number;
  todayBreakSeconds?: number;
  weekActiveSeconds?: number;
  weekRequiredSeconds?: number;
  monthActiveSeconds?: number;
  monthRequiredSeconds?: number;
  monthOvertimeSeconds?: number;
  perSecondRate: number;
  overtimeMultiplier?: number;
  defaultTimeframe?: DonutTimeframe;
  className?: string;
}

export const WorkProgressDonut: React.FC<WorkProgressDonutProps> = ({
  todayActiveSeconds,
  todayBreakSeconds = 0,
  weekActiveSeconds = 0,
  weekRequiredSeconds = 48 * 3600, // 48h default for 6-day week
  monthActiveSeconds = 0,
  monthRequiredSeconds = 208 * 3600, // 26 days * 8h
  monthOvertimeSeconds = 0,
  perSecondRate,
  overtimeMultiplier = 2.0,
  defaultTimeframe = 'today',
  className = '',
}) => {
  const [timeframe, setTimeframe] = useState<DonutTimeframe>(defaultTimeframe);

  // Daily target constants (8h = 28,800s)
  const dailyRequiredSeconds = 8 * 3600;

  // Segment metrics calculation based on active timeframe
  const metrics = useMemo(() => {
    let target = dailyRequiredSeconds;
    let actual = todayActiveSeconds;
    let ot = 0;
    let breaks = todayBreakSeconds;
    let title = 'Daily Work Target (8h)';
    let subtitle = '8 hours standard shift';

    if (timeframe === 'today') {
      target = dailyRequiredSeconds;
      actual = todayActiveSeconds;
      ot = Math.max(0, actual - target);
      breaks = todayBreakSeconds;
      title = 'Daily Shift Target';
      subtitle = `Standard Shift: ${formatSecondsToHMS(target)}`;
    } else if (timeframe === 'week') {
      target = weekRequiredSeconds || (48 * 3600);
      actual = weekActiveSeconds || todayActiveSeconds;
      ot = Math.max(0, actual - target);
      breaks = todayBreakSeconds * 6; // approximate or aggregate
      title = 'Weekly Target';
      subtitle = `Weekly Target: ${formatSecondsToHMS(target)}`;
    } else {
      target = monthRequiredSeconds || (208 * 3600);
      actual = monthActiveSeconds || todayActiveSeconds;
      ot = monthOvertimeSeconds || Math.max(0, actual - target);
      breaks = todayBreakSeconds * 26;
      title = 'Monthly Threshold';
      subtitle = `Monthly Threshold: ${formatSecondsToHMS(target)}`;
    }

    const normal = Math.min(actual, target);
    const remaining = Math.max(0, target - actual);
    const progressPct = target > 0 ? (actual / target) * 100 : 0;
    const normalPct = target > 0 ? Math.min(100, (normal / target) * 100) : 0;
    const otPct = target > 0 ? (ot / target) * 100 : 0;

    const normalEarned = normal * perSecondRate;
    const otEarned = ot * perSecondRate * overtimeMultiplier;
    const totalEarned = normalEarned + otEarned;

    return {
      target,
      actual,
      normal,
      ot,
      remaining,
      breaks,
      progressPct,
      normalPct,
      otPct,
      normalEarned,
      otEarned,
      totalEarned,
      title,
      subtitle,
      isTargetMet: actual >= target,
    };
  }, [
    timeframe, 
    todayActiveSeconds, 
    todayBreakSeconds, 
    weekActiveSeconds, 
    weekRequiredSeconds, 
    monthActiveSeconds, 
    monthRequiredSeconds, 
    monthOvertimeSeconds, 
    perSecondRate, 
    overtimeMultiplier
  ]);

  // SVG Donut calculation (radius 80, stroke 14, circumference 2 * pi * 80 ~= 502.65)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharrays & offsets
  const normalArcLength = (metrics.normalPct / 100) * circumference;
  const remainingArcLength = circumference - normalArcLength;

  // Overtime arc on secondary outer/expanded ring if OT exists
  const otCircumference = 2 * Math.PI * (radius + 10);
  const otArcLength = Math.min(otCircumference, (metrics.otPct / 100) * otCircumference);

  return (
    <div className={`p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl space-y-4 ${className}`}>
      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F1F1F] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Work Progress Donut</span>
              {metrics.isTargetMet && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-semibold border border-[#10B981]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Target Achieved
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#737373]">{metrics.subtitle}</p>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#262626] self-start sm:self-auto">
          {(['today', 'week', 'month'] as DonutTimeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition ${
                timeframe === tf
                  ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              {tf === 'today' ? 'Daily (8h)' : tf === 'week' ? 'Weekly (48h)' : 'Monthly (208h)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visual Layout: SVG Donut + Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: Donut SVG Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-[#1C1C1C]"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {/* Normal Hours Arc (Emerald) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-[#10B981] transition-all duration-700 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={`${normalArcLength} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                fill="transparent"
              />

              {/* Overtime Outer Glow/Ring if OT active */}
              {metrics.ot > 0 && (
                <circle
                  cx="100"
                  cy="100"
                  r={radius + 8}
                  className="stroke-[#D4AF37] transition-all duration-700 ease-out"
                  strokeWidth={4}
                  strokeDasharray={`${otArcLength} ${otCircumference}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  fill="transparent"
                />
              )}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-2xl sm:text-3xl font-light font-serif-display text-white tracking-tight tabular-nums">
                {metrics.progressPct.toFixed(1)}%
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#737373] mt-0.5">
                {metrics.isTargetMet ? (metrics.ot > 0 ? 'Target + OT' : 'Completed') : 'In Progress'}
              </span>
              <span className="text-xs font-mono text-[#D4AF37] font-semibold mt-1 tabular-nums">
                {formatSecondsToClock(metrics.actual)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Breakdown & Value Accrual */}
        <div className="md:col-span-7 space-y-3">
          {/* Segment Cards */}
          <div className="space-y-2 text-xs font-mono">
            {/* 1. Normal Working Time */}
            <div className="p-2.5 rounded-xl bg-[#161616] border border-[#242424] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                <div>
                  <span className="text-white font-semibold">Normal Work Hours</span>
                  <span className="block text-[10px] text-[#737373]">
                    {metrics.normalPct.toFixed(1)}% of required {formatSecondsToHMS(metrics.target)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-white font-bold block">{formatSecondsToHMS(metrics.normal)}</span>
                <span className="text-[#10B981] text-[11px]">{formatCurrency(metrics.normalEarned)}</span>
              </div>
            </div>

            {/* 2. Overtime Time */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              metrics.ot > 0 
                ? 'bg-[#18150B] border-[#D4AF37]/40' 
                : 'bg-[#161616] border-[#242424] opacity-60'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${metrics.ot > 0 ? 'bg-[#D4AF37] animate-pulse' : 'bg-[#555555]'}`} />
                <div>
                  <span className={metrics.ot > 0 ? 'text-[#D4AF37] font-semibold' : 'text-[#888888]'}>
                    Overtime Accrued
                  </span>
                  <span className="block text-[10px] text-[#737373]">
                    Eligible @ {overtimeMultiplier}x rate
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold block ${metrics.ot > 0 ? 'text-[#D4AF37]' : 'text-[#737373]'}`}>
                  +{formatSecondsToHMS(metrics.ot)}
                </span>
                <span className="text-[#D4AF37] text-[11px]">
                  {metrics.ot > 0 ? formatCurrency(metrics.otEarned) : '₹0.00'}
                </span>
              </div>
            </div>

            {/* 3. Remaining Time Until Target */}
            {!metrics.isTargetMet && (
              <div className="p-2.5 rounded-xl bg-[#161616] border border-[#242424] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0" />
                  <div>
                    <span className="text-[#A3A3A3]">Remaining to Target</span>
                    <span className="block text-[10px] text-[#737373]">Time needed before threshold</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#3B82F6] font-bold block">{formatSecondsToHMS(metrics.remaining)}</span>
                  <span className="text-[#737373] text-[11px]">{formatSecondsToDetailed(metrics.remaining)}</span>
                </div>
              </div>
            )}

            {/* 4. Breaks Logged */}
            {metrics.breaks > 0 && (
              <div className="p-2.5 rounded-xl bg-[#161616] border border-[#242424] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Coffee className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                  <div>
                    <span className="text-[#A3A3A3]">Break Duration</span>
                    <span className="block text-[10px] text-[#737373]">Lunch & rest intervals</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#F59E0B] font-bold block">{formatSecondsToHMS(metrics.breaks)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Cumulative Financial Total Footer */}
          <div className="pt-2 border-t border-[#1F1F1F] flex items-center justify-between text-xs">
            <span className="text-[#737373] font-mono uppercase text-[10px] tracking-wider">Total Value Accrued:</span>
            <span className="text-base font-bold font-serif-display text-[#D4AF37]">
              {formatCurrency(metrics.totalEarned)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
