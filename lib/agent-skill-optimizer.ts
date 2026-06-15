/**
 * Agent Skill Optimizer - PersianToolbox
 *
 * Provides continuous improvement and optimization for agent skills
 */

import { agentLogger } from '@/lib/agent-logger';

export interface SkillUsage {
  skillId: string;
  executions: number;
  successRate: number;
  averageDuration: number;
  lastUsed: string;
  errors: number;
}

export interface OptimizationSuggestion {
  skillId: string;
  type: 'performance' | 'reliability' | 'usability' | 'security';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  implementation: string;
}

export interface ImprovementEntry {
  id: string;
  skillId: string;
  type: 'bug-fix' | 'enhancement' | 'optimization' | 'documentation';
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface SkillOptimizerConfig {
  analysisInterval: number;
  minExecutionsForAnalysis: number;
  improvementRetention: number;
}

export class AgentSkillOptimizer {
  private usage: Map<string, SkillUsage> = new Map();
  private suggestions: OptimizationSuggestion[] = [];
  private improvements: ImprovementEntry[] = [];
  private config: SkillOptimizerConfig;

  constructor(config: Partial<SkillOptimizerConfig> = {}) {
    this.config = {
      analysisInterval: config.analysisInterval ?? 3600000,
      minExecutionsForAnalysis: config.minExecutionsForAnalysis ?? 10,
      improvementRetention: config.improvementRetention ?? 2592000000,
    };
  }

  recordExecution(skillId: string, success: boolean, duration: number): void {
    const existing = this.usage.get(skillId);

    if (existing) {
      existing.executions++;
      existing.errors += success ? 0 : 1;
      existing.successRate = (existing.executions - existing.errors) / existing.executions;
      existing.averageDuration =
        (existing.averageDuration * (existing.executions - 1) + duration) / existing.executions;
      existing.lastUsed = new Date().toISOString();
    } else {
      this.usage.set(skillId, {
        skillId,
        executions: 1,
        successRate: success ? 1 : 0,
        averageDuration: duration,
        lastUsed: new Date().toISOString(),
        errors: success ? 0 : 1,
      });
    }

    agentLogger.debug('skill-optimizer', 'record', `Recorded execution for ${skillId}`, {
      success,
      duration,
    });
  }

  analyzeSkills(): OptimizationSuggestion[] {
    const newSuggestions: OptimizationSuggestion[] = [];

    for (const [skillId, usage] of this.usage) {
      if (usage.executions < this.config.minExecutionsForAnalysis) {
        continue;
      }

      if (usage.successRate < 0.9) {
        newSuggestions.push({
          skillId,
          type: 'reliability',
          priority: 'high',
          description: `Low success rate: ${(usage.successRate * 100).toFixed(1)}%`,
          impact: 'Improved reliability and user experience',
          implementation: 'Review error handling and add retry logic',
        });
      }

      if (usage.averageDuration > 5000) {
        newSuggestions.push({
          skillId,
          type: 'performance',
          priority: 'medium',
          description: `High average duration: ${usage.averageDuration.toFixed(0)}ms`,
          impact: 'Faster execution times',
          implementation: 'Optimize algorithms and reduce unnecessary operations',
        });
      }

      if (usage.errors > usage.executions * 0.1) {
        newSuggestions.push({
          skillId,
          type: 'reliability',
          priority: 'high',
          description: `High error count: ${usage.errors} errors in ${usage.executions} executions`,
          impact: 'Reduced error rates',
          implementation: 'Add input validation and error recovery',
        });
      }
    }

    this.suggestions = [...this.suggestions, ...newSuggestions];
    return newSuggestions;
  }

  addImprovement(entry: Omit<ImprovementEntry, 'id' | 'createdAt' | 'updatedAt'>): ImprovementEntry {
    const improvement: ImprovementEntry = {
      ...entry,
      id: `imp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.improvements.push(improvement);
    agentLogger.info('skill-optimizer', 'add-improvement', `Improvement added: ${improvement.id}`);
    return improvement;
  }

  updateImprovement(id: string, updates: Partial<ImprovementEntry>): boolean {
    const improvement = this.improvements.find((i) => i.id === id);
    if (improvement) {
      Object.assign(improvement, updates, { updatedAt: new Date().toISOString() });
      return true;
    }
    return false;
  }

  getSkillUsage(): SkillUsage[] {
    return Array.from(this.usage.values());
  }

  getSuggestions(): OptimizationSuggestion[] {
    return [...this.suggestions];
  }

  getImprovements(status?: ImprovementEntry['status']): ImprovementEntry[] {
    if (status) {
      return this.improvements.filter((i) => i.status === status);
    }
    return [...this.improvements];
  }

  async generateReport(): Promise<string> {
    const usage = this.getSkillUsage();
    const suggestions = this.getSuggestions();
    const improvements = this.getImprovements();

    return `# Skill Optimizer Report

## Skill Usage Summary
${usage.length > 0 ? usage.map((u) => `- **${u.skillId}**: ${u.executions} executions, ${(u.successRate * 100).toFixed(1)}% success, ${u.averageDuration.toFixed(0)}ms avg`).join('\n') : 'No usage data recorded'}

## Optimization Suggestions (${suggestions.length})
${suggestions.length > 0 ? suggestions.map((s) => `- **${s.skillId}** [${s.priority.toUpperCase()}] ${s.type}: ${s.description}\n  Impact: ${s.impact}\n  Implementation: ${s.implementation}`).join('\n\n') : 'No suggestions at this time'}

## Improvement Backlog
- **Pending**: ${improvements.filter((i) => i.status === 'pending').length}
- **In Progress**: ${improvements.filter((i) => i.status === 'in-progress').length}
- **Completed**: ${improvements.filter((i) => i.status === 'completed').length}
- **Rejected**: ${improvements.filter((i) => i.status === 'rejected').length}

## Recommendations
${suggestions.filter((s) => s.priority === 'high').length > 0 ? '- 🔴 Address high-priority suggestions immediately\n' : ''}${usage.some((u) => u.successRate < 0.8) ? '- ⚠️ Review skills with low success rates\n' : ''}- 📊 Continue monitoring skill performance`;
  }
}

export const agentSkillOptimizer = new AgentSkillOptimizer();
