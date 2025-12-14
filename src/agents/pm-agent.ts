/**
 * PM (Product Manager) Agent
 *
 * Responsibilities:
 * - Requirements gathering and analysis
 * - Task prioritization and planning
 * - User story creation
 * - Roadmap management
 * - Stakeholder communication
 */

import { BaseAgent } from '../core/base-agent.js';
import type {
  AgentConfig,
  AgentMessage,
  Task,
  TaskResult,
  TaskPriority,
} from '../types/agent.js';

export interface UserStory {
  id: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  priority: TaskPriority;
  estimatedEffort: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  type: 'functional' | 'non-functional' | 'technical';
  priority: TaskPriority;
  status: 'draft' | 'approved' | 'implemented' | 'verified';
  relatedStories: string[];
}

export interface Sprint {
  id: string;
  name: string;
  goals: string[];
  tasks: string[];
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
}

const PM_CONFIG: AgentConfig = {
  role: 'pm',
  name: 'Product Manager Agent',
  description: 'Handles requirements, planning, and task prioritization',
  capabilities: [
    {
      name: 'create_user_story',
      description: 'Create a new user story with acceptance criteria',
    },
    {
      name: 'prioritize_backlog',
      description: 'Prioritize tasks in the backlog',
    },
    {
      name: 'create_sprint',
      description: 'Create and plan a new sprint',
    },
    {
      name: 'analyze_requirements',
      description: 'Analyze and document requirements',
    },
    {
      name: 'decompose_feature',
      description: 'Break down a feature into smaller tasks',
    },
  ],
  canAssignTo: ['dev', 'qa'],
  canReceiveFrom: ['orchestrator', 'dev', 'qa'],
};

export class PMAgent extends BaseAgent {
  private userStories: Map<string, UserStory> = new Map();
  private requirements: Map<string, Requirement> = new Map();
  private sprints: Map<string, Sprint> = new Map();
  private currentSprint: string | null = null;

  constructor() {
    super(PM_CONFIG);
    this.log('PM Agent initialized');
  }

  // ============ Abstract Method Implementations ============

