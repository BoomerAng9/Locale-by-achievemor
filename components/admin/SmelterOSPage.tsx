/**
 * Circuit Box - Transparent AI Sandbox
 * 
 * LIVE TRANSPARENT SANDBOX
 * The user sees the fuel, sees the thinking, and can eject at any time.
 * 
 * Features:
 * - "Chat w/ACHEEVY" Bezel Branding
 * - Live Model Switcher (Gemini 3 Flash, DeepSeek-V3, GLM-4.7)
 * - Thought Stream (visible reasoning)
 * - Token Fuel Gauge (live cost tracking)
 * - Kill Switch (abort mid-generation)
 * - V.I.B.E. Score (Virtue-Indexed Bio-Energy)
 * - Kie.ai Video Engine integration
 * 
 * Plausibility Bound: (-10^18 ≤ x, y ≤ 10^18)
 * Powered by SmelterOS (Industrial AI Foundry)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_PLUG_REGISTRY, AIPlug } from '../../lib/ai-plugs/registry';
import { 
  multiBrain, 
  MODEL_REGISTRY, 
  AVAILABLE_MODELS, 
  AIModel, 
  ChatMessage,
} from '../../lib/llm/multibrain';

// ============================================
// TYPES
// ============================================

type Environment = 'development' | 'staging' | 'production';
type TabType = 'sandbox' | 'deploy' | 'agents' | 'resources' | 'integrations';

interface SandboxMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  model: AIModel;
  timestamp: Date;
  tokens?: number;
  cost?: number;
  latency?: number;
  isStreaming?: boolean;
}

interface DeployedPlug {
  plugId: string;
  environment: Environment;
  status: 'active' | 'paused' | 'error';
  deployedAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  avgLatency: number;
}

interface ResourceMetrics {
  tokensUsedToday: number;
  tokenLimit: number;
  costToday: number;
  costLimit: number;
  avgLatency: number;
  errorRate: number;
  activeAgents: number;
  queuedTasks: number;
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'pending' | 'offline';
  apiKeyConfigured: boolean;
  category: 'ai' | 'media' | 'payments' | 'storage';
}

// ============================================
// INITIAL DATA
// ============================================

const MOCK_DEPLOYED_PLUGS: DeployedPlug[] = [
  { plugId: 'content-writer', environment: 'production', status: 'active', deployedAt: new Date('2024-12-20'), executionCount: 1247, avgLatency: 2.3, lastExecuted: new Date() },
  { plugId: 'legal-analyzer', environment: 'staging', status: 'active', deployedAt: new Date('2024-12-24'), executionCount: 89, avgLatency: 4.1 },
  { plugId: 'video-generator', environment: 'development', status: 'active', deployedAt: new Date('2024-12-26'), executionCount: 5, avgLatency: 12.5 },
  { plugId: 'market-analyzer', environment: 'production', status: 'active', deployedAt: new Date('2024-12-15'), executionCount: 3421, avgLatency: 5.2, lastExecuted: new Date() },
];

const INITIAL_METRICS: ResourceMetrics = {
  tokensUsedToday: 847293,
  tokenLimit: 2000000,
  costToday: 12.47,
  costLimit: 50.00,
  avgLatency: 2.8,
  errorRate: 0.02,
  activeAgents: 4,
  queuedTasks: 7,
};

const INTEGRATIONS: Integration[] = [
  { id: 'gemini', name: 'Google Gemini', provider: 'Google', status: 'connected', apiKeyConfigured: true, category: 'ai' },
  { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek', status: 'pending', apiKeyConfigured: false, category: 'ai' },
  { id: 'zhipu', name: 'ZhipuAI GLM', provider: 'ZhipuAI', status: 'pending', apiKeyConfigured: false, category: 'ai' },
  { id: 'openai', name: 'OpenAI', provider: 'OpenAI', status: 'pending', apiKeyConfigured: false, category: 'ai' },
  { id: 'anthropic', name: 'Anthropic Claude', provider: 'Anthropic', status: 'pending', apiKeyConfigured: false, category: 'ai' },
  { id: 'kieai', name: 'Kie.ai Video Engine', provider: 'Kie.ai', status: 'pending', apiKeyConfigured: false, category: 'media' },
  { id: 'elevenlabs', name: 'ElevenLabs Voice', provider: 'ElevenLabs', status: 'connected', apiKeyConfigured: true, category: 'media' },
  { id: 'stripe', name: 'Stripe Payments', provider: 'Stripe', status: 'connected', apiKeyConfigured: true, category: 'payments' },
];

// ============================================
// COMPONENT
// ============================================

const SmelterOSPage: React.FC = () => {
  // Core State
  const [activeTab, setActiveTab] = useState<TabType>('sandbox');
  const [environment, setEnvironment] = useState<Environment>('development');
  
  // Sandbox State
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-3-flash');
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are ACHEEVY, the AI executive assistant. Show your reasoning step by step.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showThoughts, setShowThoughts] = useState(true);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  
  // Cost Tracking State
  const [sessionCost, setSessionCost] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [walletBalance, setWalletBalance] = useState(5.00);
  
  // Resources State
  const [deployedPlugs, setDeployedPlugs] = useState<DeployedPlug[]>(MOCK_DEPLOYED_PLUGS);
  const [metrics, setMetrics] = useState<ResourceMetrics>(INITIAL_METRICS);
  const [integrations] = useState<Integration[]>(INTEGRATIONS);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        tokensUsedToday: prev.tokensUsedToday + Math.floor(Math.random() * 50),
        queuedTasks: Math.max(0, prev.queuedTasks + Math.floor(Math.random() * 3) - 1),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle model change
  const handleModelChange = useCallback((model: AIModel) => {
    setSelectedModel(model);
    multiBrain.setModel(model);
  }, []);

  // KILL SWITCH - Abort current request
  const handleAbort = useCallback(() => {
    multiBrain.abort();
    setIsProcessing(false);
    setIsThinking(false);
    
    // Mark last message as aborted
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.isStreaming) {
        return [...prev.slice(0, -1), { ...last, content: last.content + ' [ABORTED]', isStreaming: false }];
      }
      return prev;
    });
  }, []);

  // Send message to AI
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: SandboxMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      model: selectedModel,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    setIsThinking(true);

    // Add placeholder for assistant response
    const placeholderId = `msg-${Date.now() + 1}`;
    setMessages(prev => [...prev, {
      id: placeholderId,
      role: 'assistant',
      content: '',
      thinking: 'Analyzing request...',
      model: selectedModel,
      timestamp: new Date(),
      isStreaming: true,
    }]);

    try {
      // Build chat history
      const chatHistory: ChatMessage[] = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));
      chatHistory.push({ role: 'user', content: userMessage.content });

      // Call multi-brain router
      const response = await multiBrain.chat(chatHistory, {
        model: selectedModel,
        systemPrompt,
        enableThinking: true,
      });

      // Update wallet and session stats
      const cost = response.cost || 0.001;
      setSessionCost(prev => prev + cost);
      setSessionTokens(prev => prev + response.tokens.total);
      setWalletBalance(prev => Math.max(0, prev - cost));
      setMetrics(prev => ({
        ...prev,
        tokensUsedToday: prev.tokensUsedToday + response.tokens.total,
        costToday: parseFloat((prev.costToday + cost).toFixed(4)),
      }));

      // Update message with response
      setMessages(prev => prev.map(msg => 
        msg.id === placeholderId
          ? {
              ...msg,
              content: response.content,
              thinking: response.thinking,
              tokens: response.tokens.total,
              cost: response.cost,
              latency: response.latency,
              isStreaming: false,
            }
          : msg
      ));

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => prev.map(msg => 
        msg.id === placeholderId
          ? { ...msg, content: `Error: ${errorMsg}`, isStreaming: false }
          : msg
      ));
    } finally {
      setIsProcessing(false);
      setIsThinking(false);
    }
  }, [inputValue, selectedModel, messages, systemPrompt, isProcessing]);

  // Environment badge colors
  const envColors: Record<Environment, string> = {
    development: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    staging: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    production: 'bg-green-500/20 text-green-400 border-green-500/50',
  };

  const modelInfo = MODEL_REGISTRY[selectedModel];

  return (
    <div className="min-h-screen bg-carbon-900 text-white">
      {/* HEADER */}
      <div className="border-b border-carbon-700 bg-linear-to-r from-carbon-900 via-carbon-800 to-carbon-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="text-orange-500">⚡</span> 
                CIRCUIT<span className="text-orange-500">BOX</span>
                <span className="text-[10px] bg-carbon-700 text-gray-400 px-2 py-0.5 rounded font-mono">v2.0</span>
              </h1>
              <div className="h-6 w-px bg-carbon-700" />
              <p className="text-gray-500 text-xs font-mono">
                TRANSPARENT AI SANDBOX // <span className="text-orange-500/60">Powered by SmelterOS</span>
              </p>
            </div>

            {/* Environment Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex bg-carbon-800 rounded-lg p-0.5 border border-carbon-700">
                {(['development', 'staging', 'production'] as Environment[]).map(env => (
                  <button
                    key={env}
                    onClick={() => setEnvironment(env)}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                      environment === env
                        ? envColors[env] + ' border'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {env === 'development' ? '🔧 DEV' : env === 'staging' ? '🧪 STG' : '🚀 PROD'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'sandbox', label: '⚡ SANDBOX', desc: 'Live AI Testing' },
              { id: 'deploy', label: '📦 DEPLOY', desc: 'Agentic Tools' },
              { id: 'agents', label: '🤖 AGENTS', desc: 'Boomer_Ang Guild' },
              { id: 'integrations', label: '🔌 INTEGRATIONS', desc: 'APIs & Tools' },
              { id: 'resources', label: '📊 RESOURCES', desc: 'Usage & Costs' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 rounded-t-lg font-bold text-xs transition-all border-t border-l border-r ${
                  activeTab === tab.id
                    ? 'bg-carbon-800 text-white border-orange-500/50 -mb-px'
                    : 'bg-carbon-900 text-gray-500 border-carbon-700 hover:text-white hover:bg-carbon-800'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-[9px] font-normal text-gray-600">{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          
          {/* SANDBOX TAB */}
          {activeTab === 'sandbox' && (
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-12 gap-4"
            >
              {/* LEFT: Thought Stream */}
              <div className="col-span-3 bg-carbon-800 rounded-xl border border-carbon-700 h-[600px] flex flex-col">
                <div className="p-3 border-b border-carbon-700 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isThinking ? 'bg-orange-500 animate-pulse' : 'bg-gray-600'}`} />
                    Thought Stream
                  </h3>
                  <button
                    onClick={() => setShowThoughts(!showThoughts)}
                    className={`text-[10px] px-2 py-0.5 rounded ${showThoughts ? 'bg-orange-500/20 text-orange-400' : 'bg-carbon-700 text-gray-500'}`}
                  >
                    {showThoughts ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2">
                  {messages.filter(m => m.thinking).map((msg, i) => (
                    <div key={i} className="p-2 bg-black/30 rounded border border-carbon-700">
                      <div className="text-[10px] text-orange-400 mb-1">[{msg.model}]</div>
                      <pre className="text-gray-400 whitespace-pre-wrap">{msg.thinking}</pre>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="p-2 bg-orange-500/10 rounded border border-orange-500/30 animate-pulse">
                      <span className="text-orange-400">Reasoning...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER: Chat w/ACHEEVY */}
              <div className="col-span-6 flex flex-col h-[600px]">
                {/* BEZEL HEADER */}
                <div className="bg-linear-to-r from-orange-600 to-orange-500 rounded-t-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h2 className="text-white font-black text-sm tracking-tight">Chat w/ACHEEVY</h2>
                      <p className="text-orange-200 text-[10px]">Powered by SmelterOS</p>
                    </div>
                  </div>
                  
                  {/* Model Switcher */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value as AIModel)}
                      className="bg-white/20 border border-white/30 rounded px-2 py-1 text-xs font-bold text-white focus:outline-none"
                      title="Select AI Model"
                    >
                      {AVAILABLE_MODELS.map(model => (
                        <option key={model.id} value={model.id} className="bg-carbon-900 text-white">
                          {model.emoji} {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CHAT BODY */}
                <div className="flex-1 bg-carbon-800 border-x border-carbon-700 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-5xl mb-3">⚡</div>
                        <p className="text-sm font-bold">Circuit Box</p>
                        <p className="text-xs">Transparent AI Sandbox • Powered by SmelterOS</p>
                        <div className="mt-4 text-[10px] text-gray-600">
                          Active: {modelInfo.emoji} {modelInfo.name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-orange-500/20 border border-orange-500/30'
                              : 'bg-carbon-700 border border-carbon-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase text-gray-400">
                              {msg.role === 'user' ? '👤 You' : `${MODEL_REGISTRY[msg.model]?.emoji || '🤖'} ACHEEVY`}
                            </span>
                            {msg.latency && (
                              <span className="text-[9px] text-gray-500">
                                {msg.latency}ms • {msg.tokens} tokens • ${msg.cost?.toFixed(4)}
                              </span>
                            )}
                          </div>
                          
                          {/* Thinking Block */}
                          {msg.thinking && showThoughts && (
                            <div className="mb-2 p-2 bg-black/30 rounded border border-carbon-600 text-[10px] font-mono text-gray-500">
                              <details>
                                <summary className="cursor-pointer text-orange-400">💭 Reasoning</summary>
                                <pre className="mt-1 whitespace-pre-wrap">{msg.thinking}</pre>
                              </details>
                            </div>
                          )}
                          
                          <p className="text-sm whitespace-pre-wrap">{msg.content || (msg.isStreaming ? '...' : '')}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT BAR */}
                <div className="bg-carbon-800 border border-carbon-700 rounded-b-xl p-3">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Enter your prompt..."
                      className="flex-1 bg-carbon-900 border border-carbon-600 rounded-lg px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
                      disabled={isProcessing}
                    />
                    
                    {isProcessing ? (
                      <button
                        onClick={handleAbort}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                      >
                        ⏹️ STOP
                      </button>
                    ) : (
                      <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-carbon-700 disabled:text-gray-500 rounded-lg font-bold text-sm transition-all"
                      >
                        🔥 SMELT
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                    className="mt-2 text-[10px] text-gray-500 hover:text-gray-300"
                  >
                    {showSystemPrompt ? '▼' : '▶'} System Prompt
                  </button>
                  
                  {showSystemPrompt && (
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="mt-2 w-full h-20 bg-carbon-900 border border-carbon-600 rounded-lg p-2 text-xs font-mono resize-none focus:border-orange-500 focus:outline-none"
                      placeholder="System prompt..."
                    />
                  )}
                </div>
              </div>

              {/* RIGHT: Token Fuel Gauge */}
              <div className="col-span-3 space-y-4">
                {/* Wallet Balance */}
                <div className="bg-carbon-800 rounded-xl border border-carbon-700 p-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">💰 Token Wallet</h3>
                  <div className="text-3xl font-black text-green-400 mb-2">
                    ${walletBalance.toFixed(2)}
                  </div>
                  <div className="h-2 bg-carbon-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${(walletBalance / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Session: ${sessionCost.toFixed(4)} spent
                  </p>
                </div>

                {/* Session Stats */}
                <div className="bg-carbon-800 rounded-xl border border-carbon-700 p-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">📊 Session Stats</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tokens Used:</span>
                      <span className="font-mono text-white">{sessionTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Messages:</span>
                      <span className="font-mono text-white">{messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active Model:</span>
                      <span className={`font-mono ${modelInfo.color}`}>{modelInfo.name}</span>
                    </div>
                  </div>
                </div>

                {/* V.I.B.E. Score */}
                <div className="bg-linear-to-br from-purple-900/40 to-carbon-800 rounded-xl border border-purple-500/30 p-4">
                  <h3 className="text-xs font-bold text-purple-300 uppercase mb-3 flex items-center gap-2">
                    <span className="text-lg">✨</span> V.I.B.E. Score
                  </h3>
                  <div className="text-4xl font-black text-purple-400 mb-2 text-center">
                    0.92
                  </div>
                  <div className="h-2 bg-carbon-700 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-linear-to-r from-purple-500 to-blue-500 w-[92%]" />
                  </div>
                  <p className="text-[10px] text-gray-500 text-center">
                    Virtue-Indexed Bio-Energy
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-1 text-[9px] text-center">
                    <div className="bg-carbon-900/50 rounded p-1">
                      <div className="text-green-400 font-bold">0.95</div>
                      <div className="text-gray-600">Virtue</div>
                    </div>
                    <div className="bg-carbon-900/50 rounded p-1">
                      <div className="text-blue-400 font-bold">0.89</div>
                      <div className="text-gray-600">Intent</div>
                    </div>
                    <div className="bg-carbon-900/50 rounded p-1">
                      <div className="text-purple-400 font-bold">0.91</div>
                      <div className="text-gray-600">Energy</div>
                    </div>
                  </div>
                </div>

                {/* Model Info */}
                <div className="bg-carbon-800 rounded-xl border border-carbon-700 p-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">🧠 Active Model</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{modelInfo.emoji}</span>
                    <div>
                      <p className="font-bold text-white">{modelInfo.name}</p>
                      <p className="text-[10px] text-gray-500">{modelInfo.provider}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {modelInfo.bestFor.map(tag => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 bg-carbon-900 text-gray-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-[10px] text-gray-500">
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span className="text-white">{modelInfo.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost/1M tokens:</span>
                      <span className="text-green-400">${modelInfo.costPerMToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thinking:</span>
                      <span className={modelInfo.supportsThinking ? 'text-green-400' : 'text-gray-500'}>
                        {modelInfo.supportsThinking ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clear Button */}
                <button
                  onClick={() => {
                    setMessages([]);
                    setSessionCost(0);
                    setSessionTokens(0);
                  }}
                  className="w-full py-2 bg-carbon-800 border border-carbon-700 rounded-lg text-xs font-bold text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all"
                >
                  🗑️ Clear Session
                </button>
              </div>
            </motion.div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === 'integrations' && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-linear-to-r from-purple-500/10 to-carbon-800 rounded-xl border border-purple-500/30 p-6">
                <h2 className="text-xl font-bold mb-2">🔌 External Integrations</h2>
                <p className="text-gray-400 text-sm">
                  Connect AI providers, media engines, and payment systems to the Circuit Box foundry.
                </p>
              </div>

              {/* AI Providers */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-blue-400">🧠</span> AI Providers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations.filter(i => i.category === 'ai').map(integration => (
                    <div key={integration.id} className="bg-carbon-800 rounded-xl p-4 border border-carbon-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold">{integration.name}</h4>
                        <div className={`w-3 h-3 rounded-full ${
                          integration.status === 'connected' ? 'bg-green-500' :
                          integration.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{integration.provider}</p>
                      <button className={`w-full py-2 rounded text-xs font-bold transition-all ${
                        integration.apiKeyConfigured
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}>
                        {integration.apiKeyConfigured ? '✓ Connected' : 'Configure API Key'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media Engines */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-pink-400">🎬</span> Media Engines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrations.filter(i => i.category === 'media').map(integration => (
                    <div key={integration.id} className="bg-carbon-800 rounded-xl p-4 border border-carbon-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {integration.id === 'kieai' ? '🎥' : '🎙️'}
                          </span>
                          <div>
                            <h4 className="font-bold">{integration.name}</h4>
                            <p className="text-xs text-gray-500">{integration.provider}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          integration.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                      
                      {integration.id === 'kieai' && (
                        <div className="bg-black/30 p-3 rounded border border-carbon-700 text-xs mb-3">
                          <p className="text-gray-400 mb-2">Video Generation Engine (Sora 2 compatible)</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              placeholder="Enter Kie.ai API Key"
                              className="flex-1 bg-carbon-900 border border-carbon-600 rounded px-2 py-1 text-xs"
                            />
                            <button className="px-3 py-1 bg-pink-500 hover:bg-pink-600 rounded text-xs font-bold">
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <button className={`w-full py-2 rounded text-xs font-bold transition-all ${
                        integration.apiKeyConfigured
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-pink-500 hover:bg-pink-600 text-white'
                      }`}>
                        {integration.apiKeyConfigured ? '✓ Connected' : 'Configure'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* DEPLOY TAB */}
          {activeTab === 'deploy' && (
            <motion.div
              key="deploy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-carbon-800 rounded-xl border border-carbon-700 p-6">
                <h2 className="text-xl font-bold mb-4">📦 Deployed AI Plugs</h2>
                <div className="space-y-3">
                  {deployedPlugs
                    .filter(p => p.environment === environment)
                    .map(deployed => {
                      const plug = AI_PLUG_REGISTRY.find(p => p.id === deployed.plugId);
                      return (
                        <div
                          key={deployed.plugId}
                          className="flex items-center justify-between bg-carbon-900 rounded-lg p-4 border border-carbon-700"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${
                              deployed.status === 'active' ? 'bg-green-500 animate-pulse' :
                              deployed.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-bold">{plug?.name || deployed.plugId}</p>
                              <p className="text-xs text-gray-500">
                                {deployed.executionCount} executions • {deployed.avgLatency}s avg
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${envColors[deployed.environment]}`}>
                            {deployed.environment.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}

          {/* AGENTS TAB */}
          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-linear-to-r from-orange-500/10 to-carbon-800 rounded-xl border border-orange-500/30 p-6">
                <h2 className="text-2xl font-bold mb-2">🏛️ Boomer_Ang Executive Guild</h2>
                <p className="text-gray-400">AI agents that power Circuit Box operations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { role: 'CTO', emoji: '🔧', desc: 'Technical infrastructure', status: 'active' },
                  { role: 'CFO', emoji: '💰', desc: 'Financial operations', status: 'active' },
                  { role: 'COO', emoji: '⚙️', desc: 'Operations & workflows', status: 'active' },
                  { role: 'CMO', emoji: '📢', desc: 'Marketing & outreach', status: 'idle' },
                  { role: 'CDO', emoji: '📊', desc: 'Data & analytics', status: 'active' },
                  { role: 'CPO', emoji: '🎯', desc: 'Product strategy', status: 'idle' },
                ].map(agent => (
                  <div key={agent.role} className="bg-carbon-800 rounded-xl p-5 border border-carbon-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{agent.emoji}</span>
                        <div>
                          <p className="font-bold">Boomer_{agent.role}</p>
                          <p className="text-xs text-gray-500">{agent.desc}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-carbon-800 rounded-xl p-5 border border-carbon-700">
                  <p className="text-xs text-gray-500 uppercase mb-1">Tokens Today</p>
                  <p className="text-2xl font-bold text-blue-400">{(metrics.tokensUsedToday / 1000).toFixed(0)}K</p>
                  <div className="mt-2 h-1 bg-carbon-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(metrics.tokensUsedToday / metrics.tokenLimit) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-carbon-800 rounded-xl p-5 border border-carbon-700">
                  <p className="text-xs text-gray-500 uppercase mb-1">Cost Today</p>
                  <p className="text-2xl font-bold text-green-400">${metrics.costToday.toFixed(2)}</p>
                  <div className="mt-2 h-1 bg-carbon-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(metrics.costToday / metrics.costLimit) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-carbon-800 rounded-xl p-5 border border-carbon-700">
                  <p className="text-xs text-gray-500 uppercase mb-1">Avg Latency</p>
                  <p className="text-2xl font-bold text-orange-400">{metrics.avgLatency}s</p>
                </div>

                <div className="bg-carbon-800 rounded-xl p-5 border border-carbon-700">
                  <p className="text-xs text-gray-500 uppercase mb-1">Queue</p>
                  <p className="text-2xl font-bold text-purple-400">{metrics.queuedTasks}</p>
                </div>
              </div>

              {/* AVVA-NOON Plausibility Equation */}
              <div className="bg-linear-to-r from-carbon-800 to-orange-500/10 rounded-xl border border-orange-500/30 p-6 text-center">
                <p className="text-gray-500 text-xs uppercase mb-2">AVVA-NOON Plausibility Bound</p>
                <p className="text-3xl font-mono font-bold text-orange-400">
                  (-10<sup>18</sup> ≤ x, y ≤ 10<sup>18</sup>)
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  All AI operations remain grounded within finite, verifiable parameters.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmelterOSPage;
