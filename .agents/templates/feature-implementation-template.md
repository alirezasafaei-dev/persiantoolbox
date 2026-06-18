# Feature Implementation Template

**Purpose**: Standardized template for implementing new features using agents

## Template Structure

```yaml
Agent Profile: subagent_general
Skill: tool-scaffolding
Quality Gates: enabled
```

## Execution Steps

### 1. Requirements Analysis

- Understand feature requirements
- Identify user stories
- Define acceptance criteria
- Plan implementation approach

### 2. Design Phase

- Design component structure
- Plan data flow
- Consider edge cases
- Plan error handling

### 3. Implementation

- Use tool-scaffolding skill
- Implement core functionality
- Write comprehensive tests
- Update tool registry
- Add SEO metadata

### 4. Integration

- Update navigation
- Update breadcrumbs
- Update search
- Update documentation
- Add examples

### 5. Validation

- Run quality gates
- Test core functionality
- Test edge cases
- Performance check
- Accessibility check

### 6. Documentation

- Update README if needed
- Update user guides
- Add API documentation
- Update changelog

## Commit Message Format

```
feat: <brief feature description>

- <key implementation detail>
- <additional context>
- <affected components>

Closes #<issue-number>
```

## Quality Checklist

- [ ] Requirements fully implemented
- [ ] Comprehensive tests written
- [ ] Quality gates pass
- [ ] User testing performed
- [ ] Documentation updated
- [ ] Performance acceptable
- [ ] Accessibility verified
- [ ] SEO metadata added
- [ ] Error handling implemented

## Common Feature Patterns

### Tool Implementation

1. Create page component
2. Add client-side processing
3. Implement state management
4. Add error handling
5. Write tests
6. Update registry

### UI Components

1. Create component file
2. Add TypeScript types
3. Implement props interface
4. Add styling
5. Write tests
6. Export component

### API Integration

1. Define API types
2. Implement fetch logic
3. Add error handling
4. Add loading states
5. Write tests
6. Document API

## Example Implementation

```typescript
// Tool page component
export default function ToolPage() {
  const [state, setState] = useState(initialState);

  const handleAction = useCallback(async () => {
    try {
      setState({ loading: true });
      const result = await processClientSide();
      setState({ result, loading: false });
    } catch (error) {
      setState({ error: error.message, loading: false });
    }
  }, [setState]);

  return <ToolUI state={state} onAction={handleAction} />;
}
```

---

_Use this template for all feature implementations to ensure consistency and quality._
