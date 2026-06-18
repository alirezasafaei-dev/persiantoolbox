# Analytics Dashboard Skill

**Purpose**: Monitor agent performance and track operational metrics

## Context

Use this skill when monitoring agent operations or generating performance reports.

## Execution Steps

1. **Record Operations**
   - Track operation success/failure
   - Measure response times
   - Log operation context

2. **Collect Metrics**
   - Aggregate operation data
   - Calculate success rates
   - Compute average response times

3. **Generate Dashboard**
   - Display real-time metrics
   - Show trend charts
   - Highlight alerts

4. **Generate Reports**
   - Create summary reports
   - Analyze trends
   - Provide recommendations

## Quality Requirements

- Real-time updates for critical metrics
- Historical data retention for trend analysis
- Alert thresholds should be configurable

## Integration Points

- `lib/agent-analytics-dashboard.ts` - Core analytics utility
- `lib/agent-logger.ts` - Metric logging
- `lib/agent-monitoring.ts` - Performance tracking

## Usage Example

```typescript
import { agentAnalyticsDashboard } from '@/lib/agent-analytics-dashboard';

// Record operation
agentAnalyticsDashboard.recordOperation('code-review', true, 1500);

// Get analytics
const analytics = agentAnalyticsDashboard.getAnalytics();
console.log(`Success rate: ${(analytics.successRate * 100).toFixed(2)}%`);

// Generate report
const report = await agentAnalyticsDashboard.generateReport();
```
