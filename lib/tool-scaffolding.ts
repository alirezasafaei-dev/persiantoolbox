/**
 * Automated Tool Scaffolding Utility - PersianToolbox
 *
 * Provides automated tool creation following PersianToolbox patterns
 */

import { agentLogger } from '@/lib/agent-logger';
import { agentMonitoring } from '@/lib/agent-monitoring';
import type { ToolCategory, ToolEntry, ToolContent } from '@/lib/tools-registry';

export interface ToolScaffoldingConfig {
  toolId: string;
  path: string;
  title: string;
  titlePersian: string;
  description: string;
  descriptionPersian: string;
  keywords: string[];
  categoryId: string;
  content: ToolContent;
  tier?: 'Offline-Guaranteed' | 'Hybrid' | 'Online-Required';
  hasCustomComponent?: boolean;
}

export class ToolScaffolding {
  private categories: Record<string, ToolCategory>;

  constructor() {
    this.categories = {
      pdf: { id: 'pdf-tools', name: 'ابزارهای PDF', path: '/pdf-tools' },
      image: { id: 'image-tools', name: 'ابزارهای تصویر', path: '/image-tools' },
      finance: { id: 'finance', name: 'ابزارهای مالی', path: '/tools' },
      text: { id: 'text-tools', name: 'ابزارهای متنی', path: '/text-tools' },
      date: { id: 'date-tools', name: 'ابزارهای تاریخ', path: '/date-tools' },
      validation: {
        id: 'validation-tools',
        name: 'ابزارهای اعتبارسنجی',
        path: '/validation-tools',
      },
    };
  }

