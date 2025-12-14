/**
 * Dev (Developer) Agent
 *
 * Responsibilities:
 * - Code implementation
 * - Technical design and architecture
 * - Code review
 * - Bug fixing
 * - Technical documentation
 */

import { BaseAgent } from '../core/base-agent.js';
import type {
  AgentConfig,
  AgentMessage,
  Task,
  TaskResult,
} from '../types/agent.js';

export interface CodeChange {
  id: string;
  taskId: string;
  files: FileChange[];
  description: string;
  status: 'draft' | 'ready_for_review' | 'approved' | 'merged';
  createdAt: Date;
}

export interface FileChange {
  path: string;
  operation: 'create' | 'modify' | 'delete';
  content?: string;
  diff?: string;
}

export interface TechnicalDesign {
  id: string;
  taskId: string;
  title: string;
  overview: string;
  components: ComponentDesign[];
  dependencies: string[];
  risks: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
}

export interface ComponentDesign {
  name: string;
  purpose: string;
  interfaces: string[];
  implementation: string;
}

export interface CodeReview {
  id: string;
  codeChangeId: string;
  reviewer: string;
  status: 'pending' | 'approved' | 'changes_requested';
  comments: ReviewComment[];
  createdAt: Date;
}

export interface ReviewComment {
  file: string;
  line?: number;
  comment: string;
  severity: 'info' | 'suggestion' | 'required';
}

const DEV_CONFIG: AgentConfig = {
  role: 'dev',
  name: 'Developer Agent',
  description: 'Handles code implementation, design, and technical tasks',
  capabilities: [
    {
      name: 'implement_feature',
      description: 'Implement a new feature based on requirements',
    },
    {
      name: 'fix_bug',
      description: 'Debug and fix reported bugs',
    },
    {
      name: 'create_design',
      description: 'Create technical design for a feature',
    },
    {
      name: 'review_code',
      description: 'Review code changes from other developers',
    },
    {
      name: 'refactor',
      description: 'Refactor existing code for better quality',
    },
  ],
  canAssignTo: ['qa'],
  canReceiveFrom: ['orchestrator', 'pm', 'qa'],
};

export class DevAgent extends BaseAgent {
  private codeChanges: Map<string, CodeChange> = new Map();
  private designs: Map<string, TechnicalDesign> = new Map();
  private reviews: Map<string, CodeReview> = new Map();

  constructor() {
    super(DEV_CONFIG);
    this.log('Dev Agent initialized');
  }

  // ============ Abstract Method Implementations ============

