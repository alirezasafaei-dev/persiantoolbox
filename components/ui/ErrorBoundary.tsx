'use client';

import { Component, type ReactNode } from 'react';
import { errorTracker } from '@/lib/client/errorTracking';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Track the error
    const componentName = errorInfo.componentStack.split('\n')[0];
    errorTracker.capture(error, {
      component: componentName ?? 'Unknown',
      action: 'component error',
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-[var(--surface-1)] rounded-lg border border-[var(--border-light)] p-6 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              متأسفانه مشکلی پیش آمده
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              خطایی در اجرای این بخش رخ داده است. لطفاً صفحه را رفرش کنید یا بعداً دوباره تلاش کنید.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-[var(--color-primary)] text-[var(--text-inverted)] px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              رفرش صفحه
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
