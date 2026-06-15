# Error Tracker Skill

**Purpose**: Track, analyze, and resolve agent operation errors

## Context

Use this skill when monitoring errors or analyzing error patterns.

## Execution Steps

1. **Track Errors**
   - Record error details
   - Capture stack traces
   - Store operation context

2. **Analyze Patterns**
   - Detect recurring errors
   - Identify root causes
   - Group similar errors

3. **Resolve Issues**
   - Prioritize critical errors
   - Track resolution progress
   - Document fixes

4. **Generate Reports**
   - Summarize error trends
   - Highlight unresolved issues
   - Provide recommendations

## Quality Requirements

- All errors should be tracked with context
- Pattern detection should run automatically
- Resolution should be documented

## Integration Points

- `lib/agent-error-tracker.ts` - Core error tracking utility
- `lib/agent-logger.ts` - Error logging
- `lib/agent-monitoring.ts` - Performance tracking

## Usage Example

```typescript
import { agentErrorTracker } from '@/lib/agent-error-tracker';

// Track error
const entry = agentErrorTracker.trackError('code-review', error, {
  file: 'src/app.ts',
  line: 42,
});

// Resolve error
agentErrorTracker.resolveError(entry.id, 'Fixed by adding null check');

// Get patterns
const patterns = agentErrorTracker.getPatterns();
console.log(`Found ${patterns.length} error patterns`);
```
