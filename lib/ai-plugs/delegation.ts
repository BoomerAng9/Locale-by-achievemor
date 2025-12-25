/**
 * AI Plug Delegation System
 * Handles autonomous task delegation to Boomer_Ang and other agents
 * Tracks delegation status, thinking processes, and task completion
 */

import { AIPlug, AIPlugExecution, AIPlugMessage } from './registry';

export interface DelegationRequest {
  id: string;
  executionId: string;
  plugId: string;
  userId: string;
  taskDescription: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  requiredCapabilities: string[];
  delegatedTo: 'boomer-ang' | 'research-agent' | 'content-agent' | 'automation-agent';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'failed';
  delegationReason: string;
  thinkingProcess: string[];
  estimatedTime: number; // in seconds
  deadline?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface ThinkingStep {
  stepNumber: number;
  thought: string;
  decision: string;
  reasoning: string;
  timestamp: string;
}

export class DelegationManager {
  private delegationRequests: Map<string, DelegationRequest> = new Map();
  private thinkingLogs: Map<string, ThinkingStep[]> = new Map();
  private delegationCallbacks: Map<string, (result: any) => void> = new Map();

  /**
   * Create a delegation request for complex tasks
   */
  createDelegationRequest(
    execution: AIPlugExecution,
    plug: AIPlug,
    reason: string,
    estimatedTime: number = 300
  ): DelegationRequest {
    const delegationRequest: DelegationRequest = {
      id: `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executionId: execution.id,
      plugId: plug.id,
      userId: execution.userId,
      taskDescription: `Execute AI Plug: ${plug.name}`,
      complexity: this.calculateTaskComplexity(plug),
      requiredCapabilities: plug.iiAgentCapabilities as string[],
      delegatedTo: this.selectDelegationTarget(plug),
      status: 'pending',
      delegationReason: reason,
      thinkingProcess: [],
      estimatedTime,
      createdAt: new Date().toISOString()
    };

    this.delegationRequests.set(delegationRequest.id, delegationRequest);
    this.thinkingLogs.set(delegationRequest.id, []);

    return delegationRequest;
  }

  /**
   * Add a thinking step to the delegation process
   */
  addThinkingStep(
    delegationId: string,
    thought: string,
    decision: string,
    reasoning: string
  ): ThinkingStep {
    const step: ThinkingStep = {
      stepNumber: (this.thinkingLogs.get(delegationId)?.length || 0) + 1,
      thought,
      decision,
      reasoning,
      timestamp: new Date().toISOString()
    };

    const logs = this.thinkingLogs.get(delegationId) || [];
    logs.push(step);
    this.thinkingLogs.set(delegationId, logs);

    return step;
  }

  /**
   * Accept a delegation request (simulating agent acceptance)
   */
  acceptDelegation(delegationId: string): void {
    const request = this.delegationRequests.get(delegationId);
    if (!request) {
      throw new Error(`Delegation ${delegationId} not found`);
    }

    request.status = 'accepted';
    request.acceptedAt = new Date().toISOString();

    // Log acceptance
    this.addThinkingStep(
      delegationId,
      `Task accepted by ${request.delegatedTo}`,
      'ACCEPT_TASK',
      `The ${request.delegatedTo} agent has accepted responsibility for: ${request.taskDescription}`
    );
  }

  /**
   * Update delegation status
   */
  updateDelegationStatus(delegationId: string, status: DelegationRequest['status']): void {
    const request = this.delegationRequests.get(delegationId);
    if (!request) {
      throw new Error(`Delegation ${delegationId} not found`);
    }

    request.status = status;

    if (status === 'completed' && !request.completedAt) {
      request.completedAt = new Date().toISOString();
    }
  }

  /**
   * Complete a delegation with result
   */
  completeDelegation(delegationId: string, result: any): void {
    const request = this.delegationRequests.get(delegationId);
    if (!request) {
      throw new Error(`Delegation ${delegationId} not found`);
    }

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    request.result = result;

    // Trigger callback if registered
    const callback = this.delegationCallbacks.get(delegationId);
    if (callback) {
      callback(result);
    }
  }

  /**
   * Fail a delegation with error
   */
  failDelegation(delegationId: string, error: string): void {
    const request = this.delegationRequests.get(delegationId);
    if (!request) {
      throw new Error(`Delegation ${delegationId} not found`);
    }

    request.status = 'failed';
    request.completedAt = new Date().toISOString();
    request.error = error;

    // Trigger callback if registered
    const callback = this.delegationCallbacks.get(delegationId);
    if (callback) {
      callback({ error });
    }
  }

  /**
   * Register a callback for delegation completion
   */
  onDelegationComplete(delegationId: string, callback: (result: any) => void): void {
    this.delegationCallbacks.set(delegationId, callback);
  }

  /**
   * Get delegation request by ID
   */
  getDelegationRequest(delegationId: string): DelegationRequest | undefined {
    return this.delegationRequests.get(delegationId);
  }

  /**
   * Get all thinking steps for a delegation
   */
  getThinkingSteps(delegationId: string): ThinkingStep[] {
    return this.thinkingLogs.get(delegationId) || [];
  }

  /**
   * Get all active delegations for a user
   */
  getActiveDelegations(userId: string): DelegationRequest[] {
    return Array.from(this.delegationRequests.values())
      .filter(req => req.userId === userId && req.status !== 'completed' && req.status !== 'failed');
  }

  /**
   * Get all delegations for a plug
   */
  getPlugDelegations(plugId: string): DelegationRequest[] {
    return Array.from(this.delegationRequests.values())
      .filter(req => req.plugId === plugId);
  }

  /**
   * Calculate task complexity based on plug characteristics
   */
  private calculateTaskComplexity(plug: AIPlug): 'low' | 'medium' | 'high' | 'critical' {
    const capabilities = plug.iiAgentCapabilities?.length || 0;
    const dependencies = plug.dependencies?.length || 0;

    if (capabilities > 5 && dependencies > 2) return 'critical';
    if (capabilities > 4 || dependencies > 1) return 'high';
    if (capabilities > 2) return 'medium';
    return 'low';
  }

  /**
   * Select the best delegation target based on plug requirements
   */
  private selectDelegationTarget(
    plug: AIPlug
  ): 'boomer-ang' | 'research-agent' | 'content-agent' | 'automation-agent' {
    const capabilities = plug.iiAgentCapabilities || [];

    // Route to appropriate agent based on capabilities
    if (capabilities.includes('deep-research') || capabilities.includes('web-search')) {
      return 'research-agent';
    }

    if (capabilities.includes('content-generation') || capabilities.includes('code-synthesis')) {
      return 'content-agent';
    }

    if (
      capabilities.includes('workflow-automation') ||
      capabilities.includes('script-generation') ||
      capabilities.includes('browser-automation')
    ) {
      return 'automation-agent';
    }

    // Default to Boomer_Ang for complex or mixed tasks
    return 'boomer-ang';
  }

  /**
   * Get delegation statistics
   */
  getStatistics(): {
    totalDelegations: number;
    completed: number;
    failed: number;
    pending: number;
    inProgress: number;
    averageCompletionTime: number;
  } {
    const requests = Array.from(this.delegationRequests.values());

    const completed = requests.filter(r => r.status === 'completed').length;
    const failed = requests.filter(r => r.status === 'failed').length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const inProgress = requests.filter(r => r.status === 'in-progress').length;

    const completedRequests = requests.filter(r => r.status === 'completed');
    const avgTime = completedRequests.length
      ? completedRequests.reduce((acc, r) => {
          if (r.acceptedAt && r.completedAt) {
            const time = new Date(r.completedAt).getTime() - new Date(r.acceptedAt).getTime();
            return acc + time;
          }
          return acc;
        }, 0) / completedRequests.length
      : 0;

    return {
      totalDelegations: requests.length,
      completed,
      failed,
      pending,
      inProgress,
      averageCompletionTime: Math.round(avgTime / 1000) // in seconds
    };
  }
}

// Export singleton instance
export const delegationManager = new DelegationManager();
