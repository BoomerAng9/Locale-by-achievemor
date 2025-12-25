/**
 * TaskWorkspace - Manus-style AI Task Environment
 * Professional brushed carbon fiber design with real-time thinking visibility
 * Part of the Locale Intelligent Internet ecosystem
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

interface AgentStatus {
  id: string;
  name: string;
  label: string;
  status: 'idle' | 'busy' | 'offline';
  currentTask?: string;
  specialty: string;
}

// Intelligent Internet Agent Registry
const AGENT_REGISTRY: AgentStatus[] = [
  { id: 'acheevy', name: 'ACHEEVY', label: 'Core Intelligence', status: 'idle', specialty: 'Task orchestration & delegation' },
  { id: 'finder', name: 'Finder_Ang', label: 'Discovery Engine', status: 'idle', specialty: 'Search & retrieval operations' },
  { id: 'chronicle', name: 'Chronicle_Ang', label: 'Memory Keeper', status: 'idle', specialty: 'Context & history management' },
  { id: 'manus', name: 'Manus_Ang', label: 'Task Executor', status: 'idle', specialty: 'Complex task execution' },
  { id: 'codex', name: 'Codex_Ang', label: 'Code Architect', status: 'idle', specialty: 'Code generation & analysis' },
  { id: 'sentinel', name: 'Sentinel_Ang', label: 'Security Guard', status: 'idle', specialty: 'Security & verification' },
  { id: 'nexus', name: 'Nexus_Ang', label: 'Integration Hub', status: 'idle', specialty: 'API & service connections' },
  { id: 'oracle', name: 'Oracle_Ang', label: 'Insight Engine', status: 'idle', specialty: 'Analytics & predictions' },
  { id: 'forge', name: 'Forge_Ang', label: 'Builder', status: 'idle', specialty: 'Asset & content creation' },
  { id: 'pulse', name: 'Pulse_Ang', label: 'Monitor', status: 'idle', specialty: 'Real-time monitoring' },
  { id: 'bridge', name: 'Bridge_Ang', label: 'Connector', status: 'idle', specialty: 'Cross-platform operations' },
  { id: 'curator', name: 'Curator_Ang', label: 'Organizer', status: 'idle', specialty: 'Data curation & cleanup' },
  { id: 'herald', name: 'Herald_Ang', label: 'Messenger', status: 'idle', specialty: 'Notifications & alerts' },
  { id: 'sage', name: 'Sage_Ang', label: 'Advisor', status: 'idle', specialty: 'Strategic recommendations' },
  { id: 'weaver', name: 'Weaver_Ang', label: 'Integrator', status: 'idle', specialty: 'Workflow automation' },
  { id: 'guardian', name: 'Guardian_Ang', label: 'Protector', status: 'idle', specialty: 'Error handling & recovery' },
  { id: 'spark', name: 'Spark_Ang', label: 'Initiator', status: 'idle', specialty: 'Quick actions & triggers' },
  { id: 'echo', name: 'Echo_Ang', label: 'Replicator', status: 'idle', specialty: 'Backup & redundancy' },
  { id: 'prism', name: 'Prism_Ang', label: 'Transformer', status: 'idle', specialty: 'Data transformation' }
];

// Carbon Fiber CSS Styles (inline for component portability)
const styles = {
  container: {
    minHeight: '100vh',
    background: `
      linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.02) 2px,
        rgba(255, 255, 255, 0.02) 4px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.02) 2px,
        rgba(255, 255, 255, 0.02) 4px
      )
    `,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#e0e0e0'
  } as React.CSSProperties,

  header: {
    background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.9) 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backdropFilter: 'blur(10px)'
  } as React.CSSProperties,

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  } as React.CSSProperties,

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr 350px',
    height: 'calc(100vh - 73px)',
    gap: '1px',
    background: 'rgba(255, 255, 255, 0.05)'
  } as React.CSSProperties,

  panel: {
    background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%)',
    padding: '20px',
    overflowY: 'auto' as const,
    position: 'relative' as const
  } as React.CSSProperties,

  panelTitle: {
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    color: '#888',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  } as React.CSSProperties,

  taskCard: {
    background: 'linear-gradient(145deg, rgba(40, 40, 60, 0.6) 0%, rgba(30, 30, 50, 0.8) 100%)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  } as React.CSSProperties,

  thinkingStream: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '13px',
    lineHeight: '1.6'
  } as React.CSSProperties,

  thinkingStep: {
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    borderLeft: '3px solid',
    background: 'rgba(30, 30, 50, 0.6)'
  } as React.CSSProperties,

  artifactCard: {
    background: 'linear-gradient(145deg, rgba(40, 40, 60, 0.5) 0%, rgba(25, 25, 45, 0.7) 100%)',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '10px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  } as React.CSSProperties,

  agentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '8px',
    background: 'rgba(30, 30, 50, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  } as React.CSSProperties,

  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  } as React.CSSProperties,

  inputArea: {
    position: 'fixed' as const,
    bottom: 0,
    left: '300px',
    right: '350px',
    padding: '20px',
    background: 'linear-gradient(180deg, transparent 0%, rgba(15, 15, 35, 0.98) 20%)',
    backdropFilter: 'blur(10px)'
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(30, 30, 50, 0.8)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  } as React.CSSProperties,

  pulseAnimation: {
    animation: 'pulse 2s ease-in-out infinite'
  } as React.CSSProperties,

  progressBar: {
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden' as const,
    marginTop: '8px'
  } as React.CSSProperties,

  progressFill: {
    height: '100%',
    borderRadius: '2px',
    background: 'linear-gradient(90deg, #00d4ff 0%, #7b2cbf 100%)',
    transition: 'width 0.3s ease'
  } as React.CSSProperties
};

// Helper function to get step color
const getStepColor = (type: ThinkingStep['type']): string => {
  const colors = {
    analysis: '#00d4ff',
    planning: '#7b2cbf',
    execution: '#00ff88',
    delegation: '#ff9500',
    artifact: '#ff00ff',
    complete: '#00ff00'
  };
  return colors[type] || '#888';
};

// Helper function to get status color
const getStatusColor = (status: AgentStatus['status']): string => {
  const colors = {
    idle: '#00ff88',
    busy: '#ff9500',
    offline: '#ff4444'
  };
  return colors[status];
};

// Helper function to get task status color
const getTaskStatusColor = (status: Task['status']): string => {
  const colors = {
    queued: '#888',
    thinking: '#00d4ff',
    executing: '#00ff88',
    delegated: '#ff9500',
    complete: '#00ff00',
    error: '#ff4444'
  };
  return colors[status];
};

// Format timestamp
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const TaskWorkspace: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [agents, setAgents] = useState<AgentStatus[]>(AGENT_REGISTRY);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const thinkingRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thinking stream
  useEffect(() => {
    if (thinkingRef.current) {
      thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }
  }, [activeTask?.thinkingSteps]);

  // Simulate thinking process for demo
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

    // Start thinking simulation
    simulateThinking(newTask);
  }, [inputValue, isProcessing, simulateThinking]);

  return (
    <div style={styles.container}>
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
      <header style={styles.header}>
        <div style={styles.logo}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            padding: '6px 12px', 
            borderRadius: '20px', 
            background: 'rgba(0, 255, 136, 0.1)', 
            border: '1px solid rgba(0, 255, 136, 0.3)',
            fontSize: '12px',
            color: '#00ff88'
          }}>
            ● System Online
          </div>
          <div style={{ fontSize: '13px', color: '#888' }}>
            {agents.filter(a => a.status === 'idle').length}/{agents.length} Agents Available
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Left Panel - Task Queue */}
        <div style={styles.panel}>
          <div style={styles.panelTitle}>
            <span>📋</span> Task Queue
          </div>
          
          {tasks.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#666',
              fontSize: '14px'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
              No tasks yet. Start by entering a request below.
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="hover-card"
                style={{
                  ...styles.taskCard,
                  borderColor: activeTask?.id === task.id 
                    ? 'rgba(0, 212, 255, 0.5)' 
                    : 'rgba(255, 255, 255, 0.08)'
                }}
                onClick={() => setActiveTask(task)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 500,
                    flex: 1,
                    lineHeight: '1.4'
                  }}>
                    {task.title}
                  </div>
                  <div style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: `${getTaskStatusColor(task.status)}22`,
                    color: getTaskStatusColor(task.status),
                    marginLeft: '8px'
                  }}>
                    {task.status}
                  </div>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${task.progress}%` }} />
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666', 
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{task.startTime ? formatTime(task.startTime) : '-'}</span>
                  <span>{task.thinkingSteps.length} steps</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Center Panel - Thinking Stream */}
        <div style={{ ...styles.panel, paddingBottom: '100px' }} ref={thinkingRef}>
          <div style={styles.panelTitle}>
            <span>🧠</span> Thinking Process
            {isProcessing && (
              <span style={{ 
                marginLeft: 'auto', 
                color: '#00d4ff',
                fontSize: '12px',
                ...styles.pulseAnimation
              }}>
                Processing...
              </span>
            )}
          </div>

          {!activeTask ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#555'
            }}>
              <div style={{ fontSize: '60px', marginBottom: '16px', opacity: 0.5 }}>🤔</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>Ready to Think</div>
              <div style={{ fontSize: '13px', color: '#444' }}>
                Enter a task to see the AI reasoning process in real-time
              </div>
            </div>
          ) : (
            <div style={styles.thinkingStream}>
              {activeTask.thinkingSteps.map((step, index) => (
                <div 
                  key={step.id}
                  style={{
                    ...styles.thinkingStep,
                    borderLeftColor: getStepColor(step.type)
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                    fontSize: '11px',
                    color: '#666'
                  }}>
                    <span style={{ 
                      color: getStepColor(step.type),
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {step.type}
                    </span>
                    <span>{formatTime(step.timestamp)}</span>
                  </div>
                  <div style={{ color: '#ccc' }}>
                    {step.content}
                    {index === activeTask.thinkingSteps.length - 1 && 
                     activeTask.status === 'thinking' && (
                      <span className="thinking-cursor" />
                    )}
                  </div>
                  {step.agent && (
                    <div style={{ 
                      marginTop: '6px', 
                      fontSize: '11px',
                      color: '#ff9500'
                    }}>
                      → Delegated to {step.agent}
                    </div>
                  )}
                  {step.tokens && (
                    <div style={{ 
                      marginTop: '4px', 
                      fontSize: '10px',
                      color: '#555'
                    }}>
                      {step.tokens} tokens
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={styles.inputArea}>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a task for the AI to work on..."
                style={styles.input}
                disabled={isProcessing}
              />
            </form>
            <div style={{ 
              fontSize: '11px', 
              color: '#555', 
              marginTop: '8px',
              textAlign: 'center'
            }}>
              Press Enter to submit • AI will show reasoning in real-time
            </div>
          </div>
        </div>

        {/* Right Panel - Artifacts & Agents */}
        <div style={styles.panel}>
          {/* Artifacts Section */}
          <div style={styles.panelTitle}>
            <span>📦</span> Artifacts
          </div>
          
          {(!activeTask || activeTask.artifacts.length === 0) ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '30px 20px', 
              color: '#555',
              fontSize: '13px',
              marginBottom: '24px'
            }}>
              Artifacts will appear here as they're generated
            </div>
          ) : (
            activeTask.artifacts.map(artifact => (
              <div key={artifact.id} style={styles.artifactCard}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    {artifact.type === 'code' ? '💻' : 
                     artifact.type === 'document' ? '📄' :
                     artifact.type === 'data' ? '📊' :
                     artifact.type === 'deployment' ? '🚀' : '🔍'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{artifact.name}</span>
                </div>
                <pre style={{ 
                  fontSize: '11px', 
                  color: '#888',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px',
                  borderRadius: '6px',
                  overflow: 'auto',
                  maxHeight: '120px',
                  margin: 0
                }}>
                  {artifact.content}
                </pre>
              </div>
            ))
          )}

          {/* Agents Section */}
          <div style={{ ...styles.panelTitle, marginTop: '24px' }}>
            <span>🤖</span> Agent Fleet
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {agents.map(agent => (
              <div key={agent.id} style={styles.agentCard}>
                <div 
                  style={{ 
                    ...styles.statusDot, 
                    background: getStatusColor(agent.status),
                    boxShadow: `0 0 8px ${getStatusColor(agent.status)}40`
                  }} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 600,
                    color: '#ddd'
                  }}>
                    {agent.name}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#666',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {agent.currentTask || agent.specialty}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '9px', 
                  color: '#555',
                  textTransform: 'uppercase'
                }}>
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
