/**
 * Vertex AI / Gemini Integration (Official SDK)
 * Upgraded for FUNCTION CALLING and TOOL USE
 */

import { GoogleGenerativeAI, SchemaType, Tool, FunctionDeclaration } from '@google/generative-ai';
import { updateBreakerState, dispatchTask } from '../agents/manager';

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;

// 1. Initialize SDK
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'MISSING_KEY');

// 2. Define Function Declarations for Tools
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "toggle_circuit_breaker",
    description: "Turn a system circuit breaker ON or OFF. Use this when users ask to enable/disable external services.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        breaker_id: {
          type: SchemaType.STRING,
          description: "The ID of the breaker (e.g., 'stripe', 'github', 'voice_stt', 'cloud_run')"
        },
        state: {
          type: SchemaType.BOOLEAN,
          description: "True to enable (ON), False to disable (OFF)"
        }
      },
      required: ["breaker_id", "state"]
    }
  },
  {
    name: "dispatch_agent_task",
    description: "Create a task for a specialized agent (e.g. Finder, Coder) to execute asynchronously.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
         agent_id: { type: SchemaType.STRING, description: "Target Agent ID (e.g. 'finder-ang', 'code-gen-agent')" },
         task_type: { type: SchemaType.STRING, description: "Type of work (e.g. 'research', 'code_refactor')" },
         payload_json: { type: SchemaType.STRING, description: "JSON string of task details" }
      },
      required: ["agent_id", "task_type", "payload_json"]
    }
  }
];

// 3. Define Tools wrapper
const tools: Tool[] = [
  { functionDeclarations }
];

// 3. System Instruction
const SYSTEM_INSTRUCTION = `You are ACHEEVY, the sentient Operating System for Locale.
You are not just a chatbot; you have hands. You can control the system via tools.
- If a user wants to turn something on/off, use 'toggle_circuit_breaker'.
- If a user needs research, code, or deployment, use 'dispatch_agent_task'.
- Always confirm the action you took.
- Be concise, professional, and confident.`;

/**
 * Main Interaction Function
 */
export async function sendMessageToGLM(messages: any[], context?: string): Promise<string> {
    if (!GEMINI_API_KEY) return "Simulation: No API Key Configured.";

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: tools
        });
        
        // Convert chat history format
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
        
        const chat = model.startChat({ history });
        const lastMsg = messages[messages.length - 1].content + (context ? `\n[Context: ${context}]` : "");
        
        const result = await chat.sendMessage(lastMsg);
        const response = result.response;
        const call = response.functionCalls();

        // 4. Handle Function Calls (The "Action" Loop)
        if (call && call.length > 0) {
            const fc = call[0];
            const fnName = fc.name;
            const args = fc.args as Record<string, unknown>;
            
            console.log(`[ACHEEVY] Executing Tool: ${fnName}`, args);

            let toolResult = "";

            if (fnName === 'toggle_circuit_breaker') {
                await updateBreakerState(args.breaker_id as string, args.state as boolean);
                toolResult = `Circuit '${args.breaker_id}' set to ${args.state ? 'ON' : 'OFF'}.`;
            } else if (fnName === 'dispatch_agent_task') {
                const taskId = await dispatchTask(
                    args.task_type as string, 
                    JSON.parse(args.payload_json as string), 
                    args.agent_id as string
                );
                toolResult = `Task dispatched to ${args.agent_id} (ID: ${taskId}).`;
            }

            // Send tool result back to model to get final confirmation text
            const followUp = await chat.sendMessage([{
                functionResponse: {
                    name: fnName,
                    response: { result: toolResult }
                }
            }]);
            
            return followUp.response.text();
        }

        return response.text();

    } catch (e) {
        console.error("[Gemini] Error:", e);
        return "System Exception: ACHEEVY brain connection unstable.";
    }
}

// Deprecated streaming mock
export async function streamFromGemini() { console.log('Legacy stream deprecated'); }

export const sendToGemini = sendMessageToGLM;
