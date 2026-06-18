# Bug Fix Template

**Purpose**: Standardized template for bug fixes using agents

## Template Structure

```yaml
Agent Profile: fast-fix
Skill: bug-triage
Quality Gates: enabled
```

## Execution Steps

### 1. Bug Analysis

- Read bug report
- Reproduce the bug
- Identify root cause
- Assess severity and impact

### 2. Fix Implementation

- Write regression test first
- Implement minimal fix
- Follow existing patterns
- Maintain type safety

### 3. Validation

- Run quality gates
- Test the fix manually
- Check for regressions
- Update documentation if needed

### 4. Commit

- Use conventional commit message
- Format: `fix: <brief description>`
- Include issue reference if applicable

## Commit Message Format

```
fix: <brief description of the fix>

- <detail about what was fixed>
- <technical approach if relevant>

Fixes #<issue-number>
```

## Quality Checklist

- [ ] Regression test added
- [ ] Quality gates pass
- [ ] Manual testing performed
- [ ] Documentation updated
- [ ] No performance impact
- [ ] Accessibility maintained

## Common Bug Patterns

### Null/Undefined Errors

- Add null checks
- Use optional chaining
- Provide default values

### Type Errors

- Fix type definitions
- Add proper type guards
- Update interfaces

### Logic Errors

- Fix algorithm
- Update conditionals
- Correct data flow

### UI Errors

- Fix component rendering
- Update event handlers
- Correct styling issues

## Example

```typescript
// Before
if (user.name) {
  return user.name;
}

// After
return user.name ?? 'Guest';
```

---

_Use this template for all bug fixes to ensure consistency and quality._
