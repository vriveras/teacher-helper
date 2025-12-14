/**
 * Orchestrator Agent
 *
 * Responsibilities:
 * - Coordinate all agents (PM, Dev, QA)
 * - Manage workflow execution
 * - Handle task routing and assignment
 * - Monitor overall progress
 * - Resolve conflicts and blockers
 * - Manage sync/async execution modes
 */

import { BaseAgent } from '../core/base-agent.js';
import { globalEventBus } from '../core/event-bus.js';
import type {
  AgentConfig,
  AgentMessage,
  AgentRole,
  Task,
  TaskResult,
  Workflow,
  WorkflowStage,
  ExecutionMode,
  TaskStatus,
} from '../types/agent.js';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
  defaultMode: ExecutionMode;
}

export interface AgentAssignment {
  agentRole: AgentRole;
  taskId: string;
  assignedAt: Date;
  deadline?: Date;
}

export interface OrchestratorEvent {
  type: 'task_started' | 'task_completed' | 'task_failed' | 'workflow_started' | 'workflow_completed' | 'blocker_detected';
  timestamp: Date;
  data: unknown;
}

const ORCHESTRATOR_CONFIG: AgentConfig = {
  role: 'orchestrator',
  name: 'Orchestrator Agent',
  description: 'Coordinates all agents and manages workflow execution',
  capabilities: [
    {
      name: 'start_workflow',
      description: 'Start a new workflow with all stages',
    },
    {
      name: 'assign_task',
      description: 'Assign a task to the appropriate agent',
    },
    {
      name: 'monitor_progress',
      description: 'Monitor overall progress and status',
    },
    {
      name: 'resolve_blocker',
      description: 'Help resolve blocked tasks',
    },
    {
      name: 'coordinate_handoff',
      description: 'Coordinate task handoffs between agents',
    },
  ],
  canAssignTo: ['pm', 'dev', 'qa'],
  canReceiveFrom: ['pm', 'dev', 'qa'],
};

// Predefined workflow templates
const WORKFLOW_TEMPLATES: WorkflowDefinition[] = [
  {
    id: 'feature_development',
    name: 'Feature Development',
    description: 'Standard feature development workflow',
    defaultMode: 'async',
    stages: [
      {
        name: 'requirements',
        owner: 'pm',
        requiredInputs: ['feature_request'],
        outputs: ['user_stories', 'requirements'],
        validNextStages: ['design'],
      },
      {
        name: 'design',
        owner: 'dev',
        requiredInputs: ['requirements'],
        outputs: ['technical_design'],
        validNextStages: ['implementation'],
      },
      {
        name: 'implementation',
        owner: 'dev',
        requiredInputs: ['technical_design'],
        outputs: ['code_changes'],
        validNextStages: ['testing'],
      },
      {
        name: 'testing',
        owner: 'qa',
        requiredInputs: ['code_changes'],
        outputs: ['test_results'],
        validNextStages: ['review', 'implementation'],
      },
      {
        name: 'review',
        owner: 'pm',
        requiredInputs: ['test_results'],
        outputs: ['approval'],
        validNextStages: ['complete'],
      },
    ],
  },
  {
    id: 'bug_fix',
    name: 'Bug Fix',
    description: 'Bug fix workflow',
    defaultMode: 'sync',
    stages: [
      {
        name: 'triage',
        owner: 'pm',
        requiredInputs: ['bug_report'],
        outputs: ['prioritized_bug'],
        validNextStages: ['fix'],
      },
      {
        name: 'fix',
        owner: 'dev',
        requiredInputs: ['prioritized_bug'],
        outputs: ['fix_changes'],
        validNextStages: ['verify'],
      },
      {
        name: 'verify',
        owner: 'qa',
        requiredInputs: ['fix_changes'],
        outputs: ['verification_result'],
        validNextStages: ['complete', 'fix'],
      },
    ],
  },
];

export class Orchestrator extends BaseAgent {
  private workflows: Map<string, Workflow> = new Map();
  private workflowDefinitions: Map<string, WorkflowDefinition> = new Map();
  private assignments: Map<string, AgentAssignment> = new Map();
  private eventHistory: OrchestratorEvent[] = [];

  constructor() {
    super(ORCHESTRATOR_CONFIG);

    // Load workflow templates
    WORKFLOW_TEMPLATES.forEach((def) => {
      this.workflowDefinitions.set(def.id, def);
    });

    // Subscribe to all agent events
    this.subscribeToAgentEvents();

    this.log('Orchestrator initialized');
  }

