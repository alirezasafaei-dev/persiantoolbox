# Documentation Update Skill

**Purpose**: Automate documentation updates for PersianToolbox codebase.

**Usage**: Invoke this skill when code changes require documentation updates.

## Context

PersianToolbox documentation includes:

1. **Code Comments**: Inline documentation for complex logic
2. **README.md**: Project overview and quick start
3. **Tool Registry**: Tool descriptions and metadata
4. **AGENTS.md**: Agent governance and guidelines
5. **Technical Docs**: Architecture and implementation details
6. **User Guides**: Tool usage instructions

## Documentation Patterns

### Code Comment Pattern

```typescript
/**
 * Converts Persian date to Gregorian date
 * @param persianDate - Persian date string (YYYY/MM/DD)
 * @returns Gregorian date string (YYYY-MM-DD)
 * @throws Error if date format is invalid
 */
function convertPersianToGregorian(persianDate: string): string {
  // Implementation
}
```

### Tool Registry Pattern

```typescript
{
  id: 'tool-id',
  title: 'Tool Title - جعبه ابزار فارسی',
  description: 'Tool description in Persian',
  keywords: ['keyword1', 'keyword2'],
  content: {
    intro: 'Tool introduction',
    steps: ['Step 1', 'Step 2'],
    tips: ['Tip 1'],
    faq: [{ question: 'Q?', answer: 'A' }],
  },
}
```

### README Pattern

````markdown
## Feature Name

Brief description

### Usage

```bash
command
```
````

### Examples

- Example 1
- Example 2

```

## Skill Execution

### Phase 1: Analyze Changes
1. **Identify Modified Code**: Determine what changed
2. **Assess Impact**: Evaluate user-facing impact
3. **Determine Documentation Needs**: What docs need updates

### Phase 2: Update Code Documentation
1. **Add Comments**: Document complex logic
2. **Update Types**: Document type definitions
3. **Add Examples**: Provide usage examples
4. **Update Error Messages**: Clear error descriptions

### Phase 3: Update Registry Documentation
1. **Update Tool Entry**: Modify tool registry entry
2. **Add Keywords**: Add relevant keywords
3. **Update Descriptions**: Improve clarity
4. **Add FAQ**: Add common questions

### Phase 4: Update User Documentation
1. **Update README**: Add new features/changes
2. **Update Guides**: Modify user guides
3. **Add Examples**: Provide practical examples
4. **Update Screenshots**: Add visual documentation

### Phase 5: Update Technical Documentation
1. **Update Architecture Docs**: Document structural changes
2. **Update API Docs**: Document API changes
3. **Update Migration Guides**: Document breaking changes
4. **Update Changelog**: Document version changes

## Documentation Locations

### Code Documentation
- Inline comments in source files
- Type definitions in TypeScript
- JSDoc comments for functions

### User Documentation
- `README.md`: Project overview
- `docs/`: User guides and tutorials
- Tool descriptions in registry
- FAQ sections in tool content

### Technical Documentation
- `docs/technical/`: Architecture and internals
- `AGENTS.md`: Agent governance
- Comments in complex functions
- Architecture diagrams

## Quality Requirements

- Documentation must be accurate
- Documentation must be up-to-date
- Documentation must be clear and concise
- Documentation must include examples
- Documentation must be in Persian where appropriate
- Documentation must follow style guides

## Automation Patterns

### When Adding a Tool
- Add to tools registry with full metadata
- Add Persian title and description
- Include usage examples
- Add FAQ for common questions
- Update README if it's a major tool

### When Modifying API
- Update function documentation
- Add examples for new parameters
- Document breaking changes
- Update migration guide
- Update type definitions

### When Fixing a Bug
- Document the bug fix
- Add regression test documentation
- Update FAQ if relevant
- Update troubleshooting guide
- Document workarounds

## Success Criteria

- Documentation is accurate and complete
- Documentation follows existing patterns
- Documentation is in appropriate language
- Documentation includes examples
- Documentation is up-to-date with code
- Documentation passes spell checking
```
