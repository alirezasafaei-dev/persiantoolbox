# Test Generation Skill

**Purpose**: Automate the creation of comprehensive tests for PersianToolbox components and functions.

**Usage**: Invoke this skill when creating tests for new or existing code.

## Context

PersianToolbox uses Vitest for unit testing and Playwright for E2E testing. Tests should:

1. Cover happy paths and error cases
2. Test client-side processing thoroughly
3. Include accessibility testing
4. Test Persian language functionality
5. Follow existing test patterns

## Test Patterns

### Unit Test Pattern

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '@/lib/module';

describe('functionToTest', () => {
  it('handles normal case', () => {
    const result = functionToTest(input);
    expect(result).toBe(expected);
  });

  it('handles edge case', () => {
    const result = functionToTest(edgeInput);
    expect(result).toBe(expected);
  });

  it('handles error case', () => {
    expect(() => functionToTest(invalidInput)).toThrow();
  });
});
```

### Component Test Pattern

```typescript
import { render, screen } from '@testing-library/react';
import Component from '@/components/Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<Component />);
    const button = screen.getByRole('button');
    button.click();
    expect(screen.getByText('result')).toBeInTheDocument();
  });
});
```

## Skill Execution

1. **Analyze Code**: Understand the function/component being tested
2. **Identify Test Cases**: Determine happy paths, edge cases, error cases
3. **Generate Unit Tests**: Create comprehensive unit tests
4. **Generate Component Tests**: Create React component tests if applicable
5. **Add Accessibility Tests**: Include accessibility assertions
6. **Add Persian Language Tests**: Test Persian text functionality
7. **Verify Coverage**: Ensure adequate test coverage

## Test Categories

### Unit Tests

- Pure functions
- Utility functions
- Data transformations
- Business logic

### Component Tests

- React components
- User interactions
- State management
- Error handling

### Integration Tests

- Component interactions
- Data flow
- External dependencies

### E2E Tests

- Complete user flows
- Cross-page interactions
- Real browser testing

## Quality Requirements

- Tests must be deterministic
- Tests must be isolated
- Tests must be fast
- Tests must be maintainable
- Tests must follow naming conventions
- Tests must include clear descriptions

## Test Location Guidelines

- Unit tests: `__tests__/` or `tests/unit/`
- Component tests: `tests/unit/` with `.test.tsx` extension
- E2E tests: `tests/e2e/`
- Feature tests: `features/[feature]/`

## Success Criteria

- All new code has corresponding tests
- Tests achieve adequate coverage
- Tests catch regressions
- Tests are fast and reliable
- Tests follow existing patterns