  // ============ Abstract Method Implementations ============

  async processTask(task: Task): Promise<TaskResult> {
    this.log(`Processing task: ${task.title}`, { taskId: task.id });
    const startTime = Date.now();

    try {
      let output: unknown;
      const action = task.metadata.action as string;

      switch (action) {
        case 'start_workflow':
          output = await this.startWorkflow(task);
          break;
        case 'assign_task':
          output = await this.assignTaskToAgent(task);
          break;
        case 'monitor_progress':
          output = await this.getProgressReport(task);
          break;
        case 'resolve_blocker':
          output = await this.resolveBlocker(task);
          break;
        case 'coordinate_handoff':
          output = await this.coordinateHandoff(task);
          break;
        case 'process_feature':
          output = await this.processFeatureRequest(task);
          break;
        default:
          output = await this.handleGenericTask(task);
      }

      return {
        taskId: task.id,
        success: true,
        output,
        duration: Date.now() - startTime,
        nextSteps: this.determineNextSteps(task, output),
      };
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        output: null,
        errors: [error instanceof Error ? error.message : String(error)],
        duration: Date.now() - startTime,
      };
    }
  }

  async handleMessage(message: AgentMessage): Promise<void> {
    this.log(`Received message from ${message.from}`, { type: message.type });

    switch (message.type) {
      case 'task_complete':
        await this.handleTaskCompletion(message);
        break;
      case 'task_blocked':
        await this.handleBlockedTask(message);
        break;
      case 'status_update':
        await this.handleStatusUpdate(message);
        break;
      case 'review_request':
        await this.handleReviewRequest(message);
        break;
      case 'query':
        await this.handleQuery(message);
        break;
      case 'sync_request':
        await this.handleSyncRequest(message);
        break;
      default:
        this.log(`Unhandled message type: ${message.type}`);
    }
  }

  getAvailableActions(): string[] {
    return [
      'start_workflow',
      'assign_task',
      'monitor_progress',
      'resolve_blocker',
      'coordinate_handoff',
      'process_feature',
    ];
  }

  // ============ Workflow Management ============

  private async startWorkflow(task: Task): Promise<Workflow> {
    const workflowType = (task.metadata.workflowType as string) || 'feature_development';
    const definition = this.workflowDefinitions.get(workflowType);

    if (!definition) {
      throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    const workflow: Workflow = {
      id: this.generateId(),
      name: `${definition.name}: ${task.title}`,
      stages: definition.stages,
      currentStage: definition.stages[0].name,
      tasks: [task.id],
      status: 'in_progress',
    };

    this.workflows.set(workflow.id, workflow);
    this.recordEvent('workflow_started', { workflowId: workflow.id, type: workflowType });

    this.log('Workflow started', { workflowId: workflow.id, type: workflowType });

    // Start the first stage
    await this.executeWorkflowStage(workflow, definition.stages[0], task);

    return workflow;
  }

  private async executeWorkflowStage(
    workflow: Workflow,
    stage: WorkflowStage,
    task: Task
  ): Promise<void> {
    this.log('Executing workflow stage', {
      workflowId: workflow.id,
      stage: stage.name,
      owner: stage.owner,
    });

    // Create stage task
    const stageTask = this.createTask({
      title: `${stage.name}: ${task.title}`,
      description: `Workflow stage: ${stage.name}\n\nOriginal task: ${task.description}`,
      priority: task.priority,
      executionMode: task.executionMode,
      metadata: {
        workflowId: workflow.id,
        stage: stage.name,
        originalTaskId: task.id,
        action: this.getStageAction(stage),
      },
    });

    // Assign to stage owner
    this.stateManager.assignTask(stageTask.id, stage.owner);
    workflow.tasks.push(stageTask.id);

    // Send assignment
    this.sendMessage(stage.owner, 'task_assignment', {
      task: stageTask,
      workflowContext: {
        workflowId: workflow.id,
        stage: stage.name,
      },
    });
  }

  private async advanceWorkflow(workflowId: string, completedStage: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    const currentStageIndex = workflow.stages.findIndex((s) => s.name === completedStage);
    const currentStage = workflow.stages[currentStageIndex];

    if (!currentStage) return;

    // Check if there are valid next stages
    if (
      currentStage.validNextStages.length === 0 ||
      currentStage.validNextStages.includes('complete')
    ) {
      // Workflow complete
      workflow.status = 'completed';
      workflow.currentStage = 'complete';
      this.recordEvent('workflow_completed', { workflowId });
      this.log('Workflow completed', { workflowId });

      // Notify PM
      this.sendMessage('pm', 'status_update', {
        type: 'workflow_completed',
        workflowId,
      });
      return;
    }

    // Move to next stage
    const nextStageName = currentStage.validNextStages[0];
    const nextStage = workflow.stages.find((s) => s.name === nextStageName);

    if (nextStage) {
      workflow.currentStage = nextStageName;

      // Get original task
      const originalTaskId = workflow.tasks[0];
      const originalTask = this.stateManager.getTask(originalTaskId);

      if (originalTask) {
        await this.executeWorkflowStage(workflow, nextStage, originalTask);
      }
    }
  }

  private getStageAction(stage: WorkflowStage): string {
    const actionMap: Record<string, string> = {
      requirements: 'analyze_requirements',
      design: 'create_design',
      implementation: 'implement_feature',
      testing: 'test_implementation',
      review: 'review_progress',
      triage: 'prioritize_backlog',
      fix: 'fix_bug',
      verify: 'verify_fix',
    };

    return actionMap[stage.name] || 'process_task';
  }

  // ============ Task Assignment ============

  private async assignTaskToAgent(task: Task): Promise<AgentAssignment> {
    const targetRole = (task.metadata.assignTo as AgentRole) || this.determineAgent(task);

    const assignment: AgentAssignment = {
      agentRole: targetRole,
      taskId: task.id,
      assignedAt: new Date(),
      deadline: task.metadata.deadline as Date | undefined,
    };

    this.assignments.set(task.id, assignment);
    this.stateManager.assignTask(task.id, targetRole);

    this.log('Task assigned', {
      taskId: task.id,
      to: targetRole,
    });

    // Send assignment message
    this.sendMessage(targetRole, 'task_assignment', { task });

    return assignment;
  }

  private determineAgent(task: Task): AgentRole {
    const taskType = task.metadata.type as string;

    // Route based on task type
    switch (taskType) {
      case 'requirement':
      case 'planning':
      case 'prioritization':
        return 'pm';
      case 'implementation':
      case 'design':
      case 'bugfix':
        return 'dev';
      case 'testing':
      case 'verification':
      case 'qa':
        return 'qa';
      default:
        // Default routing based on keywords
        const title = task.title.toLowerCase();
        if (title.includes('test') || title.includes('verify') || title.includes('qa')) {
          return 'qa';
        }
        if (title.includes('implement') || title.includes('fix') || title.includes('code')) {
          return 'dev';
        }
        return 'pm';
    }
  }

  // ============ Coordination Methods ============

  private async processFeatureRequest(task: Task): Promise<object> {
    this.log('Processing feature request', { taskId: task.id });

    // Create a workflow for the feature
    const workflowTask = this.createTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      executionMode: task.executionMode,
      metadata: {
        ...task.metadata,
        action: 'start_workflow',
        workflowType: 'feature_development',
      },
    });

    return this.startWorkflow(workflowTask);
  }

  private async getProgressReport(task: Task): Promise<object> {
    const stats = this.stateManager.getStatistics();
    const activeWorkflows = Array.from(this.workflows.values()).filter(
      (w) => w.status === 'in_progress'
    );

    const agentStates = this.stateManager.getAllAgentStates();

    return {
      statistics: stats,
      workflows: {
        active: activeWorkflows.length,
        completed: Array.from(this.workflows.values()).filter(
          (w) => w.status === 'completed'
        ).length,
        details: activeWorkflows.map((w) => ({
          id: w.id,
          name: w.name,
          currentStage: w.currentStage,
          taskCount: w.tasks.length,
        })),
      },
      agents: agentStates.map((state) => ({
        role: state.role,
        available: state.isAvailable,
        currentTasks: state.currentTasks.length,
        completedTasks: state.completedTasks.length,
        blockedTasks: state.blockedTasks.length,
      })),
      recentEvents: this.eventHistory.slice(-10),
    };
  }

  private async resolveBlocker(task: Task): Promise<object> {
    const blockedTaskId = task.metadata.blockedTaskId as string;
    const blockedTask = this.stateManager.getTask(blockedTaskId);

    if (!blockedTask) {
      return { resolved: false, reason: 'Task not found' };
    }

    const blockingTasks = this.stateManager.getBlockingTasks(blockedTaskId);

    this.log('Resolving blocker', {
      blockedTaskId,
      blockingCount: blockingTasks.length,
    });

    // Try to unblock by prioritizing blocking tasks
    for (const blocking of blockingTasks) {
      if (blocking.status === 'pending') {
        // Prioritize and assign the blocking task
        blocking.priority = 'high';
        this.stateManager.assignTask(blocking.id, blocking.assignedTo || this.determineAgent(blocking));

        this.sendMessage(blocking.assignedTo || 'pm', 'task_assignment', {
          task: blocking,
          priority: 'urgent',
          reason: `Blocking task ${blockedTaskId}`,
        });
      }
    }

    return {
      resolved: true,
      blockedTaskId,
      actionseTaken: `Prioritized ${blockingTasks.length} blocking tasks`,
    };
  }

  private async coordinateHandoff(task: Task): Promise<object> {
    const fromAgent = task.metadata.from as AgentRole;
    const toAgent = task.metadata.to as AgentRole;
    const handoffTaskId = task.metadata.taskId as string;

    const handoffTask = this.stateManager.getTask(handoffTaskId);
    if (!handoffTask) {
      return { success: false, reason: 'Task not found' };
    }

    this.log('Coordinating handoff', { from: fromAgent, to: toAgent, taskId: handoffTaskId });

    // Update assignment
    this.stateManager.assignTask(handoffTaskId, toAgent);

    // Notify both agents
    this.sendMessage(fromAgent, 'status_update', {
      type: 'handoff_complete',
      taskId: handoffTaskId,
      handedTo: toAgent,
    });

    this.sendMessage(toAgent, 'task_assignment', {
      task: handoffTask,
      handoffFrom: fromAgent,
    });

    return {
      success: true,
      taskId: handoffTaskId,
      from: fromAgent,
      to: toAgent,
    };
  }

  private async handleGenericTask(task: Task): Promise<object> {
    // Route to appropriate agent
    const agent = this.determineAgent(task);
    const assignment = await this.assignTaskToAgent({
      ...task,
      metadata: { ...task.metadata, assignTo: agent },
    });

    return {
      processed: true,
      assignedTo: assignment.agentRole,
      taskId: task.id,
    };
  }

  // ============ Message Handlers ============

  private async handleTaskCompletion(message: AgentMessage): Promise<void> {
    const { taskId, result } = message.payload as {
      taskId: string;
      result: TaskResult;
    };

    this.log('Task completed', { taskId, from: message.from });
    this.recordEvent('task_completed', { taskId, agent: message.from, result });

    // Check if task is part of a workflow
    const task = this.stateManager.getTask(taskId);
    if (task?.metadata.workflowId) {
      await this.advanceWorkflow(
        task.metadata.workflowId as string,
        task.metadata.stage as string
      );
    }

    // Process any dependent tasks
    const readyTasks = this.stateManager.getReadyTasks();
    for (const readyTask of readyTasks) {
      if (readyTask.assignedTo && readyTask.status === 'pending') {
        this.sendMessage(readyTask.assignedTo, 'status_update', {
          type: 'dependency_resolved',
          taskId: readyTask.id,
        });
      }
    }
  }

  private async handleBlockedTask(message: AgentMessage): Promise<void> {
    const { taskId, reason } = message.payload as {
      taskId: string;
      reason: string;
    };

    this.log('Task blocked', { taskId, reason, from: message.from });
    this.recordEvent('blocker_detected', { taskId, reason, agent: message.from });

    // Create resolution task
    const resolveTask = this.createTask({
      title: `Resolve blocker for ${taskId}`,
      description: `Reason: ${reason}`,
      priority: 'high',
      metadata: {
        action: 'resolve_blocker',
        blockedTaskId: taskId,
        reportedBy: message.from,
      },
    });

    // Process immediately
    await this.executeTask(resolveTask);
  }

  private async handleStatusUpdate(message: AgentMessage): Promise<void> {
    const update = message.payload as { type: string; [key: string]: unknown };

    this.log('Status update', { type: update.type, from: message.from });

    switch (update.type) {
      case 'sprint_created':
        this.recordEvent('workflow_started', { type: 'sprint', data: update });
        break;
      case 'story_completed':
        this.recordEvent('task_completed', { type: 'story', data: update });
        break;
      case 'regression_detected':
        // Handle regression - might need to halt deployments
        this.sendMessage('broadcast', 'status_update', {
          type: 'regression_alert',
          ...update,
        });
        break;
    }
  }

  private async handleReviewRequest(message: AgentMessage): Promise<void> {
    const { type, taskId, codeChangeId } = message.payload as {
      type: string;
      taskId: string;
      codeChangeId?: string;
    };

    this.log('Review request', { type, taskId, from: message.from });

    // Route review to appropriate agent
    if (type === 'code') {
      this.sendMessage('qa', 'review_request', {
        type: 'code_review',
        taskId,
        codeChangeId,
      });
    } else if (type === 'design') {
      this.sendMessage('pm', 'review_request', {
        type: 'design_review',
        taskId,
      });
    }
  }

  private async handleQuery(message: AgentMessage): Promise<void> {
    const query = message.payload as { type: string; data?: unknown };
    let response: unknown;

    switch (query.type) {
      case 'get_workflow':
        response = this.workflows.get(query.data as string);
        break;
      case 'get_active_workflows':
        response = Array.from(this.workflows.values()).filter(
          (w) => w.status === 'in_progress'
        );
        break;
      case 'get_agent_status':
        response = this.stateManager.getAgentState(query.data as AgentRole);
        break;
      case 'get_progress':
        response = await this.getProgressReport({} as Task);
        break;
      default:
        response = { error: 'Unknown query type' };
    }

    this.sendMessage(message.from, 'response', response, message.correlationId);
  }

  private async handleSyncRequest(message: AgentMessage): Promise<void> {
    const request = message.payload as { action: string; data?: unknown };
    let response: unknown;

    switch (request.action) {
      case 'route_task':
        response = this.determineAgent(request.data as Task);
        break;
      case 'get_available_agents':
        response = this.stateManager.getAvailableAgents();
        break;
      case 'get_workflow_status':
        const workflow = this.workflows.get(request.data as string);
        response = workflow
          ? { status: workflow.status, stage: workflow.currentStage }
          : null;
        break;
      default:
        response = { error: 'Unknown sync action' };
    }

    this.respondToSyncRequest(message.correlationId!, response);
  }

  // ============ Event Subscription ============

  private subscribeToAgentEvents(): void {
    // Subscribe to all agent events for monitoring
    const roles: AgentRole[] = ['pm', 'dev', 'qa'];

    for (const role of roles) {
      this.eventBus.subscribeToAgent(role, (event) => {
        this.log(`Agent event from ${role}`, { type: event.type });
      });
    }
  }

  // ============ Helper Methods ============

  private recordEvent(type: OrchestratorEvent['type'], data: unknown): void {
    const event: OrchestratorEvent = {
      type,
      timestamp: new Date(),
      data,
    };
    this.eventHistory.push(event);

    // Keep only last 100 events
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100);
    }
  }

  private determineNextSteps(task: Task, output: unknown): string[] {
    const steps: string[] = [];
    const action = task.metadata.action as string;

    switch (action) {
      case 'start_workflow':
        steps.push('Monitor workflow progress');
        steps.push('Handle any blockers');
        break;
      case 'assign_task':
        steps.push('Track task progress');
        steps.push('Prepare for handoff if needed');
        break;
      case 'resolve_blocker':
        steps.push('Verify blocker is resolved');
        steps.push('Resume dependent tasks');
        break;
    }

    return steps;
  }

  // ============ Public API ============

  /**
   * Start a new feature workflow (convenience method)
   */
  async startFeature(
    title: string,
    description: string,
    options: {
      priority?: Task['priority'];
      mode?: ExecutionMode;
    } = {}
  ): Promise<Workflow> {
    const task = this.createTask({
      title,
      description,
      priority: options.priority || 'medium',
      executionMode: options.mode || 'async',
      metadata: {
        action: 'start_workflow',
        workflowType: 'feature_development',
      },
    });

    return this.startWorkflow(task);
  }

  /**
   * Start a bug fix workflow
   */
  async startBugFix(
    title: string,
    description: string,
    options: {
      priority?: Task['priority'];
      mode?: ExecutionMode;
    } = {}
  ): Promise<Workflow> {
    const task = this.createTask({
      title,
      description,
      priority: options.priority || 'high',
      executionMode: options.mode || 'sync',
      metadata: {
        action: 'start_workflow',
        workflowType: 'bug_fix',
      },
    });

    return this.startWorkflow(task);
  }

  /**
   * Get current system status
   */
  async getStatus(): Promise<object> {
    return this.getProgressReport({} as Task);
  }

  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  getEventHistory(): OrchestratorEvent[] {
    return [...this.eventHistory];
  }
}
