# Refactoring Automation Skill

**Purpose**: Automate code refactoring for improved readability and maintainability

## Context

Use this skill when identifying code smells, suggesting refactoring opportunities, or applying automated refactoring changes.

## Execution Steps

1. **Analyze Code Smells**
   - Identify long methods
   - Detect duplicate code
   - Find unclear variable names
   - Locate complex conditionals

2. **Generate Refactoring Suggestions**
   - Extract methods
   - Rename variables
   - Move code
   - Inline functions
   - Simplify logic

3. **Apply Refactoring**
   - Execute refactoring changes
   - Maintain functionality
   - Update tests if needed
   - Verify no regressions

4. **Generate Report**
   - List all changes
   - Show before/after
   - Calculate impact metrics
   - Provide additional suggestions

## Quality Requirements

- All refactoring must maintain existing functionality
- Tests must pass after refactoring
- Code readability must improve
- No performance regressions

## Integration Points

- `lib/refactoring-automation.ts` - Core automation utility
- `lib/agent-logger.ts` - Logging and monitoring
- `lib/agent-monitoring.ts` - Performance tracking
- `lib/regression-testing.ts` - Regression verification

## Usage Example

```typescript
import { refactoringAutomation } from '@/lib/refactoring-automation';

const result = await refactoringAutomation.refactorCode({
  targetFiles: ['src/utils/helpers.ts'],
  refactoringType: 'extract',
  priority: 'medium',
  includeTests: true,
  dryRun: false,
});

console.log('Changes applied:', result.metrics.totalChanges);
```
