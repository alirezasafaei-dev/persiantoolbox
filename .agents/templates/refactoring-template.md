# Refactoring Template

**Purpose**: Standardized template for code refactoring using agents

## Template Structure

```yaml
Agent Profile: subagent_general
Quality Gates: enabled
```

## Execution Steps

### 1. Analysis

- Identify refactoring opportunity
- Analyze current implementation
- Identify smells and anti-patterns
- Plan refactoring approach

### 2. Preparation

- Write tests for existing behavior
- Establish performance baseline
- Document current behavior
- Identify break points

### 3. Refactoring

- Make incremental changes
- Maintain functionality
- Improve code structure
- Follow best practices
- Update types

### 4. Validation

- Run tests to ensure no regression
- Compare performance with baseline
- Manual testing
- Update documentation

### 5. Cleanup

- Remove unused code
- Update imports
- Update exports
- Add comments if needed

## Commit Message Format

```
refactor: <brief refactoring description>

- <what was refactored>
- <why it was refactored>
- <performance impact if any>

Related to #<issue-number>
```

## Quality Checklist

- [ ] Existing behavior maintained
- [ ] Tests pass (no regression)
- [ ] Performance improved or maintained
- [ ] Code is more readable
- [ ] Types are correct
- [ ] Documentation updated
- [ ] No dead code introduced

## Common Refactoring Patterns

### Function Extraction

```typescript
// Before
function processUser(user) {
  // 50 lines of logic
  if (user.age > 18) {
    // more logic
  }
}

// After
function processUser(user) {
  const isAdult = checkIfAdult(user);
  const permissions = calculatePermissions(user);
  return applyPermissions(permissions, isAdult);
}
```

### DRY (Don't Repeat Yourself)

```typescript
// Before
function validateEmail1(email: string) {
  /* validation */
}
function validateEmail2(email: string) {
  /* validation */
}

// After
function validateEmail(email: string) {
  /* validation */
}
function validateEmail1(email: string) {
  return validateEmail(email);
}
function validateEmail2(email: string) {
  return validateEmail(email);
}
```

### Single Responsibility

```typescript
// Before
function handleUserAction(user, action, context) {
  // authentication
  // authorization
  // action execution
  // logging
  // analytics
}

// After
function authenticateUser(user) {
  /* authentication */
}
function authorizeUser(user, action) {
  /* authorization */
}
function executeAction(action, context) {
  /* execution */
}
function logAction(user, action) {
  /* logging */
}
function trackAnalytics(user, action) {
  /* analytics */
}
```

### Type Safety Improvements

```typescript
// Before
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// After
interface DataItem {
  value: string;
  id: number;
}

function processData(data: DataItem[]) {
  return data.map((item) => item.value);
}
```

## Performance Considerations

- Measure before and after
- Optimize hot paths first
- Consider memoization
- Optimize algorithms
- Reduce unnecessary renders

## Safety Measures

- Always write tests first
- Commit after each major step
- Keep functionality working
- Rollback if issues arise
- Monitor performance

---

_Use this template for all refactoring tasks to ensure safety and quality._
