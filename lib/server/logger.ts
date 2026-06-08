/**
 * Logger utility for server-side logging with environment-aware levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

type LogEntry = {
  level: string;
  message: string;
  context?: Record<string, unknown> | undefined;
  timestamp: string;
};

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = this.parseLogLevel(
      process.env['LOG_LEVEL'] ?? (this.isProduction ? 'INFO' : 'DEBUG'),
    );
  }

  private parseLogLevel(level: string): LogLevel {
    const normalized = level.toUpperCase();
    switch (normalized) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'NONE':
        return LogLevel.NONE;
      default:
        return this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private format(level: string, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  private output(entry: LogEntry): void {
    const { level, message, context, timestamp } = entry;
    const prefix = `[${timestamp}] [${level}]`;

    if (this.isProduction) {
      // In production, output structured JSON
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(entry));
    } else {
      // In development, use readable format
      if (context) {
        // eslint-disable-next-line no-console
        console.log(`${prefix} ${message}`, context);
      } else {
        // eslint-disable-next-line no-console
        console.log(`${prefix} ${message}`);
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.format('DEBUG', message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.format('INFO', message, context));
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.format('WARN', message, context));
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.format('ERROR', message, context));
    }
  }

  // Convenience method for error with stack trace
  errorWithStack(message: string, error: Error, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.error(message, {
        ...context,
        error: error.message,
        stack: error.stack,
      });
    }
  }
}

// Singleton instance
export const logger = new Logger();
