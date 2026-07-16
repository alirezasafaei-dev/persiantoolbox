# Best Practices Guide - PersianToolbox CLI Agent

**Last Updated**: 2026-06-15
**Version**: 1.0
**Status**: Complete

---

## Code Quality

### 1. Follow Existing Patterns

- Look at similar implementations before writing new code
- Use consistent naming conventions
- Maintain code style throughout the project

### 2. Write Clean Code

```typescript
// Good: Clear, descriptive naming
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Bad: Unclear naming
function calc(a: any[]): number {
  return a.reduce((s, i) => s + i.p * i.q, 0);
}
```

### 3. Use TypeScript Properly

```typescript
// Good: Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User | null {
  // Implementation
}

// Bad: Using any
function getUser(id: any): any {
  // Implementation
}
```

### 4. Handle Errors Gracefully

```typescript
// Good: Proper error handling
async function fetchData(): Promise<Data> {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch data', { error });
    throw new DataFetchError('Unable to fetch data');
  }
}

// Bad: Swallowing errors
async function fetchData(): Promise<any> {
  try {
    return await api.get('/data');
  } catch (e) {
    // Silent failure
  }
}
```

---

## Testing

### 1. Write Meaningful Tests

```typescript
// Good: Descriptive test names
describe('calculateTotalPrice', () => {
  it('should return 0 for empty cart', () => {
    expect(calculateTotalPrice([])).toBe(0);
  });

  it('should calculate total for single item', () => {
    const items = [{ price: 10, quantity: 2 }];
    expect(calculateTotalPrice(items)).toBe(20);
  });
});

// Bad: Unclear test names
describe('calc', () => {
  it('works', () => {
    expect(calc([])).toBe(0);
  });
});
```

### 2. Test Edge Cases

```typescript
// Good: Testing edge cases
describe('calculateTotalPrice', () => {
  it('should handle zero quantity', () => {
    const items = [{ price: 10, quantity: 0 }];
    expect(calculateTotalPrice(items)).toBe(0);
  });

  it('should handle negative prices', () => {
    const items = [{ price: -10, quantity: 2 }];
    expect(calculateTotalPrice(items)).toBe(-20);
  });
});
```

### 3. Maintain Test Coverage

```bash
# Check coverage
pnpm vitest run --coverage

# Target: 80%+ coverage
```

---

## Security

### 1. Never Commit Secrets

```bash
# Good: Use environment variables
const apiKey = process.env.API_KEY;

# Bad: Hardcoded secrets
const apiKey = 'sk-placeholder-replace-with-real-key';
```

### 2. Validate User Input

```typescript
// Good: Input validation
function processUserInput(input: string): string {
  const sanitized = input.trim().replace(/[<>]/g, '');
  return sanitized;
}

// Bad: No validation
function processUserInput(input: string): string {
  return input;
}
```

### 3. Use Secure Dependencies

```bash
# Check for vulnerabilities
pnpm audit

# Update vulnerable packages
pnpm update
```

---

## Performance

### 1. Optimize Critical Paths

```typescript
// Good: Memoization for expensive computations
const memoizedCalculate = memoize(calculateTotalPrice);

// Bad: Recomputing every time
function calculate(items: CartItem[]): number {
  return calculateTotalPrice(items);
}
```

### 2. Use Caching

```typescript
// Good: Cache frequently accessed data
import { agentCache } from '@/lib/agent-cache';

async function getUserData(userId: string): Promise<UserData> {
  const cached = agentCache.get<UserData>(`user-${userId}`);
  if (cached) return cached;

  const data = await fetchUserData(userId);
  agentCache.set(`user-${userId}`, data, 3600000);
  return data;
}
```

### 3. Lazy Load When Possible

```typescript
// Good: Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// Bad: Static imports for heavy components
import HeavyComponent from './HeavyComponent';
```

---

## Documentation

### 1. Write Clear Comments

```typescript
// Good: Explains why, not what
// We use a 5-minute cache TTL to balance freshness with performance
const CACHE_TTL = 300000;

// Bad: Explains what (redundant)
// Set cache TTL to 300000 milliseconds
const CACHE_TTL = 300000;
```

### 2. Document Complex Logic

