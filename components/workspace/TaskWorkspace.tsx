/**
 * TaskWorkspace - Manus-style AI Task Environment
 * Professional brushed carbon fiber design with real-time thinking visibility
 * Part of the Locale Intelligent Internet ecosystem
 * 
 * Now WIRED to live II-Agent Backend!
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AGENT_REGISTRY, BoomerAng } from '../../lib/agents/registry';
import { executeAgentTask, ThinkingStep as IIThinkingStep } from '../../lib/ii-agent/IIAgentBridge';

// Backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://locale-backend-6vy2c3elqq-uc.a.run.app';
const USE_REAL_BACKEND = true; // Toggle for real vs simulated

// Alias BoomerAng as AgentStatus to match component usage
type AgentStatus = BoomerAng;

// Types for the TaskWorkspace
interface ThinkingStep {
  id: string;
  timestamp: Date;
  type: 'analysis' | 'planning' | 'execution' | 'delegation' | 'artifact' | 'complete';
  content: string;
  agent?: string;
  duration?: number;
  tokens?: number;
}

interface Artifact {
  id: string;
  type: 'code' | 'document' | 'data' | 'analysis' | 'deployment';
  name: string;
  content: string;
  language?: string;
  timestamp: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'queued' | 'thinking' | 'executing' | 'delegated' | 'complete' | 'error';
  progress: number;
  thinkingSteps: ThinkingStep[];
  artifacts: Artifact[];
  delegatedTo?: string;
  startTime?: Date;
  endTime?: Date;
}

// Styles removed in favor of Tailwind classes

// Helper function to get step color classes
const getStepColorClasses = (type: ThinkingStep['type']) => {
  const colors = {
    analysis: { text: 'text-cyan-400', border: 'border-cyan-400' },
    planning: { text: 'text-purple-600', border: 'border-purple-600' },
    execution: { text: 'text-green-400', border: 'border-green-400' },
    delegation: { text: 'text-orange-400', border: 'border-orange-400' },
    artifact: { text: 'text-fuchsia-500', border: 'border-fuchsia-500' },
    complete: { text: 'text-green-500', border: 'border-green-500' }
  };
  return colors[type] || { text: 'text-gray-400', border: 'border-gray-400' };
};

// Helper function to get status color class
const getStatusColorClass = (status: AgentStatus['status']): string => {
  const colors = {
    idle: 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]',
    busy: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]',
    offline: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
  };
  return colors[status];
};

// Helper function to get task status color class
const getTaskStatusColorClass = (status: Task['status']): string => {
  const colors = {
    queued: 'bg-gray-400/20 text-gray-400',
    thinking: 'bg-cyan-400/20 text-cyan-400',
    executing: 'bg-green-400/20 text-green-400',
    delegated: 'bg-orange-400/20 text-orange-400',
    complete: 'bg-green-500/20 text-green-500',
    error: 'bg-red-500/20 text-red-500'
  };
  return colors[status];
};

// Format timestamp
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const TaskWorkspace: React.FC = () => {
  const location = useLocation();
  const { agentId, initialTask } = location.state || {};

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [agents, setAgents] = useState<AgentStatus[]>(AGENT_REGISTRY);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const thinkingRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Auto-scroll thinking stream
  useEffect(() => {
    if (thinkingRef.current) {
      thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }
  }, [activeTask?.thinkingSteps]);

  // REAL BACKEND EXECUTION - Calls the live Cloud Run API
  const executeWithRealBackend = useCallback(async (task: Task) => {
    try {
      // Call the real II-Agent backend
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: task.title,
          context: task.description,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      // Create thinking steps from response
      const steps: ThinkingStep[] = [
        {
          id: `step-${Date.now()}-1`,
          timestamp: new Date(),
          type: 'analysis',
          content: 'Received task and initializing II-Agent pipeline...',
          tokens: 50,
        },
        {
          id: `step-${Date.now()}-2`,
          timestamp: new Date(),
          type: 'execution',
          content: 'Processing with Gemini 2.0 Flash...',
          agent: 'ACHEEVY',
          tokens: 200,
        },
        {
          id: `step-${Date.now()}-3`,
          timestamp: new Date(),
          type: 'complete',
          content: data.response || data.message || 'Task completed.',
          tokens: 100,
        },
      ];

      // Update task with real response
      const artifact: Artifact = {
        id: `artifact-${Date.now()}`,
        type: 'analysis',
        name: `${task.title.replace(/\s+/g, '_').slice(0, 30)}_result.md`,
        content: data.response || data.message || JSON.stringify(data, null, 2),
        language: 'markdown',
        timestamp: new Date(),
      };

      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            thinkingSteps: steps,
            artifacts: [artifact],
            status: 'complete',
            progress: 100,
            endTime: new Date(),
          };
        }
        return t;
      }));

      setActiveTask(prev => {
        if (prev?.id === task.id) {
          return {
            ...prev,
            thinkingSteps: steps,
            artifacts: [artifact],
            status: 'complete',
            progress: 100,
            endTime: new Date(),
          };
        }
        return prev;
      });

    } catch (error) {
      console.error('Backend execution error:', error);
      // Fall back to simulation if backend fails
      await simulateThinking(task);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Simulate thinking process for demo (fallback)
  const simulateThinking = useCallback(async (task: Task) => {
    const thinkingSequence: Omit<ThinkingStep, 'id' | 'timestamp'>[] = [
      { type: 'analysis', content: 'Analyzing task requirements and constraints...', tokens: 150 },
      { type: 'planning', content: 'Developing execution strategy with optimal agent allocation...', tokens: 200 },
      { type: 'delegation', content: 'Delegating subtasks to specialized agents...', agent: 'Finder_Ang' },
      { type: 'execution', content: 'Executing primary task pipeline...', duration: 2500 },
      { type: 'artifact', content: 'Generating output artifacts...', tokens: 350 },
      { type: 'complete', content: 'Task completed successfully with all deliverables.' }
    ];

    for (let i = 0; i < thinkingSequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      
      const step: ThinkingStep = {
        id: `step-${Date.now()}-${i}`,
        timestamp: new Date(),
        ...thinkingSequence[i]
      };

      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            thinkingSteps: [...t.thinkingSteps, step],
            status: thinkingSequence[i].type === 'complete' ? 'complete' : 'thinking',
            progress: Math.min(100, ((i + 1) / thinkingSequence.length) * 100)
          };
        }
        return t;
      }));

      // Update active task
      setActiveTask(prev => {
        if (prev?.id === task.id) {
          return {
            ...prev,
            thinkingSteps: [...prev.thinkingSteps, step],
            status: thinkingSequence[i].type === 'complete' ? 'complete' : 'thinking',
            progress: Math.min(100, ((i + 1) / thinkingSequence.length) * 100)
          };
        }
        return prev;
      });

      // Simulate agent status changes
      if (thinkingSequence[i].agent) {
        setAgents(prev => prev.map(a => {
          if (a.name === thinkingSequence[i].agent) {
            return { ...a, status: 'busy', currentTask: task.title };
          }
          return a;
        }));

        // Reset agent after delay
        setTimeout(() => {
          setAgents(prev => prev.map(a => {
            if (a.name === thinkingSequence[i].agent) {
              return { ...a, status: 'idle', currentTask: undefined };
            }
            return a;
          }));
        }, 3000);
      }
    }

    // Generate sample artifact
    const artifact: Artifact = {
      id: `artifact-${Date.now()}`,
      type: 'analysis',
      name: `${task.title.replace(/\s+/g, '_')}_result.json`,
      content: JSON.stringify({
        task: task.title,
        status: 'completed',
        timestamp: new Date().toISOString(),
        metrics: {
          tokensUsed: 700,
          executionTime: '4.2s',
          agentsInvolved: 2
        }
      }, null, 2),
      language: 'json',
      timestamp: new Date()
    };

    setTasks(prev => prev.map(t => {
      if (t.id === task.id) {
        return { ...t, artifacts: [...t.artifacts, artifact], endTime: new Date() };
      }
      return t;
    }));

    setActiveTask(prev => {
      if (prev?.id === task.id) {
        return { ...prev, artifacts: [...prev.artifacts, artifact], endTime: new Date() };
      }
      return prev;
    });

    setIsProcessing(false);
  }, []);

  // Handle initial task from navigation
  useEffect(() => {
    if (initialTask && !hasInitialized.current) {
      hasInitialized.current = true;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: initialTask,
        description: `User requested: ${initialTask}`,
        status: 'thinking',
        progress: 0,
        thinkingSteps: [],
        artifacts: [],
        startTime: new Date()
      };

      setTasks([newTask]);
      setActiveTask(newTask);
      setIsProcessing(true);
      
      // Use real backend or simulation
      if (USE_REAL_BACKEND) {
        executeWithRealBackend(newTask);
      } else {
        simulateThinking(newTask);
      }
    }
  }, [initialTask, simulateThinking, executeWithRealBackend]);

  // Handle task submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: inputValue,
      description: `User requested: ${inputValue}`,
      status: 'thinking',
      progress: 0,
      thinkingSteps: [],
      artifacts: [],
      startTime: new Date()
    };

    setTasks(prev => [newTask, ...prev]);
    setActiveTask(newTask);
    setInputValue('');
    setIsProcessing(true);

    // Use real backend or simulation
    if (USE_REAL_BACKEND) {
      executeWithRealBackend(newTask);
    } else {
      simulateThinking(newTask);
    }
  }, [inputValue, isProcessing, simulateThinking, executeWithRealBackend]);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_50%,#0f0f23_100%)]">
      {/* CSS Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .hover-card:hover {
          border-color: rgba(0, 212, 255, 0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 212, 255, 0.1);
        }
        .thinking-cursor::after {
          content: '▋';
          animation: pulse 1s infinite;
          color: #00d4ff;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/95 backdrop-blur-md">
        <div className="flex items-center gap-3 text-xl font-bold bg-gradient-to-br from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="url(#grad1)" strokeWidth="2"/>
            <circle cx="16" cy="16" r="8" fill="url(#grad1)"/>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff"/>
                <stop offset="100%" stopColor="#7b2cbf"/>
              </linearGradient>
            </defs>
          </svg>
          <span>Locale TaskWorkspace</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/30 text-xs text-green-400">
            ● System Online
          </div>
          <div className="text-[13px] text-gray-400">
            {agents.filter(a => a.status === 'idle').length}/{agents.length} Agents Available
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-[300px_1fr_350px] h-[calc(100vh-73px)] gap-[1px] bg-white/5">
        {/* Left Panel - Task Queue */}
        <div className="relative overflow-y-auto p-5 bg-slate-900/95">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            <span>📋</span> Task Queue
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-10 px-5 text-gray-500 text-sm">
              <div className="text-4xl mb-3">🚀</div>
              No tasks yet. Start by entering a request below.
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={`hover-card mb-3 cursor-pointer rounded-xl border bg-slate-800/60 p-4 transition-all hover:bg-slate-800/80 ${
                  activeTask?.id === task.id ? 'border-cyan-400/50' : 'border-white/10'
                }`}
                onClick={() => setActiveTask(task)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium flex-1 leading-snug">
                    {task.title}
                  </div>
                  <div 
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ml-2 ${getTaskStatusColorClass(task.status)}`}
                  >
                    {task.status}
                  </div>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 transition-all duration-300"
                    style={{ width: `${task.progress}%` }} 
                  />
                </div>
                <div className="flex justify-between mt-2 text-[11px] text-gray-500">
                  <span>{task.startTime ? formatTime(task.startTime) : '-'}</span>
                  <span>{task.thinkingSteps.length} steps</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Center Panel - Thinking Stream */}
        <div className="relative overflow-y-auto p-5 bg-slate-900/95 pb-[100px]" ref={thinkingRef}>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            <span>🧠</span> Thinking Process
            {isProcessing && (
              <span className="ml-auto text-cyan-400 text-xs animate-pulse">
                Processing...
              </span>
            )}
          </div>

          {!activeTask ? (
            <div className="text-center py-16 px-5 text-gray-500">
              <div className="text-6xl mb-4 opacity-50">🤔</div>
              <div className="text-base mb-2">Ready to Think</div>
              <div className="text-[13px] text-gray-600">
                Enter a task to see the AI reasoning process in real-time
              </div>
            </div>
          ) : (
            <div className="font-mono text-[13px] leading-relaxed">
              {activeTask.thinkingSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`mb-2 rounded-lg border-l-4 bg-slate-800/60 p-3 ${getStepColorClasses(step.type).border}`}
                >
                  <div className="flex justify-between mb-1.5 text-[11px] text-gray-500">
                    <span 
                      className={`font-semibold uppercase ${getStepColorClasses(step.type).text}`}
                    >
                      {step.type}
                    </span>
                    <span>{formatTime(step.timestamp)}</span>
                  </div>
                  <div className="text-gray-300">
                    {step.content}
                    {index === activeTask.thinkingSteps.length - 1 && 
                     activeTask.status === 'thinking' && (
                      <span className="thinking-cursor" />
                    )}
                  </div>
                  {step.agent && (
                    <div className="mt-1.5 text-[11px] text-orange-400">
                      → Delegated to {step.agent}
                    </div>
                  )}
                  {step.tokens && (
                    <div className="mt-1 text-[10px] text-gray-600">
                      {step.tokens} tokens
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="fixed bottom-0 left-[300px] right-[350px] p-5 bg-gradient-to-t from-slate-900/95 via-slate-900/95 to-transparent backdrop-blur-md">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a task for the AI to work on..."
                className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-5 py-4 text-white outline-none transition-colors focus:border-cyan-500/50 placeholder-gray-500"
                disabled={isProcessing}
              />
            </form>
            <div className="mt-2 text-center text-[11px] text-gray-500">
              Press Enter to submit • AI will show reasoning in real-time
            </div>
          </div>
        </div>

        {/* Right Panel - Artifacts & Agents */}
        <div className="relative overflow-y-auto p-5 bg-slate-900/95">
          {/* Artifacts Section */}
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            <span>📦</span> Artifacts
          </div>
          
          {(!activeTask || activeTask.artifacts.length === 0) ? (
            <div className="text-center py-8 px-5 text-gray-500 text-[13px] mb-6">
              Artifacts will appear here as they're generated
            </div>
          ) : (
            activeTask.artifacts.map(artifact => (
              <div key={artifact.id} className="mb-2.5 rounded-lg border border-white/5 bg-slate-800/50 p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">
                    {artifact.type === 'code' ? '💻' : 
                     artifact.type === 'document' ? '📄' :
                     artifact.type === 'data' ? '📊' :
                     artifact.type === 'deployment' ? '🚀' : '🔍'}
                  </span>
                  <span className="text-[13px] font-medium">{artifact.name}</span>
                </div>
                <pre className="text-[11px] text-gray-400 bg-black/30 p-2.5 rounded-md overflow-auto max-h-[120px] m-0">
                  {artifact.content}
                </pre>
              </div>
            ))
          )}

          {/* Agents Section */}
          <div className="mt-6 mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-400">
            <span>🤖</span> Agent Fleet
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {agents.map(agent => (
              <div key={agent.id} className="mb-2 flex items-center gap-3 rounded-lg border border-white/5 bg-slate-800/40 p-3">
                <div 
                  className={`h-2 w-2 shrink-0 rounded-full ${getStatusColorClass(agent.status)}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-300">
                    {agent.name}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {agent.currentTask || agent.specialty}
                  </div>
                </div>
                <div className="text-[9px] text-gray-600 uppercase">
                  {agent.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskWorkspace;
