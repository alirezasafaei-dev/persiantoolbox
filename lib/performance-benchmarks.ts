/**
 * Agent Performance Benchmarks - PersianToolbox
 *
 * Provides performance benchmarking for agent operations
 */

import { agentLogger } from '@/lib/agent-logger';
import { agentMonitoring } from '@/lib/agent-monitoring';

export interface BenchmarkConfig {
  iterations: number;
  warmupIterations: number;
  timeout: number;
  collectMetrics: boolean;
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p95: number;
  p99: number;
  operationsPerSecond: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

export interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  totalDuration: number;
  timestamp: string;
}

export class PerformanceBenchmarks {
  private config: BenchmarkConfig;

  constructor(config: Partial<BenchmarkConfig> = {}) {
    this.config = {
      iterations: config.iterations ?? 100,
      warmupIterations: config.warmupIterations ?? 10,
      timeout: config.timeout ?? 60000,
      collectMetrics: config.collectMetrics ?? true,
    };
  }

  async benchmark<T>(
    name: string,
    operation: () => Promise<T>,
  ): Promise<BenchmarkResult> {
    const operationId = agentMonitoring.startOperation('benchmarks', 'benchmark');

    try {
      agentLogger.info('benchmarks', 'benchmark', `Starting benchmark: ${name}`, {
        iterations: this.config.iterations,
      });

      for (let i = 0; i < this.config.warmupIterations; i++) {
        await operation();
      }

      const times: number[] = [];
      const startTime = Date.now();

      for (let i = 0; i < this.config.iterations; i++) {
        const iterationStart = Date.now();
        await operation();
        times.push(Date.now() - iterationStart);
      }

      const totalTime = Date.now() - startTime;
      const sortedTimes = [...times].sort((a, b) => a - b);

      const result: BenchmarkResult = {
        name,
        iterations: this.config.iterations,
        totalTime,
        averageTime: totalTime / this.config.iterations,
        minTime: sortedTimes[0] ?? 0,
        maxTime: sortedTimes[sortedTimes.length - 1] ?? 0,
        p50: this.percentile(sortedTimes, 50),
        p95: this.percentile(sortedTimes, 95),
        p99: this.percentile(sortedTimes, 99),
        operationsPerSecond: (this.config.iterations / totalTime) * 1000,
      };

      if (this.config.collectMetrics) {
        const memUsage = process.memoryUsage();
        result.memoryUsage = {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
        };
      }

      agentMonitoring.endOperation(operationId, true);
      agentLogger.info('benchmarks', 'benchmark', `Benchmark completed: ${name}`, {
        averageTime: result.averageTime,
        opsPerSecond: result.operationsPerSecond,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      agentMonitoring.endOperation(operationId, false, errorMessage);
      agentLogger.error('benchmarks', 'benchmark', `Benchmark failed: ${name}`, { error: errorMessage });
      throw error;
    }
  }

  async benchmarkSuite(
    suiteName: string,
    benchmarks: Array<{ name: string; operation: () => Promise<unknown> }>,
  ): Promise<BenchmarkSuite> {
    const operationId = agentMonitoring.startOperation('benchmarks', 'benchmark-suite');
    const startTime = Date.now();

    try {
      agentLogger.info('benchmarks', 'benchmark-suite', `Starting suite: ${suiteName}`);

      const results: BenchmarkResult[] = [];
      for (const benchmark of benchmarks) {
        const result = await this.benchmark(benchmark.name, benchmark.operation);
        results.push(result);
      }

      const totalDuration = Date.now() - startTime;

      agentMonitoring.endOperation(operationId, true);
      agentLogger.info('benchmarks', 'benchmark-suite', `Suite completed: ${suiteName}`, {
        benchmarks: results.length,
        totalDuration,
      });

      return {
        name: suiteName,
        results,
        totalDuration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      agentMonitoring.endOperation(operationId, false, errorMessage);
      agentLogger.error('benchmarks', 'benchmark-suite', `Suite failed: ${errorMessage}`);
      throw error;
    }
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }

  async generateBenchmarkReport(result: BenchmarkResult): Promise<string> {
    return `# Benchmark Report: ${result.name}

## Summary
- **Iterations**: ${result.iterations}
- **Total Time**: ${result.totalTime}ms
- **Average Time**: ${result.averageTime.toFixed(2)}ms
- **Operations/Second**: ${result.operationsPerSecond.toFixed(2)}

## Latency Distribution
- **Min**: ${result.minTime}ms
- **P50**: ${result.p50}ms
- **P95**: ${result.p95}ms
- **P99**: ${result.p99}ms
- **Max**: ${result.maxTime}ms

${result.memoryUsage ? `## Memory Usage
- **Heap Used**: ${(result.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
- **Heap Total**: ${(result.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
- **External**: ${(result.memoryUsage.external / 1024 / 1024).toFixed(2)} MB` : ''}`;
  }

  async generateSuiteReport(suite: BenchmarkSuite): Promise<string> {
    const reports = await Promise.all(
      suite.results.map((result) => this.generateBenchmarkReport(result)),
    );

    return `# Benchmark Suite: ${suite.name}

**Timestamp**: ${suite.timestamp}
**Total Duration**: ${suite.totalDuration}ms
**Benchmarks**: ${suite.results.length}

---

${reports.join('\n\n---\n\n')}`;
  }
}

export const performanceBenchmarks = new PerformanceBenchmarks();
