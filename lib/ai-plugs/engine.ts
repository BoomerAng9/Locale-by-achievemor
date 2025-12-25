/**
 * AI Plug Execution Engine
 * Manages the lifecycle of AI Plug executions, delegation, and message queuing
 */

import { AIPlug, AIPlugExecution, AIPlugMessage, AI_PLUG_REGISTRY } from './registry';
import { callConciergeAI } from '../llm/vertexai';
import { AGENT_REGISTRY, BoomerAng } from '../agents/registry';

export class AIPlugEngine {
  private activeExecutions: Map<string, AIPlugExecution> = new Map();
  private messageQueue: AIPlugMessage[] = [];
  private delegationQueue: Map<string, AIPlugMessage[]> = new Map();
  private executionCallbacks: Map<string, (result: any) => void> = new Map();

  /**
   * Execute an AI Plug with given input
   */
  async executePlug(
    plugId: string,
    userId: string,
    input: any,
    onProgress?: (status: string) => void
  ): Promise<AIPlugExecution> {
    const plug = AI_PLUG_REGISTRY.find(p => p.id === plugId);
    if (!plug) {
      throw new Error(`AI Plug ${plugId} not found`);
    }

    // Check access level
    if (!this.checkAccessLevel(userId, plug.accessLevel)) {
      throw new Error(`Access denied for AI Plug ${plugId}`);
    }

    const execution: AIPlugExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plugId,
      userId,
      input,
      status: 'queued',
      startedAt: new Date().toISOString(),
      cost: this.calculateCost(plug, input)
    };

    this.activeExecutions.set(execution.id, execution);

    try {
      execution.status = 'running';
      onProgress?.('Starting execution...');

      // Delegate to appropriate BoomerAng based on plug category
      const result = await this.delegateToBoomerAng(plug, input, onProgress);

      execution.output = result;
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();

      // Update plug metrics
      this.updatePlugMetrics(plug, execution);

      onProgress?.('Execution completed successfully');

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date().toISOString();
      onProgress?.('Execution failed');
    }

