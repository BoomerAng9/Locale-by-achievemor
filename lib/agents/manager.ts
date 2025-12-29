/**
 * Agent Manager - Simplified after FOSTER phase cleanup
 * Task queue and breaker state management for ACHEEVY
 */

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  payload: any;
  status: 'pending' | 'running' | 'complete' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  result?: any;
}

// In-memory task queue (simplified from legacy complex state)
const taskQueue: AgentTask[] = [];
const taskListeners: ((task: AgentTask) => void)[] = [];

// Breaker state for circuit breakers
const breakerState: Map<string, boolean> = new Map([
  ['stripe', true],
  ['github', true],
  ['voice_stt', true],
  ['cloud_run', true],
  ['llm_primary', true],
  ['llm_fallback', true]
]);

/**
 * Dispatch a task to an agent
 */
export function dispatchTask(agentId: string, type: string, payload: any): string {
  const task: AgentTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    agentId,
    type,
    payload,
    status: 'pending',
    createdAt: new Date()
  };
  
  taskQueue.push(task);
  
  // Notify listeners
  taskListeners.forEach(listener => listener(task));
  
  console.log(`[AgentManager] Dispatched task ${task.id} to ${agentId}`);
  return task.id;
}

/**
 * Subscribe to task queue updates
 */
export function subscribeToTaskQueue(callback: (task: AgentTask) => void): () => void {
  taskListeners.push(callback);
  return () => {
    const idx = taskListeners.indexOf(callback);
    if (idx > -1) taskListeners.splice(idx, 1);
  };
}

/**
 * Update breaker state
 */
export function updateBreakerState(breakerId: string, enabled: boolean): void {
  breakerState.set(breakerId, enabled);
  console.log(`[AgentManager] Breaker ${breakerId} set to ${enabled ? 'ON' : 'OFF'}`);
}

/**
 * Get breaker state
 */
export function getBreakerState(breakerId: string): boolean {
  return breakerState.get(breakerId) ?? true;
}

/**
 * Get all tasks for an agent
 */
export function getAgentTasks(agentId: string): AgentTask[] {
  return taskQueue.filter(task => task.agentId === agentId);
}

/**
 * Get pending tasks count
 */
export function getPendingTaskCount(): number {
  return taskQueue.filter(task => task.status === 'pending').length;
}

export default {
  dispatchTask,
  subscribeToTaskQueue,
  updateBreakerState,
  getBreakerState,
  getAgentTasks,
  getPendingTaskCount
};
