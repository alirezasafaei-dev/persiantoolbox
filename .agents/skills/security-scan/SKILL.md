# Security Scan Automation Skill

**Purpose**: Automate security scanning and vulnerability detection

## Context

Use this skill when scanning for vulnerabilities, checking code security, or generating security reports.

## Execution Steps

1. **Scan Dependencies**
   - Check for known vulnerabilities
   - Identify severity levels
   - Suggest fixes

2. **Scan Code**
   - Check for XSS vulnerabilities
   - Detect injection risks
   - Identify insecure patterns

3. **Auto-Fix (Optional)**
   - Apply safe fixes
   - Update vulnerable packages
   - Sanitize code patterns

4. **Generate Report**
   - List all vulnerabilities
   - Categorize by severity
   - Provide remediation steps
   - Highlight critical issues

## Quality Requirements

- Critical vulnerabilities must be addressed immediately
- High severity issues must be fixed before release
- Reports must be comprehensive
- Auto-fix must be safe and tested

## Integration Points

- `lib/security-scan-automation.ts` - Core automation utility
- `lib/agent-logger.ts` - Logging and monitoring
- `lib/agent-monitoring.ts` - Performance tracking
- npm audit and security tools

## Usage Example

```typescript
import { securityScanAutomation } from '@/lib/security-scan-automation';

const result = await securityScanAutomation.scanSecurity({
  scanType: 'full',
  includeDependencies: true,
  includeCodeAnalysis: true,
  autoFix: false,
  severity: 'medium',
});

console.log('Vulnerabilities:', result.metrics.totalVulnerabilities);
console.log('Passed:', result.passed);
```
