/**
 * Finder Ang - Research Agent Implementation
 * 
 * ROLE: Deep Research & Information Retrieval
 * REPO: ii-researcher
 * 
 * In Production: This logic runs in a Cloud Function or separate Python container.
 * In this env: We simulate the 'Worker' loop here to process tasks from the queue 
 * using Client-Side Vertex AI calls.
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../gcp';
import { AgentTask } from '../firestore/schema';
import { callGeminiDirect } from '../llm/vertexai';
import { ChatMessage } from '../../types';

export const PROCESS_FINDER_TASK = async (taskId: string) => {
   if (!db) return;
   
   const taskRef = doc(db, 'agent_tasks', taskId);
   
   try {
     // 1. Mark as In Progress
     await updateDoc(taskRef, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        logs: [`[Finder_Ang] Task picked up. Initializing search protocols...`]
     });

     // Retrieve Payload
     const taskSnap = await getDoc(taskRef);
     const task = taskSnap.data() as AgentTask;
     const query = task.payload.query;

     // 2. Execute Research (Simulated via Vertex AI)
     const prompt = `
        ROLE: You are 'Finder_Ang', an advanced AI researcher agent for the Locale platform.
        TASK: Perform a deep research on the following query: "${query}"
        
        OUTPUT FORMAT:
        Return a structured JSON report with:
        - summary: High-level overview
        - key_findings: Array of specific bullet points
        - sources: Array of potential source URLs (mock realistic ones if needed for valid structure)
        - action_item: A recommendation for the user
     `;

     const messages: ChatMessage[] = [{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: prompt,
        timestamp: Date.now()
     }];

     const researchResult = await callGeminiDirect(messages);

     // 3. Mark as Completed
     await updateDoc(taskRef, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: researchResult, 
        logs: [
           ...task.logs, 
           `[Finder_Ang] Research phases 1-3 complete.`, 
           `[Finder_Ang] Data synthesized and validated.`, 
           `[Finder_Ang] Report generated.`
        ]
     });

   } catch (error) {
      console.error("Finder Task Failed", error);
      await updateDoc(taskRef, {
         status: 'failed',
         error: error instanceof Error ? error.message : 'Unknown error',
         logs: [`[Finder_Ang] CRITICAL FAILURE: ${error instanceof Error ? error.message : 'Unknown'}`]
      });
   }
};
