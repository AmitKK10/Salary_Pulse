import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  onResetToDashboard?: () => void;
  onOpenDataHealth?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SalaryPulse ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleDashboard = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onResetToDashboard) {
      this.props.onResetToDashboard();
    } else {
      window.location.hash = '#dashboard';
      window.location.reload();
    }
  };

  handleDataHealth = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onOpenDataHealth) {
      this.props.onOpenDataHealth();
    } else {
      window.location.hash = '#settings';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          id="salarypulse-error-boundary"
          className="min-h-[420px] flex items-center justify-center p-6 bg-[#0E0E0E] border border-red-900/40 rounded-2xl text-center max-w-2xl mx-auto my-8 shadow-2xl"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center justify-center text-red-400 mb-5 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-[#F5F5F5] tracking-tight mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-[#A3A3A3] max-w-md mb-6 leading-relaxed">
              SalaryPulse encountered an unexpected rendering exception in this section. Your underlying attendance logs and salary records remain protected in local storage.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                id="btn-error-retry"
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-semibold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>

              <button
                id="btn-error-dashboard"
                onClick={this.handleDashboard}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#F5F5F5] font-semibold text-xs tracking-wider uppercase rounded-xl border border-[#333333] transition-all active:scale-95 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" />
                <span>Dashboard</span>
              </button>

              <button
                id="btn-error-data-health"
                onClick={this.handleDataHealth}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#A3A3A3] hover:text-[#F5F5F5] font-semibold text-xs tracking-wider uppercase rounded-xl border border-[#333333] transition-all active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Data Health</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
