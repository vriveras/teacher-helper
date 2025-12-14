/**
 * Task Queue for managing sync and async task execution
 */

import type { Task, TaskStatus, AgentRole, ExecutionMode } from '../types/agent.js';

export interface QueuedTask {
  task: Task;
  execute: () => Promise<void>;
  resolve: (value: void) => void;
  reject: (reason: unknown) => void;
}

export class TaskQueue {
  private syncQueue: QueuedTask[] = [];
  private asyncQueue: QueuedTask[] = [];
  private runningTasks: Map<string, QueuedTask> = new Map();
  private maxConcurrent: number;
  private isProcessing = false;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add a task to the appropriate queue
   */
  enqueue(
    task: Task,
    execute: () => Promise<void>,
    mode: ExecutionMode = 'async'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const queuedTask: QueuedTask = { task, execute, resolve, reject };

      if (mode === 'sync') {
        this.syncQueue.push(queuedTask);
      } else {
        this.asyncQueue.push(queuedTask);
      }

      this.processQueues();
    });
  }

  /**
   * Process both queues with proper prioritization
   */
  private async processQueues(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Process sync queue first (blocking)
      while (this.syncQueue.length > 0) {
        const queuedTask = this.syncQueue.shift()!;
        await this.executeTask(queuedTask);
      }

      // Process async queue with concurrency limit
      while (
        this.asyncQueue.length > 0 &&
        this.runningTasks.size < this.maxConcurrent
      ) {
        const queuedTask = this.asyncQueue.shift()!;
        this.executeTaskAsync(queuedTask);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute a task synchronously
   */
  private async executeTask(queuedTask: QueuedTask): Promise<void> {
    const { task, execute, resolve, reject } = queuedTask;
    this.runningTasks.set(task.id, queuedTask);

    try {
      await execute();
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      this.runningTasks.delete(task.id);
    }
  }

  /**
   * Execute a task asynchronously
   */
  private executeTaskAsync(queuedTask: QueuedTask): void {
    const { task, execute, resolve, reject } = queuedTask;
    this.runningTasks.set(task.id, queuedTask);

    execute()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        this.runningTasks.delete(task.id);
        this.processQueues();
      });
  }

  /**
   * Get current queue status
   */
  getStatus(): {
    syncPending: number;
    asyncPending: number;
    running: number;
  } {
    return {
      syncPending: this.syncQueue.length,
      asyncPending: this.asyncQueue.length,
      running: this.runningTasks.size,
    };
  }

  /**
   * Cancel a pending task
   */
  cancel(taskId: string): boolean {
    // Check sync queue
    const syncIndex = this.syncQueue.findIndex((qt) => qt.task.id === taskId);
    if (syncIndex !== -1) {
      const [removed] = this.syncQueue.splice(syncIndex, 1);
      removed.reject(new Error('Task cancelled'));
      return true;
    }

    // Check async queue
    const asyncIndex = this.asyncQueue.findIndex((qt) => qt.task.id === taskId);
    if (asyncIndex !== -1) {
      const [removed] = this.asyncQueue.splice(asyncIndex, 1);
      removed.reject(new Error('Task cancelled'));
      return true;
    }

    return false;
  }

  /**
   * Clear all pending tasks
   */
  clear(): void {
    this.syncQueue.forEach((qt) => qt.reject(new Error('Queue cleared')));
    this.asyncQueue.forEach((qt) => qt.reject(new Error('Queue cleared')));
    this.syncQueue = [];
    this.asyncQueue = [];
  }

  /**
   * Check if a task is currently running
   */
  isRunning(taskId: string): boolean {
    return this.runningTasks.has(taskId);
  }

  /**
   * Get all running task IDs
   */
  getRunningTaskIds(): string[] {
    return Array.from(this.runningTasks.keys());
  }
}

// Singleton instance
export const globalTaskQueue = new TaskQueue();
