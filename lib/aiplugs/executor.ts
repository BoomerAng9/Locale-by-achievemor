/**
 * AI Plug Execution Engine
 * Handles the execution of AI Plugs with proper delegation and monitoring
 */

import { AIPlug, AI_PLUG_REGISTRY, getPlugById } from './registry';

export interface ExecutionTask {
  id: string;
  plugId: number;
  params: any;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  delegatedTo?: string; // Agent name like 'Boomer_Ang'
  userId: string;
  accessLevel: 'public' | 'partners' | 'ownership';
}

class AIPlugExecutor {
  private activeTasks: Map<string, ExecutionTask> = new Map();
  private taskQueue: ExecutionTask[] = [];
  private maxConcurrentTasks = 5;

  /**
   * Execute an AI Plug
   */
  async executePlug(
    plugId: number,
    params: any,
    userId: string,
    accessLevel: 'public' | 'partners' | 'ownership' = 'public'
  ): Promise<string> {
    const plug = getPlugById(plugId);
    if (!plug) {
      throw new Error(`AI Plug ${plugId} not found`);
    }

    // Check access level
    if (this.getAccessPriority(accessLevel) < this.getAccessPriority(plug.accessLevel)) {
      throw new Error(`Insufficient access level for plug ${plugId}`);
    }

    const taskId = this.generateTaskId();
    const task: ExecutionTask = {
      id: taskId,
      plugId,
      params,
      status: 'queued',
      progress: 0,
      userId,
      accessLevel,
    };

    this.taskQueue.push(task);
    this.activeTasks.set(taskId, task);

    // Start processing if under concurrency limit
    this.processQueue();

    return taskId;
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): ExecutionTask | null {
    return this.activeTasks.get(taskId) || null;
  }

  /**
   * Get all tasks for a user
   */
  getUserTasks(userId: string): ExecutionTask[] {
    return Array.from(this.activeTasks.values()).filter(task => task.userId === userId);
  }

  /**
   * Delegate task to an agent
   */
  delegateTask(taskId: string, agentName: string): boolean {
    const task = this.activeTasks.get(taskId);
    if (!task || task.status !== 'queued') {
      return false;
    }

    task.delegatedTo = agentName;
    task.status = 'running';
    task.startedAt = new Date();

    // Simulate delegation (in real implementation, this would trigger agent workflow)
    this.simulateDelegation(task);

    return true;
  }

  private async processQueue(): Promise<void> {
    const runningTasks = Array.from(this.activeTasks.values()).filter(
      task => task.status === 'running'
    ).length;

    if (runningTasks >= this.maxConcurrentTasks || this.taskQueue.length === 0) {
      return;
    }

    const task = this.taskQueue.shift()!;
    task.status = 'running';
    task.startedAt = new Date();

    // Execute the plug
    this.executeTask(task);
  }

  private async executeTask(task: ExecutionTask): Promise<void> {
    try {
      const plug = getPlugById(task.plugId)!;
      task.progress = 25;

      // Simulate thinking/progress
      await this.delay(1000);
      task.progress = 50;

      // Check if delegation is needed (for complex tasks)
      if (this.shouldDelegate(task)) {
        this.delegateTask(task.id, 'Boomer_Ang');
        return;
      }

      await this.delay(1000);
      task.progress = 75;

      // Execute the plug
      const result = await plug.execute(task.params);

      task.progress = 100;
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = new Date();
    }

    // Process next task in queue
    setTimeout(() => this.processQueue(), 100);
  }

  private shouldDelegate(task: ExecutionTask): boolean {
    // Delegate complex or high-cost tasks to Boomer_Ang
    const plug = getPlugById(task.plugId);
    if (!plug) return false;

    // Delegate if cost > $0.20 or execution time > 60 seconds
    const costThreshold = parseFloat(plug.estimatedCost.split('-')[1].replace('$', ''));
    const timeThreshold = parseInt(plug.executionTime.split('-')[1]);

    return costThreshold > 0.20 || timeThreshold > 60;
  }

  private async simulateDelegation(task: ExecutionTask): Promise<void> {
    // Simulate Boomer_Ang working on the task
    await this.delay(2000);
    task.progress = 60;

    await this.delay(2000);
    task.progress = 80;

    await this.delay(2000);
    task.progress = 100;
    task.status = 'completed';
    task.result = {
      status: 'delegated_execution',
      agent: 'Boomer_Ang',
      message: `Task completed by ${task.delegatedTo}`,
      result: 'Mock delegated result'
    };
    task.completedAt = new Date();
  }

  private getAccessPriority(level: 'public' | 'partners' | 'ownership'): number {
    switch (level) {
      case 'public': return 1;
      case 'partners': return 2;
      case 'ownership': return 3;
      default: return 0;
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const aiPlugExecutor = new AIPlugExecutor();

// Export types
export type { ExecutionTask };