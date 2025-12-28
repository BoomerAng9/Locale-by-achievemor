/**
 * AI Plug Execution Engine
 * Enhanced with II-Agent capabilities for autonomous execution
 * Integrated with Locale platform for workforce networking automation
 */

import { AIPlug, AIPlugExecution, AIPlugMessage, IIAgentCapability, AI_PLUG_REGISTRY } from './registry';
import { callConciergeAI } from '../llm/vertexai';
import { AGENT_REGISTRY, BoomerAng } from '../agents/registry';
import { delegationManager, DelegationRequest } from './delegation';

export class AIPlugEngine {
  private activeExecutions: Map<string, AIPlugExecution> = new Map();
  private messageQueue: AIPlugMessage[] = [];
  private delegationQueue: Map<string, AIPlugMessage[]> = new Map();
  private executionCallbacks: Map<string, (result: any) => void> = new Map();
  private autonomousTasks: Map<string, NodeJS.Timeout> = new Map();
  private iiAgentCapabilities: Map<IIAgentCapability, boolean> = new Map();

  constructor() {
    this.initializeIIAgentCapabilities();
    this.startAutonomousTasks();
  }

  private initializeIIAgentCapabilities(): void {
    // Initialize available II-Agent capabilities
    const capabilities: IIAgentCapability[] = [
      'web-search', 'source-triangulation', 'content-generation', 'data-analysis',
      'code-synthesis', 'script-generation', 'browser-automation', 'file-management',
      'problem-decomposition', 'stepwise-reasoning', 'pdf-processing', 'image-analysis',
      'video-processing', 'deep-research', 'context-management', 'token-optimization'
    ];

    capabilities.forEach(cap => this.iiAgentCapabilities.set(cap, true));
  }

  private startAutonomousTasks(): void {
    // Start scheduled autonomous tasks
    AI_PLUG_REGISTRY.forEach(plug => {
      if (plug.autonomousTriggers) {
        plug.autonomousTriggers.forEach(trigger => {
          if (trigger.type === 'schedule' && trigger.schedule) {
            this.scheduleAutonomousTask(plug, trigger);
          }
        });
      }
    });
  }

  private scheduleAutonomousTask(plug: AIPlug, trigger: any): void {
    // Simple cron-like scheduling (in production, use a proper cron library)
    const taskId = `${plug.id}_${trigger.schedule}`;

    // For demo purposes, we'll simulate scheduling
    // In production, implement proper cron scheduling
    if (trigger.schedule === '0 9 * * 1') { // Weekly on Mondays
      const interval = 7 * 24 * 60 * 60 * 1000; // 7 days
      const timeout = setTimeout(() => {
        this.executeAutonomousPlug(plug);
        // Reschedule
        this.scheduleAutonomousTask(plug, trigger);
      }, interval);

      this.autonomousTasks.set(taskId, timeout);
    }
  }

  private async executeAutonomousPlug(plug: AIPlug): Promise<void> {
    try {
      console.log(`🤖 Executing autonomous task: ${plug.name}`);

      const execution = await this.executePlug(
        plug.id,
        'system', // System user for autonomous tasks
        { autonomous: true, timestamp: new Date().toISOString() }
      );

      console.log(`✅ Autonomous task completed: ${plug.name}`, execution);
    } catch (error) {
      console.error(`❌ Autonomous task failed: ${plug.name}`, error);
    }
  }

  /**
   * Check if II-Agent capability is available
   */
  hasCapability(capability: IIAgentCapability): boolean {
    return this.iiAgentCapabilities.get(capability) || false;
  }

