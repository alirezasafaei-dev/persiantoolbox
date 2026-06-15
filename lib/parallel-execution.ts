/**
 * Parallel Execution Engine - PersianToolbox
 *
 * Provides parallel execution capabilities for agent operations
 */

import { agentLogger } from '@/lib/agent-logger';
import { agentMonitoring } from '@/lib/agent-monitoring';

export interface ParallelConfig {
  maxConcurrency: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface TaskResult<T> {
  taskId: string;
  success: boolean;
  result?: T;
  error?: string;
  duration: number;
  attempts: number;
}

export interface BatchResult<T> {
  results: TaskResult<T>[];
  successful: number;
  failed: number;
  totalDuration: number;
}

export class ParallelExecution {
  private config: ParallelConfig;

  constructor(config: Partial<ParallelConfig> = {}) {
    this.config = {
      maxConcurrency: config.maxConcurrency ?? 5,
      timeout: config.timeout ?? 30000,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000,
    };
  }

  async execute<T>(
    taskId: string,
    operation: () => Promise<T>,
  ): Promise<TaskResult<T>> {
    const operationId = agentMonitoring.startOperation('parallel-execution', 'execute');
    const startTime = Date.now();
    let attempts = 0;

    try {
      agentLogger.info('parallel-execution', 'execute', `Starting task: ${taskId}`);

      while (attempts < this.config.retryAttempts) {
        attempts++;
        try {
          const result = await this.executeWithTimeout(operation);
          const duration = Date.now() - startTime;

          agentMonitoring.endOperation(operationId, true);
          agentLogger.info('parallel-execution', 'execute', `Task completed: ${taskId}`, {
            duration,
            attempts,
          });

          return {
            taskId,
            success: true,
            result,
            duration,
            attempts,
          };
        } catch (error) {
          if (attempts < this.config.retryAttempts) {
            agentLogger.warn('parallel-execution', 'execute', `Task retry ${attempts}/${this.config.retryAttempts}: ${taskId}`);
            await this.delay(this.config.retryDelay * attempts);
          }
        }
      }

      const duration = Date.now() - startTime;
      const errorMessage = `Task failed after ${attempts} attempts`;

      agentMonitoring.endOperation(operationId, false, errorMessage);
      agentLogger.error('parallel-execution', 'execute', `Task failed: ${taskId}`, { attempts });

      return {
        taskId,
        success: false,
        error: errorMessage,
        duration,
        attempts,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      agentMonitoring.endOperation(operationId, false, errorMessage);
      agentLogger.error('parallel-execution', 'execute', `Task error: ${taskId}`, { error: errorMessage });

      return {
        taskId,
        success: false,
        error: errorMessage,
        duration,
        attempts,
      };
    }
  }

  async executeBatch<T>(
    tasks: Array<{ id: string; operation: () => Promise<T> }>,
  ): Promise<BatchResult<T>> {
    const operationId = agentMonitoring.startOperation('parallel-execution', 'execute-batch');
    const startTime = Date.now();

    try {
      agentLogger.info('parallel-execution', 'execute-batch', `Executing batch of ${tasks.length} tasks`);

      const results: TaskResult<T>[] = [];
      const chunks = this.chunkArray(tasks, this.config.maxConcurrency);

      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map((task) => this.execute(task.id, task.operation)),
        );
        results.push(...chunkResults);
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      const totalDuration = Date.now() - startTime;

      agentMonitoring.endOperation(operationId, true);
      agentLogger.info('parallel-execution', 'execute-batch', 'Batch completed', {
        successful,
        failed,
        totalDuration,
      });

      return {
        results,
        successful,
        failed,
        totalDuration,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      agentMonitoring.endOperation(operationId, false, errorMessage);
      agentLogger.error('parallel-execution', 'execute-batch', `Batch failed: ${errorMessage}`);
      throw error;
    }
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), this.config.timeout),
      ),
    ]);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const parallelExecution = new ParallelExecution();
