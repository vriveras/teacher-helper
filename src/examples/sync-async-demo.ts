/**
 * Sync vs Async Execution Demo
 *
 * Demonstrates the difference between synchronous and asynchronous
 * task execution modes in the agent system.
 */

import {
  createAgentSystem,
  resetGlobalState,
  globalTaskQueue,
  globalStateManager,
} from '../index.js';
import type { Task, ExecutionMode } from '../types/agent.js';

async function main() {
  console.log('=== Sync vs Async Execution Demo ===\n');

  resetGlobalState();
  const { orchestrator, pm, dev, qa } = createAgentSystem();

  // ============ Synchronous Execution ============
  console.log('1. SYNCHRONOUS EXECUTION');
  console.log('   Tasks execute one after another, blocking until complete.\n');

  const syncTask1 = createDemoTask('Sync Task 1', 'sync');
  const syncTask2 = createDemoTask('Sync Task 2', 'sync');

  console.log('   Starting sync tasks...');
  const syncStart = Date.now();

  // These will execute sequentially
  await Promise.all([
    globalTaskQueue.enqueue(syncTask1, () => simulateWork(100), 'sync'),
    globalTaskQueue.enqueue(syncTask2, () => simulateWork(100), 'sync'),
  ]);

  console.log(`   Sync tasks completed in ${Date.now() - syncStart}ms`);
  console.log('   (Tasks ran sequentially)\n');

  // ============ Asynchronous Execution ============
  console.log('2. ASYNCHRONOUS EXECUTION');
  console.log('   Tasks execute concurrently, up to the concurrency limit.\n');

  const asyncTask1 = createDemoTask('Async Task 1', 'async');
  const asyncTask2 = createDemoTask('Async Task 2', 'async');
  const asyncTask3 = createDemoTask('Async Task 3', 'async');

  console.log('   Starting async tasks...');
  const asyncStart = Date.now();

  // These will execute concurrently
  await Promise.all([
    globalTaskQueue.enqueue(asyncTask1, () => simulateWork(100), 'async'),
    globalTaskQueue.enqueue(asyncTask2, () => simulateWork(100), 'async'),
    globalTaskQueue.enqueue(asyncTask3, () => simulateWork(100), 'async'),
  ]);

  console.log(`   Async tasks completed in ${Date.now() - asyncStart}ms`);
  console.log('   (Tasks ran concurrently)\n');

  // ============ Mixed Mode Workflow ============
  console.log('3. MIXED MODE WORKFLOW');
  console.log('   Real-world workflows often mix sync and async tasks.\n');

  console.log('   Creating workflow with dependencies...');

  // Phase 1: Planning (sync - must complete before implementation)
  const planningTask = globalStateManager.createTask({
    id: 'planning-1',
    title: 'Planning Phase',
    description: 'Create requirements',
    createdBy: 'pm',
    priority: 'high',
    executionMode: 'sync',
  });

  // Phase 2: Implementation (async - can run in parallel)
  const implTask1 = globalStateManager.createTask({
    id: 'impl-1',
    title: 'Implement Component A',
    description: 'Build component A',
    createdBy: 'dev',
    dependencies: ['planning-1'],
    executionMode: 'async',
  });

  const implTask2 = globalStateManager.createTask({
    id: 'impl-2',
    title: 'Implement Component B',
    description: 'Build component B',
    createdBy: 'dev',
    dependencies: ['planning-1'],
    executionMode: 'async',
  });

  // Phase 3: Testing (sync - must wait for all implementations)
  const testTask = globalStateManager.createTask({
    id: 'test-1',
    title: 'Integration Testing',
    description: 'Test all components',
    createdBy: 'qa',
    dependencies: ['impl-1', 'impl-2'],
    executionMode: 'sync',
  });

  console.log('   Task dependency graph:');
  console.log('   ');
  console.log('   [Planning] ─┬─> [Component A] ─┬─> [Testing]');
  console.log('               └─> [Component B] ─┘');
  console.log('   ');

  // Execute the workflow
  const workflowStart = Date.now();

  // Phase 1: Planning (sync)
  console.log('   Executing planning phase (sync)...');
  globalStateManager.updateTaskStatus('planning-1', 'in_progress');
  await simulateWork(50);
  globalStateManager.updateTaskStatus('planning-1', 'completed');
  console.log('   Planning complete.\n');

  // Phase 2: Implementation (async, parallel)
  console.log('   Executing implementation phase (async, parallel)...');
  globalStateManager.updateTaskStatus('impl-1', 'in_progress');
  globalStateManager.updateTaskStatus('impl-2', 'in_progress');

  await Promise.all([
    simulateWork(75).then(() => {
      globalStateManager.updateTaskStatus('impl-1', 'completed');
      console.log('   Component A complete.');
    }),
    simulateWork(75).then(() => {
      globalStateManager.updateTaskStatus('impl-2', 'completed');
      console.log('   Component B complete.');
    }),
  ]);

  // Phase 3: Testing (sync)
  console.log('\n   Executing testing phase (sync)...');
  globalStateManager.updateTaskStatus('test-1', 'in_progress');
  await simulateWork(50);
  globalStateManager.updateTaskStatus('test-1', 'completed');
  console.log('   Testing complete.');

  console.log(`\n   Total workflow time: ${Date.now() - workflowStart}ms`);
  console.log('   (Planning + max(Impl A, Impl B) + Testing)\n');

  // ============ Queue Status ============
  console.log('4. QUEUE STATUS');
  const queueStatus = globalTaskQueue.getStatus();
  console.log(`   Sync pending: ${queueStatus.syncPending}`);
  console.log(`   Async pending: ${queueStatus.asyncPending}`);
  console.log(`   Running: ${queueStatus.running}\n`);

  console.log('=== Demo Complete ===');
}

function createDemoTask(title: string, mode: ExecutionMode): Task {
  return {
    id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title,
    description: `Demo task: ${title}`,
    status: 'pending',
    priority: 'medium',
    assignedTo: null,
    createdBy: 'orchestrator',
    createdAt: new Date(),
    updatedAt: new Date(),
    dependencies: [],
    subtasks: [],
    parentTaskId: null,
    metadata: {},
    executionMode: mode,
  };
}

function simulateWork(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
