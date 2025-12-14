/**
 * Core type definitions for the multi-role agent system
 */

export type AgentRole = 'pm' | 'dev' | 'qa' | 'orchestrator';

export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'review' | 'completed' | 'failed';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export type ExecutionMode = 'sync' | 'async';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: AgentRole | null;
  createdBy: AgentRole;
  createdAt: Date;
  updatedAt: Date;
  dependencies: string[];
  subtasks: string[];
  parentTaskId: string | null;
  metadata: Record<string, unknown>;
  executionMode: ExecutionMode;
}

export interface AgentMessage {
  id: string;
  from: AgentRole;
  to: AgentRole | 'broadcast';
  type: MessageType;
  payload: unknown;
  timestamp: Date;
  correlationId?: string;
}

export type MessageType =
  | 'task_assignment'
  | 'task_update'
  | 'task_complete'
  | 'task_blocked'
  | 'review_request'
  | 'review_result'
  | 'query'
  | 'response'
  | 'status_update'
  | 'sync_request'
  | 'sync_response';

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface AgentConfig {
  role: AgentRole;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  canAssignTo: AgentRole[];
  canReceiveFrom: AgentRole[];
}

export interface AgentState {
  role: AgentRole;
  currentTasks: string[];
  completedTasks: string[];
  blockedTasks: string[];
  isAvailable: boolean;
  lastActivity: Date;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  output: unknown;
  errors?: string[];
  warnings?: string[];
  duration: number;
  nextSteps?: string[];
}

export interface WorkflowStage {
  name: string;
  owner: AgentRole;
  requiredInputs: string[];
  outputs: string[];
  validNextStages: string[];
}

export interface Workflow {
  id: string;
  name: string;
  stages: WorkflowStage[];
  currentStage: string;
  tasks: string[];
  status: TaskStatus;
}

// Event system for async communication
export interface AgentEvent {
  type: string;
  source: AgentRole;
  data: unknown;
  timestamp: Date;
}

export type EventHandler = (event: AgentEvent) => void | Promise<void>;

export interface EventSubscription {
  eventType: string;
  handler: EventHandler;
  unsubscribe: () => void;
}
