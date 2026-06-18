/**
 * Agent Monitoring - PersianToolbox
 *
 * Provides monitoring capabilities for agent operations
 */

export interface AgentMetric {
  agent: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface AgentStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  errorRate: number;
  operationsByAgent: Record<string, number>;
  operationsByOperation: Record<string, number>;
}

class AgentMonitoring {
  private metrics: AgentMetric[] = [];
  private activeOperations: Map<string, AgentMetric> = new Map();
  private maxMetrics = 1000;

  startOperation(agent: string, operation: string): string {
    const operationId = `${agent}-${operation}-${Date.now()}`;
    const metric: AgentMetric = {
      agent,
      operation,
      startTime: Date.now(),
      success: false,
    };

    this.activeOperations.set(operationId, metric);
    return operationId;
  }

  endOperation(operationId: string, success: boolean, error?: string): void {
    const metric = this.activeOperations.get(operationId);
    if (!metric) {
      return;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    if (error) {
      metric.error = error;
    }

    this.metrics.push(metric);
    this.activeOperations.delete(operationId);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getStats(): AgentStats {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        errorRate: 0,
        operationsByAgent: {},
        operationsByOperation: {},
      };
    }

    const successful = this.metrics.filter((m) => m.success).length;
    const failed = this.metrics.filter((m) => !m.success).length;
    const durations = this.metrics
      .filter((m) => m.duration !== undefined)
      .map((m) => m.duration as number);

    const averageDuration =
      durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

    const operationsByAgent: Record<string, number> = {};
    const operationsByOperation: Record<string, number> = {};

    for (const metric of this.metrics) {
      operationsByAgent[metric.agent] = (operationsByAgent[metric.agent] ?? 0) + 1;
      operationsByOperation[metric.operation] = (operationsByOperation[metric.operation] ?? 0) + 1;
    }

    return {
      totalOperations: this.metrics.length,
      successfulOperations: successful,
      failedOperations: failed,
      averageDuration,
      errorRate: (failed / this.metrics.length) * 100,
      operationsByAgent,
      operationsByOperation,
    };
  }

  getRecentMetrics(count = 50): AgentMetric[] {
    return this.metrics.slice(-count);
  }

  getFailedMetrics(): AgentMetric[] {
    return this.metrics.filter((m) => !m.success);
  }

  getSlowOperations(thresholdMs = 5000): AgentMetric[] {
    return this.metrics.filter((m) => (m.duration ?? 0) > thresholdMs);
  }

  clearMetrics(): void {
    this.metrics = [];
    this.activeOperations.clear();
  }

  getOperationStats(
    agent: string,
    operation: string,
  ): {
    count: number;
    successRate: number;
    averageDuration: number;
  } {
    const relevantMetrics = this.metrics.filter(
      (m) => m.agent === agent && m.operation === operation,
    );

    if (relevantMetrics.length === 0) {
      return { count: 0, successRate: 0, averageDuration: 0 };
    }

    const successful = relevantMetrics.filter((m) => m.success).length;
    const durations = relevantMetrics
      .filter((m) => m.duration !== undefined)
      .map((m) => m.duration as number);

    return {
      count: relevantMetrics.length,
      successRate: (successful / relevantMetrics.length) * 100,
      averageDuration:
        durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
    };
  }
}

// Singleton instance
export const agentMonitoring = new AgentMonitoring();

// Convenience function for tracking operations
export function trackAgentOperation<T>(agent: string, operation: string, fn: () => T): T {
  const operationId = agentMonitoring.startOperation(agent, operation);

  try {
    const result = fn();
    agentMonitoring.endOperation(operationId, true);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    agentMonitoring.endOperation(operationId, false, errorMessage);
    throw error;
  }
}
