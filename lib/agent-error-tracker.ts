/**
 * Agent Error Tracker - PersianToolbox
 *
 * Provides error tracking and analysis for agent operations
 */

import { agentLogger } from '@/lib/agent-logger';

export interface ErrorEntry {
  id: string;
  operation: string;
  error: string;
  stack: string | undefined;
  timestamp: string;
  context: Record<string, unknown>;
  resolved: boolean;
  resolution?: string;
}

export interface ErrorPattern {
  pattern: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  operations: string[];
  suggestion: string;
}

export interface ErrorTrackerConfig {
  maxErrors: number;
  retentionPeriod: number;
  patternDetection: boolean;
  autoResolve: boolean;
}

export class AgentErrorTracker {
  private errors: ErrorEntry[] = [];
  private patterns: Map<string, ErrorPattern> = new Map();
  private config: ErrorTrackerConfig;

  constructor(config: Partial<ErrorTrackerConfig> = {}) {
    this.config = {
      maxErrors: config.maxErrors ?? 1000,
      retentionPeriod: config.retentionPeriod ?? 604800000,
      patternDetection: config.patternDetection ?? true,
      autoResolve: config.autoResolve ?? false,
    };
  }

  trackError(
    operation: string,
    error: Error | string,
    context: Record<string, unknown> = {},
  ): ErrorEntry {
    const errorEntry: ErrorEntry = {
      id: this.generateId(),
      operation,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      context,
      resolved: false,
    };

    this.errors.push(errorEntry);
    this.cleanupOldErrors();

    if (this.config.patternDetection) {
      this.detectPattern(errorEntry);
    }

    agentLogger.error('error-tracker', 'track', `Error tracked: ${errorEntry.error}`, {
      operation,
      errorId: errorEntry.id,
    });

    return errorEntry;
  }

  resolveError(errorId: string, resolution: string): boolean {
    const error = this.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolution = resolution;
      agentLogger.info('error-tracker', 'resolve', `Error resolved: ${errorId}`, { resolution });
      return true;
    }
    return false;
  }

  getErrors(options: {
    operation?: string;
    resolved?: boolean;
    limit?: number;
  } = {}): ErrorEntry[] {
    let filtered = [...this.errors];

    if (options.operation) {
      filtered = filtered.filter((e) => e.operation === options.operation);
    }

    if (options.resolved !== undefined) {
      filtered = filtered.filter((e) => e.resolved === options.resolved);
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  getPatterns(): ErrorPattern[] {
    return Array.from(this.patterns.values()).sort((a, b) => b.count - a.count);
  }

  getErrorRate(timeRange?: number): number {
    const now = Date.now();
    const range = timeRange ?? 3600000;
    const recentErrors = this.errors.filter(
      (e) => now - new Date(e.timestamp).getTime() < range,
    );

    return recentErrors.length;
  }

  getUnresolvedErrors(): ErrorEntry[] {
    return this.errors.filter((e) => !e.resolved);
  }

  async generateReport(): Promise<string> {
    const unresolved = this.getUnresolvedErrors();
    const patterns = this.getPatterns();

    return `# Error Tracker Report

## Summary
- **Total Errors**: ${this.errors.length}
- **Unresolved**: ${unresolved.length}
- **Resolved**: ${this.errors.length - unresolved.length}
- **Error Patterns**: ${patterns.length}

## Unresolved Errors (${unresolved.length})
${unresolved.length > 0 ? unresolved.slice(0, 10).map((e) => `- **${e.id}** [${e.operation}] ${e.error} (${e.timestamp})`).join('\n') : 'No unresolved errors'}

## Error Patterns
${patterns.length > 0 ? patterns.map((p) => `- **${p.pattern}** (${p.count} occurrences)\n  Operations: ${p.operations.join(', ')}\n  Suggestion: ${p.suggestion}`).join('\n\n') : 'No patterns detected'}

## Recommendations
${unresolved.length > 5 ? '- ⚠️ High number of unresolved errors - prioritize resolution\n' : ''}${patterns.length > 0 ? '- 🔍 Review error patterns for systemic issues\n' : ''}- ✅ Regular error review recommended`;
  }

  private detectPattern(error: ErrorEntry): void {
    const normalizedError = this.normalizeError(error.error);

    const existing = this.patterns.get(normalizedError);
    if (existing) {
      existing.count++;
      existing.lastSeen = error.timestamp;
      if (!existing.operations.includes(error.operation)) {
        existing.operations.push(error.operation);
      }
    } else {
      this.patterns.set(normalizedError, {
        pattern: normalizedError,
        count: 1,
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
        operations: [error.operation],
        suggestion: this.generateSuggestion(normalizedError),
      });
    }
  }

  private normalizeError(error: string): string {
    return error
      .replace(/\d+/g, 'N')
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID')
      .replace(/['"]/g, '')
      .substring(0, 100);
  }

  private generateSuggestion(pattern: string): string {
    if (pattern.includes('timeout')) {
      return 'Consider increasing timeout or optimizing operation';
    }
    if (pattern.includes('memory')) {
      return 'Check for memory leaks or reduce data processing';
    }
    if (pattern.includes('network')) {
      return 'Add retry logic or check network connectivity';
    }
    if (pattern.includes('permission')) {
      return 'Verify access credentials and permissions';
    }
    return 'Review error context and operation logic';
  }

  private cleanupOldErrors(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.errors = this.errors.filter(
      (e) => new Date(e.timestamp).getTime() > cutoff,
    );

    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(-this.config.maxErrors);
    }
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const agentErrorTracker = new AgentErrorTracker();
