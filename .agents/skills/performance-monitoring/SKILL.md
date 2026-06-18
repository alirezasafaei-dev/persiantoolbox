# Performance Monitoring Automation Skill

**Purpose**: Automate performance monitoring and optimization

## Context

Use this skill when measuring performance metrics, detecting regressions, or generating optimization suggestions.

## Execution Steps

1. **Collect Metrics**
   - Measure bundle size
   - Track load times
   - Run Lighthouse audits
   - Monitor Core Web Vitals

2. **Detect Regressions**
   - Compare with baselines
   - Identify threshold violations
   - Alert on significant regressions

3. **Generate Suggestions**
   - Compression opportunities
   - Caching strategies
   - Lazy loading
   - Code splitting

4. **Generate Report**
   - Summarize metrics
   - Highlight regressions
   - Provide optimization recommendations

## Quality Requirements

- Metrics must be accurate
- Regressions must be detected early
- Suggestions must be actionable
- Reports must be clear and concise

## Integration Points

- `lib/performance-monitoring-automation.ts` - Core automation utility
- `lib/agent-logger.ts` - Logging and monitoring
- `lib/agent-monitoring.ts` - Performance tracking
- Lighthouse and Core Web Vitals APIs

## Usage Example

```typescript
import { performanceMonitoringAutomation } from '@/lib/performance-monitoring-automation';

const result = await performanceMonitoringAutomation.monitorPerformance({
  metrics: ['bundle-size', 'load-time', 'lighthouse', 'core-web-vitals'],
  threshold: {
    bundleSize: 300000,
    loadTime: 2000,
    lighthouseScore: 90,
  },
  alertOnRegression: true,
  generateReport: true,
});

console.log('Regressions:', result.regressions.length);
console.log('Suggestions:', result.suggestions.length);
```
