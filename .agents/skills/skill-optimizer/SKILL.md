# Skill Optimizer Skill

**Purpose**: Continuously improve agent skills based on usage data

## Context

Use this skill when optimizing agent skills or managing improvement backlogs.

## Execution Steps

1. **Track Skill Usage**
   - Record execution counts
   - Track success rates
   - Measure execution times

2. **Analyze Performance**
   - Identify underperforming skills
   - Detect optimization opportunities
   - Generate improvement suggestions

3. **Manage Improvements**
   - Create improvement tasks
   - Track progress
   - Document changes

4. **Generate Reports**
   - Summarize skill performance
   - Highlight improvement opportunities
   - Track improvement progress

## Quality Requirements

- Minimum executions before analysis
- Suggestions should be actionable
- Improvements should be prioritized

## Integration Points

- `lib/agent-skill-optimizer.ts` - Core optimization utility
- `lib/agent-logger.ts` - Usage logging
- `lib/agent-monitoring.ts` - Performance tracking

## Usage Example

```typescript
import { agentSkillOptimizer } from '@/lib/agent-skill-optimizer';

// Record execution
agentSkillOptimizer.recordExecution('code-review', true, 1500);

// Analyze skills
const suggestions = agentSkillOptimizer.analyzeSkills();

// Add improvement
agentSkillOptimizer.addImprovement({
  skillId: 'code-review',
  type: 'optimization',
  description: 'Add parallel file analysis',
  status: 'pending',
  priority: 'medium',
});
```
