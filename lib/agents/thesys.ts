import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../gcp';
import { AgentTask } from '../firestore/schema';
import { callGeminiDirect } from '../llm/vertexai';
import { ChatMessage } from '../../types';

export const PROCESS_THESYS_TASK = async (taskId: string) => {
   if (!db) return;
   
   const taskRef = doc(db, 'agent_tasks', taskId);
   
   try {
     // 1. Mark as In Progress
     await updateDoc(taskRef, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        logs: [`[Thesys_Ang] received build request. Initiating C1 Protocol...`]
     });

     // Retrieve Payload
     const taskSnap = await getDoc(taskRef);
     const task = taskSnap.data() as AgentTask;
     const projectScope = task.payload.query;

     // 2. Generate Implementation Plan (Simulated C1 Output)
     const prompt = `
        ROLE: You are 'Thesys_Ang', the C1 Implementation Architect for Locale.
        TASK: Create a high-level Implementation Plan for: "${projectScope}"
        
        OUTPUT FORMAT:
        Return a structured JSON with:
        - project_name: Creative title
        - phases: Array of { name, duration, deliverables }
        - tech_stack: Recommended stack
        - estimated_timeline: Total weeks
     `;

      const messages: ChatMessage[] = [{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: prompt,
        timestamp: Date.now()
     }];

     // Call Gemini to generate the plan
     const planJson = await callGeminiDirect(messages);

     // 3. Mark as Completed
     await updateDoc(taskRef, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: planJson, 
        logs: [
           ...task.logs, 
           `[Thesys_Ang] Requirements analyzed.`, 
           `[Thesys_Ang] Tech stack selected.`, 
           `[Thesys_Ang] Implementation Plan generated.`
        ]
     });

   } catch (error) {
     console.error("Thesys Agent Error:", error);
     await updateDoc(taskRef, {
        status: 'failed',
        logs: [`[Thesys_Ang] CRITICAL ERROR: ${error}`]
     });
   }
};
