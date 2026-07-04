# Blog Article Server-First Rendering Plan — 2026-07-04

## Current
BlogPost is mostly client component.

## Client Widgets to Keep
- Progress bar (scroll)
- Back to top
- Bookmark / reactions
- Share toast
- Any interactive

## Proposed Split
- Server component for content, metadata, schema, series
- Client wrapper for interactive only: BlogInteractive.client.tsx

## Benefits
Better SEO, faster initial HTML, streaming.

## Risks
Hydration mismatch if not careful.

## Implementation Order
1. Extract static parts
2. Test with existing

See BlogPost.tsx for current.
