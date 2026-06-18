# Parallel Execution Skill

**Purpose**: Execute multiple agent operations concurrently for improved performance

## Context

Use this skill when multiple independent operations can run simultaneously.

## Execution Steps

1. **Identify Parallelizable Tasks**
   - Find independent operations
   - Check for shared resources
   - Estimate concurrency benefits

2. **Configure Execution Settings**
   - Set max concurrency level
   - Configure timeouts
   - Set retry attempts

3. **Execute in Parallel**
   - Use parallel-execution for batch operations
   - Monitor running tasks
   - Handle failures gracefully

4. **Collect Results**
   - Aggregate task results
   - Report success/failure rates
   - Calculate total duration

## Quality Requirements

- Max concurrency should match system resources
- Timeout should prevent hanging operations
- Retry logic should handle transient failures

## Integration Points

- `lib/parallel-execution.ts` - Core parallel execution utility
- `lib/agent-logger.ts` - Execution logging
- `lib/agent-monitoring.ts` - Performance tracking

## Usage Example

```typescript
import { parallelExecution } from '@/lib/parallel-execution';

// Execute single task with retries
const result = await parallelExecution.execute('task-1', async () => {
  return await someOperation();
});

// Execute batch of tasks
const batchResult = await parallelExecution.executeBatch([
  { id: 'task-1', operation: () => operation1() },
  { id: 'task-2', operation: () => operation2() },
  { id: 'task-3', operation: () => operation3() },
]);
```