    return execution;
  }

  /**
   * Delegate execution to appropriate BoomerAng
   */
  private async delegateToBoomerAng(
    plug: AIPlug,
    input: any,
    onProgress?: (status: string) => void
  ): Promise<any> {
    const boomerAng = this.selectBoomerAng(plug);

    if (!boomerAng) {
      // Fallback to direct execution
      return this.executePlugDirectly(plug, input, onProgress);
    }

    onProgress?.(`Delegating to ${boomerAng.name}...`);

    // Create delegation message
    const delegationMessage: AIPlugMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      plugId: plug.id,
      userId: 'system',
      content: `Execute AI Plug: ${plug.name}\nInput: ${JSON.stringify(input)}\nCategory: ${plug.category}`,
      timestamp: new Date().toISOString(),
      type: 'delegation',
      priority: 'high'
    };

    // Add to delegation queue
    if (!this.delegationQueue.has(boomerAng.id)) {
      this.delegationQueue.set(boomerAng.id, []);
    }
    this.delegationQueue.get(boomerAng.id)!.push(delegationMessage);

    // Simulate delegation processing (in real implementation, this would be async)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = this.executePlugDirectly(plug, input, onProgress);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 2000); // Simulate processing time
    });
  }

  /**
   * Select appropriate BoomerAng for plug execution
   */
  private selectBoomerAng(plug: AIPlug): BoomerAng | null {
    // Map plug categories to BoomerAng roles
    const categoryToRole: Record<string, string> = {
      'content-creation': 'maker',
      'legal-compliance': 'debugger',
      'ecommerce-retail': 'maker',
      'marketing-seo': 'finder',
      'voice-chatbots': 'orchestrator',
      'education-training': 'maker',
      'healthcare-wellness': 'finder',
      'finance-accounting': 'debugger',
      'real-estate': 'finder',
      'hr-recruiting': 'orchestrator',
      'creative-media': 'visualizer',
      'operations-workflow': 'orchestrator'
    };

    const requiredRole = categoryToRole[plug.category];
    if (!requiredRole) return null;

    return AGENT_REGISTRY.find(agent =>
      agent.role === requiredRole &&
      agent.status === 'active'
    ) || null;
  }

  /**
   * Execute plug directly using AI
   */
  private async executePlugDirectly(
    plug: AIPlug,
    input: any,
    onProgress?: (status: string) => void
  ): Promise<any> {
    onProgress?.('Processing with AI...');

    const prompt = this.buildExecutionPrompt(plug, input);

    try {
      const response = await callConciergeAI({
        query: prompt,
        context: {
          plug_id: plug.id,
          plug_category: plug.category,
          execution_mode: 'direct'
        }
      });

      // Parse and structure the response based on plug type
      return this.parsePlugResponse(plug, response.response);

    } catch (error) {
      throw new Error(`AI execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build execution prompt for AI
   */
  private buildExecutionPrompt(plug: AIPlug, input: any): string {
    return `You are executing the AI Plug: ${plug.name}

Description: ${plug.description}
Category: ${plug.category}
Capabilities: ${plug.capabilities.join(', ')}

Input Data:
${JSON.stringify(input, null, 2)}

Please execute this AI Plug and provide a comprehensive, structured response that fulfills the plug's purpose. Format your response as valid JSON when appropriate.`;
  }

  /**
   * Parse AI response into structured output
   */
  private parsePlugResponse(plug: AIPlug, response: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(response);
    } catch {
      // Return as structured text response
      return {
        result: response,
        metadata: {
          plugId: plug.id,
          timestamp: new Date().toISOString(),
          format: 'text'
        }
      };
    }
  }

  /**
   * Check user access level for plug
   */
  private checkAccessLevel(userId: string, requiredLevel: string): boolean {
    // In a real implementation, this would check user roles from database
    // For now, allow all access
    return true;
  }

  /**
   * Calculate execution cost
   */
  private calculateCost(plug: AIPlug, input: any): number {
    const { baseCost, unit } = plug.pricing;

    switch (unit) {
      case 'per-use':
        return baseCost;
      case 'monthly':
        return baseCost; // Simplified - would track usage over time
      case 'yearly':
        return baseCost / 12; // Monthly equivalent
      default:
        return baseCost;
    }
  }

  /**
   * Update plug metrics after execution
   */
  private updatePlugMetrics(plug: AIPlug, execution: AIPlugExecution): void {
    plug.metrics.totalExecutions++;
    plug.metrics.revenueGenerated += execution.cost;

    if (execution.status === 'completed') {
      plug.metrics.successRate =
        (plug.metrics.successRate * (plug.metrics.totalExecutions - 1) + 100) / plug.metrics.totalExecutions;
    } else {
      plug.metrics.successRate =
        (plug.metrics.successRate * (plug.metrics.totalExecutions - 1)) / plug.metrics.totalExecutions;
    }

    if (execution.completedAt && execution.startedAt) {
      const duration = new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime();
      plug.metrics.avgResponseTime =
        (plug.metrics.avgResponseTime * (plug.metrics.totalExecutions - 1) + duration) / plug.metrics.totalExecutions;
    }

    plug.lastExecuted = execution.completedAt;
  }

  /**
   * Queue message for later processing
   */
  queueMessage(message: AIPlugMessage): void {
    this.messageQueue.push(message);
  }

  /**
   * Get pending messages for user
   */
  getQueuedMessages(userId: string): AIPlugMessage[] {
    return this.messageQueue.filter(msg => msg.userId === userId);
  }

  /**
   * Process queued messages
   */
  async processQueuedMessages(): Promise<void> {
    const messagesToProcess = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messagesToProcess) {
      try {
        // Process message (could trigger new executions, updates, etc.)
        console.log(`Processing queued message: ${message.content}`);
      } catch (error) {
        console.error(`Failed to process message ${message.id}:`, error);
        // Re-queue failed messages
        this.messageQueue.push(message);
      }
    }
  }

  /**
   * Get active executions for user
   */
  getActiveExecutions(userId: string): AIPlugExecution[] {
    return Array.from(this.activeExecutions.values())
      .filter(exec => exec.userId === userId && exec.status === 'running');
  }

  /**
   * Get execution history for user
   */
  getExecutionHistory(userId: string, limit = 50): AIPlugExecution[] {
    return Array.from(this.activeExecutions.values())
      .filter(exec => exec.userId === userId)
      .sort((a, b) => new Date(b.startedAt!).getTime() - new Date(a.startedAt!).getTime())
      .slice(0, limit);
  }

  /**
   * Get delegation queue for BoomerAng
   */
  getDelegationQueue(boomerAngId: string): AIPlugMessage[] {
    return this.delegationQueue.get(boomerAngId) || [];
  }

  /**
   * Clear delegation queue for BoomerAng
   */
  clearDelegationQueue(boomerAngId: string): void {
    this.delegationQueue.delete(boomerAngId);
  }
}

// Singleton instance
export const aiPlugEngine = new AIPlugEngine();