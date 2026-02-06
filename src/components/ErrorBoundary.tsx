import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component with Sentry integration
 * Catches React errors and displays a fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-black text-slate-100 mb-4">
              Something went wrong
            </h1>
            <p className="text-slate-400 mb-2">
              We encountered an unexpected error. Our team has been notified.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl text-left">
                <p className="text-xs font-mono text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold text-white transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-slate-200 transition-colors flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
