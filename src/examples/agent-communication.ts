/**
 * Agent Communication Demo
 *
 * Demonstrates how agents communicate with each other
 * through the event bus and message system.
 */

import {
  createAgentSystem,
  resetGlobalState,
  globalEventBus,
} from '../index.js';
import type { AgentEvent } from '../types/agent.js';

async function main() {
  console.log('=== Agent Communication Demo ===\n');

  resetGlobalState();

  // Set up event logging before creating agents
  console.log('1. Setting up event listeners...\n');

  const eventLog: string[] = [];

  // Log all events
  globalEventBus.subscribe('pm_task_completed', (event: AgentEvent) => {
    eventLog.push(`[PM] Task completed: ${JSON.stringify(event.data)}`);
  });

  globalEventBus.subscribe('dev_task_completed', (event: AgentEvent) => {
    eventLog.push(`[DEV] Task completed: ${JSON.stringify(event.data)}`);
  });

  globalEventBus.subscribe('qa_task_completed', (event: AgentEvent) => {
    eventLog.push(`[QA] Task completed: ${JSON.stringify(event.data)}`);
  });

  globalEventBus.subscribe('broadcast_message', (event: AgentEvent) => {
    eventLog.push(`[BROADCAST] from ${event.source}: ${JSON.stringify(event.data)}`);
  });

  // Create agents
  const { orchestrator, pm, dev, qa } = createAgentSystem();
  console.log('   Agents created and listening.\n');

  // ============ Direct Message Demo ============
  console.log('2. DIRECT MESSAGING');
  console.log('   Agents can send messages directly to other agents.\n');

  // PM sends a task to Dev
  console.log('   PM -> Dev: Sending implementation request...');

  // Create a sample task through the orchestrator
  const workflow = await orchestrator.startFeature(
    'Search Feature',
    'Add search functionality to the application',
    { priority: 'high', mode: 'async' }
  );

  // Wait for initial message propagation
  await sleep(50);

  console.log(`   Workflow ${workflow.id} started`);
  console.log(`   Current stage: ${workflow.currentStage}\n`);

  // ============ Broadcast Demo ============
  console.log('3. BROADCAST MESSAGING');
  console.log('   Agents can broadcast to all other agents.\n');

  // Simulate a broadcast event
  globalEventBus.publish({
    type: 'broadcast_message',
    source: 'orchestrator',
    data: {
      type: 'announcement',
      message: 'Sprint planning meeting at 2pm',
    },
    timestamp: new Date(),
  });

  await sleep(10);
  console.log('   Orchestrator broadcast: Sprint planning announcement\n');

  // ============ Sync Request Demo ============
  console.log('4. SYNCHRONOUS REQUEST/RESPONSE');
  console.log('   Agents can make sync requests and wait for responses.\n');

  // This would normally be done through the agent's sendSyncRequest method
  // For demo purposes, we'll show the concept

  console.log('   PM requests task estimation from Dev...');
  console.log('   (Sync requests block until response is received)\n');

  // ============ Event History ============
  console.log('5. EVENT FLOW VISUALIZATION\n');

  console.log('   Typical feature development flow:');
  console.log('   ');
  console.log('   ┌─────────────┐');
  console.log('   │ Orchestrator │');
  console.log('   └──────┬──────┘');
  console.log('          │ start_workflow');
  console.log('          ▼');
  console.log('   ┌─────────────┐');
  console.log('   │     PM      │ ─── create_user_story ───┐');
  console.log('   └──────┬──────┘                          │');
  console.log('          │ task_assignment                 │');
  console.log('          ▼                                 │');
  console.log('   ┌─────────────┐                          │');
  console.log('   │     Dev     │ ◄────────────────────────┘');
  console.log('   └──────┬──────┘');
  console.log('          │ review_request');
  console.log('          ▼');
  console.log('   ┌─────────────┐');
  console.log('   │     QA      │ ─── test_results ───┐');
  console.log('   └──────┬──────┘                     │');
  console.log('          │                            │');
  console.log('          └────────────────────────────┘');
  console.log('                     │');
  console.log('                     ▼');
  console.log('              [Workflow Complete]');
  console.log('   ');

  // ============ Message Types ============
  console.log('6. SUPPORTED MESSAGE TYPES\n');

  const messageTypes = [
    { type: 'task_assignment', desc: 'Assign a task to an agent' },
    { type: 'task_update', desc: 'Update task status or details' },
    { type: 'task_complete', desc: 'Notify task completion' },
    { type: 'task_blocked', desc: 'Report a blocked task' },
    { type: 'review_request', desc: 'Request review from another agent' },
    { type: 'review_result', desc: 'Send review results' },
    { type: 'query', desc: 'Query information from agent' },
    { type: 'response', desc: 'Response to a query' },
    { type: 'status_update', desc: 'General status update' },
    { type: 'sync_request', desc: 'Synchronous request (blocking)' },
    { type: 'sync_response', desc: 'Response to sync request' },
  ];

  messageTypes.forEach(({ type, desc }) => {
    console.log(`   ${type.padEnd(20)} - ${desc}`);
  });

  console.log('\n7. RECORDED EVENTS\n');

  if (eventLog.length > 0) {
    eventLog.forEach((log) => console.log(`   ${log}`));
  } else {
    console.log('   (Events are processed asynchronously)');
  }

  console.log('\n=== Demo Complete ===');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
