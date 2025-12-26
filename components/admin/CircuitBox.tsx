/**
 * Circuit Box - AI Department Management
 * NANO BANANA PRO Design - Dark with Neon Green Accents
 * Manages all AI agents, APIs, and system integrations
 */

import React, { useState, useEffect } from 'react';

// === API STATUS CHECK ===
const getApiStatus = () => ({
    // AI Department - The Forge
    theForge: !!import.meta.env.VITE_OPENAI_API_KEY,
    theGateway: !!import.meta.env.VITE_OPENROUTER_API_KEY,
    theThinker: !!import.meta.env.VITE_DEEPSEEK_API_KEY,
    theSpeedster: !!import.meta.env.VITE_GROQ_API_KEY,
    theResearcher: !!import.meta.env.VITE_PERPLEXITY_API_KEY,
    theSage: !!import.meta.env.VITE_ANTHROPIC_API_KEY,
    theOracle: !!import.meta.env.VITE_GEMINI_API_KEY,
    designFactory: !!import.meta.env.VITE_DESIGN_FACTORY_API_KEY,
    
    // Voice Department
    theScribe: !!import.meta.env.VITE_DEEPGRAM_API_KEY,
    theVoiceArtist: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
    
    // Research Department
    theSeeker: !!import.meta.env.VITE_TAVILY_API_KEY,
    
    // Infrastructure
    theEngine: !!import.meta.env.VITE_MODAL_API_KEY,
});

// === AGENT DEFINITIONS ===
interface AgentConfig {
    id: string;
    name: string;
    codeName: string;
    department: 'ai' | 'voice' | 'research' | 'infra' | 'core';
    description: string;
    envKey: string;
    isEnabled: boolean;
    load: number;
    status: 'online' | 'offline' | 'warning' | 'error';
    lastActivity: string;
    rateLimit: string;
    costPerCall: string;
}

const AI_DEPARTMENT: AgentConfig[] = [
    { id: 'the-forge', name: 'The Forge', codeName: 'Code Generation', department: 'ai', description: 'GPT-4 powered code generation', envKey: 'VITE_OPENAI_API_KEY', isEnabled: true, load: 65, status: 'online', lastActivity: '2s ago', rateLimit: '10K/min', costPerCall: '$0.03' },
    { id: 'the-gateway', name: 'The Gateway', codeName: 'Multi-Model Routing', department: 'ai', description: 'OpenRouter multi-model access', envKey: 'VITE_OPENROUTER_API_KEY', isEnabled: true, load: 78, status: 'online', lastActivity: '1s ago', rateLimit: '5K/min', costPerCall: '$0.01' },
    { id: 'the-thinker', name: 'The Thinker', codeName: 'Deep Reasoning', department: 'ai', description: 'DeepSeek reasoning engine', envKey: 'VITE_DEEPSEEK_API_KEY', isEnabled: true, load: 45, status: 'online', lastActivity: '5s ago', rateLimit: '1K/min', costPerCall: '$0.001' },
    { id: 'the-speedster', name: 'The Speedster', codeName: 'Fast Inference', department: 'ai', description: 'Groq ultra-fast inference', envKey: 'VITE_GROQ_API_KEY', isEnabled: true, load: 30, status: 'online', lastActivity: '3s ago', rateLimit: '30/min', costPerCall: '$0.0001' },
    { id: 'the-sage', name: 'The Sage', codeName: 'Claude AI', department: 'ai', description: 'Anthropic Claude models', envKey: 'VITE_ANTHROPIC_API_KEY', isEnabled: true, load: 55, status: 'online', lastActivity: '10s ago', rateLimit: '1K/min', costPerCall: '$0.015' },
    { id: 'the-oracle', name: 'The Oracle', codeName: 'Gemini AI', department: 'ai', description: 'Google Gemini models', envKey: 'VITE_GEMINI_API_KEY', isEnabled: true, load: 40, status: 'online', lastActivity: '8s ago', rateLimit: '1.5K/min', costPerCall: '$0.0025' },
    { id: 'design-factory', name: 'Design Factory', codeName: 'Internal Agent', department: 'ai', description: 'ACHIEVEMOR agent system', envKey: 'VITE_DESIGN_FACTORY_API_KEY', isEnabled: true, load: 80, status: 'online', lastActivity: '1s ago', rateLimit: '∞', costPerCall: '$0.00' },
];

