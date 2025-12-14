/**
 * Agent System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createAgentSystem,
  resetGlobalState,
  globalStateManager,
  globalEventBus,
} from '../index.js';

describe('Agent System', () => {
  beforeEach(() => {
    resetGlobalState();
  });

  describe('createAgentSystem', () => {
    it('should create all agents', () => {
      const system = createAgentSystem();

      expect(system.orchestrator).toBeDefined();
      expect(system.pm).toBeDefined();
      expect(system.dev).toBeDefined();
      expect(system.qa).toBeDefined();
    });

    it('should have correct agent roles', () => {
      const system = createAgentSystem();

      expect(system.orchestrator.role).toBe('orchestrator');
      expect(system.pm.role).toBe('pm');
      expect(system.dev.role).toBe('dev');
      expect(system.qa.role).toBe('qa');
    });
  });

  describe('Orchestrator', () => {
    it('should start a feature workflow', async () => {
      const { orchestrator } = createAgentSystem();

      const workflow = await orchestrator.startFeature(
        'Test Feature',
        'A test feature for testing',
        { priority: 'high' }
      );

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      expect(workflow.status).toBe('in_progress');
    });

    it('should start a bug fix workflow', async () => {
      const { orchestrator } = createAgentSystem();

      const workflow = await orchestrator.startBugFix(
        'Test Bug',
        'A test bug for testing',
        { priority: 'critical' }
      );

      expect(workflow).toBeDefined();
      expect(workflow.status).toBe('in_progress');
    });

    it('should return system status', async () => {
      const { orchestrator } = createAgentSystem();

      const status = await orchestrator.getStatus();

      expect(status).toBeDefined();
      expect(status).toHaveProperty('statistics');
      expect(status).toHaveProperty('workflows');
      expect(status).toHaveProperty('agents');
    });
  });

  describe('PM Agent', () => {
    it('should return available actions', () => {
      const { pm } = createAgentSystem();

      const actions = pm.getAvailableActions();

      expect(actions).toContain('create_user_story');
      expect(actions).toContain('analyze_requirements');
      expect(actions).toContain('prioritize_backlog');
    });

    it('should initialize with empty user stories', () => {
      const { pm } = createAgentSystem();

      const stories = pm.getUserStories();

      expect(stories).toEqual([]);
    });
  });

  describe('Dev Agent', () => {
    it('should return available actions', () => {
      const { dev } = createAgentSystem();

      const actions = dev.getAvailableActions();

      expect(actions).toContain('implement_feature');
      expect(actions).toContain('fix_bug');
      expect(actions).toContain('create_design');
    });

    it('should initialize with empty code changes', () => {
      const { dev } = createAgentSystem();

      const changes = dev.getCodeChanges();

      expect(changes).toEqual([]);
    });
  });

  describe('QA Agent', () => {
    it('should return available actions', () => {
      const { qa } = createAgentSystem();

      const actions = qa.getAvailableActions();

      expect(actions).toContain('create_test_plan');
      expect(actions).toContain('execute_tests');
      expect(actions).toContain('report_bug');
    });

    it('should initialize with empty test cases', () => {
      const { qa } = createAgentSystem();

      const testCases = qa.getTestCases();

      expect(testCases).toEqual([]);
    });
  });

  describe('State Manager', () => {
    it('should create tasks', () => {
      const task = globalStateManager.createTask({
        id: 'test-task',
        title: 'Test Task',
        description: 'A test task',
        createdBy: 'pm',
      });

      expect(task.id).toBe('test-task');
      expect(task.status).toBe('pending');
    });

    it('should track agent states', () => {
      const pmState = globalStateManager.getAgentState('pm');

      expect(pmState).toBeDefined();
      expect(pmState?.isAvailable).toBe(true);
    });

    it('should update task status', () => {
      globalStateManager.createTask({
        id: 'test-task-2',
        title: 'Test Task 2',
        description: 'Another test task',
        createdBy: 'dev',
      });

      const updated = globalStateManager.updateTaskStatus('test-task-2', 'in_progress');

      expect(updated?.status).toBe('in_progress');
    });

    it('should calculate statistics', () => {
      globalStateManager.createTask({
        id: 'stats-task',
        title: 'Stats Task',
        description: 'Task for stats',
        createdBy: 'pm',
      });

      const stats = globalStateManager.getStatistics();

      expect(stats.totalTasks).toBeGreaterThan(0);
      expect(stats.byStatus.pending).toBeGreaterThan(0);
    });
  });

  describe('Event Bus', () => {
    it('should subscribe and publish events', () => {
      const events: unknown[] = [];

      globalEventBus.subscribe('test_event', (event) => {
        events.push(event);
      });

      globalEventBus.publish({
        type: 'test_event',
        source: 'orchestrator',
        data: { test: true },
        timestamp: new Date(),
      });

      expect(events.length).toBe(1);
    });

    it('should unsubscribe from events', () => {
      const events: unknown[] = [];

      const subscription = globalEventBus.subscribe('test_event_2', (event) => {
        events.push(event);
      });

      subscription.unsubscribe();

      globalEventBus.publish({
        type: 'test_event_2',
        source: 'orchestrator',
        data: { test: true },
        timestamp: new Date(),
      });

      expect(events.length).toBe(0);
    });
  });
});
