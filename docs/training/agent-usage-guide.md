# Agent Usage Guide - PersianToolbox

**Last Updated**: 2026-06-15
**Version**: 1.0
**Status**: Complete

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Git configured
- Access to PersianToolbox repository

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Verify setup
pnpm lint && pnpm typecheck && pnpm test
```

---

## Agent Profiles

### subagent_general

**Use for**: General development tasks requiring write access

```bash
# Example: Implementing a new feature
Use subagent_general to create a new tool page
```

**Capabilities**:

- Create new files and directories
- Modify existing code
- Run build and test commands
- Update documentation

### subagent_explore

**Use for**: Codebase exploration and research

```bash
# Example: Understanding existing patterns
Use subagent_explore to analyze the tool registry structure
```

**Capabilities**:

- Read and search code
- Analyze patterns
- Generate reports
- No file modifications

### deep-review

**Use for**: Complex tool development or security reviews

```bash
# Example: Security audit
Use deep-review to analyze authentication flow
```

**Capabilities**:

- Comprehensive code analysis
- Security vulnerability detection
- Performance bottleneck identification
- Architecture review

### fast-fix

**Use for**: Quick bug fixes and small feature additions

```bash
# Example: Fix a typo
Use fast-fix to correct the misspelling in footer
```

**Capabilities**:

- Quick file edits
- Simple bug fixes
- Documentation updates
- Minor UI improvements

---

## Common Workflows

### Adding a New Tool

1. **Research Phase**

   ```bash
   # Use explore agent to understand patterns
   Use subagent_explore to analyze existing tool implementations
   ```

2. **Implementation Phase**

   ```bash
   # Use general agent to create the tool
   Use subagent_general to implement the new tool
   ```

3. **Validation Phase**

   ```bash
   # Run quality gates
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

4. **Documentation Phase**
   ```bash
   # Update documentation
   Use subagent_general to update tool registry and docs
   ```

### Fixing a Bug

1. **Triage Phase**

   ```bash
   # Use bug-triage skill
   import { bugTriageAutomation } from '@/lib/bug-triage-automation';
   const analysis = await bugTriageAutomation.analyzeBug(bugReport);
   ```

2. **Fix Phase**

   ```bash
   # Use fast-fix for simple bugs
   Use fast-fix to implement the fix
   ```

3. **Testing Phase**
   ```bash
   # Run regression tests
   import { regressionTesting } from '@/lib/regression-testing';
   await regressionTesting.runRegressionTests(config);
   ```

### Code Review

1. **Automated Review**

   ```bash
   # Use code-review skill
   import { codeReviewAutomation } from '@/lib/code-review-automation';
   const result = await codeReviewAutomation.reviewCode(config);
   ```

2. **Manual Review**
   ```bash
   # Create pull request
   git checkout -b feature/my-feature
   # Make changes
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

---

## Quality Gates

### Required Checks

Before any commit, ensure:

```bash
# Linting
pnpm lint

# Type checking
pnpm typecheck

# Tests
pnpm test

# Build (optional but recommended)
pnpm build
```

### Quality Standards

- **Lint**: Zero errors, warnings acceptable
- **Typecheck**: Zero errors
- **Tests**: All tests passing
- **Coverage**: Maintain current coverage levels
- **Performance**: No Lighthouse score degradation

---

## Automation Tools

### Tool Scaffolding

```typescript
import { toolScaffolding } from '@/lib/tool-scaffolding';

await toolScaffolding.createTool({
  toolId: 'my-tool',
  path: '/my-tool',
  title: 'My Tool',
  titlePersian: 'ابزار من',
  description: 'A useful tool',
  descriptionPersian: 'ابزار مفید',
  keywords: ['tool', 'utility'],
  categoryId: 'text-tools',
});
```

### Test Generation

```typescript
import { testGeneration } from '@/lib/test-generation';

const tests = await testGeneration.generateTests({
  targetFile: 'src/components/Button.tsx',
  testType: 'unit',
  includeAccessibility: true,
});
```

### Dependency Updates

```typescript
import { dependencyUpdateAutomation } from '@/lib/dependency-update-automation';

const result = await dependencyUpdateAutomation.updateDependencies({
  updateType: 'minor',
  testAfterUpdate: true,
});
```

---

## Troubleshooting

### Common Issues

#### Lint Errors

```bash
# Auto-fix lint errors
pnpm lint --fix

# Check specific file
pnpm lint src/path/to/file.ts
```

#### Type Errors

```bash
# Run typecheck
pnpm typecheck

# Check specific file
npx tsc --noEmit src/path/to/file.ts
```

#### Test Failures

```bash
# Run specific test
pnpm vitest run path/to/test.test.ts

