/**
 * TaskWorkspace - Manus-style Task Execution Environment
 * 
 * Professional brushed carbon fiber design with:
 * - Left sidebar navigation with sticky scroll (like OpenAI)
 * - Real-time thinking UI
 * - Tab switcher in bottom left
 * - Properly padded search bar at bottom
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface BoomerAng {
  id: string;
  name: string;
  displayName: string;
  role: string;
  description: string;
  status: 'active' | 'standby' | 'offline';
  capabilities: string[];
  icon: string;
  color: string;
}

interface TaskStep {
  id: string;
  type: 'thinking' | 'action' | 'result' | 'delegation' | 'artifact' | 'error';
  agent: BoomerAng;
  content: string;
  reasoning?: string;
  timestamp: Date;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface Artifact {
  type: string;
  title: string;
  content: string;
  timestamp: Date;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

const AGENT_REGISTRY: BoomerAng[] = [
  {
    id: 'acheevy-core',
    name: 'ACHEEVY',
    displayName: '🤖 ACHEEVY - Main Orchestrator',
    role: 'orchestrator',
    description: 'Main Orchestrator powered by II-Agent framework.',
    status: 'active',
    capabilities: ['Task Delegation', 'Context Management', 'User Intent Analysis'],
    icon: '🤖',
    color: '#6366f1',
  },
  {
    id: 'finder-ang',
    name: 'Finder_Ang',
    displayName: '🔍 Finder_Ang - Deep Research',
    role: 'finder',
    description: 'Deep research and information retrieval.',
    status: 'active',
    capabilities: ['Web Search', 'Data Scrape', 'Fact Checking'],
    icon: '🔍',
    color: '#10b981',
  },
  {
    id: 'execution-ang',
    name: 'Execution_Ang',
    displayName: '⚡ Execution_Ang - Code Runner',
    role: 'maker',
    description: 'Code synthesis, refactoring, debugging.',
    status: 'active',
    capabilities: ['Code Generation', 'Script Execution', 'File Manipulation'],
    icon: '⚡',
    color: '#ef4444',
  },
  {
    id: 'reasoning-ang',
    name: 'Reasoning_Ang',
    displayName: '🧠 Reasoning_Ang - Chain of Thought',
    role: 'reasoner',
    description: 'Step-by-step logical reasoning.',
    status: 'active',
    capabilities: ['Chain of Thought', 'Problem Solving', 'Analysis'],
    icon: '🧠',
    color: '#dc2626',
  },
  {
    id: 'presentation-ang',
    name: 'Presentation_Ang',
    displayName: '📊 Presentation_Ang - Visualizer',
    role: 'visualizer',
    description: 'Slide and chart generation.',
    status: 'standby',
    capabilities: ['Slide Generation', 'Chart Creation', 'Layout Design'],
    icon: '📊',
    color: '#ec4899',
  },
  {
    id: 'debugger-ang',
    name: 'Debugger_Ang',
    displayName: '🐞 Debugger_Ang - LLM Monitor',
    role: 'debugger',
    description: 'LLM Gateway monitoring and tracing.',
    status: 'active',
    capabilities: ['Error Tracing', 'API Logging', 'Cost Analysis'],
    icon: '🐞',
    color: '#f97316',
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION ITEMS (Left Sidebar - OpenAI Style)
// ═══════════════════════════════════════════════════════════════════════════

const NAV_ITEMS: NavItem[] = [
  { id: 'research', label: 'Research', icon: '🔍', path: '/workspace/research' },
  { id: 'content', label: 'Content', icon: '📝', path: '/workspace/content' },
  { id: 'code', label: 'Code', icon: '⚡', path: '/workspace/code' },
  { id: 'analysis', label: 'Analysis', icon: '📊', path: '/workspace/analysis' },
  { id: 'automation', label: 'Automation', icon: '🤖', path: '/workspace/automation' },
  { id: 'voice', label: 'Voice', icon: '🎙️', path: '/workspace/voice' },
  { id: 'video', label: 'Video', icon: '🎬', path: '/workspace/video' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/workspace/settings' },
];

// ═══════════════════════════════════════════════════════════════════════════
// CSS STYLES (Carbon Fiber Theme)
// ═══════════════════════════════════════════════════════════════════════════

const carbonStyles = {
  carbonBg: {
    background: `
      linear-gradient(135deg, rgba(10, 10, 12, 0.98) 0%, rgba(8, 8, 10, 0.99) 100%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.015) 2px,
        rgba(255, 255, 255, 0.015) 4px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.01) 2px,
        rgba(255, 255, 255, 0.01) 4px
      )
    `,
    backgroundSize: '100% 100%, 4px 4px, 4px 4px',
  } as React.CSSProperties,
  
  brushedMetal: {
    background: `
      linear-gradient(90deg, 
        rgba(28, 28, 32, 0.95) 0%, 
        rgba(35, 35, 40, 0.95) 25%, 
        rgba(30, 30, 35, 0.95) 50%, 
        rgba(35, 35, 40, 0.95) 75%, 
        rgba(28, 28, 32, 0.95) 100%
      )
    `,
    borderBottom: '1px solid rgba(80, 80, 100, 0.2)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
  } as React.CSSProperties,
  
  glassPanel: {
    background: 'rgba(20, 20, 25, 0.9)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(60, 60, 80, 0.25)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.02)',
  } as React.CSSProperties,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const TaskWorkspace: React.FC<{ userId?: string }> = ({ userId = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('research');
  const [taskInput, setTaskInput] = useState('');
  const [taskSteps, setTaskSteps] = useState<TaskStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<BoomerAng | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [thinkingExpanded, setThinkingExpanded] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-scroll to latest step
  useEffect(() => {
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
    }
  }, [taskSteps]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK EXECUTION LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  const addStep = (step: Omit<TaskStep, 'id' | 'timestamp'>) => {
    const newStep: TaskStep = {
      ...step,
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setTaskSteps(prev => [...prev, newStep]);
    return newStep;
  };

  const updateStep = (stepId: string, updates: Partial<TaskStep>) => {
    setTaskSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const selectAgent = (taskType: string): BoomerAng => {
    const taskAgentMap: Record<string, string> = {
      'research': 'finder-ang',
      'content': 'execution-ang',
      'code': 'execution-ang',
      'analysis': 'reasoning-ang',
      'automation': 'acheevy-core',
      'voice': 'acheevy-core',
      'video': 'presentation-ang',
    };
    return AGENT_REGISTRY.find(a => a.id === taskAgentMap[activeNav]) || AGENT_REGISTRY[0];
  };

  const executeTask = async () => {
    if (!taskInput.trim()) return;
    
    setIsExecuting(true);
    setTaskSteps([]);
    setArtifacts([]);
    
    const acheevy = AGENT_REGISTRY.find(a => a.id === 'acheevy-core')!;
    setCurrentAgent(acheevy);

    // Step 1: Analysis
    const analysisStep = addStep({
      type: 'thinking',
      agent: acheevy,
      content: '🔄 Analyzing task requirements...',
      reasoning: `TASK RECEIVED:\n"${taskInput.substring(0, 150)}${taskInput.length > 150 ? '...' : ''}"`,
      status: 'active'
    });

    await simulateDelay(1200);

    const bestAgent = selectAgent(activeNav);

    updateStep(analysisStep.id, {
      status: 'completed',
      content: '✅ Task analysis complete',
      reasoning: `ANALYSIS RESULTS:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Selected Agent: ${bestAgent.displayName}\n• Confidence: 94%`
    });

    // Step 2: Delegation
    if (bestAgent.id !== 'acheevy-core') {
      setCurrentAgent(bestAgent);
      
      const delegationStep = addStep({
        type: 'delegation',
        agent: acheevy,
        content: `🔄 Delegating to ${bestAgent.displayName}`,
        reasoning: `${bestAgent.name} specializes in: ${bestAgent.capabilities.join(', ')}`,
        status: 'active',
      });

      await simulateDelay(600);
      updateStep(delegationStep.id, { status: 'completed', content: `✅ Delegated to ${bestAgent.name}` });

      addStep({
        type: 'thinking',
        agent: bestAgent,
        content: '📥 Task received. Initializing...',
        reasoning: `Activating: ${bestAgent.capabilities.slice(0, 2).join(', ')}`,
        status: 'completed'
      });
    }

    // Step 3: Execute
    const steps = [
      { content: '🔄 Processing input...', reasoning: 'Parsing task parameters' },
      { content: '⚙️ Executing core logic...', reasoning: 'Running specialized algorithms' },
      { content: '✓ Validating output...', reasoning: 'Quality assurance check' },
    ];

    for (const step of steps) {
      const s = addStep({
        type: 'action',
        agent: bestAgent,
        content: step.content,
        reasoning: step.reasoning,
        status: 'active'
      });
      await simulateDelay(1000);
      updateStep(s.id, { status: 'completed' });
    }

    // Artifact
    setArtifacts([{
      type: 'output',
      title: `${activeNav.charAt(0).toUpperCase() + activeNav.slice(1)} Result`,
      content: `Generated output for: ${taskInput.substring(0, 50)}...`,
      timestamp: new Date()
    }]);

    // Final
    setCurrentAgent(acheevy);
    addStep({
      type: 'result',
      agent: acheevy,
      content: '🎉 Task completed successfully!',
      reasoning: `Execution complete.`,
      status: 'completed'
    });

    setIsExecuting(false);
    setCurrentAgent(null);
    setTaskInput('');
  };

  const getStepColor = (type: TaskStep['type'], status: TaskStep['status']): string => {
    if (status === 'error') return 'border-red-500/50 bg-red-500/5';
    if (status === 'active') return 'border-blue-500/50 bg-blue-500/5 animate-pulse';
    
    switch (type) {
      case 'thinking': return 'border-purple-500/30 bg-purple-500/5';
      case 'action': return 'border-blue-500/30 bg-blue-500/5';
      case 'result': return 'border-green-500/30 bg-green-500/5';
      case 'delegation': return 'border-orange-500/30 bg-orange-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      {/* Floating Launch Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 border border-purple-400/30"
        style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}
      >
        <span className="text-xl">🚀</span>
        <span className="font-semibold">Task Workspace</span>
      </button>

      {/* Full-Screen Workspace */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" style={carbonStyles.carbonBg}>
          
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* LEFT SIDEBAR - OpenAI Style Navigation (Sticky Scroll) */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          <aside 
            className="w-64 flex flex-col border-r border-gray-800/50 h-full"
            style={carbonStyles.glassPanel}
          >
            {/* Logo/Brand */}
            <div className="p-5 border-b border-gray-800/50">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  L
                </div>
                <span className="text-white font-semibold text-lg tracking-tight">LOCALE</span>
              </Link>
            </div>

            {/* Navigation - Sticky Scroll */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeNav === item.id
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {activeNav === item.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* Agent Status */}
              <div className="mt-8 px-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Active Agents</h3>
                <div className="space-y-2">
                  {AGENT_REGISTRY.filter(a => a.status === 'active').slice(0, 4).map(agent => (
                    <div 
                      key={agent.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        currentAgent?.id === agent.id 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : 'bg-gray-800/30'
                      }`}
                    >
                      <span>{agent.icon}</span>
                      <span className="text-gray-300 text-xs flex-1 truncate">{agent.name}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        currentAgent?.id === agent.id ? 'bg-green-500 animate-pulse' : 'bg-gray-600'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* BOTTOM LEFT - Tab Switcher */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            <div className="p-3 border-t border-gray-800/50">
              <div className="relative">
                <button
                  onClick={() => setShowSwitcher(!showSwitcher)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all group"
                >
                  <span className="text-lg">⚡</span>
                  <span className="text-sm font-medium flex-1 text-left">Quick Switch</span>
                  <svg className={`w-4 h-4 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Switcher Popup */}
                {showSwitcher && (
                  <div className="absolute bottom-full left-0 w-full mb-2 p-2 rounded-xl bg-gray-900 border border-gray-700 shadow-xl">
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { icon: '🏠', label: 'Home', path: '/' },
                        { icon: '📊', label: 'Dashboard', path: '/dashboard' },
                        { icon: '⚙️', label: 'Admin', path: '/admin' },
                        { icon: '🔧', label: 'Circuit', path: '/admin/circuit-box' },
                      ].map(item => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setIsOpen(false);
                            setShowSwitcher(false);
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-[10px] text-gray-400">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User */}
              <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">User</div>
                  <div className="text-xs text-gray-500">Pro Plan</div>
                </div>
              </div>
            </div>
          </aside>

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* MAIN CONTENT AREA */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 border-b border-gray-800/50" style={carbonStyles.brushedMetal}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-bold text-white capitalize">{activeNav} Workspace</h1>
                  {currentAgent && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                      <span>{currentAgent.icon}</span>
                      <span className="text-sm text-green-400">{currentAgent.name}</span>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Thinking Stream */}
            <div 
              ref={stepsContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {taskSteps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <span className="text-7xl mb-6 opacity-50">🚀</span>
                  <p className="text-xl font-medium text-gray-400">Enter a task to begin</p>
                  <p className="text-sm mt-2 text-gray-600 max-w-md text-center">
                    Watch as ACHEEVY and the Boomer_Angs work through your request with real-time thinking
                  </p>
                </div>
              ) : (
                taskSteps.map(step => (
                  <div
                    key={step.id}
                    className={`border-l-4 rounded-r-xl p-4 transition-all ${getStepColor(step.type, step.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{step.agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{step.agent.name}</span>
                          <span className="text-xs text-gray-500 font-mono">
                            {step.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-200 mt-1">{step.content}</p>
                        {step.reasoning && thinkingExpanded && (
                          <div className="mt-3 p-3 rounded-lg bg-black/30 border border-gray-800/50 font-mono text-xs text-gray-400 whitespace-pre-wrap">
                            {step.reasoning}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════ */}
            {/* BOTTOM INPUT - Properly Padded Search Bar */}
            {/* ═══════════════════════════════════════════════════════════════════════ */}
            <div className="border-t border-gray-800/50 p-6" style={carbonStyles.glassPanel}>
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          executeTask();
                        }
                      }}
                      placeholder={`Ask ${activeNav} assistant...`}
                      className="w-full bg-gray-900/80 text-white rounded-2xl px-5 py-4 pr-14 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500 border border-gray-700/50 text-base"
                      rows={2}
                      disabled={isExecuting}
                    />
                    <button
                      onClick={executeTask}
                      disabled={isExecuting || !taskInput.trim()}
                      className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all ${
                        isExecuting
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isExecuting ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">Enter</kbd> to send</span>
                    <span className="text-gray-600">|</span>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">Shift + Enter</kbd> for new line</span>
                  </div>
                  <button
                    onClick={() => setThinkingExpanded(!thinkingExpanded)}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {thinkingExpanded ? '🔽 Hide reasoning' : '🔼 Show reasoning'}
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* RIGHT SIDEBAR - Artifacts */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}
          <aside 
            className="w-80 border-l border-gray-800/50 flex flex-col"
            style={carbonStyles.glassPanel}
          >
            <div className="p-4 border-b border-gray-800/50" style={carbonStyles.brushedMetal}>
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Artifacts</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {artifacts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl opacity-30">📄</span>
                  <p className="mt-3 text-sm">Generated artifacts will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {artifacts.map((artifact, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <span>📄</span>
                        <span className="font-medium text-sm">{artifact.title}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-3">{artifact.content}</p>
                      <div className="flex gap-2 mt-3">
                        <button className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30">
                          View
                        </button>
                        <button className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-600/50 transition-colors">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default TaskWorkspace;
