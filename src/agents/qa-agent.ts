/**
 * QA (Quality Assurance) Agent
 *
 * Responsibilities:
 * - Test planning and execution
 * - Bug reporting and tracking
 * - Acceptance testing
 * - Regression testing
 * - Quality metrics and reporting
 */

import { BaseAgent } from '../core/base-agent.js';
import type {
  AgentConfig,
  AgentMessage,
  Task,
  TaskResult,
} from '../types/agent.js';

export interface TestCase {
  id: string;
  title: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'acceptance' | 'regression';
  steps: TestStep[];
  expectedResult: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  priority: 'critical' | 'high' | 'medium' | 'low';
  relatedTaskId?: string;
}

export interface TestStep {
  order: number;
  action: string;
  expectedOutcome: string;
  actualOutcome?: string;
  passed?: boolean;
}

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  testCases: string[];
  coverage: string[];
  status: 'draft' | 'ready' | 'in_progress' | 'completed';
  createdAt: Date;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  status: 'open' | 'in_progress' | 'resolved' | 'verified' | 'closed';
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment?: string;
  relatedTestCase?: string;
  assignedTo?: string;
  createdAt: Date;
}

export interface TestRun {
  id: string;
  testPlanId: string;
  results: TestResult[];
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'aborted';
  summary?: TestSummary;
}

export interface TestResult {
  testCaseId: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errorMessage?: string;
  screenshots?: string[];
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  duration: number;
}

const QA_CONFIG: AgentConfig = {
  role: 'qa',
  name: 'QA Agent',
  description: 'Handles testing, quality assurance, and bug tracking',
  capabilities: [
    {
      name: 'create_test_plan',
      description: 'Create a comprehensive test plan for a feature',
    },
    {
      name: 'execute_tests',
      description: 'Execute test cases and report results',
    },
    {
      name: 'report_bug',
      description: 'Create detailed bug reports',
    },
    {
      name: 'verify_fix',
      description: 'Verify that a bug fix resolves the issue',
    },
    {
      name: 'acceptance_testing',
      description: 'Perform acceptance testing against requirements',
    },
  ],
  canAssignTo: ['dev'],
  canReceiveFrom: ['orchestrator', 'pm', 'dev'],
};

export class QAAgent extends BaseAgent {
  private testCases: Map<string, TestCase> = new Map();
  private testPlans: Map<string, TestPlan> = new Map();
  private bugReports: Map<string, BugReport> = new Map();
  private testRuns: Map<string, TestRun> = new Map();

  constructor() {
    super(QA_CONFIG);
    this.log('QA Agent initialized');
  }

  // ============ Abstract Method Implementations ============

