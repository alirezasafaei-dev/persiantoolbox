# Quality Gates Automation Skill

**Purpose**: Automate quality gate validation for PersianToolbox development.

**Usage**: Invoke this skill to run and validate all quality gates before committing changes.

## Context

PersianToolbox enforces strict quality gates to maintain code quality and user experience:

1. **Linting**: ESLint with project-specific rules
2. **Type Checking**: Strict TypeScript compilation
3. **Testing**: Comprehensive unit and E2E tests
4. **Building**: Production build must succeed
5. **Security**: No known vulnerabilities
6. **Performance**: Lighthouse scores must meet minimums

## Quality Gate Sequence

### Phase 1: Code Quality

```bash
pnpm lint
```

- Must pass with zero errors
- Auto-fixable issues should be resolved automatically

### Phase 2: Type Safety

```bash
pnpm typecheck
```

- Must pass with zero TypeScript errors
- No `any` types allowed in new code

### Phase 3: Testing

```bash
pnpm test
pnpm test:e2e
```

- All unit tests must pass
- All E2E tests must pass
- Coverage should not decrease

### Phase 4: Build

```bash
pnpm build
```

- Production build must succeed
- No build warnings
- All routes must generate successfully

### Phase 5: Security

```bash
pnpm security:scan
```

- No high/critical vulnerabilities
- Medium vulnerabilities should be addressed

### Phase 6: Performance

```bash
pnpm performance:budgets
```

- Lighthouse scores 90+
- Bundle size within limits
- No performance regressions

## Automation Pattern

### Pre-Commit Hook Integration

```bash
#!/bin/bash
# Run quality gates before commit
pnpm lint || exit 1
pnpm typecheck || exit 1
pnpm test --run || exit 1
```

### CI Integration

```bash
# Full quality gate suite
pnpm ci:contracts
```

### Agent Execution Pattern

1. **Check File Changes**: Identify modified files
2. **Run Relevant Gates**: Execute gates for affected areas
3. **Fix Auto-Fixable Issues**: Automatically resolve linting
4. **Report Failures**: Clearly indicate what failed
5. **Suggest Fixes**: Provide actionable fix suggestions

## Error Handling

### Lint Failures

- Auto-fix when possible
- Report manual fixes needed
- Provide ESLint error details

### Type Errors

- Clearly indicate type mismatch
- Suggest type corrections
- Report file and line numbers

### Test Failures

- Identify failing test
- Show test output
- Suggest debugging steps

### Build Failures

- Identify build error location
- Show build log
- Suggest dependency issues

## Quality Metrics

### Code Quality

- ESLint score: 10/10
- TypeScript strict mode: Enabled
- Test coverage: >80%

### Performance

- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+
- Lighthouse Best Practices: 90+
- Lighthouse SEO: 100

### Security

- No high/critical vulnerabilities
- No hardcoded secrets
- No external API calls without review

## Success Criteria

- All quality gates pass
- No regressions introduced
- Code follows project patterns
- Documentation is updated
- Tests are comprehensive

## Failure Recovery

### When Quality Gates Fail

1. Stop the process
2. Report specific failures
3. Suggest fixes
4. Allow manual intervention
5. Re-run gates after fixes

### Continuous Improvement

- Track quality gate failures
- Identify common patterns
- Update skill based on learnings
- Improve automation over time
