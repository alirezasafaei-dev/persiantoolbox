/**
 * Agent Analytics Dashboard - PersianToolbox
 *
 * Provides analytics and monitoring dashboards for agent operations
 */

import { agentLogger } from '@/lib/agent-logger';

export interface DashboardConfig {
  refreshInterval: number;
  retentionPeriod: number;
  enableRealTime: boolean;
  alertThresholds: {
    errorRate: number;
    avgResponseTime: number;
    successRate: number;
  };
}

export interface AgentMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags: Record<string, string>;
}

export interface AgentAnalytics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  operationsPerMinute: number;
  peakResponseTime: number;
  uptime: number;
}

export interface DashboardData {
  timestamp: string;
  analytics: AgentAnalytics;
  metrics: AgentMetric[];
  alerts: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
  trends: {
    successRate: number[];
    responseTime: number[];
    errorRate: number[];
  };
}

export class AgentAnalyticsDashboard {
  private config: DashboardConfig;
  private metrics: AgentMetric[] = [];
  private alerts: DashboardData['alerts'] = [];
  private operationLog: Array<{
    operation: string;
    success: boolean;
    duration: number;
    timestamp: number;
  }> = [];

  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = {
      refreshInterval: config.refreshInterval ?? 5000,
      retentionPeriod: config.retentionPeriod ?? 86400000,
      enableRealTime: config.enableRealTime ?? true,
      alertThresholds: config.alertThresholds ?? {
        errorRate: 0.05,
        avgResponseTime: 5000,
        successRate: 0.95,
      },
    };
  }

  recordOperation(operation: string, success: boolean, duration: number): void {
    this.operationLog.push({
      operation,
      success,
      duration,
      timestamp: Date.now(),
    });

    this.cleanupOldEntries();

    this.metrics.push({
      name: 'operation_duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      tags: { operation, success: String(success) },
    });

    this.checkAlerts();
  }

  getAnalytics(timeRange?: number): AgentAnalytics {
    const now = Date.now();
    const range = timeRange ?? 3600000;
    const recentOps = this.operationLog.filter((op) => now - op.timestamp < range);

    const totalOperations = recentOps.length;
    const successfulOperations = recentOps.filter((op) => op.success).length;
    const failedOperations = totalOperations - successfulOperations;
    const successRate = totalOperations > 0 ? successfulOperations / totalOperations : 1;
    const errorRate = 1 - successRate;
    const durations = recentOps.map((op) => op.duration);
    const averageResponseTime =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const peakResponseTime = durations.length > 0 ? Math.max(...durations) : 0;
    const operationsPerMinute =
      totalOperations > 0 ? (totalOperations / (range / 60000)) : 0;

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      successRate,
      averageResponseTime,
      errorRate,
      operationsPerMinute,
      peakResponseTime,
      uptime: this.calculateUptime(),
    };
  }

  getDashboardData(): DashboardData {
    const analytics = this.getAnalytics();
    const recentMetrics = this.metrics.slice(-100);

    const successRates = this.calculateTrend('successRate');
    const responseTimes = this.calculateTrend('responseTime');
    const errorRates = this.calculateTrend('errorRate');

    return {
      timestamp: new Date().toISOString(),
      analytics,
      metrics: recentMetrics,
      alerts: this.alerts.slice(-50),
      trends: {
        successRate: successRates,
        responseTime: responseTimes,
        errorRate: errorRates,
      },
    };
  }

  async generateReport(): Promise<string> {
    const data = this.getDashboardData();

    return `# Agent Analytics Dashboard Report

**Timestamp**: ${data.timestamp}

## Overview
- **Total Operations**: ${data.analytics.totalOperations}
- **Success Rate**: ${(data.analytics.successRate * 100).toFixed(2)}%
- **Average Response Time**: ${data.analytics.averageResponseTime.toFixed(2)}ms
- **Operations/Minute**: ${data.analytics.operationsPerMinute.toFixed(2)}
- **Uptime**: ${(data.analytics.uptime * 100).toFixed(2)}%

## Performance Metrics
- **Peak Response Time**: ${data.analytics.peakResponseTime}ms
- **Error Rate**: ${(data.analytics.errorRate * 100).toFixed(2)}%
- **Failed Operations**: ${data.analytics.failedOperations}

## Alerts (${data.alerts.length})
${data.alerts.length > 0 ? data.alerts.map((a) => `- [${a.type.toUpperCase()}] ${a.message} (${a.timestamp})`).join('\n') : 'No alerts'}

## Trends (Last 10 data points)
- **Success Rate**: ${data.trends.successRate.map((v) => `${(v * 100).toFixed(1)}%`).join(' → ')}
- **Avg Response Time**: ${data.trends.responseTime.map((v) => `${v.toFixed(0)}ms`).join(' → ')}
- **Error Rate**: ${data.trends.errorRate.map((v) => `${(v * 100).toFixed(1)}%`).join(' → ')}`;
  }

  private checkAlerts(): void {
    const analytics = this.getAnalytics(300000);

    if (analytics.errorRate > this.config.alertThresholds.errorRate) {
      this.addAlert('error', `High error rate: ${(analytics.errorRate * 100).toFixed(2)}%`);
    }

    if (analytics.averageResponseTime > this.config.alertThresholds.avgResponseTime) {
      this.addAlert('warning', `High response time: ${analytics.averageResponseTime.toFixed(2)}ms`);
    }

    if (analytics.successRate < this.config.alertThresholds.successRate) {
      this.addAlert('error', `Low success rate: ${(analytics.successRate * 100).toFixed(2)}%`);
    }
  }

  private addAlert(type: DashboardData['alerts'][0]['type'], message: string): void {
    const existing = this.alerts.find((a) => a.message === message);
    if (!existing) {
      this.alerts.push({
        type,
        message,
        timestamp: new Date().toISOString(),
      });
      agentLogger.warn('analytics-dashboard', 'alert', message);
    }
  }

  private calculateTrend(metric: string): number[] {
    const values: number[] = [];
    const chunkSize = 100;

    for (let i = 0; i < this.operationLog.length; i += chunkSize) {
      const chunk = this.operationLog.slice(i, i + chunkSize);
      if (metric === 'successRate') {
        values.push(chunk.filter((op) => op.success).length / chunk.length);
      } else if (metric === 'responseTime') {
        values.push(chunk.reduce((sum, op) => sum + op.duration, 0) / chunk.length);
      } else if (metric === 'errorRate') {
        values.push(chunk.filter((op) => !op.success).length / chunk.length);
      }
    }

    return values.slice(-10);
  }

  private calculateUptime(): number {
    if (this.operationLog.length === 0) {
      return 1;
    }
    const successful = this.operationLog.filter((op) => op.success).length;
    return successful / this.operationLog.length;
  }

  private cleanupOldEntries(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.operationLog = this.operationLog.filter((op) => op.timestamp > cutoff);
    this.metrics = this.metrics.filter(
      (m) => new Date(m.timestamp).getTime() > cutoff,
    );
  }
}

export const agentAnalyticsDashboard = new AgentAnalyticsDashboard();