  /**
   * Execute AI Plug with II-Agent enhanced capabilities
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

    // Validate II-Agent capabilities
    if (!this.validateCapabilities(plug.iiAgentCapabilities)) {
      throw new Error(`Required II-Agent capabilities not available for ${plugId}`);
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
      onProgress?.('Starting II-Agent enhanced execution...');

      // Determine if this task should be delegated
      const shouldDelegate = this.shouldDelegatePlug(plug);
      let result: any;

      if (shouldDelegate) {
        onProgress?.('Complex task detected - delegating to specialized agent...');

        // Create delegation request
        const delegation = delegationManager.createDelegationRequest(
          execution,
          plug,
          `Task requires ${plug.iiAgentCapabilities.length} capabilities: ${plug.iiAgentCapabilities.join(', ')}`,
          plug.metrics.avgResponseTime || 300
        );

        onProgress?.(`Task delegated to ${delegation.delegatedTo}...`);

        // Simulate agent acceptance
        delegationManager.acceptDelegation(delegation.id);
        delegationManager.addThinkingStep(
          delegation.id,
          `Analyzing requirements for ${plug.name}`,
          'ANALYZE',
          `Plugin requires: ${plug.iiAgentCapabilities.join(', ')}`
        );

        // Execute with delegation tracking
        result = await this.executeWithDelegation(plug, input, delegation, onProgress);

        // Mark delegation as complete
        delegationManager.completeDelegation(delegation.id, result);

      } else {
        // Execute directly with II-Agent capabilities
        result = await this.executeWithIIAgentCapabilities(plug, input, onProgress);
      }

      execution.status = 'completed';
      execution.output = result;
      execution.completedAt = new Date().toISOString();

      // Update plug metrics
      this.updatePlugMetrics(plug, execution);

      onProgress?.('Execution completed successfully');

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date().toISOString();

      onProgress?.(`Execution failed: ${execution.error}`);
    }

    return execution;
  }

  /**
   * Determine if a plug should be delegated based on complexity
   */
  private shouldDelegatePlug(plug: AIPlug): boolean {
    // Delegate if: multiple capabilities, dependencies, or marked as automatic
    const complexity = plug.iiAgentCapabilities.length + (plug.dependencies?.length || 0);
    return complexity > 3 || plug.executionMode === 'automatic';
  }

  /**
   * Execute plug with delegation tracking
   */
  private async executeWithDelegation(
    plug: AIPlug,
    input: any,
    delegation: DelegationRequest,
    onProgress?: (status: string) => void
  ): Promise<any> {
    onProgress?.(`Delegation in progress - Task ID: ${delegation.id}`);

    // Add thinking steps to show reasoning
    delegationManager.addThinkingStep(
      delegation.id,
      `Planning execution strategy for ${plug.name}`,
      'PLAN',
      `Will use capabilities: ${plug.iiAgentCapabilities.join(', ')}`
    );

    delegationManager.updateDelegationStatus(delegation.id, 'in-progress');

    onProgress?.('Executing delegated task...');

    // Execute the actual plug
    const result = await this.executePlugDirectly(plug, input, onProgress);

    delegationManager.addThinkingStep(
      delegation.id,
      `Task execution complete`,
      'COMPLETE',
      `Successfully executed ${plug.name}`
    );

    return result;
  }

  private async executeWithIIAgentCapabilities(
    plug: AIPlug,
    input: any,
    onProgress?: (status: string) => void
  ): Promise<any> {
    const capabilities = plug.iiAgentCapabilities;

    // Web search and research capabilities
    if (capabilities.includes('web-search')) {
      onProgress?.('Performing web search...');
      // Implement web search logic
    }

    if (capabilities.includes('source-triangulation')) {
      onProgress?.('Triangulating sources...');
      // Implement source validation
    }

    if (capabilities.includes('deep-research')) {
      onProgress?.('Conducting deep research...');
      // Implement comprehensive research
    }

    // Content generation capabilities
    if (capabilities.includes('content-generation')) {
      onProgress?.('Generating content...');
      const contentResult = await this.generateContent(plug, input);
      return contentResult;
    }

    // Data analysis capabilities
    if (capabilities.includes('data-analysis')) {
      onProgress?.('Analyzing data...');
      // Implement data analysis
    }

    // Code synthesis capabilities
    if (capabilities.includes('code-synthesis')) {
      onProgress?.('Synthesizing code...');
      // Implement code generation
    }

    // Problem solving capabilities
    if (capabilities.includes('problem-decomposition')) {
      onProgress?.('Decomposing problem...');
      // Implement problem decomposition
    }

    if (capabilities.includes('stepwise-reasoning')) {
      onProgress?.('Applying stepwise reasoning...');
      // Implement structured reasoning
    }

    // Default execution for plugs without specific II-Agent handling
    return await this.executeStandardPlug(plug, input);
  }

