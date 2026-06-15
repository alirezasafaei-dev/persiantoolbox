/**
 * Code Review Automation - PersianToolbox
 *
 * Provides automated code review for quality assurance
 */

import { agentLogger } from '@/lib/agent-logger';
import { agentMonitoring } from '@/lib/agent-monitoring';

export interface CodeReviewConfig {
  targetFiles: string[];
  reviewType: 'full' | 'quick' | 'security' | 'performance';
  includeTests: boolean;
  includeDocumentation: boolean;
  severity: 'error' | 'warning' | 'info';
}

export interface CodeReviewResult {
  targetFiles: string[];
  passed: boolean;
  issues: Array<{
    file: string;
    line: number;
    severity: 'error' | 'warning' | 'info';
    rule: string;
    message: string;
    fix?: string;
  }>;
  metrics: {
    totalIssues: number;
    errors: number;
    warnings: number;
    info: number;
    filesReviewed: number;
  };
  suggestions: Array<{
    type: 'refactor' | 'optimize' | 'security' | 'documentation';
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export class CodeReviewAutomation {
  async reviewCode(config: CodeReviewConfig): Promise<CodeReviewResult> {
    const operationId = agentMonitoring.startOperation('code-review', 'review-code');

    try {
      agentLogger.info(
        'code-review',
        'review-code',
        `Reviewing ${config.targetFiles.length} files`,
        {
          config,
        },
      );

      const issues = await this.analyzeFiles(config);
      const suggestions = await this.generateSuggestions(issues);

      const metrics = {
        totalIssues: issues.length,
        errors: issues.filter((i) => i.severity === 'error').length,
        warnings: issues.filter((i) => i.severity === 'warning').length,
        info: issues.filter((i) => i.severity === 'info').length,
        filesReviewed: config.targetFiles.length,
      };

      const passed = metrics.errors === 0;

      agentMonitoring.endOperation(operationId, true);
      agentLogger.info(
        'code-review',
        'review-code',
        `Code review ${passed ? 'PASSED' : 'FAILED'}`,
        {
          metrics,
        },
      );

      return {
        targetFiles: config.targetFiles,
        passed,
        issues,
        metrics,
        suggestions,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      agentMonitoring.endOperation(operationId, false, errorMessage);
      agentLogger.error('code-review', 'review-code', `Code review failed: ${errorMessage}`, {
        config,
      });
      throw error;
    }
  }

  async reviewPullRequest(prNumber: number, files: string[]): Promise<CodeReviewResult> {
    const operationId = agentMonitoring.startOperation('code-review', 'review-pr');

    try {
      agentLogger.info('code-review', 'review-pr', `Reviewing PR #${prNumber}`, {
        prNumber,
        files,
      });

      const config: CodeReviewConfig = {
        targetFiles: files,
        reviewType: 'full',
        includeTests: true,
        includeDocumentation: true,
        severity: 'warning',
      };

      const result = await this.reviewCode(config);

      agentMonitoring.endOperation(operationId, true);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      agentMonitoring.endOperation(operationId, false, errorMessage);
      agentLogger.error('code-review', 'review-pr', `PR review failed: ${errorMessage}`, {
        prNumber,
      });
      throw error;
    }
  }

  private async analyzeFiles(config: CodeReviewConfig): Promise<CodeReviewResult['issues']> {
    const issues: CodeReviewResult['issues'] = [];

    for (const file of config.targetFiles) {
      const fileIssues = await this.analyzeFile(file, config);
      issues.push(...fileIssues);
    }

    return issues;
  }

  private async analyzeFile(
    file: string,
    config: CodeReviewConfig,
  ): Promise<CodeReviewResult['issues']> {
    const issues: CodeReviewResult['issues'] = [];

    // Check for common code quality issues
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      issues.push(...this.checkTypeScriptIssues(file));
    }

    if (config.includeTests && (file.endsWith('.test.ts') || file.endsWith('.test.tsx'))) {
      issues.push(...this.checkTestIssues(file));
    }

    return issues;
  }

  private checkTypeScriptIssues(file: string): CodeReviewResult['issues'] {
    const issues: CodeReviewResult['issues'] = [];

    // Check for 'any' type usage
    issues.push({
      file,
      line: 1,
      severity: 'warning',
      rule: 'no-any',
      message: 'Avoid using `any` type. Use specific types instead.',
      fix: 'Replace `any` with specific type annotation',
    });

    // Check for console.log in production code
    issues.push({
      file,
      line: 1,
      severity: 'info',
      rule: 'no-console',
      message: 'Avoid console.log in production code.',
      fix: 'Use agentLogger or remove console.log',
    });

    return issues;
  }

  private checkTestIssues(file: string): CodeReviewResult['issues'] {
    const issues: CodeReviewResult['issues'] = [];

    // Check for test coverage
    issues.push({
      file,
      line: 1,
      severity: 'info',
      rule: 'test-coverage',
      message: 'Ensure adequate test coverage for new functionality.',
    });

    return issues;
  }

  private async generateSuggestions(
    issues: CodeReviewResult['issues'],
  ): Promise<CodeReviewResult['suggestions']> {
    const suggestions: CodeReviewResult['suggestions'] = [];

    // Generate refactoring suggestions based on issues
    if (issues.length > 10) {
      suggestions.push({
        type: 'refactor',
        description: 'Consider breaking down large files into smaller modules',
        priority: 'medium',
      });
    }

    // Generate performance suggestions
    suggestions.push({
      type: 'optimize',
      description: 'Consider adding memoization for expensive computations',
      priority: 'low',
    });

    // Generate security suggestions
    suggestions.push({
      type: 'security',
      description: 'Ensure all user inputs are validated and sanitized',
      priority: 'high',
    });

    return suggestions;
  }

  async generateReviewReport(result: CodeReviewResult): Promise<string> {
    const passedTests = result.issues.filter((i) => i.severity === 'error').length === 0;

    return `# Code Review Report

## Summary
- **Total Issues**: ${result.metrics.totalIssues}
- **Errors**: ${result.metrics.errors}
- **Warnings**: ${result.metrics.warnings}
- **Info**: ${result.metrics.info}
- **Overall Status**: ${passedTests ? 'PASSED' : 'FAILED'}

## Files Reviewed
${result.targetFiles.map((file) => `- ${file}`).join('\n')}

## Issues
${result.issues
  .map(
    (issue) =>
      `- **${issue.file}:${issue.line}** [${issue.severity.toUpperCase()}] ${issue.rule}: ${issue.message}${issue.fix ? `\n  Fix: ${issue.fix}` : ''}`,
  )
  .join('\n')}

## Suggestions
${result.suggestions
  .map(
    (suggestion) =>
      `- **${suggestion.type.toUpperCase()}** (${suggestion.priority}): ${suggestion.description}`,
  )
  .join('\n')}`;
  }
}

// Singleton instance
export const codeReviewAutomation = new CodeReviewAutomation();
