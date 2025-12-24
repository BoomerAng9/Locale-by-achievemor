/**
 * Agent Manager - The Nervous System Bus
 * 
 * Handles:
 * 1. Registering Agents (Heartbeats)
 * 2. Dispatching Tasks (Queue)
 * 3. Monitoring Status
 * 
 * Production Note: This uses Firestore as the event bus.
 * Agents (Python scripts) watch the 'agent_tasks' collection.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../gcp';
import { AgentState, AgentTask } from '../firestore/schema';
import { AGENT_REGISTRY } from './registry';

// --- AGENT REGISTRATION ---

export const registerAgentHeartbeat = async (agentId: string, status: AgentState['status'] = 'active') => {
  if (!db) return; // Guard for dev/mock mode
  
  const agentRef = doc(db, 'agent_registry', agentId);
  const registryInfo = AGENT_REGISTRY.find(a => a.id === agentId);
  
  const payload: Partial<AgentState> = {
    id: agentId,
    name: registryInfo?.name || agentId,
    role: registryInfo?.role || 'maker',
    status,
    last_heartbeat: new Date().toISOString(),
    capabilities: registryInfo?.capabilities || [],
    metrics: { // Reset or update metrics (pseudo-logic)
       tasks_completed: 0, 
       uptime_seconds: 0,
       error_count: 0 
    }
  };

  try {
     // Use setDoc with merge to avoid overwriting metrics if they existed, 
     // but for "heartbeat" usually we just update timestamp.
     // For initial registration, we set everything.
     await setDoc(agentRef, payload, { merge: true });
     console.log(`[Nervous System] Heartbeat received from ${agentId}`);
  } catch (error) {
     console.error(`[Nervous System] Failed to register heartbeat for ${agentId}`, error);
  }
};

// --- TASK DISPATCH (From UI to Agent) ---

export const dispatchTask = async (
  taskType: string, 
  payload: any, 
  targetAgentId?: string, 
  priority: AgentTask['priority'] = 'medium'
): Promise<string> => {
   if (!db) throw new Error("Database not connected");

   const taskData: Partial<AgentTask> = {
      type: taskType,
      target_agent_id: targetAgentId || null,
      status: 'queued',
      priority,
      payload,
      created_by: 'user_v1', // TODO: Get actual auth ID
      created_at: new Date().toISOString(),
      logs: [`[System] Task dispatched to queue. Priority: ${priority}`]
   };

   const docRef = await addDoc(collection(db, 'agent_tasks'), taskData);
   return docRef.id;
};

// --- HOOKS FOR UI (Circuit Box) ---

export const subscribeToAgents = (callback: (agents: AgentState[]) => void) => {
   if (!db) return () => {};
   
   const q = query(collection(db, 'agent_registry'));
   
   return onSnapshot(q, (snapshot) => {
      const agents = snapshot.docs.map(d => d.data() as AgentState);
      callback(agents);
   });
};

export const subscribeToTaskQueue = (callback: (tasks: AgentTask[]) => void) => {
   if (!db) return () => {};
   
   // Get active tasks (queued or in_progress)
   const q = query(
      collection(db, 'agent_tasks'), 
      where('status', 'in', ['queued', 'in_progress']),
      orderBy('created_at', 'desc'),
      limit(20)
   );
   
   return onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AgentTask));
      // Sort in memory to be safe if index missing
      taskList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      callback(taskList);
   });
};

// --- SYSTEM BREAKERS (Circuit Box) ---

export const subscribeToBreakers = (callback: (breakers: any[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'system_breakers'));
  return onSnapshot(q, (snapshot) => {
    const breakers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(breakers);
  });
};

export const updateBreakerState = async (breakerId: string, isActive: boolean) => {
  if (!db) return;
  const ref = doc(db, 'system_breakers', breakerId);
  await setDoc(ref, { 
    id: breakerId,
    is_active: isActive, 
    last_updated: new Date().toISOString() 
  }, { merge: true });
};