  private async generateContent(plug: AIPlug, input: any): Promise<any> {
    // Use OpenRouter/Claude for content generation
    const prompt = this.buildContentPrompt(plug, input);

    try {
      const response = await callConciergeAI({
        query: prompt,
        context: {
          current_page: 'ai-plug-execution',
          plugId: plug.id,
          capabilities: plug.capabilities,
          category: plug.category
        }
      });

      return {
        content: response.response,
        metadata: {
          plugId: plug.id,
          generatedAt: new Date().toISOString(),
          capabilities: plug.iiAgentCapabilities
        }
      };
    } catch (error) {
      throw new Error(`Content generation failed: ${error}`);
    }
  }

  private buildContentPrompt(plug: AIPlug, input: any): string {
    const basePrompts: Record<string, string> = {
      'resume-tailor-pro': `Tailor this resume for the job description. Optimize keywords, highlight relevant experience, and ensure ATS compatibility.`,
      'linkedin-optimizer': `Optimize this LinkedIn profile. Improve headline, summary, and experience descriptions for better visibility.`,
      'script-generator-ai': `Generate an engaging script for ${input.platform || 'YouTube'} about: ${input.topic}`,
      'blog-seo-rewriter': `Rewrite this blog post with improved SEO, readability, and engagement.`,
      'social-caption-generator': `Generate optimized captions for ${input.platform || 'Instagram'} with emojis and hashtags.`,
      'product-description-writer': `Write compelling product descriptions for: ${input.product}`,
      'press-release-generator': `Create a professional press release for: ${input.announcement}`,
      'email-copy-assistant': `Write high-converting email copy for: ${input.campaign}`,
      'ad-copy-creator': `Create optimized ad copy for ${input.platform} targeting: ${input.audience}`,
      'proofreading-grammar-ai': `Proofread and improve this text for grammar, style, and readability.`,
      'brand-voice-consistency': `Ensure this content matches the brand voice: ${input.brandGuidelines}`,
      'content-repurposing-engine': `Transform this content into ${input.targetFormat} format.`,
      'presentation-deck-builder': `Create a presentation structure and content for: ${input.topic}`,
      'whitepaper-ebook-generator': `Generate a comprehensive white paper on: ${input.topic}`,
      'newsletter-content-curator': `Curate newsletter content about: ${input.topic}`
    };

    return basePrompts[plug.id] || `Generate content for ${plug.name} based on: ${JSON.stringify(input)}`;
  }

  private async executeStandardPlug(plug: AIPlug, input: any): Promise<any> {
    // Fallback for plugs without specific II-Agent implementation
    const prompt = `Execute ${plug.name}: ${plug.description}\n\nInput: ${JSON.stringify(input, null, 2)}`;

    const response = await callConciergeAI({
      query: prompt,
      context: {
        current_page: 'ai-plug-execution',
        plugId: plug.id,
        capabilities: plug.capabilities
      }
    });

    return {
      result: response.response,
      metadata: {
        plugId: plug.id,
        executedAt: new Date().toISOString()
      }
    };
  }

  private validateCapabilities(capabilities: IIAgentCapability[]): boolean {
    return capabilities.every(cap => this.hasCapability(cap));
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
      agent.status === 'idle'
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
          current_page: 'ai-plug-execution',
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

  /**
   * Stop autonomous task
   */
  stopAutonomousTask(taskId: string): void {
    const timeout = this.autonomousTasks.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.autonomousTasks.delete(taskId);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Clear all autonomous tasks
    this.autonomousTasks.forEach((timeout) => clearTimeout(timeout));
    this.autonomousTasks.clear();

    // Clear executions (in production, archive instead)
    this.activeExecutions.clear();
  }
}

// Singleton instance
export const aiPlugEngine = new AIPlugEngine();