const VOICE_DEPARTMENT: AgentConfig[] = [
    { id: 'the-scribe', name: 'The Scribe', codeName: 'Speech-to-Text', department: 'voice', description: 'Deepgram Nova-2 STT', envKey: 'VITE_DEEPGRAM_API_KEY', isEnabled: true, load: 25, status: 'online', lastActivity: '15s ago', rateLimit: '100/min', costPerCall: '$0.0043' },
    { id: 'the-voice-artist', name: 'The Voice Artist', codeName: 'Text-to-Speech', department: 'voice', description: 'ElevenLabs TTS', envKey: 'VITE_ELEVENLABS_API_KEY', isEnabled: true, load: 35, status: 'online', lastActivity: '20s ago', rateLimit: '500/min', costPerCall: '$0.001' },
    { id: 'whisper-agent', name: 'Whisper Agent', codeName: 'Groq Whisper', department: 'voice', description: 'Fast voice transcription', envKey: 'VITE_GROQ_API_KEY', isEnabled: true, load: 20, status: 'online', lastActivity: '30s ago', rateLimit: '30/min', costPerCall: '$0.0001' },
];

const RESEARCH_DEPARTMENT: AgentConfig[] = [
    { id: 'the-seeker', name: 'The Seeker', codeName: 'Web Search', department: 'research', description: 'Tavily AI search', envKey: 'VITE_TAVILY_API_KEY', isEnabled: true, load: 15, status: 'online', lastActivity: '1m ago', rateLimit: '1K/month', costPerCall: '$0.01' },
    { id: 'the-researcher', name: 'The Researcher', codeName: 'Deep Research', department: 'research', description: 'Perplexity search synthesis', envKey: 'VITE_PERPLEXITY_API_KEY', isEnabled: true, load: 10, status: 'online', lastActivity: '2m ago', rateLimit: '100/day', costPerCall: '$0.005' },
];

const INFRA_DEPARTMENT: AgentConfig[] = [
    { id: 'the-engine', name: 'The Engine', codeName: 'Serverless Compute', department: 'infra', description: 'Modal serverless', envKey: 'VITE_MODAL_API_KEY', isEnabled: true, load: 50, status: 'online', lastActivity: '5m ago', rateLimit: '∞', costPerCall: '$0.0001' },
    { id: 'stripe', name: 'The Treasury', codeName: 'Payments', department: 'infra', description: 'Stripe payments', envKey: 'VITE_STRIPE_SECRET_KEY', isEnabled: true, load: 5, status: 'online', lastActivity: '10m ago', rateLimit: '∞', costPerCall: '2.9%+$0.30' },
    { id: 'messenger', name: 'The Messenger', codeName: 'Communications', department: 'infra', description: 'Email & notifications', envKey: 'VITE_RESEND_API_KEY', isEnabled: true, load: 8, status: 'online', lastActivity: '15m ago', rateLimit: '100/day', costPerCall: '$0.001' },
];

// === SUB-COMPONENTS ===

const StatusIndicator = ({ status }: { status: 'online' | 'offline' | 'warning' | 'error' }) => {
    const colors = {
        online: 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]',
        offline: 'bg-gray-500',
        warning: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]',
        error: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse',
    };
    return <div className={`w-3 h-3 rounded-full ${colors[status]}`} />;
};

const LoadBar = ({ load, className }: { load: number; className?: string }) => (
    <div className={`h-2 bg-carbon-800 rounded-full overflow-hidden ${className}`}>
        <div 
            className={`h-full transition-all duration-500 ${
                load < 50 ? 'bg-green-400' : load < 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${load}%` }}
        />
    </div>
);

const ToggleSwitch = ({ isOn, onToggle, size = 'md' }: { isOn: boolean; onToggle: () => void; size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = {
        sm: 'w-10 h-5',
        md: 'w-14 h-7',
        lg: 'w-20 h-10',
    };
    const knobSizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-9 h-9',
    };
    return (
        <button 
            onClick={onToggle}
            className={`${sizes[size]} rounded-full transition-all relative ${
                isOn 
                    ? 'bg-green-400/30 border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                    : 'bg-carbon-800 border-2 border-carbon-600'
            }`}
        >
            <div className={`${knobSizes[size]} rounded-full absolute top-0.5 transition-all ${
                isOn 
                    ? 'right-0.5 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]' 
                    : 'left-0.5 bg-gray-500'
            }`} />
        </button>
    );
};