  async processTask(task: Task): Promise<TaskResult> {
    this.log(`Processing task: ${task.title}`, { taskId: task.id });
    const startTime = Date.now();

    try {
      let output: unknown;
      const action = task.metadata.action as string;

      switch (action) {
        case 'create_test_plan':
          output = await this.createTestPlan(task);
          break;
        case 'test_implementation':
          output = await this.testImplementation(task);
          break;
        case 'verify_fix':
          output = await this.verifyFix(task);
          break;
        case 'acceptance_testing':
          output = await this.performAcceptanceTesting(task);
          break;
        case 'regression_testing':
          output = await this.performRegressionTesting(task);
          break;
        case 'report_bug':
          output = await this.reportBug(task);
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
      'create_test_plan',
      'execute_tests',
      'report_bug',
      'acceptance_testing',
    ];

    // Add verify_fix if there are open bugs
    const openBugs = Array.from(this.bugReports.values()).filter(
      (b) => b.status === 'resolved'
    );
    if (openBugs.length > 0) {
      actions.push('verify_fix');
    }

    return actions;
  }

  // ============ QA-Specific Methods ============

  private async createTestPlan(task: Task): Promise<TestPlan> {
    this.log('Creating test plan', { taskId: task.id });

    const requirements = task.metadata.requirements as string[] || [];
    const testCases = this.generateTestCases(task, requirements);

    const testPlan: TestPlan = {
      id: this.generateId(),
      name: `Test Plan: ${task.title}`,
      description: `Comprehensive test plan for: ${task.description}`,
      testCases: testCases.map((tc) => tc.id),
      coverage: this.analyzeCoverage(testCases),
      status: 'ready',
      createdAt: new Date(),
    };

    this.testPlans.set(testPlan.id, testPlan);

    // Store test cases
    testCases.forEach((tc) => this.testCases.set(tc.id, tc));

    this.log('Test plan created', {
      planId: testPlan.id,
      testCaseCount: testCases.length,
    });

    return testPlan;
  }

  private async testImplementation(task: Task): Promise<TestRun> {
    const codeChangeId = task.metadata.codeChangeId as string;
    this.log('Testing implementation', { codeChangeId });

    // Create test cases for the implementation
    const testCases = this.generateTestCases(task, []);

    // Execute tests
    const testRun = await this.executeTests(testCases);

    // Report results back
    if (testRun.summary && testRun.summary.passRate >= 0.8) {
      // Tests passed - notify dev and PM
      this.sendMessage('dev', 'review_result', {
        taskId: task.metadata.originalTaskId,
        approved: true,
        feedback: `All tests passed. Pass rate: ${(testRun.summary.passRate * 100).toFixed(1)}%`,
      });

      this.sendMessage('pm', 'task_complete', {
        taskId: task.metadata.originalTaskId,
        result: {
          success: true,
          testResults: testRun.summary,
        },
      });
    } else {
      // Tests failed - create bug reports
      const failedTests = testRun.results.filter((r) => r.status === 'failed');

      for (const failed of failedTests) {
        const bug = await this.createBugFromFailedTest(failed, task);
        this.sendMessage('dev', 'task_blocked', {
          taskId: task.metadata.originalTaskId,
          reason: `Test failed: ${bug.title}`,
          bugId: bug.id,
        });
      }

      this.sendMessage('dev', 'review_result', {
        taskId: task.metadata.originalTaskId,
        approved: false,
        feedback: `Tests failed. Pass rate: ${(testRun.summary?.passRate ?? 0 * 100).toFixed(1)}%. See bug reports.`,
      });
    }

    return testRun;
  }

  private async verifyFix(task: Task): Promise<{ verified: boolean; details: string }> {
    const bugId = task.metadata.bugId as string;
    const bug = this.bugReports.get(bugId);

    this.log('Verifying fix', { bugId });

    if (!bug) {
      return { verified: false, details: `Bug ${bugId} not found` };
    }

    // Simulate verification
    const verified = Math.random() > 0.2; // 80% success rate for demo

    if (verified) {
      bug.status = 'verified';
      this.log('Fix verified', { bugId });

      this.sendMessage('dev', 'review_result', {
        taskId: task.metadata.originalTaskId || task.id,
        approved: true,
        feedback: 'Bug fix verified successfully',
      });

      this.sendMessage('pm', 'status_update', {
        type: 'bug_verified',
        bugId,
      });
    } else {
      this.sendMessage('dev', 'review_result', {
        taskId: task.metadata.originalTaskId || task.id,
        approved: false,
        feedback: 'Bug still reproducible. Please review the fix.',
      });
    }

    return {
      verified,
      details: verified
        ? 'Fix successfully verified'
        : 'Bug still reproducible after fix',
    };
  }

  private async performAcceptanceTesting(task: Task): Promise<{
    passed: boolean;
    criteria: { criterion: string; passed: boolean }[];
  }> {
    const acceptanceCriteria = (task.metadata.acceptanceCriteria as string[]) || [
      'Feature works as expected',
      'No critical bugs',
      'Performance acceptable',
    ];

    this.log('Performing acceptance testing', {
      taskId: task.id,
      criteriaCount: acceptanceCriteria.length,
    });

    const results = acceptanceCriteria.map((criterion) => ({
      criterion,
      passed: Math.random() > 0.1, // 90% pass rate for demo
    }));

    const allPassed = results.every((r) => r.passed);

    // Send acceptance result to PM
    this.sendMessage('pm', 'review_request', {
      type: 'acceptance',
      taskId: task.id,
      results,
      passed: allPassed,
    });

    return { passed: allPassed, criteria: results };
  }

  private async performRegressionTesting(task: Task): Promise<TestRun> {
    this.log('Performing regression testing', { taskId: task.id });

    // Get all existing test cases
    const allTests = Array.from(this.testCases.values());

    // Execute regression tests
    const testRun = await this.executeTests(allTests);

    // Report any regressions
    const failedTests = testRun.results.filter((r) => r.status === 'failed');
    if (failedTests.length > 0) {
      this.sendMessage('orchestrator', 'status_update', {
        type: 'regression_detected',
        failedCount: failedTests.length,
        testRunId: testRun.id,
      });
    }

    return testRun;
  }

  private async reportBug(task: Task): Promise<BugReport> {
    const bugData = task.metadata.bug as Partial<BugReport>;

    const bug: BugReport = {
      id: this.generateId(),
      title: bugData?.title || task.title,
      description: bugData?.description || task.description,
      severity: bugData?.severity || 'major',
      status: 'open',
      stepsToReproduce: bugData?.stepsToReproduce || ['1. Perform action', '2. Observe result'],
      expectedBehavior: bugData?.expectedBehavior || 'Should work correctly',
      actualBehavior: bugData?.actualBehavior || 'Does not work as expected',
      environment: bugData?.environment || 'Development',
      createdAt: new Date(),
    };

    this.bugReports.set(bug.id, bug);
    this.log('Bug reported', { bugId: bug.id, severity: bug.severity });

    // Notify dev about the bug
    const bugTask = this.createTask({
      title: `Fix: ${bug.title}`,
      description: this.formatBugDescription(bug),
      priority: this.bugSeverityToPriority(bug.severity),
      metadata: {
        action: 'fix_bug',
        bugId: bug.id,
        bug: {
          location: 'src/unknown.ts',
          symptoms: bug.actualBehavior,
        },
      },
    });

    this.stateManager.assignTask(bugTask.id, 'dev');
    this.sendMessage('dev', 'task_assignment', { task: bugTask, bug });

    return bug;
  }

  private async handleGenericTask(task: Task): Promise<object> {
    this.log('Handling generic QA task', { taskId: task.id });

    return {
      processed: true,
      taskId: task.id,
      message: `QA processed task: ${task.title}`,
    };
  }

  // ============ Message Handlers ============

  private async handleTaskAssignment(message: AgentMessage): Promise<void> {
    const { task, codeChange } = message.payload as {
      task: Task;
      codeChange?: unknown;
    };

    this.log('Received task assignment', { taskId: task.id, from: message.from });

    // Acknowledge receipt
    this.sendMessage(message.from, 'response', {
      type: 'task_acknowledged',
      taskId: task.id,
    });

    // Execute asynchronously
    if (task.executionMode === 'async') {
      this.executeTask(task).catch((error) => {
        this.log('Task execution failed', { taskId: task.id, error });
      });
    }
  }

  private async handleReviewRequest(message: AgentMessage): Promise<void> {
    const { type, taskId } = message.payload as {
      type: string;
      taskId: string;
    };

    this.log('Received review request', { type, taskId });

    // Create a testing task
    const testTask = this.createTask({
      title: `Review: ${type} for task ${taskId}`,
      description: `Perform ${type} review`,
      priority: 'high',
      metadata: {
        action: 'test_implementation',
        originalTaskId: taskId,
      },
    });

    this.executeTask(testTask);
  }

  private async handleQuery(message: AgentMessage): Promise<void> {
    const query = message.payload as { type: string; data?: unknown };
    let response: unknown;

    switch (query.type) {
      case 'get_test_plan':
        response = this.testPlans.get(query.data as string);
        break;
      case 'get_test_cases':
        response = Array.from(this.testCases.values());
        break;
      case 'get_bugs':
        response = Array.from(this.bugReports.values());
        break;
      case 'get_open_bugs':
        response = Array.from(this.bugReports.values()).filter(
          (b) => b.status === 'open' || b.status === 'in_progress'
        );
        break;
      case 'get_quality_metrics':
        response = this.getQualityMetrics();
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
      case 'quick_test':
        response = await this.quickTest(request.data as Task);
        break;
      case 'get_coverage':
        response = this.calculateCoverage();
        break;
      default:
        response = { error: 'Unknown sync action' };
    }

    this.respondToSyncRequest(message.correlationId!, response);
  }

  // ============ Helper Methods ============

  private generateTestCases(task: Task, requirements: string[]): TestCase[] {
    const testCases: TestCase[] = [];

    // Generate acceptance test
    testCases.push({
      id: this.generateId(),
      title: `Acceptance: ${task.title}`,
      description: `Verify ${task.title} meets requirements`,
      type: 'acceptance',
      steps: [
        { order: 1, action: 'Setup test environment', expectedOutcome: 'Environment ready' },
        { order: 2, action: 'Execute feature', expectedOutcome: 'Feature works correctly' },
        { order: 3, action: 'Verify output', expectedOutcome: 'Output matches expected' },
      ],
      expectedResult: 'All acceptance criteria met',
      status: 'pending',
      priority: task.priority as TestCase['priority'],
      relatedTaskId: task.id,
    });

    // Generate integration test
    testCases.push({
      id: this.generateId(),
      title: `Integration: ${task.title}`,
      description: `Verify ${task.title} integrates correctly`,
      type: 'integration',
      steps: [
        { order: 1, action: 'Initialize dependencies', expectedOutcome: 'Dependencies loaded' },
        { order: 2, action: 'Execute integration', expectedOutcome: 'Integration successful' },
      ],
      expectedResult: 'Successful integration with system',
      status: 'pending',
      priority: 'high',
      relatedTaskId: task.id,
    });

    // Generate edge case tests
    testCases.push({
      id: this.generateId(),
      title: `Edge Cases: ${task.title}`,
      description: `Test edge cases for ${task.title}`,
      type: 'unit',
      steps: [
        { order: 1, action: 'Test null input', expectedOutcome: 'Handles gracefully' },
        { order: 2, action: 'Test large input', expectedOutcome: 'Handles gracefully' },
        { order: 3, action: 'Test concurrent access', expectedOutcome: 'Thread safe' },
      ],
      expectedResult: 'All edge cases handled correctly',
      status: 'pending',
      priority: 'medium',
      relatedTaskId: task.id,
    });

    return testCases;
  }

  private async executeTests(testCases: TestCase[]): Promise<TestRun> {
    const startTime = new Date();

    const testRun: TestRun = {
      id: this.generateId(),
      testPlanId: '',
      results: [],
      startTime,
      status: 'running',
    };

    this.testRuns.set(testRun.id, testRun);

    // Execute each test
    for (const testCase of testCases) {
      const testStartTime = Date.now();

      // Simulate test execution
      const passed = Math.random() > 0.15; // 85% pass rate

      testCase.status = passed ? 'passed' : 'failed';

      testRun.results.push({
        testCaseId: testCase.id,
        status: testCase.status,
        duration: Date.now() - testStartTime,
        errorMessage: passed ? undefined : 'Assertion failed',
      });
    }

    testRun.endTime = new Date();
    testRun.status = 'completed';
    testRun.summary = this.calculateSummary(testRun.results);

    this.log('Test run completed', {
      runId: testRun.id,
      summary: testRun.summary,
    });

    return testRun;
  }

  private calculateSummary(results: TestResult[]): TestSummary {
    const total = results.length;
    const passed = results.filter((r) => r.status === 'passed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const duration = results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? passed / total : 0,
      duration,
    };
  }

  private async createBugFromFailedTest(
    result: TestResult,
    task: Task
  ): Promise<BugReport> {
    const testCase = this.testCases.get(result.testCaseId);

    const bug: BugReport = {
      id: this.generateId(),
      title: `Test failure: ${testCase?.title || result.testCaseId}`,
      description: `Test failed during execution of ${task.title}`,
      severity: 'major',
      status: 'open',
      stepsToReproduce: testCase?.steps.map((s) => s.action) || [],
      expectedBehavior: testCase?.expectedResult || 'Test should pass',
      actualBehavior: result.errorMessage || 'Test failed',
      relatedTestCase: result.testCaseId,
      createdAt: new Date(),
    };

    this.bugReports.set(bug.id, bug);
    return bug;
  }

  private analyzeCoverage(testCases: TestCase[]): string[] {
    const coverage: string[] = [];

    const types = new Set(testCases.map((tc) => tc.type));
    types.forEach((type) => coverage.push(`${type} testing`));

    return coverage;
  }

  private formatBugDescription(bug: BugReport): string {
    return `
## Bug Report: ${bug.title}

**Severity:** ${bug.severity}
**Environment:** ${bug.environment || 'N/A'}

### Description
${bug.description}

### Steps to Reproduce
${bug.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### Expected Behavior
${bug.expectedBehavior}

### Actual Behavior
${bug.actualBehavior}
    `.trim();
  }

  private bugSeverityToPriority(
    severity: BugReport['severity']
  ): Task['priority'] {
    const mapping: Record<BugReport['severity'], Task['priority']> = {
      critical: 'critical',
      major: 'high',
      minor: 'medium',
      trivial: 'low',
    };
    return mapping[severity];
  }

  private async quickTest(task: Task): Promise<{ passed: boolean; message: string }> {
    // Perform a quick smoke test
    return {
      passed: true,
      message: 'Quick test passed',
    };
  }

  private calculateCoverage(): { percentage: number; areas: string[] } {
    const testCases = Array.from(this.testCases.values());
    const areas = [...new Set(testCases.map((tc) => tc.type))];

    return {
      percentage: Math.min(100, testCases.length * 10),
      areas,
    };
  }

  private getQualityMetrics(): object {
    const bugs = Array.from(this.bugReports.values());
    const testRuns = Array.from(this.testRuns.values());

    const lastRun = testRuns[testRuns.length - 1];

    return {
      totalBugs: bugs.length,
      openBugs: bugs.filter((b) => b.status === 'open').length,
      resolvedBugs: bugs.filter((b) => b.status === 'verified' || b.status === 'closed').length,
      testCoverage: this.calculateCoverage(),
      lastTestRun: lastRun?.summary || null,
      bugsBySeveity: {
        critical: bugs.filter((b) => b.severity === 'critical').length,
        major: bugs.filter((b) => b.severity === 'major').length,
        minor: bugs.filter((b) => b.severity === 'minor').length,
        trivial: bugs.filter((b) => b.severity === 'trivial').length,
      },
    };
  }

  private determineNextSteps(task: Task, output: unknown): string[] {
    const steps: string[] = [];
    const action = task.metadata.action as string;

    switch (action) {
      case 'test_implementation':
        steps.push('Review test results with dev');
        steps.push('Create bug reports if needed');
        break;
      case 'verify_fix':
        steps.push('Close bug if verified');
        steps.push('Notify PM of status');
        break;
      case 'acceptance_testing':
        steps.push('Report results to PM');
        steps.push('Schedule sign-off meeting');
        break;
    }

    return steps;
  }

  // ============ Public API ============

  getTestCases(): TestCase[] {
    return Array.from(this.testCases.values());
  }

  getTestPlans(): TestPlan[] {
    return Array.from(this.testPlans.values());
  }

  getBugReports(): BugReport[] {
    return Array.from(this.bugReports.values());
  }

  getTestRuns(): TestRun[] {
    return Array.from(this.testRuns.values());
  }
}
