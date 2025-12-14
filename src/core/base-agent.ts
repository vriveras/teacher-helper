/**
 * Base Agent class that all role-specific agents extend
 */

import type {
  AgentRole,
  AgentConfig,
  AgentState,
  AgentMessage,
  AgentEvent,
  Task,
  TaskResult,
  ExecutionMode,
  MessageType,
} from '../types/agent.js';
import { EventBus, globalEventBus } from './event-bus.js';
import { StateManager, globalStateManager } from './state-manager.js';
import { TaskQueue, globalTaskQueue } from './task-queue.js';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected eventBus: EventBus;
  protected stateManager: StateManager;
  protected taskQueue: TaskQueue;

  constructor(
    config: AgentConfig,
    eventBus: EventBus = globalEventBus,
    stateManager: StateManager = globalStateManager,
    taskQueue: TaskQueue = globalTaskQueue
  ) {
    this.config = config;
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.taskQueue = taskQueue;

    // Subscribe to messages directed to this agent
    this.setupMessageHandlers();
  }

  // ============ Abstract Methods (must be implemented by subclasses) ============

  /**
   * Process a task assigned to this agent
   */
  abstract processTask(task: Task): Promise<TaskResult>;

  /**
   * Handle a message from another agent
   */
  abstract handleMessage(message: AgentMessage): Promise<void>;

  /**
   * Get the agent's current capabilities based on state
   */
  abstract getAvailableActions(): string[];

  // ============ Core Agent Methods ============

  get role(): AgentRole {
    return this.config.role;
  }

  get name(): string {
    return this.config.name;
  }

  getState(): AgentState | undefined {
    return this.stateManager.getAgentState(this.role);
  }

  isAvailable(): boolean {
    return this.getState()?.isAvailable ?? false;
  }

  // ============ Task Execution ============

  /**
   * Execute a task (sync or async based on task configuration)
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const mode = task.executionMode;

    // Check dependencies
    if (!this.stateManager.canStartTask(task.id)) {
      const blocking = this.stateManager.getBlockingTasks(task.id);
      return {
        taskId: task.id,
        success: false,
        output: null,
        errors: [`Task blocked by: ${blocking.map((t) => t.id).join(', ')}`],
        duration: 0,
      };
    }

    // Update task status
    this.stateManager.updateTaskStatus(task.id, 'in_progress');
    this.stateManager.setAgentAvailability(this.role, false);

    const startTime = Date.now();

    try {
      // Queue and execute the task
      await this.taskQueue.enqueue(
        task,
        async () => {
          const result = await this.processTask(task);
          this.stateManager.setTaskResult(result);
        },
        mode
      );

      const result = this.stateManager.getTaskResult(task.id);
      if (result) {
        // Update task status based on result
        this.stateManager.updateTaskStatus(
          task.id,
          result.success ? 'completed' : 'failed'
        );

        // Emit completion event
        this.emitEvent('task_completed', {
          taskId: task.id,
          result,
        });

        return result;
      }

      throw new Error('Task result not found');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.stateManager.updateTaskStatus(task.id, 'failed');

      const failResult: TaskResult = {
        taskId: task.id,
        success: false,
        output: null,
        errors: [errorMessage],
        duration: Date.now() - startTime,
      };

      this.stateManager.setTaskResult(failResult);
      this.emitEvent('task_failed', { taskId: task.id, error: errorMessage });

      return failResult;
    } finally {
      this.stateManager.setAgentAvailability(this.role, true);
    }
  }

  // ============ Communication ============

  /**
   * Send a message to another agent
   */
  sendMessage(
    to: AgentRole | 'broadcast',
    type: MessageType,
    payload: unknown,
    correlationId?: string
  ): AgentMessage {
    const message: AgentMessage = {
      id: this.generateId(),
      from: this.role,
      to,
      type,
      payload,
      timestamp: new Date(),
      correlationId,
    };

    this.emitEvent('message_sent', message);

    if (to === 'broadcast') {
      this.eventBus.publish({
        type: 'broadcast_message',
        source: this.role,
        data: message,
        timestamp: new Date(),
      });
    } else {
      this.eventBus.publish({
        type: `message_to_${to}`,
        source: this.role,
        data: message,
        timestamp: new Date(),
      });
    }

    return message;
  }

  /**
   * Request a synchronous response from another agent
   */
  async sendSyncRequest(
    to: AgentRole,
    payload: unknown,
    timeout = 30000
  ): Promise<unknown> {
    const correlationId = this.generateId();

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error(`Sync request to ${to} timed out`));
      }, timeout);

      const subscription = this.eventBus.subscribe(
        `sync_response_${correlationId}`,
        (event) => {
          clearTimeout(timeoutId);
          subscription.unsubscribe();
          resolve(event.data);
        }
      );

      this.sendMessage(to, 'sync_request', payload, correlationId);
    });
  }

  /**
   * Respond to a sync request
   */
  respondToSyncRequest(correlationId: string, response: unknown): void {
    this.eventBus.publish({
      type: `sync_response_${correlationId}`,
      source: this.role,
      data: response,
      timestamp: new Date(),
    });
  }

  // ============ Event Handling ============

  protected setupMessageHandlers(): void {
    // Listen for direct messages
    this.eventBus.subscribe(`message_to_${this.role}`, async (event) => {
      const message = event.data as AgentMessage;
      await this.handleMessage(message);
    });

    // Listen for broadcast messages
    this.eventBus.subscribe('broadcast_message', async (event) => {
      if (event.source !== this.role) {
        const message = event.data as AgentMessage;
        await this.handleMessage(message);
      }
    });
  }

  protected emitEvent(type: string, data: unknown): void {
    this.eventBus.publish({
      type: `${this.role}_${type}`,
      source: this.role,
      data,
      timestamp: new Date(),
    });
  }

  // ============ Task Creation Helpers ============

  protected createTask(params: {
    title: string;
    description: string;
    priority?: Task['priority'];
    dependencies?: string[];
    parentTaskId?: string;
    executionMode?: ExecutionMode;
    metadata?: Record<string, unknown>;
  }): Task {
    return this.stateManager.createTask({
      id: this.generateId(),
      ...params,
      createdBy: this.role,
    });
  }

  protected createSubtask(
    parentTaskId: string,
    params: Omit<Parameters<typeof this.createTask>[0], 'parentTaskId'>
  ): Task {
    const subtask = this.createTask({
      ...params,
      parentTaskId,
    });
    this.stateManager.addSubtask(parentTaskId, subtask.id);
    return subtask;
  }

  // ============ Utility Methods ============

  protected generateId(): string {
    return `${this.role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected log(message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.role.toUpperCase()}] ${message}`, data || '');
  }
}
