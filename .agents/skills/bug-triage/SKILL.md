# Bug Triage Skill

**Purpose**: Automate bug analysis, categorization, and fix generation for PersianToolbox.

**Usage**: Invoke this skill when a bug is reported or discovered.

## Context

PersianToolbox bugs should be:

1. **Quickly categorized** by severity and impact
2. **Analyzed** for root cause
3. **Fixed** with minimal changes
4. **Tested** to prevent regression
5. **Documented** for future reference

## Bug Categories

### Severity Levels

- **Critical**: Blocks core functionality, data loss, security issues
- **High**: Major functionality broken, poor UX
- **Medium**: Minor functionality issues, edge cases
- **Low**: Cosmetic issues, documentation errors

### Impact Areas

- **Core Platform**: Navigation, search, routing
- **Tools**: Specific tool functionality
- **Performance**: Load times, responsiveness
- **Accessibility**: Screen readers, keyboard navigation
- **SEO**: Metadata, structured data
- **Privacy**: Data handling, client-side processing

## Triage Process

### Phase 1: Bug Analysis

1. **Understand the Bug**: Read bug description, reproduction steps
2. **Reproduce the Bug**: Create minimal reproduction case
3. **Identify Scope**: Determine affected components
4. **Assess Impact**: Evaluate user impact and severity
5. **Categorize Bug**: Assign severity and category

### Phase 2: Root Cause Analysis

1. **Examine Code**: Review affected code paths
2. **Check Dependencies**: Verify dependency versions
3. **Review Recent Changes**: Check recent commits
4. **Analyze Logs**: Look for error patterns
5. **Identify Root Cause**: Determine underlying issue

### Phase 3: Fix Generation

1. **Design Fix**: Create minimal, focused fix
2. **Write Test**: Add regression test first
3. **Implement Fix**: Apply the fix
4. **Verify Fix**: Ensure bug is resolved
5. **Check Regressions**: Run full test suite

### Phase 4: Validation

1. **Test Fix**: Manually verify bug resolution
2. **Run Quality Gates**: Ensure all gates pass
3. **Test Scenarios**: Test related scenarios
4. **Performance Check**: Ensure no performance impact
5. **Accessibility Check**: Verify accessibility maintained

## Bug Fix Patterns

### Simple Bug Fix

```typescript
// Before
if (value === undefined) return null;

// After
if (value == null) return null; // Handles both undefined and null
```

### Defensive Programming

```typescript
// Add validation
if (!input || typeof input !== 'string') {
  throw new Error('Invalid input');
}
```

### Error Boundary

```typescript
// Add error handling
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error);
  return fallbackValue;
}
```

## Quality Requirements

- Fix must be minimal and focused
- Fix must include regression test
- Fix must not break existing functionality
- Fix must follow project patterns
- Fix must maintain performance
- Fix must preserve accessibility

## Documentation Requirements

### Bug Report Template

```markdown
## Bug Description

Brief description of the bug

## Reproduction Steps

1. Step 1
2. Step 2
3. Step 3

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- Browser: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux
- PersianToolbox Version: x.x.x
```

### Fix Documentation

- Describe the bug
- Explain the root cause
- Detail the fix approach
- List testing performed
- Note any related issues

## Success Criteria

- Bug is completely resolved
- No regressions introduced
- Tests are comprehensive
- Documentation is updated
- Quality gates pass
- Performance is maintained
