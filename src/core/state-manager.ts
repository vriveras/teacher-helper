/**
 * State Manager for tracking tasks and agent states
 */

import type {
  Task,
  TaskStatus,
  AgentRole,
  AgentState,
  TaskResult,
  TaskPriority,
  ExecutionMode,
} from '../types/agent.js';

export class StateManager {
  private tasks: Map<string, Task> = new Map();
  private agentStates: Map<AgentRole, AgentState> = new Map();
  private taskResults: Map<string, TaskResult> = new Map();

  constructor() {
    // Initialize agent states
    const roles: AgentRole[] = ['pm', 'dev', 'qa', 'orchestrator'];
    roles.forEach((role) => {
      this.agentStates.set(role, {
        role,
        currentTasks: [],
        completedTasks: [],
        blockedTasks: [],
        isAvailable: true,
        lastActivity: new Date(),
      });
    });
  }

  // ============ Task Management ============

  createTask(params: {
    id: string;
    title: string;
    description: string;
    createdBy: AgentRole;
    priority?: TaskPriority;
    dependencies?: string[];
    parentTaskId?: string;
    executionMode?: ExecutionMode;
    metadata?: Record<string, unknown>;
  }): Task {
    const task: Task = {
      id: params.id,
      title: params.title,
      description: params.description,
      status: 'pending',
      priority: params.priority || 'medium',
      assignedTo: null,
      createdBy: params.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      dependencies: params.dependencies || [],
      subtasks: [],
      parentTaskId: params.parentTaskId || null,
      metadata: params.metadata || {},
      executionMode: params.executionMode || 'async',
    };

    this.tasks.set(task.id, task);
    return task;
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter((task) => task.status === status);
  }

  getTasksByAssignee(role: AgentRole): Task[] {
    return this.getAllTasks().filter((task) => task.assignedTo === role);
  }

  updateTaskStatus(taskId: string, status: TaskStatus): Task | undefined {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();

      // Update agent state
      if (task.assignedTo) {
        const agentState = this.agentStates.get(task.assignedTo);
        if (agentState) {
          if (status === 'completed') {
            agentState.currentTasks = agentState.currentTasks.filter(
              (id) => id !== taskId
            );
            agentState.completedTasks.push(taskId);
          } else if (status === 'blocked') {
            agentState.blockedTasks.push(taskId);
          }
        }
      }
    }
    return task;
  }

  assignTask(taskId: string, role: AgentRole): Task | undefined {
    const task = this.tasks.get(taskId);
    if (task) {
      // Remove from previous assignee
      if (task.assignedTo) {
        const prevState = this.agentStates.get(task.assignedTo);
        if (prevState) {
          prevState.currentTasks = prevState.currentTasks.filter(
            (id) => id !== taskId
          );
        }
      }

      // Assign to new agent
      task.assignedTo = role;
      task.status = 'pending';
      task.updatedAt = new Date();

      const agentState = this.agentStates.get(role);
      if (agentState) {
        agentState.currentTasks.push(taskId);
        agentState.lastActivity = new Date();
      }
    }
    return task;
  }

  addSubtask(parentTaskId: string, subtaskId: string): void {
    const parent = this.tasks.get(parentTaskId);
    if (parent && !parent.subtasks.includes(subtaskId)) {
      parent.subtasks.push(subtaskId);
      parent.updatedAt = new Date();
    }
  }

  // ============ Dependency Management ============

  canStartTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    // Check all dependencies are completed
    return task.dependencies.every((depId) => {
      const dep = this.tasks.get(depId);
      return dep && dep.status === 'completed';
    });
  }

  getBlockingTasks(taskId: string): Task[] {
    const task = this.tasks.get(taskId);
    if (!task) return [];

    return task.dependencies
      .map((depId) => this.tasks.get(depId))
      .filter((dep): dep is Task => dep !== undefined && dep.status !== 'completed');
  }

  getReadyTasks(): Task[] {
    return this.getAllTasks().filter(
      (task) =>
        task.status === 'pending' && this.canStartTask(task.id)
    );
  }

  // ============ Agent State Management ============

  getAgentState(role: AgentRole): AgentState | undefined {
    return this.agentStates.get(role);
  }

  getAllAgentStates(): AgentState[] {
    return Array.from(this.agentStates.values());
  }

  setAgentAvailability(role: AgentRole, isAvailable: boolean): void {
    const state = this.agentStates.get(role);
    if (state) {
      state.isAvailable = isAvailable;
      state.lastActivity = new Date();
    }
  }

  getAvailableAgents(): AgentRole[] {
    return Array.from(this.agentStates.entries())
      .filter(([_, state]) => state.isAvailable)
      .map(([role]) => role);
  }

  // ============ Task Results ============

  setTaskResult(result: TaskResult): void {
    this.taskResults.set(result.taskId, result);
  }

  getTaskResult(taskId: string): TaskResult | undefined {
    return this.taskResults.get(taskId);
  }

  // ============ Statistics ============

  getStatistics(): {
    totalTasks: number;
    byStatus: Record<TaskStatus, number>;
    byAgent: Record<AgentRole, number>;
    completionRate: number;
  } {
    const tasks = this.getAllTasks();
    const byStatus: Record<TaskStatus, number> = {
      pending: 0,
      in_progress: 0,
      blocked: 0,
      review: 0,
      completed: 0,
      failed: 0,
    };
    const byAgent: Record<AgentRole, number> = {
      pm: 0,
      dev: 0,
      qa: 0,
      orchestrator: 0,
    };

    tasks.forEach((task) => {
      byStatus[task.status]++;
      if (task.assignedTo) {
        byAgent[task.assignedTo]++;
      }
    });

    const completionRate =
      tasks.length > 0 ? byStatus.completed / tasks.length : 0;

    return {
      totalTasks: tasks.length,
      byStatus,
      byAgent,
      completionRate,
    };
  }

  // ============ Serialization ============

  toJSON(): string {
    return JSON.stringify({
      tasks: Array.from(this.tasks.entries()),
      agentStates: Array.from(this.agentStates.entries()),
      taskResults: Array.from(this.taskResults.entries()),
    });
  }

  fromJSON(json: string): void {
    const data = JSON.parse(json);
    this.tasks = new Map(data.tasks);
    this.agentStates = new Map(data.agentStates);
    this.taskResults = new Map(data.taskResults);
  }

  clear(): void {
    this.tasks.clear();
    this.taskResults.clear();
    // Reset agent states but keep them initialized
    this.agentStates.forEach((state) => {
      state.currentTasks = [];
      state.completedTasks = [];
      state.blockedTasks = [];
      state.isAvailable = true;
    });
  }
}

// Singleton instance
export const globalStateManager = new StateManager();
