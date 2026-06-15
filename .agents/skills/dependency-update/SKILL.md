# Dependency Update Automation Skill

**Purpose**: Automate dependency management and security updates

## Context

Use this skill when checking for dependency updates, applying updates, or scanning for security vulnerabilities.

## Execution Steps

1. **Check for Updates**
   - Analyze package.json dependencies
   - Identify updatable packages
   - Categorize by update type (minor, patch, major)
   - Flag breaking changes

2. **Security Vulnerability Scan**
   - Check for known vulnerabilities
   - Identify severity levels
   - Suggest fixes

3. **Apply Updates**
   - Update dependencies safely
   - Handle breaking changes
   - Run compatibility tests

4. **Verify Compatibility**
   - Run test suite
   - Check build process
   - Verify no regressions

5. **Generate Report**
   - List updated dependencies
   - Highlight breaking changes
   - Show security fixes
   - Provide recommendations

## Quality Requirements

- Security updates must be prioritized
- Breaking changes must be carefully reviewed
- Tests must pass after updates
- Changelog must be updated

## Integration Points

- `lib/dependency-update-automation.ts` - Core automation utility
- `lib/agent-logger.ts` - Logging and monitoring
- `lib/agent-monitoring.ts` - Performance tracking
- `package.json` - Dependency definitions

## Usage Example

```typescript
import { dependencyUpdateAutomation } from '@/lib/dependency-update-automation';

const result = await dependencyUpdateAutomation.updateDependencies({
  updateType: 'minor',
  includeDevDependencies: true,
  dryRun: false,
  securityOnly: false,
  testAfterUpdate: true,
});

console.log('Updated:', result.metrics.updatable);
console.log('Tests passed:', result.testPassed);
```
