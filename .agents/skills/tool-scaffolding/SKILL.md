# Tool Scaffolding Skill

**Purpose**: Automate the creation of new tools following PersianToolbox patterns.

**Usage**: Invoke this skill when creating a new tool from scratch.

## Context

PersianToolbox follows specific patterns for tool implementation:

1. Tools are implemented in `app/(tools)/` with subdirectories for categories
2. Each tool has a corresponding entry in `lib/tools-registry.ts`
3. Tools use client-side processing only
4. Tools must include TypeScript types, tests, and SEO metadata
5. Tools should follow existing UI patterns and components

## Implementation Pattern

### Tool Structure

```
app/(tools)/
├── [category]/
│   └── [tool-name]/
│       └── page.tsx
```

### Registry Entry Pattern

```typescript
{
  id: 'tool-id',
  path: '/category/tool-name',
  title: 'Persian title - جعبه ابزار فارسی',
  description: 'Persian description',
  keywords: ['keyword1', 'keyword2'],
  indexable: true,
  lastModified: '2026-06-15',
  kind: 'tool',
  category: categoryOrThrow('category-id'),
  tier: 'Offline-Guaranteed',
  content: {
    intro: 'Tool introduction',
    steps: ['Step 1', 'Step 2'],
    tips: ['Tip 1', 'Tip 2'],
    faq: [{ question: 'Q?', answer: 'A' }],
  },
}
```

## Skill Execution

1. **Analyze Request**: Understand what tool the user wants to create
2. **Determine Category**: Choose appropriate category (pdf, image, date, text, finance)
3. **Create Tool Page**: Generate the page component following patterns
4. **Update Registry**: Add tool entry to `lib/tools-registry.ts`
5. **Create Tests**: Add test file for the new tool
6. **Update Documentation**: Add tool content and FAQ
7. **Verify Integration**: Ensure tool appears in search and navigation

## Quality Requirements

- Must use TypeScript strictly (no `any`)
- Must implement client-side processing only
- Must include proper error handling
- Must have comprehensive tests
- Must follow existing UI patterns
- Must include Persian language support
- Must pass all quality gates

## Examples

### Creating a PDF Tool

- Category: `pdf`
- Path: `/pdf-tools/[tool-name]`
- Tier: `Offline-Guaranteed`
- Dependencies: pdf-lib or PDF.js

### Creating a Financial Tool

- Category: `finance`
- Path: `/tools/[tool-name]`
- Tier: `Offline-Guaranteed`
- Dependencies: JavaScript math libraries only

### Creating an Image Tool

- Category: `image`
- Path: `/image-tools/[tool-name]`
- Tier: `Offline-Guaranteed`
- Dependencies: Client-side image libraries

## Constraints

- No external API calls
- No server-side processing
- No hardcoded credentials
- Must maintain privacy
- Must be accessible

## Success Criteria

- Tool renders without errors
- Tool is searchable
- Tool has proper SEO metadata
- Tool includes breadcrumb navigation
- Tool has comprehensive tests
- Tool follows existing patterns
