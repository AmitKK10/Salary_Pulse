// ============================================================================
// SALARYPULSE — ANDROID WIDGET & SHORTCUTS STUDIO (STEP 12)
// Compact Home-Screen Widget experience, Android Home Screen simulator,
// PWA Shortcuts management & Native Android architecture documentation
// ============================================================================

import React, { useState } from 'react';
import { 
  Smartphone, 
  Layers, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  Info, 
  ShieldCheck, 
  Compass, 
  Code2, 
  Share2,
  Download,
  Flame,
  Clock,
  ArrowRight,
  Maximize2,
  Zap
} from 'lucide-react';
import { HomeScreenWidget } from '../widget/HomeScreenWidget';
import { useApp } from '../../context/AppContext';
import { PwaService } from '../../services/pwaService';

export const WidgetView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [viewMode, setViewMode] = useState<'standalone' | 'android-sim' | 'architecture'>('android-sim');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);

  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    new URLSearchParams(window.location.search).get('mode') === 'widget'
  );

  const openPopoutWidget = () => {
    if (typeof window !== 'undefined') {
      const widgetUrl = `${window.location.origin}/?mode=widget`;
      window.open(
        widgetUrl,
        'SalaryPulseWidget',
        'width=440,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      );
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    if (key === 'kotlin') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedShortcut(key);
      setTimeout(() => setCopiedShortcut(null), 2000);
    }
  };

  const pwaShortcutsList = [
    {
      name: 'Start Work',
      url: '/?action=start-work',
      desc: 'Clocks in and begins active work session immediately',
      icon: '▶'
    },
    {
      name: 'Take Break',
      url: '/?action=take-break',
      desc: 'Starts lunch / coffee break countdown timer',
      icon: '☕'
    },
    {
      name: 'Resume Work',
      url: '/?action=resume-work',
      desc: 'Resumes active work tracking after break',
      icon: '⏯'
    },
    {
      name: 'Clock Out',
      url: '/?action=clock-out',
      desc: 'Finalizes workday and records daily earnings',
      icon: '⏹'
    },
    {
      name: 'Dashboard',
      url: '/?tab=dashboard',
      desc: 'Opens monthly summary and core salary metrics',
      icon: '📊'
    }
  ];

  const jetpackGlanceSampleCode = `// Android Jetpack Glance Widget Provider (Kotlin / TWA Integration)
package com.salarypulse.widget

import android.content.Context
import androidx.glance.*
import androidx.glance.appwidget.*
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.graphics.Color

class SalaryPulseWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            GlanceTheme {
                Column(
                    modifier = GlanceModifier
                        .fillMaxSize()
                        .background(Color(0xFF0E0E12))
                        .padding(16.dp)
                        .cornerRadius(24.dp)
                ) {
                    Text(
                        text = "SALARYPULSE",
                        style = TextStyle(color = ColorProvider(Color(0xFFD4AF37)), fontWeight = FontWeight.Bold)
                    )
                    Text(
                        text = "TODAY: ₹594.95 earned",
                        style = TextStyle(color = ColorProvider(Color.White), fontSize = 18.sp)
                    )
                    Text(
                        text = "WORK: 04:10:58 / 08:00:00",
                        style = TextStyle(color = ColorProvider(Color(0xFF10B981)))
                    )
                }
            }
        }
    }
}
class SalaryPulseWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = SalaryPulseWidget()
}`;

  return (
    <div id="widget-view" className="space-y-6 pb-16 animate-fadeIn max-w-5xl mx-auto px-2 sm:px-4">
      {/* Top Banner / Mode Toggle */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#14141A] to-[#0E0E12] border border-[#262634] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B38F22] flex items-center justify-center shadow-md">
              <Smartphone className="w-3.5 h-3.5 text-[#0A0A0D]" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight font-mono">
              Android Home-Screen Widget & PWA Shortcuts
            </h1>
          </div>
          <p className="text-xs text-[#9090A4] font-sans">
            Compact finance & productivity widget with live telemetry rings and instant Android launcher shortcuts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <button
            onClick={() => setViewMode('android-sim')}
            className={`px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'android-sim'
                ? 'bg-[#D4AF37] text-black border-[#F3E5AB] font-bold shadow-md'
                : 'bg-[#181820] text-[#A0A0B2] border-[#2E2E3E] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Home Sim</span>
          </button>

          <button
            onClick={() => setViewMode('standalone')}
            className={`px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'standalone'
                ? 'bg-[#D4AF37] text-black border-[#F3E5AB] font-bold shadow-md'
                : 'bg-[#181820] text-[#A0A0B2] border-[#2E2E3E] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pure Widget</span>
          </button>

          <button
            onClick={() => setViewMode('architecture')}
            className={`px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'architecture'
                ? 'bg-[#D4AF37] text-black border-[#F3E5AB] font-bold shadow-md'
                : 'bg-[#181820] text-[#A0A0B2] border-[#2E2E3E] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Platform Spec</span>
          </button>

          <button
            onClick={openPopoutWidget}
            className="px-3 py-1.5 rounded-xl bg-[#1C1C26] hover:bg-[#252534] text-[#E0E0EC] border border-[#323246] transition cursor-pointer flex items-center gap-1.5"
            title="Pop out in compact mini window"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Pop-Out</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: ANDROID HOME SCREEN SIMULATOR */}
      {viewMode === 'android-sim' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Android Mobile Frame Simulator */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full max-w-[390px] aspect-[9/18.5] max-h-[720px] bg-black border-[7px] border-[#282834] rounded-[44px] shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden relative flex flex-col justify-between p-4 bg-cover bg-center select-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 30%, #1c1c28 0%, #0c0c12 70%, #050508 100%)'
              }}
            >
              {/* Android Top Speaker & Camera Punch-Hole */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black rounded-full flex items-center justify-center z-20">
                <div className="w-2.5 h-2.5 rounded-full bg-[#181820] border border-[#282834]" />
              </div>

              {/* Android Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#D0D0E0] px-3 pt-1 pb-2 z-10">
                <span>09:41</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Android Widget Area */}
              <div className="flex-1 flex flex-col justify-center py-2 z-10">
                <HomeScreenWidget 
                  className="shadow-[0_10px_30px_rgba(0,0,0,0.9)]" 
                  onOpenFullApp={() => setActiveTab('live-work')}
                />
              </div>

              {/* Android Home Screen App Dock */}
              <div className="space-y-3 z-10 pt-2">
                {/* Google Search Bar Mock */}
                <div className="h-9 px-3 rounded-full bg-[#1A1A26]/80 backdrop-blur-md border border-[#2C2C3E] flex items-center justify-between text-xs text-[#808096]">
                  <span className="font-mono text-[11px]">Google Search</span>
                  <div className="flex gap-2">
                    <span className="text-[#D4AF37] font-bold">G</span>
                  </div>
                </div>

                {/* Bottom App Icons */}
                <div className="grid grid-cols-4 gap-2 text-center pb-2">
                  <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setActiveTab('live-work')}>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38F22] flex items-center justify-center shadow-lg border border-[#F3E5AB]/40">
                      <Zap className="w-5 h-5 text-[#0A0A0D] fill-current" />
                    </div>
                    <span className="text-[9px] font-mono text-white tracking-tight">SalaryPulse</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setActiveTab('calendar')}>
                    <div className="w-11 h-11 rounded-2xl bg-[#1E1E2C] border border-[#2E2E42] flex items-center justify-center text-white">
                      <Clock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-[9px] font-mono text-[#A0A0B2] tracking-tight">Calendar</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setActiveTab('salary')}>
                    <div className="w-11 h-11 rounded-2xl bg-[#1E1E2C] border border-[#2E2E42] flex items-center justify-center text-white">
                      <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#A0A0B2] tracking-tight">Payslip</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setActiveTab('settings')}>
                    <div className="w-11 h-11 rounded-2xl bg-[#1E1E2C] border border-[#2E2E42] flex items-center justify-center text-white">
                      <Terminal className="w-5 h-5 text-sky-400" />
                    </div>
                    <span className="text-[9px] font-mono text-[#A0A0B2] tracking-tight">Settings</span>
                  </div>
                </div>

                {/* Android Navigation Gesture Bar */}
                <div className="w-32 h-1 bg-[#555566] rounded-full mx-auto" />
              </div>
            </div>
          </div>

          {/* Right Column: Shortcuts & Instructions */}
          <div className="lg:col-span-5 space-y-4">
            {/* PWA Shortcuts Card */}
            <div className="p-4 sm:p-5 bg-[#121218] border border-[#22222E] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#D4AF37]" />
                  <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Android PWA Shortcuts
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                  Ready
                </span>
              </div>

              <p className="text-xs text-[#9090A4]">
                Long-press the SalaryPulse app icon on your Android home screen to trigger these quick actions directly without opening the full dashboard:
              </p>

              <div className="space-y-2 pt-1">
                {pwaShortcutsList.map((sc) => (
                  <div
                    key={sc.name}
                    className="p-2.5 bg-[#171722] border border-[#262636] rounded-xl flex items-center justify-between gap-2 hover:border-[#38384E] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#20202E] flex items-center justify-center text-xs text-[#D4AF37] font-mono shrink-0">
                        {sc.icon}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block font-mono">{sc.name}</span>
                        <span className="text-[10px] text-[#7A7A8E] block">{sc.desc}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}${sc.url}`, sc.name)}
                      className="p-1.5 rounded-lg bg-[#222230] hover:bg-[#2C2C3E] text-[#A0A0B4] hover:text-white transition cursor-pointer shrink-0 text-[10px] font-mono flex items-center gap-1"
                      title="Copy shortcut link"
                    >
                      {copiedShortcut === sc.name ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* How to add to Android Home Screen */}
            <div className="p-4 sm:p-5 bg-[#121218] border border-[#22222E] rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Android Installation Steps
                </h3>
              </div>

              <ol className="space-y-2 text-xs text-[#9E9EB2] list-decimal list-inside font-sans">
                <li>
                  Open SalaryPulse in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on Android.
                </li>
                <li>
                  Tap the browser menu <span className="font-mono text-white">(⋮)</span> and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
                </li>
                <li>
                  Once installed, long-press the SalaryPulse app icon to launch quick shortcuts or widget view!
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: PURE STANDALONE WIDGET */}
      {viewMode === 'standalone' && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-full max-w-[440px] space-y-4">
            <HomeScreenWidget onOpenFullApp={() => setActiveTab('live-work')} />

            <div className="p-3 bg-[#14141C] border border-[#242432] rounded-2xl text-center space-y-1">
              <span className="text-[11px] font-mono text-[#8A8A9E] block">
                💡 Tip: Click Pop-Out in the top right to keep this widget in a persistent compact floating window while working.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: PLATFORM ARCHITECTURE & CAPABILITIES SPECIFICATION */}
      {viewMode === 'architecture' && (
        <div className="space-y-4">
          <div className="p-5 bg-[#121218] border border-[#242434] rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222230] pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  PWA vs. Native Android Platform Capabilities
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] px-2 py-0.5 bg-[#10B981]/20 rounded border border-[#10B981]/40">
                Authoritative Audit
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* What is Supported in PWA */}
              <div className="p-4 bg-[#161622] border border-[#262638] rounded-xl space-y-2">
                <div className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>SUPPORTED IN PWA / BROWSER TODAY</span>
                </div>
                <ul className="space-y-1.5 text-[#A0A0B6] list-disc list-inside text-[11px]">
                  <li>PWA App Shortcuts (Long-press home screen icon)</li>
                  <li>W3C Web App Manifest "widgets" specification</li>
                  <li>Standalone Compact Widget View (PIP / Pop-out)</li>
                  <li>Real-time live drift-free timer synchronization</li>
                  <li>Offline service worker caching and background sync</li>
                  <li>URL Launch Handlers (<code className="text-[#D4AF37]">/?action=start-work</code>)</li>
                </ul>
              </div>

              {/* What Requires Native Android TWA */}
              <div className="p-4 bg-[#161622] border border-[#262638] rounded-xl space-y-2">
                <div className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>REQUIRES NATIVE ANDROID / TWA WRAPPER</span>
                </div>
                <ul className="space-y-1.5 text-[#A0A0B6] list-disc list-inside text-[11px]">
                  <li>True Android OS Home-Screen AppWidgets (<code className="text-[#D4AF37]">RemoteViews</code> / Jetpack Glance)</li>
                  <li>Always-on Lock Screen widgets (Android 14/15 glance)</li>
                  <li>Direct OS launcher desktop placement by user long-press on home screen</li>
                  <li>Background persistent process without browser engine instance</li>
                </ul>
              </div>
            </div>

            {/* Jetpack Glance Sample Code Card */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Native Android Jetpack Glance Widget Integration Template
                </span>
                <button
                  onClick={() => copyToClipboard(jetpackGlanceSampleCode, 'kotlin')}
                  className="px-2.5 py-1 rounded-lg bg-[#20202E] hover:bg-[#2A2A3E] text-[#D4AF37] text-[11px] font-mono flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Kotlin Code'}</span>
                </button>
              </div>

              <pre className="p-3 bg-[#0A0A0D] border border-[#20202C] rounded-xl text-[10.5px] font-mono text-[#D0D0E0] overflow-x-auto max-h-56">
                <code>{jetpackGlanceSampleCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