  async processTask(task: Task): Promise<TaskResult> {
    this.log(`Processing task: ${task.title}`, { taskId: task.id });
    const startTime = Date.now();

    try {
      let output: unknown;
      const action = task.metadata.action as string;

      switch (action) {
        case 'create_user_story':
          output = await this.createUserStory(task);
          break;
        case 'analyze_requirements':
          output = await this.analyzeRequirements(task);
          break;
        case 'prioritize_backlog':
          output = await this.prioritizeBacklog(task);
          break;
        case 'create_sprint':
          output = await this.createSprint(task);
          break;
        case 'decompose_feature':
          output = await this.decomposeFeature(task);
          break;
        case 'review_progress':
          output = await this.reviewProgress(task);
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
    const actions = [
      'create_user_story',
      'analyze_requirements',
      'prioritize_backlog',
      'decompose_feature',
    ];

    // Add sprint-related actions if applicable
    if (!this.currentSprint) {
      actions.push('create_sprint');
    } else {
      actions.push('review_progress', 'close_sprint');
    }

    return actions;
  }

  // ============ PM-Specific Methods ============

  private async createUserStory(task: Task): Promise<UserStory> {
    const data = task.metadata.data as Partial<UserStory>;

    const story: UserStory = {
      id: this.generateId(),
      title: data.title || task.title,
      asA: data.asA || 'user',
      iWant: data.iWant || task.description,
      soThat: data.soThat || 'I can achieve my goal',
      acceptanceCriteria: data.acceptanceCriteria || [],
      priority: data.priority || 'medium',
      estimatedEffort: data.estimatedEffort || 'medium',
    };

    this.userStories.set(story.id, story);
    this.log('Created user story', { storyId: story.id, title: story.title });

    // Create development task for the story
    const devTask = this.createTask({
      title: `Implement: ${story.title}`,
      description: this.formatStoryForDev(story),
      priority: story.priority,
      metadata: {
        storyId: story.id,
        action: 'implement_story',
      },
    });

    // Assign to dev
    this.stateManager.assignTask(devTask.id, 'dev');
    this.sendMessage('dev', 'task_assignment', { task: devTask });

    return story;
  }

  private async analyzeRequirements(task: Task): Promise<Requirement[]> {
    const input = task.metadata.input as string;
    const requirements: Requirement[] = [];

    // Simulate requirement analysis
    const analyzed: Requirement = {
      id: this.generateId(),
      title: `Requirement from: ${task.title}`,
      description: input || task.description,
      type: 'functional',
      priority: task.priority,
      status: 'draft',
      relatedStories: [],
    };

    requirements.push(analyzed);
    this.requirements.set(analyzed.id, analyzed);

    this.log('Analyzed requirements', { count: requirements.length });
    return requirements;
  }

  private async prioritizeBacklog(task: Task): Promise<Task[]> {
    const pendingTasks = this.stateManager.getTasksByStatus('pending');

    // Sort by priority and dependencies
    const prioritized = pendingTasks.sort((a, b) => {
      const priorityOrder: Record<TaskPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Tasks with no dependencies come first
      return a.dependencies.length - b.dependencies.length;
    });

    this.log('Prioritized backlog', { taskCount: prioritized.length });
    return prioritized;
  }

  private async createSprint(task: Task): Promise<Sprint> {
    const data = task.metadata.data as Partial<Sprint>;

    const sprint: Sprint = {
      id: this.generateId(),
      name: data.name || `Sprint ${this.sprints.size + 1}`,
      goals: data.goals || [],
      tasks: data.tasks || [],
      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      status: 'planning',
    };

    this.sprints.set(sprint.id, sprint);
    this.currentSprint = sprint.id;

    this.log('Created sprint', { sprintId: sprint.id, name: sprint.name });

    // Notify orchestrator about new sprint
    this.sendMessage('orchestrator', 'status_update', {
      type: 'sprint_created',
      sprint,
    });

    return sprint;
  }

  private async decomposeFeature(task: Task): Promise<Task[]> {
    const subtasks: Task[] = [];
    const feature = task.metadata.feature as { name: string; components: string[] };

    if (feature && feature.components) {
      for (const component of feature.components) {
        const subtask = this.createSubtask(task.id, {
          title: `Implement ${component}`,
          description: `Implement the ${component} component for ${feature.name}`,
          priority: task.priority,
          metadata: { component, feature: feature.name },
        });
        subtasks.push(subtask);
      }
    } else {
      // Default decomposition: design, implement, test
      const phases = [
        { name: 'Design', assignTo: 'dev' as const },
        { name: 'Implement', assignTo: 'dev' as const },
        { name: 'Test', assignTo: 'qa' as const },
      ];

      let prevTaskId: string | undefined;

      for (const phase of phases) {
        const subtask = this.createSubtask(task.id, {
          title: `${phase.name}: ${task.title}`,
          description: `${phase.name} phase for ${task.title}`,
          priority: task.priority,
          dependencies: prevTaskId ? [prevTaskId] : [],
          metadata: { phase: phase.name.toLowerCase() },
        });

        this.stateManager.assignTask(subtask.id, phase.assignTo);
        subtasks.push(subtask);
        prevTaskId = subtask.id;
      }
    }

    this.log('Decomposed feature', {
      featureId: task.id,
      subtaskCount: subtasks.length,
    });

    return subtasks;
  }

  private async reviewProgress(task: Task): Promise<object> {
    const stats = this.stateManager.getStatistics();
    const sprint = this.currentSprint
      ? this.sprints.get(this.currentSprint)
      : null;

    const report = {
      overall: stats,
      sprint: sprint
        ? {
            name: sprint.name,
            status: sprint.status,
            taskCount: sprint.tasks.length,
            completedTasks: sprint.tasks.filter((id) => {
              const t = this.stateManager.getTask(id);
              return t?.status === 'completed';
            }).length,
          }
        : null,
      blockedItems: this.stateManager.getTasksByStatus('blocked').map((t) => ({
        id: t.id,
        title: t.title,
        blockedBy: this.stateManager.getBlockingTasks(t.id).map((b) => b.id),
      })),
    };

    this.log('Generated progress report', report);
    return report;
  }

  private async handleGenericTask(task: Task): Promise<object> {
    return {
      processed: true,
      taskId: task.id,
      message: `PM processed task: ${task.title}`,
    };
  }

  // ============ Message Handlers ============

  private async handleTaskCompletion(message: AgentMessage): Promise<void> {
    const { taskId, result } = message.payload as {
      taskId: string;
      result: TaskResult;
    };

    this.log(`Task completed by ${message.from}`, { taskId });

    // Check if this completes a user story
    const task = this.stateManager.getTask(taskId);
    if (task?.metadata.storyId) {
      const story = this.userStories.get(task.metadata.storyId as string);
      if (story && message.from === 'qa') {
        // QA verified, story is complete
        this.log('User story completed', { storyId: story.id });
        this.sendMessage('orchestrator', 'status_update', {
          type: 'story_completed',
          story,
        });
      }
    }
  }

  private async handleBlockedTask(message: AgentMessage): Promise<void> {
    const { taskId, reason } = message.payload as {
      taskId: string;
      reason: string;
    };

    this.log(`Task blocked`, { taskId, reason, reportedBy: message.from });

    // Analyze the block and suggest resolution
    const resolutionTask = this.createTask({
      title: `Resolve blocker for task ${taskId}`,
      description: `Blocker reason: ${reason}`,
      priority: 'high',
      metadata: { blockedTaskId: taskId, action: 'resolve_blocker' },
    });

    this.sendMessage('orchestrator', 'status_update', {
      type: 'blocker_detected',
      taskId,
      reason,
      resolutionTaskId: resolutionTask.id,
    });
  }

  private async handleReviewRequest(message: AgentMessage): Promise<void> {
    const { taskId, type } = message.payload as {
      taskId: string;
      type: string;
    };

    this.log(`Review requested`, { taskId, type, from: message.from });

    // For now, auto-approve reviews from QA
    if (message.from === 'qa' && type === 'acceptance') {
      this.sendMessage(message.from, 'review_result', {
        taskId,
        approved: true,
        feedback: 'Acceptance criteria met',
      });
    }
  }

  private async handleQuery(message: AgentMessage): Promise<void> {
    const query = message.payload as { type: string; data?: unknown };

    let response: unknown;

    switch (query.type) {
      case 'get_priorities':
        response = await this.prioritizeBacklog({} as Task);
        break;
      case 'get_story':
        response = this.userStories.get(query.data as string);
        break;
      case 'get_requirements':
        response = Array.from(this.requirements.values());
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
      case 'get_next_task':
        const ready = this.stateManager.getReadyTasks();
        response = ready.length > 0 ? ready[0] : null;
        break;
      case 'get_sprint_status':
        response = this.currentSprint
          ? this.sprints.get(this.currentSprint)
          : null;
        break;
      default:
        response = { error: 'Unknown sync action' };
    }

    this.respondToSyncRequest(message.correlationId!, response);
  }

  // ============ Helper Methods ============

  private formatStoryForDev(story: UserStory): string {
    return `
## User Story: ${story.title}

**As a** ${story.asA}
**I want** ${story.iWant}
**So that** ${story.soThat}

### Acceptance Criteria:
${story.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join('\n')}

### Estimated Effort: ${story.estimatedEffort}
### Priority: ${story.priority}
    `.trim();
  }

  private determineNextSteps(task: Task, output: unknown): string[] {
    const steps: string[] = [];
    const action = task.metadata.action as string;

    switch (action) {
      case 'create_user_story':
        steps.push('Assign story to developer');
        steps.push('Create QA test plan');
        break;
      case 'decompose_feature':
        steps.push('Review subtasks with team');
        steps.push('Assign subtasks to developers');
        break;
      case 'prioritize_backlog':
        steps.push('Communicate priorities to team');
        steps.push('Update sprint goals if needed');
        break;
    }

    return steps;
  }

  // ============ Public API ============

  getUserStories(): UserStory[] {
    return Array.from(this.userStories.values());
  }

  getRequirements(): Requirement[] {
    return Array.from(this.requirements.values());
  }

  getCurrentSprint(): Sprint | null {
    return this.currentSprint ? this.sprints.get(this.currentSprint) || null : null;
  }
}
