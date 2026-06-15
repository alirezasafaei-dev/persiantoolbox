# Performance Benchmarks Skill

**Purpose**: Measure and optimize agent operation performance

## Context

Use this skill when benchmarking agent operations or identifying performance bottlenecks.

## Execution Steps

1. **Define Benchmark Suite**
   - Identify critical operations
   - Set iteration count
   - Configure warmup iterations

2. **Run Benchmarks**
   - Execute operation multiple times
   - Collect timing statistics
   - Measure memory usage

3. **Analyze Results**
   - Calculate percentiles (P50, P95, P99)
   - Identify outliers
   - Compare with baselines

4. **Optimize Based on Results**
   - Target slow operations
   - Implement optimizations
   - Re-benchmark to verify

## Quality Requirements

- Minimum 100 iterations for statistical significance
- Include warmup iterations to stabilize results
- Collect memory usage for memory-sensitive operations

## Integration Points

- `lib/performance-benchmarks.ts` - Core benchmarking utility
- `lib/agent-logger.ts` - Benchmark logging
- `lib/agent-monitoring.ts` - Performance tracking

## Usage Example

```typescript
import { performanceBenchmarks } from '@/lib/performance-benchmarks';

// Benchmark single operation
const result = await performanceBenchmarks.benchmark('data-processing', async () => {
  await processData();
});

console.log(`Average: ${result.averageTime}ms`);
console.log(`Ops/sec: ${result.operationsPerSecond}`);

// Benchmark suite
const suite = await performanceBenchmarks.benchmarkSuite('core-operations', [
  { name: 'read', operation: () => readData() },
  { name: 'write', operation: () => writeData() },
  { name: 'transform', operation: () => transformData() },
]);
```
