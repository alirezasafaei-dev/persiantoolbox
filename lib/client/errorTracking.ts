/**
 * Client-side error tracking utility
 * Captures and reports errors for monitoring and debugging
 */

type ErrorContext = {
  component?: string;
  action?: string;
  route?: string;
  userId?: string;
  [key: string]: unknown;
};

type ErrorReport = {
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  userAgent: string;
  url: string;
};

class ErrorTracker {
  private isEnabled: boolean;
  private queue: ErrorReport[] = [];
  private maxQueueSize = 10;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    if (this.isEnabled) {
      this.setupAutoFlush();
    }
  }

  private setupAutoFlush(): void {
    if (typeof window === 'undefined') {
      return;
    }

    setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush on page hide
    window.addEventListener('pagehide', () => {
      this.flush();
    });
  }

  private createReport(error: Error, context: ErrorContext = {}): ErrorReport {
    return {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };
  }

  private addToQueue(report: ErrorReport): void {
    this.queue.push(report);
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const reports = [...this.queue];
    this.queue = [];

    try {
      // In a real implementation, this would send to an error tracking service
      // For now, we'll log to console in development
      if (!this.isEnabled) {
        console.debug('[ErrorTracker] Would send reports:', reports);
        return;
      }

      // Send to error tracking endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports }),
        keepalive: true,
      });
    } catch (err) {
      // Re-queue failed reports
      this.queue.unshift(...reports);
    }
  }

  capture(error: Error, context: ErrorContext = {}): void {
    const report = this.createReport(error, context);
    this.addToQueue(report);

    // Log in development
    if (!this.isEnabled) {
      console.error('[ErrorTracker]', error, context);
    }
  }

  captureException(error: unknown, context: ErrorContext = {}): void {
    if (error instanceof Error) {
      this.capture(error, context);
    } else {
      this.capture(new Error(String(error)), context);
    }
  }

  captureMessage(message: string, context: ErrorContext = {}): void {
    this.capture(new Error(message), context);
  }

  // Setup global error handlers
  setupGlobalHandlers(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.captureException(event.error, {
        component: 'global',
        action: 'unhandled error',
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason, {
        component: 'global',
        action: 'unhandled promise rejection',
      });
    });
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Auto-setup global handlers in browser
if (typeof window !== 'undefined') {
  errorTracker.setupGlobalHandlers();
}