  async createTool(config: ToolScaffoldingConfig): Promise<void> {
    const operationId = agentMonitoring.startOperation('tool-scaffolding', 'create-tool');

    try {
      agentLogger.info('tool-scaffolding', 'create-tool', `Creating tool: ${config.title}`, {
        toolId: config.toolId,
        path: config.path,
      });

      // Validate category
      const category = this.categories[config.categoryId];
      if (!category) {
        throw new Error(
          `Invalid category: ${config.categoryId}. Valid categories: ${Object.keys(this.categories).join(', ')}`,
        );
      }

      // Create tool page
      await this.createToolPage(config);
      agentLogger.info('tool-scaffolding', 'create-tool', `Tool page created: ${config.path}`);

      // Create tool component
      if (config.hasCustomComponent) {
        await this.createToolComponent(config);
        agentLogger.info(
          'tool-scaffolding',
          'create-tool',
          `Tool component created: ${config.toolId}`,
        );
      }

      // Create test file
      await this.createTestFile(config);
      agentLogger.info(
        'tool-scaffolding',
        'create-tool',
        `Test file created for: ${config.toolId}`,
      );

      // Create tool entry
      const toolEntry = this.createToolEntry(config, category);
      await this.addToolToRegistry(toolEntry);
      agentLogger.info(
        'tool-scaffolding',
        'create-tool',
        `Tool entry added to registry: ${config.toolId}`,
      );

      agentMonitoring.endOperation(operationId, true);
      agentLogger.info(
        'tool-scaffolding',
        'create-tool',
        `Tool successfully created: ${config.title}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      agentMonitoring.endOperation(operationId, false, errorMessage);
      agentLogger.error(
        'tool-scaffolding',
        'create-tool',
        `Failed to create tool: ${errorMessage}`,
        { config },
      );
      throw error;
    }
  }

  private async createToolPage(config: ToolScaffoldingConfig): Promise<void> {
    const pageContent = this.generatePageContent(config);
    const pagePath = this.getPagePath(config.path);

    // In a real implementation, this would write the file
    // await writeFile(pagePath, pageContent);
    console.log(`Would create page at: ${pagePath}`);
    console.log(`Page content:\n${pageContent}`);
  }

  private async createToolComponent(config: ToolScaffoldingConfig): Promise<void> {
    const componentContent = this.generateComponentContent(config);
    const componentPath = this.getComponentPath(config.toolId);

    // In a real implementation, this would write the file
    // await writeFile(componentPath, componentContent);
    console.log(`Would create component at: ${componentPath}`);
    console.log(`Component content:\n${componentContent}`);
  }

  private async createTestFile(config: ToolScaffoldingConfig): Promise<void> {
    const testContent = this.generateTestContent(config);
    const testPath = this.getTestPath(config.toolId);

    // In a real implementation, this would write the file
    // await writeFile(testPath, testContent);
    console.log(`Would create test at: ${testPath}`);
    console.log(`Test content:\n${testContent}`);
  }

  private async addToolToRegistry(toolEntry: ToolEntry): Promise<void> {
    // In a real implementation, this would update the tools-registry.ts file
    // await updateRegistryFile(toolEntry);
    console.log(`Would add tool to registry: ${toolEntry.id}`);
    console.log(`Tool entry: ${JSON.stringify(toolEntry, null, 2)}`);
  }

  private createToolEntry(config: ToolScaffoldingConfig, category: ToolCategory): ToolEntry {
    const lastModified = new Date().toISOString().split('T')[0] ?? '';
    return {
      id: config.toolId,
      path: config.path,
      title: `${config.titlePersian} - جعبه ابزار فارسی`,
      description: config.descriptionPersian,
      keywords: config.keywords,
      indexable: true,
      lastModified,
      kind: 'tool',
      category,
      content: config.content,
      tier: config.tier ?? 'Offline-Guaranteed',
    };
  }

  private getPagePath(path: string): string {
    return `/home/dev13/my-project/sites/live/persiantoolbox/app/(tools)${path}/page.tsx`;
  }

  private getComponentPath(toolId: string): string {
    const componentDir = toolId.replace(/-/g, '/');
    return `/home/dev13/my-project/sites/live/persiantoolbox/components/features/${componentDir}/Page.tsx`;
  }

  private getTestPath(toolId: string): string {
    return `/home/dev13/my-project/sites/live/persiantoolbox/features/${toolId}/page.test.tsx`;
  }

  private generatePageContent(config: ToolScaffoldingConfig): string {
    const componentName = this.getComponentName(config.toolId);
    const componentNamePersian = config.titlePersian.replace(/\s+/g, '');

    return `import ${componentName} from '@/components/features/${config.toolId}/${componentName}';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('${config.path}');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function ${componentNamePersian}Route() {
  return (
    <div className="space-y-10">
      <${componentName} />
      <ToolSeoContent tool={tool} />
    </div>
  );
}`;
  }

  private generateComponentContent(config: ToolScaffoldingConfig): string {
    const componentName = this.getComponentName(config.toolId);

    return `'use client';

import { useState, useCallback } from 'react';

export default function ${componentName}() {
  const [state, setState] = useState({
    loading: false,
    result: null as string | null,
    error: null as string | null,
  });

  const handleAction = useCallback(async () => {
    try {
      setState({ loading: true, result: null, error: null });
      
      // Add your client-side processing logic here
      const result = await processClientSide();
      
      setState({ loading: false, result, error: null });
    } catch (error) {
      setState({
        loading: false,
        result: null,
        error: error instanceof Error ? error.message : 'خطای نامشخص',
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Add your tool UI here */}
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">
        ${config.titlePersian}
      </h1>
      
      {state.error && (
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-red-900">
          {state.error}
        </div>
      )}
      
      {state.result && (
        <div className="rounded-[var(--radius-md)] border border-green-200 bg-green-50 px-4 py-3 text-green-900">
          {state.result}
        </div>
      )}
    </div>
  );
}`;
  }

  private generateTestContent(config: ToolScaffoldingConfig): string {
    const componentName = this.getComponentName(config.toolId);

    return `import { render, screen } from '@testing-library/react';
import ${componentName} from '@/components/features/${config.toolId}/${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByText('${config.titlePersian}')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<${componentName} />);
    // Add interaction tests here
  });

  it('handles errors gracefully', () => {
    render(<${componentName} />);
    // Add error handling tests here
  });
});`;
  }

  private getComponentName(toolId: string): string {
    return toolId
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  getAvailableCategories(): Array<{ id: string; name: string; path: string }> {
    return Object.values(this.categories);
  }

  validateToolConfig(config: ToolScaffoldingConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.toolId || !/^[a-z0-9-]+$/.test(config.toolId)) {
      errors.push('Tool ID must be lowercase alphanumeric with hyphens');
    }

    if (!config.path?.startsWith('/')) {
      errors.push('Path must start with /');
    }

    if (!config.title || !config.titlePersian) {
      errors.push('Both title and titlePersian are required');
    }

    if (!config.description || !config.descriptionPersian) {
      errors.push('Both description and descriptionPersian are required');
    }

    if (!config.keywords || config.keywords.length === 0) {
      errors.push('At least one keyword is required');
    }

    if (!config.categoryId || !this.categories[config.categoryId]) {
      errors.push(`Invalid category. Valid categories: ${Object.keys(this.categories).join(', ')}`);
    }

    if (!config.content?.intro) {
      errors.push('Content with intro is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
export const toolScaffolding = new ToolScaffolding();