# Run with verbose output
pnpm vitest run --reporter=verbose
```

#### Build Failures

```bash
# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Try build again
pnpm build
```

### Getting Help

1. **Check Documentation**
   - `AGENTS.md` - Agent governance
   - `docs/technical/` - Technical documentation
   - `README.md` - Project overview

2. **Run Diagnostics**

   ```bash
   ./scripts/workspace-status.sh
   ./scripts/live-healthcheck.sh
   ```

3. **Contact Support**
   - Technical lead
   - Development team

---

## Best Practices

### Code Quality

1. **Follow Existing Patterns**
   - Look at similar implementations
   - Use consistent naming conventions
   - Maintain code style

2. **Write Tests**
   - Test new functionality
   - Test edge cases
   - Maintain coverage

3. **Document Changes**
   - Update relevant docs
   - Add code comments for complex logic
   - Update changelog

### Security

1. **Never Commit Secrets**
   - Use environment variables
   - Check `.env.example` for required vars
   - Never hardcode credentials

2. **Validate Inputs**
   - Sanitize user input
   - Validate data types
   - Check permissions

3. **Follow Security Guidelines**
   - Use secure libraries
   - Follow OWASP guidelines
   - Regular security audits

### Performance

1. **Optimize Critical Paths**
   - Profile before optimizing
   - Measure impact
   - Document changes

2. **Use Caching**
   - Cache expensive computations
   - Use appropriate TTL
   - Monitor cache hit rates

3. **Monitor Performance**
   - Track key metrics
   - Set up alerts
   - Review regularly

---

## Appendix

### Agent Skill Reference

| Skill                  | Purpose          | Location                                 |
| ---------------------- | ---------------- | ---------------------------------------- |
| tool-scaffolding       | Create new tools | `.agents/skills/tool-scaffolding/`       |
| test-generation        | Generate tests   | `.agents/skills/test-generation/`        |
| quality-gates          | Quality checks   | `.agents/skills/quality-gates/`          |
| bug-triage             | Bug analysis     | `.agents/skills/bug-triage/`             |
| documentation-update   | Update docs      | `.agents/skills/documentation-update/`   |
| code-review            | Code review      | `.agents/skills/code-review/`            |
| refactoring            | Code refactoring | `.agents/skills/refactoring/`            |
| dependency-update      | Dependencies     | `.agents/skills/dependency-update/`      |
| performance-monitoring | Performance      | `.agents/skills/performance-monitoring/` |
| security-scan          | Security         | `.agents/skills/security-scan/`          |
| agent-caching          | Caching          | `.agents/skills/agent-caching/`          |
| parallel-execution     | Parallel tasks   | `.agents/skills/parallel-execution/`     |
| performance-benchmarks | Benchmarking     | `.agents/skills/performance-benchmarks/` |
| analytics-dashboard    | Analytics        | `.agents/skills/analytics-dashboard/`    |
| error-tracker          | Error tracking   | `.agents/skills/error-tracker/`          |
| skill-optimizer        | Optimization     | `.agents/skills/skill-optimizer/`        |

### Automation Utility Reference

| Utility                           | Purpose          | Location                                   |
| --------------------------------- | ---------------- | ------------------------------------------ |
| tool-scaffolding                  | Tool creation    | `lib/tool-scaffolding.ts`                  |
| test-generation                   | Test generation  | `lib/test-generation.ts`                   |
| documentation-update              | Doc updates      | `lib/documentation-update.ts`              |
| registry-integration              | Registry mgmt    | `lib/registry-integration.ts`              |
| tool-validation                   | Validation       | `lib/tool-validation.ts`                   |
| bug-triage-automation             | Bug analysis     | `lib/bug-triage-automation.ts`             |
| regression-testing                | Regression tests | `lib/regression-testing.ts`                |
| code-review-automation            | Code review      | `lib/code-review-automation.ts`            |
| refactoring-automation            | Refactoring      | `lib/refactoring-automation.ts`            |
| dependency-update-automation      | Dependencies     | `lib/dependency-update-automation.ts`      |
| performance-monitoring-automation | Performance      | `lib/performance-monitoring-automation.ts` |
| security-scan-automation          | Security         | `lib/security-scan-automation.ts`          |
| agent-cache                       | Caching          | `lib/agent-cache.ts`                       |
| parallel-execution                | Parallel tasks   | `lib/parallel-execution.ts`                |
| performance-benchmarks            | Benchmarking     | `lib/performance-benchmarks.ts`            |
| agent-analytics-dashboard         | Analytics        | `lib/agent-analytics-dashboard.ts`         |
| agent-error-tracker               | Error tracking   | `lib/agent-error-tracker.ts`               |
| agent-skill-optimizer             | Optimization     | `lib/agent-skill-optimizer.ts`             |
