/**
 * Multi-Role Agent System
 *
 * A coordinated agent system with PM, Dev, QA roles and an Orchestrator
 * for managing software development workflows.
 */

export * from './types/index.js';
export * from './core/index.js';
export * from './agents/index.js';

// Re-export main classes for convenience
import { Orchestrator } from './agents/orchestrator.js';
import { PMAgent } from './agents/pm-agent.js';
import { DevAgent } from './agents/dev-agent.js';
import { QAAgent } from './agents/qa-agent.js';
import { globalEventBus } from './core/event-bus.js';
import { globalStateManager } from './core/state-manager.js';
import { globalTaskQueue } from './core/task-queue.js';

export interface AgentSystem {
  orchestrator: Orchestrator;
  pm: PMAgent;
  dev: DevAgent;
  qa: QAAgent;
}

/**
 * Create and initialize the complete agent system
 */
export function createAgentSystem(): AgentSystem {
  // Create agents - they automatically register with the global event bus
  const orchestrator = new Orchestrator();
  const pm = new PMAgent();
  const dev = new DevAgent();
  const qa = new QAAgent();

  return {
    orchestrator,
    pm,
    dev,
    qa,
  };
}

/**
 * Reset the global state (useful for testing)
 */
export function resetGlobalState(): void {
  globalEventBus.clear();
  globalStateManager.clear();
  globalTaskQueue.clear();
}

// Default export for convenience
export default createAgentSystem;

// CLI entry point when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Multi-Role Agent System');
  console.log('=======================\n');

  const system = createAgentSystem();

  console.log('Agents initialized:');
  console.log('  - Orchestrator');
  console.log('  - PM (Product Manager)');
  console.log('  - Dev (Developer)');
  console.log('  - QA (Quality Assurance)');
  console.log('\nSystem ready for task processing.\n');

  // Example: Start a feature workflow
  console.log('Starting example feature workflow...\n');

  system.orchestrator
    .startFeature(
      'User Authentication',
      'Implement user login and registration with OAuth support',
      { priority: 'high', mode: 'async' }
    )
    .then((workflow) => {
      console.log(`Workflow started: ${workflow.id}`);
      console.log(`  Name: ${workflow.name}`);
      console.log(`  Current Stage: ${workflow.currentStage}`);
      console.log(`  Status: ${workflow.status}`);
    })
    .catch((error) => {
      console.error('Error starting workflow:', error);
    });
}
