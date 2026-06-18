# Code Review Automation Skill

**Purpose**: Automate code review for quality assurance and standards compliance

## Context

Use this skill when reviewing code changes, pull requests, or performing quality checks on the PersianToolbox codebase.

## Execution Steps

1. **Analyze Target Files**
   - Identify files to review
   - Determine review type (full, quick, security, performance)
   - Set severity thresholds

2. **Run Code Analysis**
   - Check TypeScript issues (any types, console.log, etc.)
   - Verify test coverage
   - Check documentation completeness
   - Analyze code patterns

3. **Generate Issues List**
   - Categorize issues by severity (error, warning, info)
   - Provide fix suggestions for each issue
   - Calculate metrics (total issues, errors, warnings)

4. **Generate Suggestions**
   - Refactoring opportunities
   - Performance optimizations
   - Security improvements
   - Documentation enhancements

5. **Generate Report**
   - Summarize findings
   - Highlight critical issues
   - Provide actionable recommendations

## Quality Requirements

- All errors must be addressed before merge
- Warnings should be resolved when possible
- Report must include clear fix suggestions
- Metrics must be accurate and complete

## Integration Points

- `lib/code-review-automation.ts` - Core automation utility
- `lib/agent-logger.ts` - Logging and monitoring
- `lib/agent-monitoring.ts` - Performance tracking
- Quality gates in `AGENTS.md`

## Usage Example

```typescript
import { codeReviewAutomation } from '@/lib/code-review-automation';

const result = await codeReviewAutomation.reviewCode({
  targetFiles: ['src/components/Button.tsx'],
  reviewType: 'full',
  includeTests: true,
  includeDocumentation: true,
  severity: 'warning',
});

if (!result.passed) {
  console.log('Review failed:', result.issues);
}
```