const AgentCard = ({ agent, onToggle, isSelected, onClick }: { 
    agent: AgentConfig; 
    onToggle: () => void; 
    isSelected: boolean;
    onClick: () => void;
}) => (
    <div 
        onClick={onClick}
        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            isSelected 
                ? 'bg-carbon-800 border-green-400/50 shadow-[0_0_20px_rgba(74,222,128,0.1)]' 
                : 'bg-carbon-900 border-carbon-700 hover:border-carbon-500'
        }`}
    >
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                <StatusIndicator status={agent.status} />
                <div>
                    <h4 className="text-white font-bold text-sm">{agent.name}</h4>
                    <span className="text-green-400 text-xs font-mono">{agent.codeName}</span>
                </div>
            </div>
            <ToggleSwitch isOn={agent.isEnabled} onToggle={onToggle} size="sm" />
        </div>
        
        <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Load</span>
                <span className="font-mono">{agent.load}%</span>
            </div>
            <LoadBar load={agent.load} />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
            <span>Last: {agent.lastActivity}</span>
            <span className="font-mono">{agent.costPerCall}</span>
        </div>
    </div>
);

const DepartmentPanel = ({ title, agents, onToggle, selectedId, onSelect }: {
    title: string;
    agents: AgentConfig[];
    onToggle: (id: string) => void;
    selectedId: string | null;
    onSelect: (id: string) => void;
}) => (
    <div className="bg-carbon-900 rounded-2xl border border-carbon-700 overflow-hidden">
        <div className="bg-carbon-800 px-4 py-3 border-b border-carbon-700 flex items-center justify-between">
            <h3 className="text-green-400 font-bold text-sm uppercase tracking-wider">{title}</h3>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{agents.filter(a => a.isEnabled).length}/{agents.length} active</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
        </div>
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {agents.map(agent => (
                <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    onToggle={() => onToggle(agent.id)}
                    isSelected={selectedId === agent.id}
                    onClick={() => onSelect(agent.id)}
                />
            ))}
        </div>
    </div>
);

// === MAIN COMPONENT ===

const CircuitBox: React.FC = () => {
    const [apiStatus, setApiStatus] = useState(getApiStatus());
    const [aiAgents, setAiAgents] = useState(AI_DEPARTMENT);
    const [voiceAgents, setVoiceAgents] = useState(VOICE_DEPARTMENT);
    const [researchAgents, setResearchAgents] = useState(RESEARCH_DEPARTMENT);
    const [infraAgents, setInfraAgents] = useState(INFRA_DEPARTMENT);
    const [selectedAgent, setSelectedAgent] = useState<string | null>('the-gateway');
    const [systemStatus, setSystemStatus] = useState<'optimal' | 'warning' | 'critical'>('optimal');
    const [logs, setLogs] = useState([
        { time: '10:05 AM', type: 'info', message: "User 'Admin' accessed Circuit Box" },
        { time: '10:04 AM', type: 'success', message: "Voice Agent processed 100 requests" },
        { time: '10:03 AM', type: 'warning', message: "The Forge approaching rate limit (85%)" },
    ]);

    const toggleAgent = (department: 'ai' | 'voice' | 'research' | 'infra', id: string) => {
        const setters = { ai: setAiAgents, voice: setVoiceAgents, research: setResearchAgents, infra: setInfraAgents };
        setters[department](prev => prev.map(a => 
            a.id === id ? { ...a, isEnabled: !a.isEnabled } : a
        ));
    };

    const allAgents = [...aiAgents, ...voiceAgents, ...researchAgents, ...infraAgents];
    const selected = allAgents.find(a => a.id === selectedAgent);
    const activeCount = allAgents.filter(a => a.isEnabled).length;
    const totalCount = allAgents.length;

    return (
        <div className="min-h-screen bg-carbon-900 text-white p-6">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center">
                        <span className="text-2xl">🔌</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">
                            <span className="text-neon-green">Circuit Box</span>
                            <span className="text-gray-500 font-light"> - System Management</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${systemStatus === 'optimal' ? 'bg-neon-green' : systemStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-xs text-neon-green font-bold uppercase tracking-wider">
                                System {systemStatus}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Quick Stats */}
                    <div className="text-right">
                        <div className="text-2xl font-bold text-neon-green">{activeCount}/{totalCount}</div>
                        <div className="text-xs text-gray-500">Agents Online</div>
                    </div>
                    
                    {/* Emergency Shutoff */}
                    <button className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-4 border-red-300/30 shadow-xl flex items-center justify-center hover:scale-95 active:scale-90 transition-transform">
                        <div className="w-10 h-10 rounded-full border-2 border-red-300/50" />
                    </button>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-12 gap-6">
                {/* LEFT COLUMN - AI DEPARTMENT */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <DepartmentPanel 
                        title="🤖 AI Department"
                        agents={aiAgents}
                        onToggle={(id) => toggleAgent('ai', id)}
                        selectedId={selectedAgent}
                        onSelect={setSelectedAgent}
                    />
                </div>

                {/* MIDDLE COLUMN - VOICE & RESEARCH */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <DepartmentPanel 
                        title="🎙️ Voice Department"
                        agents={voiceAgents}
                        onToggle={(id) => toggleAgent('voice', id)}
                        selectedId={selectedAgent}
                        onSelect={setSelectedAgent}
                    />
                    <DepartmentPanel 
                        title="🔍 Research Department"
                        agents={researchAgents}
                        onToggle={(id) => toggleAgent('research', id)}
                        selectedId={selectedAgent}
                        onSelect={setSelectedAgent}
                    />
                </div>

                {/* RIGHT COLUMN - DETAIL PANEL */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Selected Agent Details */}
                    {selected && (
                        <div className="bg-carbon-900 rounded-2xl border border-carbon-700 overflow-hidden">
                            <div className="bg-carbon-800 px-4 py-3 border-b border-carbon-700">
                                <h3 className="text-neon-green font-bold text-sm uppercase">Agent Details</h3>
                            </div>
                            <div className="p-6">
                                {/* Big Switch */}
                                <div className="flex justify-center mb-6">
                                    <div className="bg-carbon-800 rounded-2xl p-6 border border-carbon-700">
                                        <ToggleSwitch 
                                            isOn={selected.isEnabled} 
                                            onToggle={() => toggleAgent(selected.department, selected.id)} 
                                            size="lg" 
                                        />
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-white text-center mb-1">{selected.name}</h2>
                                <div className="text-neon-green text-sm font-mono text-center mb-6">{selected.codeName}</div>
                                
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between py-2 border-b border-carbon-800">
                                        <span className="text-gray-500">Status</span>
                                        <span className={selected.isEnabled ? 'text-neon-green' : 'text-red-500'}>
                                            {selected.isEnabled ? 'ACTIVE' : 'DISABLED'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-carbon-800">
                                        <span className="text-gray-500">API Key</span>
                                        <span className="text-gray-400 font-mono">••••••••</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-carbon-800">
                                        <span className="text-gray-500">Rate Limit</span>
                                        <span className="text-white font-mono">{selected.rateLimit}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-carbon-800">
                                        <span className="text-gray-500">Cost/Call</span>
                                        <span className="text-yellow-400 font-mono">{selected.costPerCall}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-500">Load</span>
                                        <span className="text-white font-mono">{selected.load}%</span>
                                    </div>
                                    <LoadBar load={selected.load} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Infrastructure */}
                    <DepartmentPanel 
                        title="⚡ Infrastructure"
                        agents={infraAgents}
                        onToggle={(id) => toggleAgent('infra', id)}
                        selectedId={selectedAgent}
                        onSelect={setSelectedAgent}
                    />
                </div>
            </div>

            {/* BOTTOM LOG PANEL */}
            <div className="fixed bottom-0 left-0 right-0 bg-carbon-900 border-t border-carbon-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className={`text-xs font-mono ${
                                log.type === 'info' ? 'text-blue-400' : 
                                log.type === 'success' ? 'text-neon-green' : 
                                log.type === 'warning' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                                [{log.time}] {log.message}
                            </div>
                        ))}
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Monthly Usage</div>
                        <div className="text-lg font-bold text-neon-green">$12.45</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircuitBox;