```typescript
// Good: Complex algorithm explained
/**
 * Implements the Dutch National Flag algorithm for sorting
 * an array of 0s, 1s, and 2s in linear time.
 *
 * Time complexity: O(n)
 * Space complexity: O(1)
 */
function sortColors(nums: number[]): void {
  // Implementation
}
```

### 3. Keep Documentation Updated

- Update docs when changing functionality
- Add examples for new features
- Remove outdated information

---

## Git Workflow

### 1. Write Good Commit Messages

```bash
# Good: Clear, descriptive message
git commit -m "feat: add user authentication

- Implement JWT token generation
- Add login/logout endpoints
- Update user model"

# Bad: Unclear message
git commit -m "fixed stuff"
```

### 2. Use Feature Branches

```bash
# Good: Feature branch workflow
git checkout -b feature/user-auth
# Make changes
git commit -m "feat: add user authentication"
git push origin feature/user-auth
# Create PR

# Bad: Direct commits to main
git checkout main
# Make changes
git commit -m "quick fix"
```

### 3. Keep Commits Small and Focused

```bash
# Good: One logical change per commit
git commit -m "feat: add login form"
git commit -m "feat: add validation"
git commit -m "test: add login tests"

# Bad: Multiple changes in one commit
git commit -m "add login, validation, tests, and fix typo"
```

---

## Agent Usage

### 1. Choose the Right Profile

| Task | Profile | Why |
|------|---------|-----|
| New feature | subagent_general | Needs write access |
| Code review | deep-review | Needs analysis |
| Quick fix | fast-fix | Simple changes |
| Research | subagent_explore | Read-only |

### 2. Use Skills Effectively

```typescript
// Good: Use appropriate skill
import { codeReviewAutomation } from '@/lib/code-review-automation';
const result = await codeReviewAutomation.reviewCode(config);

// Bad: Manual review when skill exists
// Manually checking every file
```

### 3. Validate Agent Output

```bash
# Always run quality checks after agent work
pnpm lint
pnpm typecheck
pnpm test
```

---

## Common Pitfalls

### 1. Not Testing Edge Cases

```typescript
// Bad: Only testing happy path
it('should work', () => {
  expect(calculate(1, 2)).toBe(3);
});

// Good: Testing edge cases
it('should handle zero', () => {
  expect(calculate(0, 5)).toBe(0);
});

it('should handle negative numbers', () => {
  expect(calculate(-1, 5)).toBe(-4);
});
```

### 2. Ignoring Error Handling

```typescript
// Bad: No error handling
const data = await fetch(url);

// Good: Proper error handling
try {
  const data = await fetch(url);
} catch (error) {
  logger.error('Fetch failed', { url, error });
  throw new FetchError('Unable to fetch data');
}
```

### 3. Hardcoding Values

```typescript
// Bad: Hardcoded values
const MAX_RETRIES = 3;
const TIMEOUT = 5000;

// Good: Configurable values
const config = {
  maxRetries: process.env.MAX_RETRIES || 3,
  timeout: process.env.TIMEOUT || 5000,
};
```

---

## Code Review Checklist

### Before Submitting

- [ ] Code follows existing patterns
- [ ] TypeScript types are correct
- [ ] Tests are added/updated
- [ ] Documentation is updated
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass

### During Review

- [ ] Code is readable and maintainable
- [ ] Error handling is proper
- [ ] Security considerations are addressed
- [ ] Performance impact is acceptable
- [ ] Tests cover edge cases

---

## Performance Optimization Checklist

### Before Optimizing

- [ ] Profile to identify bottleneck
- [ ] Measure current performance
- [ ] Set optimization target

### During Optimization

- [ ] Make one change at a time
- [ ] Measure impact after each change
- [ ] Document changes

### After Optimizing

- [ ] Verify no regressions
- [ ] Update documentation
- [ ] Share learnings with team

---

## Quick Reference

### Quality Commands

```bash
pnpm lint          # Check code style
pnpm typecheck     # Check types
pnpm test          # Run tests
pnpm build         # Build project
```

### Git Commands

```bash
git status         # Check status
git diff           # See changes
git log            # View history
git stash          # Save changes
```

### Agent Commands

```bash
# Run quality gates
./scripts/workspace-status.sh

# Check live sites
./scripts/live-healthcheck.sh
```
