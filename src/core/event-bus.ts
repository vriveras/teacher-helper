/**
 * Event Bus for async inter-agent communication
 */

import type { AgentEvent, AgentRole, EventHandler, EventSubscription } from '../types/agent.js';

export class EventBus {
  private subscribers: Map<string, Set<EventHandler>> = new Map();
  private eventQueue: AgentEvent[] = [];
  private isProcessing = false;

  /**
   * Subscribe to events of a specific type
   */
  subscribe(eventType: string, handler: EventHandler): EventSubscription {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    return {
      eventType,
      handler,
      unsubscribe: () => {
        this.subscribers.get(eventType)?.delete(handler);
      },
    };
  }

  /**
   * Subscribe to all events from a specific agent role
   */
  subscribeToAgent(role: AgentRole, handler: EventHandler): EventSubscription {
    return this.subscribe(`agent:${role}`, handler);
  }

  /**
   * Publish an event synchronously
   */
  publish(event: AgentEvent): void {
    const handlers = this.subscribers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }

    // Also notify agent-specific subscribers
    const agentHandlers = this.subscribers.get(`agent:${event.source}`);
    if (agentHandlers) {
      agentHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in agent handler for ${event.source}:`, error);
        }
      });
    }
  }

  /**
   * Queue an event for async processing
   */
  enqueue(event: AgentEvent): void {
    this.eventQueue.push(event);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process queued events asynchronously
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.publishAsync(event);
    }

    this.isProcessing = false;
  }

  /**
   * Publish an event asynchronously
   */
  async publishAsync(event: AgentEvent): Promise<void> {
    const handlers = this.subscribers.get(event.type);
    if (handlers) {
      const promises = Array.from(handlers).map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in async event handler for ${event.type}:`, error);
        }
      });
      await Promise.all(promises);
    }

    // Also notify agent-specific subscribers
    const agentHandlers = this.subscribers.get(`agent:${event.source}`);
    if (agentHandlers) {
      const promises = Array.from(agentHandlers).map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in async agent handler for ${event.source}:`, error);
        }
      });
      await Promise.all(promises);
    }
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscribers.clear();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Get pending event count
   */
  getPendingCount(): number {
    return this.eventQueue.length;
  }
}

// Singleton instance for global event communication
export const globalEventBus = new EventBus();
