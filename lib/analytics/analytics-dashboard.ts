/**
 * Analytics Dashboard - PersianToolbox
 *
 * Provides analytics and insights for monetization
 */

import {agentLogger} from '@/lib/agent-logger';

export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  period: string;
}

export interface RevenueReport {
  totalRevenue: number;
  recurringRevenue: number;
  newSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  period: string;
}

export interface UserEngagement {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  toolsPerSession: number;
  conversionRate: number;
}

export interface ToolUsage {
  toolId: string;
  name: string;
  usageCount: number;
  premiumUsage: number;
  conversionRate: number;
}

const metrics = new Map<string, AnalyticsMetric[]>();
const revenueData: RevenueReport[] = [];
const usageData: ToolUsage[] = [];

export function recordMetric(name: string, value: number, period: string): void {
  const existing = metrics.get(name) ?? [];
  const lastMetric = existing[existing.length - 1];
  const change = lastMetric ? ((value - lastMetric.value) / lastMetric.value) * 100 : 0;

  existing.push({name, value, change, period});
  metrics.set(name, existing);
}

export function getMetric(name: string, limit = 30): AnalyticsMetric[] {
  return (metrics.get(name) ?? []).slice(-limit);
}

export function recordRevenue(report: RevenueReport): void {
  revenueData.push(report);
  agentLogger.info('analytics', 'revenue', 'Revenue recorded', {
    total: report.totalRevenue,
    mrr: report.recurringRevenue,
  });
}

export function getRevenueReport(period = 'monthly'): RevenueReport | undefined {
  return revenueData.find((r) => r.period === period) ?? revenueData[revenueData.length - 1];
}

export function getRevenueHistory(): RevenueReport[] {
  return [...revenueData];
}

export function recordToolUsage(toolId: string, name: string, isPremium: boolean): void {
  const existing = usageData.find((u) => u.toolId === toolId);
  if (existing) {
    existing.usageCount++;
    if (isPremium) {
      existing.premiumUsage++;
    }
    existing.conversionRate = (existing.premiumUsage / existing.usageCount) * 100;
  } else {
    usageData.push({
      toolId,
      name,
      usageCount: 1,
      premiumUsage: isPremium ? 1 : 0,
      conversionRate: isPremium ? 100 : 0,
    });
  }
}

export function getToolUsageStats(): ToolUsage[] {
  return [...usageData].sort((a, b) => b.usageCount - a.usageCount);
}

export function getTopTools(limit = 10): ToolUsage[] {
  return getToolUsageStats().slice(0, limit);
}

export function calculateMetrics(): {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  averageConversion: number;
  } {
  const totalUsers = 1000;
  const premiumUsers = 150;
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.totalRevenue, 0);
  const averageConversion =
    usageData.length > 0
      ? usageData.reduce((sum, u) => sum + u.conversionRate, 0) / usageData.length
      : 0;

  return {totalUsers, premiumUsers, totalRevenue, averageConversion};
}

export function generateDashboardData(): {
  metrics: AnalyticsMetric[];
  revenue: RevenueReport | undefined;
  topTools: ToolUsage[];
  summary: ReturnType<typeof calculateMetrics>;
  } {
  return {
    metrics: Array.from(metrics.values()).flat().slice(-100),
    revenue: getRevenueReport(),
    topTools: getTopTools(5),
    summary: calculateMetrics(),
  };
}
