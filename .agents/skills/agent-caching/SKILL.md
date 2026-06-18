# Agent Caching Skill

**Purpose**: Optimize agent performance through intelligent caching

## Context

Use this skill when agent operations are slow due to repeated computations or API calls.

## Execution Steps

1. **Identify Cacheable Operations**
   - Find repeated computations
   - Identify expensive API calls
   - Locate static data that changes infrequently

2. **Configure Cache Settings**
   - Set appropriate TTL values
   - Configure max cache size
   - Enable cleanup intervals

3. **Implement Caching**
   - Use agent-cache for operation results
   - Cache frequently accessed data
   - Implement cache invalidation strategies

4. **Monitor Cache Performance**
   - Track hit/miss rates
   - Monitor memory usage
   - Adjust cache parameters

## Quality Requirements

- Cache hit rate should be > 70%
- Memory usage should remain stable
- No stale data served after invalidation

## Integration Points

- `lib/agent-cache.ts` - Core caching utility
- `lib/agent-logger.ts` - Cache operation logging
- `lib/agent-monitoring.ts` - Performance tracking

## Usage Example

```typescript
import { agentCache } from '@/lib/agent-cache';

// Cache with default TTL (5 minutes)
agentCache.set('user-data', userData);

// Cache with custom TTL (1 hour)
agentCache.set('config', configData, 3600000);

// Retrieve cached data
const cached = agentCache.get<UserData>('user-data');
if (cached) {
  return cached;
}
```
