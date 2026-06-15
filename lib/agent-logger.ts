/**
 * Agent Logger - PersianToolbox
 *
 * Provides logging capabilities for agent operations
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface AgentLogEntry {
  timestamp: string;
  level: LogLevel;
  agent: string;
  operation: string;
  message: string;
  details: Record<string, unknown>;
  duration: number;
}

class AgentLogger {
  private logs: AgentLogEntry[] = [];
  private maxLogs = 1000;

  log(
    level: LogLevel,
    agent: string,
    operation: string,
    message: string,
    details?: Record<string, unknown>,
    duration?: number,
  ): void {
    const entry: AgentLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      agent,
      operation,
      message,
      details: details ?? {},
      duration: duration ?? 0,
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for visibility
    this.logToConsole(entry);
  }

  info(agent: string, operation: string, message: string, details?: Record<string, unknown>): void {
    this.log('info', agent, operation, message, details);
  }

  warn(agent: string, operation: string, message: string, details?: Record<string, unknown>): void {
    this.log('warn', agent, operation, message, details);
  }

  error(
    agent: string,
    operation: string,
    message: string,
    details?: Record<string, unknown>,
  ): void {
    this.log('error', agent, operation, message, details);
  }

  debug(
    agent: string,
    operation: string,
    message: string,
    details?: Record<string, unknown>,
  ): void {
    this.log('debug', agent, operation, message, details);
  }

  private logToConsole(entry: AgentLogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.agent}]`;

    switch (entry.level) {
      case 'error':
        console.error(prefix, entry.operation, '-', entry.message, entry.details || '');
        break;
      case 'warn':
        console.warn(prefix, entry.operation, '-', entry.message, entry.details || '');
        break;
      case 'debug':
        console.log(prefix, entry.operation, '-', entry.message, entry.details || '');
        break;
      default:
        console.log(prefix, entry.operation, '-', entry.message, entry.details || '');
    }
  }

  getLogs(level?: LogLevel): AgentLogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return this.logs;
  }

  getRecentLogs(count = 50): AgentLogEntry[] {
    return this.logs.slice(-count);
  }

  getErrorLogs(): AgentLogEntry[] {
    return this.getLogs('error');
  }

  clearLogs(): void {
    this.logs = [];
  }

  getMetrics(): {
      total: number;
      errors: number;
      warnings: number;
      info: number;
      debug: number;
      } {
    return {
      total: this.logs.length,
      errors: this.getLogs('error').length,
      warnings: this.getLogs('warn').length,
      info: this.getLogs('info').length,
      debug: this.getLogs('debug').length,
    };
  }
}

// Singleton instance
export const agentLogger = new AgentLogger();

// Convenience functions
export function logAgentOperation(
  agent: string,
  operation: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  agentLogger.info(agent, operation, message, details);
}

export function logAgentError(
  agent: string,
  operation: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  agentLogger.error(agent, operation, message, details);
}

export function logAgentWarning(
  agent: string,
  operation: string,
  message: string,
  details?: Record<string, unknown>,
): void {
  agentLogger.warn(agent, operation, message, details);
}
