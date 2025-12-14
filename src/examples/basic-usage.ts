/**
 * Basic Usage Example
 *
 * Demonstrates how to use the multi-role agent system
 */

import { createAgentSystem, resetGlobalState } from '../index.js';

async function main() {
  console.log('=== Multi-Role Agent System Demo ===\n');

  // Reset any previous state
  resetGlobalState();

  // Create the agent system
  const { orchestrator, pm, dev, qa } = createAgentSystem();

  console.log('1. Starting a feature development workflow...\n');

  // Start a feature workflow (async mode)
  const workflow = await orchestrator.startFeature(
    'Dark Mode Theme',
    'Add dark mode support with theme toggle in settings',
    { priority: 'medium', mode: 'async' }
  );

  console.log(`   Workflow ID: ${workflow.id}`);
  console.log(`   Current Stage: ${workflow.currentStage}`);
  console.log(`   Status: ${workflow.status}\n`);

  // Wait a bit for async processing
  await sleep(100);

  console.log('2. Checking system status...\n');

  const status = await orchestrator.getStatus();
  console.log('   Status:', JSON.stringify(status, null, 2).substring(0, 500) + '...\n');

  console.log('3. Starting a bug fix workflow (sync mode)...\n');

  const bugWorkflow = await orchestrator.startBugFix(
    'Login Button Not Responding',
    'Users report the login button sometimes does not trigger authentication',
    { priority: 'high', mode: 'sync' }
  );

  console.log(`   Bug Fix Workflow ID: ${bugWorkflow.id}`);
  console.log(`   Status: ${bugWorkflow.status}\n`);

  console.log('4. Querying agents directly...\n');

  // Get user stories from PM
  const stories = pm.getUserStories();
  console.log(`   PM has ${stories.length} user stories`);

  // Get code changes from Dev
  const changes = dev.getCodeChanges();
  console.log(`   Dev has ${changes.length} code changes`);

  // Get bug reports from QA
  const bugs = qa.getBugReports();
  console.log(`   QA has ${bugs.length} bug reports\n`);

  console.log('5. Getting all workflows...\n');

  const workflows = orchestrator.getWorkflows();
  workflows.forEach((w) => {
    console.log(`   - ${w.name} (${w.status}) @ ${w.currentStage}`);
  });

  console.log('\n=== Demo Complete ===');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
