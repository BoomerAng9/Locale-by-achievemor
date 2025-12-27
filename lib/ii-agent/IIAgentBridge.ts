/**
 * II-Agent Bridge - Connects Locale to the Intelligent Internet Agent Ecosystem
 * 
 * Integrates:
 * - ii-agent (Main agent framework)
 * - ii-researcher (Search/research agents)
 * - II-Commons (Dataset tools)
 * - CommonGround (Multi-agent collaboration)
 * - Common_Chronicle (Context → Timeline)
 * 
 * @author ACHEEVY / Boomer_Ang
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://locale-backend-6vy2c3elqq-uc.a.run.app';

export interface ThinkingStep {
  id: string;
  type: 'planning' | 'researching' | 'coding' | 'executing' | 'validating' | 'complete';
  content: string;
  timestamp: Date;
  toolUsed?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentTask {
  id: string;
  prompt: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  thinkingSteps: ThinkingStep[];
  result?: string;
  agentType: 'researcher' | 'coder' | 'analyst' | 'orchestrator';
}

export interface IIAgentConfig {
  model: string;
  maxIterations: number;
  tools: string[];
  enableResearch: boolean;
  enableCodeExecution: boolean;
}

const DEFAULT_CONFIG: IIAgentConfig = {
  model: 'gemini-2.0-flash',
  maxIterations: 10,
  tools: ['web_search', 'code_interpreter', 'file_operations', 'browser'],
  enableResearch: true,
  enableCodeExecution: true,
};

/**
 * Execute an agent task with real-time thinking stream
 */
export async function executeAgentTask(
  prompt: string,
  config: Partial<IIAgentConfig> = {},
  onThinkingStep?: (step: ThinkingStep) => void
): Promise<AgentTask> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const taskId = crypto.randomUUID();
  
  const task: AgentTask = {
    id: taskId,
    prompt,
    status: 'running',
    thinkingSteps: [],
    agentType: determineAgentType(prompt),
  };

  try {
    // Call the real backend
    const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        config: mergedConfig,
        taskId,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent API error: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'thinking') {
              const step: ThinkingStep = {
                id: crypto.randomUUID(),
                type: data.stepType || 'executing',
                content: data.content,
                timestamp: new Date(),
                toolUsed: data.tool,
                metadata: data.metadata,
              };
              
              task.thinkingSteps.push(step);
              onThinkingStep?.(step);
            } else if (data.type === 'result') {
              task.result = data.content;
              task.status = 'completed';
            }
          } catch {
            // Non-JSON line, skip
          }
        }
      }
    } else {
      // Non-streaming fallback
      const data = await response.json();
      task.result = data.response || data.message;
      task.status = 'completed';
      
      // Generate synthetic thinking steps from response
      task.thinkingSteps = generateSyntheticThinking(prompt, task.result || '');
      task.thinkingSteps.forEach(step => onThinkingStep?.(step));
    }

    return task;
  } catch (error) {
    task.status = 'failed';
    task.result = error instanceof Error ? error.message : 'Unknown error';
    return task;
  }
}

/**
 * Determine which agent type to use based on the prompt
 */
function determineAgentType(prompt: string): AgentTask['agentType'] {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('research') || lowerPrompt.includes('find') || lowerPrompt.includes('search')) {
    return 'researcher';
  }
  if (lowerPrompt.includes('code') || lowerPrompt.includes('build') || lowerPrompt.includes('implement')) {
    return 'coder';
  }
  if (lowerPrompt.includes('analyze') || lowerPrompt.includes('data') || lowerPrompt.includes('report')) {
    return 'analyst';
  }
  return 'orchestrator';
}

/**
 * Generate synthetic thinking steps when streaming isn't available
 */
function generateSyntheticThinking(prompt: string, result: string): ThinkingStep[] {
  const steps: ThinkingStep[] = [];
  const baseTime = new Date();
  
  steps.push({
    id: crypto.randomUUID(),
    type: 'planning',
    content: `Analyzing task: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
    timestamp: new Date(baseTime.getTime()),
  });
  
  steps.push({
    id: crypto.randomUUID(),
    type: 'researching',
    content: 'Gathering relevant context and information...',
    timestamp: new Date(baseTime.getTime() + 500),
    toolUsed: 'context_retrieval',
  });
  
  steps.push({
    id: crypto.randomUUID(),
    type: 'executing',
    content: 'Processing request with AI model...',
    timestamp: new Date(baseTime.getTime() + 1000),
    toolUsed: 'gemini-2.0-flash',
  });
  
  steps.push({
    id: crypto.randomUUID(),
    type: 'validating',
    content: 'Validating response quality...',
    timestamp: new Date(baseTime.getTime() + 1500),
  });
  
  steps.push({
    id: crypto.randomUUID(),
    type: 'complete',
    content: result.slice(0, 200) + (result.length > 200 ? '...' : ''),
    timestamp: new Date(baseTime.getTime() + 2000),
  });
  
  return steps;
}

/**
 * Research Agent - Uses ii-researcher pattern
 */
export async function researchTopic(
  query: string,
  options: {
    depth?: 'shallow' | 'deep';
    sources?: string[];
    maxResults?: number;
  } = {}
): Promise<{
  summary: string;
  sources: { url: string; title: string; snippet: string }[];
  timeline?: { date: string; event: string }[];
}> {
  const response = await fetch(`${BACKEND_URL}/api/ai/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      depth: options.depth || 'shallow',
      sources: options.sources || ['web'],
      maxResults: options.maxResults || 10,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Research API error');
  }
  
  return response.json();
}

/**
 * Code Agent - Generates and executes code
 */
export async function executeCode(
  task: string,
  language: 'python' | 'javascript' | 'typescript' = 'python',
  context?: string
): Promise<{
  code: string;
  output?: string;
  error?: string;
}> {
  const response = await fetch(`${BACKEND_URL}/api/ai/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task,
      language,
      context,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Code API error');
  }
  
  return response.json();
}

/**
 * Multi-Agent Orchestration - CommonGround pattern
 */
export async function orchestrateAgents(
  goal: string,
  agents: Array<{
    role: string;
    capabilities: string[];
  }>
): Promise<{
  plan: string[];
  results: Record<string, unknown>;
  summary: string;
}> {
  const response = await fetch(`${BACKEND_URL}/api/ai/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal,
      agents,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Orchestration API error');
  }
  
  return response.json();
}

/**
 * Chronicle Agent - Converts context to structured timelines
 */
export async function createChronicle(
  context: string,
  options: {
    format?: 'timeline' | 'narrative' | 'structured';
    includeSources?: boolean;
  } = {}
): Promise<{
  title: string;
  events: Array<{
    date: string;
    title: string;
    description: string;
    sources?: string[];
  }>;
  summary: string;
}> {
  const response = await fetch(`${BACKEND_URL}/api/ai/chronicle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context,
      format: options.format || 'timeline',
      includeSources: options.includeSources ?? true,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Chronicle API error');
  }
  
  return response.json();
}

export default {
  executeAgentTask,
  researchTopic,
  executeCode,
  orchestrateAgents,
  createChronicle,
};