  async processTask(task: Task): Promise<TaskResult> {
    this.log(`Processing task: ${task.title}`, { taskId: task.id });
    const startTime = Date.now();

    try {
      let output: unknown;
      const action = task.metadata.action as string;

      switch (action) {
        case 'implement_story':
        case 'implement_feature':
          output = await this.implementFeature(task);
          break;
        case 'fix_bug':
          output = await this.fixBug(task);
          break;
        case 'create_design':
          output = await this.createDesign(task);
          break;
        case 'review_code':
          output = await this.reviewCode(task);
          break;
        case 'refactor':
          output = await this.refactorCode(task);
          break;
        case 'implement_component':
          output = await this.implementComponent(task);
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
      case 'task_assignment':
        await this.handleTaskAssignment(message);
        break;
      case 'review_result':
        await this.handleReviewResult(message);
        break;
      case 'task_blocked':
        await this.handleBlockedNotification(message);
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
      'implement_feature',
      'fix_bug',
      'create_design',
      'refactor',
    ];

    // Add review if there are pending reviews
    const pendingReviews = Array.from(this.reviews.values()).filter(
      (r) => r.status === 'pending'
    );
    if (pendingReviews.length > 0) {
      actions.push('review_code');
    }

    return actions;
  }

  // ============ Dev-Specific Methods ============

  private async implementFeature(task: Task): Promise<CodeChange> {
    this.log('Implementing feature', { taskId: task.id, title: task.title });

    // Simulate implementation process
    const codeChange: CodeChange = {
      id: this.generateId(),
      taskId: task.id,
      files: this.generateImplementation(task),
      description: `Implementation of: ${task.title}`,
      status: 'ready_for_review',
      createdAt: new Date(),
    };

    this.codeChanges.set(codeChange.id, codeChange);

    // Request QA review
    const qaTask = this.createTask({
      title: `Test: ${task.title}`,
      description: `Verify implementation of: ${task.title}\n\nCode Change ID: ${codeChange.id}`,
      priority: task.priority,
      dependencies: [task.id],
      metadata: {
        action: 'test_implementation',
        codeChangeId: codeChange.id,
        originalTaskId: task.id,
      },
    });

    this.stateManager.assignTask(qaTask.id, 'qa');
    this.sendMessage('qa', 'task_assignment', { task: qaTask, codeChange });

    return codeChange;
  }

  private async fixBug(task: Task): Promise<CodeChange> {
    this.log('Fixing bug', { taskId: task.id });

    const bugInfo = task.metadata.bug as { location?: string; symptoms?: string };

    // Simulate bug fix process
    const codeChange: CodeChange = {
      id: this.generateId(),
      taskId: task.id,
      files: [
        {
          path: bugInfo?.location || 'src/unknown.ts',
          operation: 'modify',
          diff: `- // Bug: ${task.title}\n+ // Fixed: ${task.title}`,
        },
      ],
      description: `Bug fix: ${task.title}`,
      status: 'ready_for_review',
      createdAt: new Date(),
    };

    this.codeChanges.set(codeChange.id, codeChange);

    // Request QA verification
    const qaTask = this.createTask({
      title: `Verify fix: ${task.title}`,
      description: `Verify bug fix for: ${task.title}`,
      priority: task.priority,
      dependencies: [task.id],
      metadata: {
        action: 'verify_fix',
        codeChangeId: codeChange.id,
        originalTaskId: task.id,
      },
    });

    this.stateManager.assignTask(qaTask.id, 'qa');
    this.sendMessage('qa', 'task_assignment', { task: qaTask, codeChange });

    return codeChange;
  }

  private async createDesign(task: Task): Promise<TechnicalDesign> {
    this.log('Creating technical design', { taskId: task.id });

    const design: TechnicalDesign = {
      id: this.generateId(),
      taskId: task.id,
      title: `Design: ${task.title}`,
      overview: task.description,
      components: this.analyzeComponents(task),
      dependencies: [],
      risks: this.identifyRisks(task),
      estimatedComplexity: this.estimateComplexity(task),
    };

    this.designs.set(design.id, design);

    // Send design for PM review
    this.sendMessage('pm', 'review_request', {
      type: 'design',
      designId: design.id,
      design,
    });

    return design;
  }

  private async reviewCode(task: Task): Promise<CodeReview> {
    const codeChangeId = task.metadata.codeChangeId as string;
    const codeChange = this.codeChanges.get(codeChangeId);

    if (!codeChange) {
      throw new Error(`Code change not found: ${codeChangeId}`);
    }

    this.log('Reviewing code', { codeChangeId });

    const review: CodeReview = {
      id: this.generateId(),
      codeChangeId,
      reviewer: this.role,
      status: 'approved', // Simplified for demo
      comments: this.generateReviewComments(codeChange),
      createdAt: new Date(),
    };

    this.reviews.set(review.id, review);
    codeChange.status = review.status === 'approved' ? 'approved' : 'draft';

    return review;
  }

  private async refactorCode(task: Task): Promise<CodeChange> {
    this.log('Refactoring code', { taskId: task.id });

    const targetFiles = (task.metadata.files as string[]) || ['src/main.ts'];

    const codeChange: CodeChange = {
      id: this.generateId(),
      taskId: task.id,
      files: targetFiles.map((path) => ({
        path,
        operation: 'modify' as const,
        diff: '// Refactored for better maintainability',
      })),
      description: `Refactoring: ${task.title}`,
      status: 'ready_for_review',
      createdAt: new Date(),
    };

    this.codeChanges.set(codeChange.id, codeChange);

    // Send for code review
    this.sendMessage('orchestrator', 'review_request', {
      type: 'code',
      codeChangeId: codeChange.id,
      taskId: task.id,
    });

    return codeChange;
  }

  private async implementComponent(task: Task): Promise<CodeChange> {
    const component = task.metadata.component as string;

    this.log('Implementing component', { component });

    const codeChange: CodeChange = {
      id: this.generateId(),
      taskId: task.id,
      files: [
        {
          path: `src/components/${component}.ts`,
          operation: 'create',
          content: this.generateComponentCode(component),
        },
        {
          path: `src/components/${component}.test.ts`,
          operation: 'create',
          content: this.generateComponentTest(component),
        },
      ],
      description: `Component implementation: ${component}`,
      status: 'ready_for_review',
      createdAt: new Date(),
    };

    this.codeChanges.set(codeChange.id, codeChange);
    return codeChange;
  }

  private async handleGenericTask(task: Task): Promise<object> {
    this.log('Handling generic dev task', { taskId: task.id });

    return {
      processed: true,
      taskId: task.id,
      message: `Dev processed task: ${task.title}`,
      recommendation: 'Task completed. Consider adding tests.',
    };
  }

  // ============ Message Handlers ============

  private async handleTaskAssignment(message: AgentMessage): Promise<void> {
    const { task } = message.payload as { task: Task };
    this.log('Received task assignment', { taskId: task.id, from: message.from });

    // Acknowledge receipt
    this.sendMessage(message.from, 'response', {
      type: 'task_acknowledged',
      taskId: task.id,
    });

    // Execute the task asynchronously
    if (task.executionMode === 'async') {
      this.executeTask(task).catch((error) => {
        this.log('Task execution failed', { taskId: task.id, error });
      });
    }
  }

  private async handleReviewResult(message: AgentMessage): Promise<void> {
    const { taskId, approved, feedback } = message.payload as {
      taskId: string;
      approved: boolean;
      feedback?: string;
    };

    this.log('Received review result', { taskId, approved });

    if (approved) {
      this.stateManager.updateTaskStatus(taskId, 'completed');
      this.sendMessage('pm', 'task_complete', {
        taskId,
        result: { success: true },
      });
    } else {
      // Need to address feedback
      const revisionTask = this.createTask({
        title: `Address feedback for task ${taskId}`,
        description: feedback || 'Address review feedback',
        priority: 'high',
        dependencies: [],
        metadata: { originalTaskId: taskId, action: 'address_feedback' },
      });

      this.log('Created revision task', { revisionTaskId: revisionTask.id });
    }
  }

  private async handleBlockedNotification(message: AgentMessage): Promise<void> {
    const { taskId, reason } = message.payload as {
      taskId: string;
      reason: string;
    };

    this.log('Received blocked notification', { taskId, reason });

    // Notify PM about the block
    this.sendMessage('pm', 'task_blocked', {
      taskId,
      reason,
      suggestedAction: 'Review dependencies and requirements',
    });
  }

  private async handleQuery(message: AgentMessage): Promise<void> {
    const query = message.payload as { type: string; data?: unknown };
    let response: unknown;

    switch (query.type) {
      case 'get_code_change':
        response = this.codeChanges.get(query.data as string);
        break;
      case 'get_design':
        response = this.designs.get(query.data as string);
        break;
      case 'get_pending_reviews':
        response = Array.from(this.reviews.values()).filter(
          (r) => r.status === 'pending'
        );
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
      case 'estimate_task':
        response = this.estimateTask(request.data as Task);
        break;
      case 'check_feasibility':
        response = this.checkFeasibility(request.data as string);
        break;
      default:
        response = { error: 'Unknown sync action' };
    }

    this.respondToSyncRequest(message.correlationId!, response);
  }

  // ============ Helper Methods ============

  private generateImplementation(task: Task): FileChange[] {
    // Simulate generating implementation files
    const baseName = task.title.toLowerCase().replace(/\s+/g, '-');

    return [
      {
        path: `src/features/${baseName}/index.ts`,
        operation: 'create',
        content: `// Implementation of ${task.title}\nexport class ${this.toPascalCase(baseName)} {\n  // TODO: Implement\n}`,
      },
      {
        path: `src/features/${baseName}/${baseName}.test.ts`,
        operation: 'create',
        content: `import { ${this.toPascalCase(baseName)} } from './index';\n\ndescribe('${task.title}', () => {\n  it('should work', () => {\n    // TODO: Add tests\n  });\n});`,
      },
    ];
  }

  private analyzeComponents(task: Task): ComponentDesign[] {
    return [
      {
        name: 'Core Module',
        purpose: `Main implementation for ${task.title}`,
        interfaces: ['IModule'],
        implementation: 'TypeScript class with dependency injection',
      },
      {
        name: 'API Layer',
        purpose: 'External interface for the feature',
        interfaces: ['IAPI'],
        implementation: 'REST/GraphQL endpoints',
      },
    ];
  }

  private identifyRisks(task: Task): string[] {
    const risks: string[] = [];

    if (task.priority === 'critical') {
      risks.push('High priority - tight deadline');
    }
    if (task.dependencies.length > 2) {
      risks.push('Multiple dependencies may cause delays');
    }

    return risks;
  }

  private estimateComplexity(task: Task): 'low' | 'medium' | 'high' {
    const descLength = task.description.length;
    const depCount = task.dependencies.length;

    if (descLength > 500 || depCount > 3) return 'high';
    if (descLength > 200 || depCount > 1) return 'medium';
    return 'low';
  }

  private generateReviewComments(codeChange: CodeChange): ReviewComment[] {
    return codeChange.files.map((file) => ({
      file: file.path,
      comment: 'Code looks good',
      severity: 'info' as const,
    }));
  }

  private generateComponentCode(name: string): string {
    const className = this.toPascalCase(name);
    return `/**
 * ${className} Component
 */
export class ${className} {
  constructor() {
    // Initialize component
  }

  public execute(): void {
    // Implementation
  }
}
`;
  }

  private generateComponentTest(name: string): string {
    const className = this.toPascalCase(name);
    return `import { ${className} } from './${name}';

describe('${className}', () => {
  let component: ${className};

  beforeEach(() => {
    component = new ${className}();
  });

  it('should create instance', () => {
    expect(component).toBeDefined();
  });

  it('should execute successfully', () => {
    expect(() => component.execute()).not.toThrow();
  });
});
`;
  }

  private estimateTask(task: Task): { hours: number; complexity: string } {
    const complexity = this.estimateComplexity(task);
    const hours = { low: 4, medium: 16, high: 40 }[complexity];
    return { hours, complexity };
  }

  private checkFeasibility(taskDescription: string): { feasible: boolean; concerns: string[] } {
    return {
      feasible: true,
      concerns: [],
    };
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private determineNextSteps(task: Task, output: unknown): string[] {
    const steps: string[] = [];
    const action = task.metadata.action as string;

    switch (action) {
      case 'implement_feature':
      case 'implement_story':
        steps.push('Wait for QA verification');
        steps.push('Address any review feedback');
        break;
      case 'fix_bug':
        steps.push('Verify fix with QA');
        steps.push('Update documentation if needed');
        break;
      case 'create_design':
        steps.push('Get PM approval');
        steps.push('Begin implementation');
        break;
    }

    return steps;
  }

  // ============ Public API ============

  getCodeChanges(): CodeChange[] {
    return Array.from(this.codeChanges.values());
  }

  getDesigns(): TechnicalDesign[] {
    return Array.from(this.designs.values());
  }

  getReviews(): CodeReview[] {
    return Array.from(this.reviews.values());
  }
}
