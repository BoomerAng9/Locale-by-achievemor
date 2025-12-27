/**
 * useIIAgent - React hook for II-Agent integration
 * 
 * Provides real-time agent execution with thinking visualization
 */

import { useState, useCallback, useRef } from 'react';
import { 
  executeAgentTask, 
  researchTopic, 
  executeCode,
  ThinkingStep, 
  AgentTask,
  IIAgentConfig 
} from './IIAgentBridge';

export interface UseIIAgentReturn {
  // State
  isRunning: boolean;
  currentTask: AgentTask | null;
  thinkingSteps: ThinkingStep[];
  error: string | null;
  
  // Actions
  runTask: (prompt: string, config?: Partial<IIAgentConfig>) => Promise<AgentTask>;
  research: (query: string) => Promise<void>;
  generateCode: (task: string, language?: 'python' | 'javascript' | 'typescript') => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export function useIIAgent(): UseIIAgentReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState<AgentTask | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const abortRef = useRef(false);
  
  const handleThinkingStep = useCallback((step: ThinkingStep) => {
    if (abortRef.current) return;
    setThinkingSteps(prev => [...prev, step]);
  }, []);
  
  const runTask = useCallback(async (
    prompt: string, 
    config?: Partial<IIAgentConfig>
  ): Promise<AgentTask> => {
    setIsRunning(true);
    setError(null);
    setThinkingSteps([]);
    abortRef.current = false;
    
    try {
      const task = await executeAgentTask(prompt, config, handleThinkingStep);
      
      if (!abortRef.current) {
        setCurrentTask(task);
        
        if (task.status === 'failed') {
          setError(task.result || 'Task failed');
        }
      }
      
      return task;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, [handleThinkingStep]);
  
  const research = useCallback(async (query: string) => {
    setIsRunning(true);
    setError(null);
    
    // Add initial thinking step
    handleThinkingStep({
      id: crypto.randomUUID(),
      type: 'researching',
      content: `Initiating research: "${query}"`,
      timestamp: new Date(),
      toolUsed: 'ii-researcher',
    });
    
    try {
      const result = await researchTopic(query, { depth: 'deep' });
      
      handleThinkingStep({
        id: crypto.randomUUID(),
        type: 'complete',
        content: `Found ${result.sources.length} sources. Summary: ${result.summary.slice(0, 200)}...`,
        timestamp: new Date(),
      });
      
      setCurrentTask({
        id: crypto.randomUUID(),
        prompt: query,
        status: 'completed',
        thinkingSteps: [],
        result: JSON.stringify(result, null, 2),
        agentType: 'researcher',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Research failed';
      setError(message);
    } finally {
      setIsRunning(false);
    }
  }, [handleThinkingStep]);
  
  const generateCode = useCallback(async (
    task: string, 
    language: 'python' | 'javascript' | 'typescript' = 'python'
  ) => {
    setIsRunning(true);
    setError(null);
    
    handleThinkingStep({
      id: crypto.randomUUID(),
      type: 'coding',
      content: `Generating ${language} code for: "${task}"`,
      timestamp: new Date(),
      toolUsed: 'code_interpreter',
    });
    
    try {
      const result = await executeCode(task, language);
      
      handleThinkingStep({
        id: crypto.randomUUID(),
        type: 'complete',
        content: `Code generated successfully${result.output ? '. Executed with output.' : '.'}`,
        timestamp: new Date(),
      });
      
      setCurrentTask({
        id: crypto.randomUUID(),
        prompt: task,
        status: 'completed',
        thinkingSteps: [],
        result: result.code,
        agentType: 'coder',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Code generation failed';
      setError(message);
    } finally {
      setIsRunning(false);
    }
  }, [handleThinkingStep]);
  
  const cancel = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);
  
  const reset = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
    setCurrentTask(null);
    setThinkingSteps([]);
    setError(null);
  }, []);
  
  return {
    isRunning,
    currentTask,
    thinkingSteps,
    error,
    runTask,
    research,
    generateCode,
    cancel,
    reset,
  };
}

export default useIIAgent;
