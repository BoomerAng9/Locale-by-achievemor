/**
 * Circuit Box - System Management Interface
 * Refactored to match High-Fidelity "Metallic/Industrial" Design
 */

import React, { useState, useEffect } from 'react';
import { AGENT_REGISTRY } from '../../lib/agents/registry';
import { AgentState, AgentTask } from '../../lib/firestore/schema';
import { subscribeToAgents, subscribeToTaskQueue, updateBreakerState } from '../../lib/agents/manager';

// --- Types & Mock Data for UI Panels ---

interface BreakerSwitch {
  id: string;
  name: string;
  category: 'core' | 'financial' | 'external' | 'voice' | 'infra';
  isOn: boolean;
  status: 'healthy' | 'warning' | 'error';
  lastCheck?: string;
  meta?: any; // Extra data like "load", "cost", etc.
}

const MOCK_BREAKERS: BreakerSwitch[] = [
    // Panel 3: External Integrations
    { id: 'stripe', name: 'Stripe (Payments)', category: 'financial', isOn: true, status: 'healthy' },
    { id: 'github', name: 'GitHub', category: 'external', isOn: true, status: 'healthy' },
    { id: 'gcp_functions', name: 'GCP Functions', category: 'infra', isOn: true, status: 'healthy' },
    { id: 'postgres', name: 'PostgreSQL Database', category: 'core', isOn: true, status: 'healthy' },
    { id: 'websocket', name: 'WebSocket Service', category: 'core', isOn: true, status: 'healthy' },

    // Panel 4: Voice
    { id: 'voice_stt', name: 'Scribe STT', category: 'voice', isOn: true, status: 'healthy' },
    { id: 'voice_tts', name: 'TTS Circuit', category: 'voice', isOn: true, status: 'healthy' },
    { id: 'voice_stream', name: 'Real-time Streaming', category: 'voice', isOn: true, status: 'healthy' },

    { id: 'cloud_run', name: 'GCP Cloud Run', category: 'infra', isOn: true, status: 'healthy', meta: { lastCheck: '3m ago' } },
    { id: 'firebase_hosting', name: 'Firebase Hosting', category: 'infra', isOn: true, status: 'healthy', meta: { lastCheck: '3m ago' } },
    { id: 'function_deploy', name: 'Function Deployment', category: 'infra', isOn: true, status: 'healthy', meta: { lastCheck: '3m ago' } },
    { id: 'db_backup', name: 'Database Backups', category: 'core', isOn: true, status: 'healthy', meta: { lastCheck: '3m ago' } },
    { id: 'health_check', name: 'Health Check Circuit', category: 'core', isOn: true, status: 'healthy', meta: { lastCheck: '3m ago' } },
];

const REPO_GRID = Array.from({ length: 17 }).map((_, i) => ({
    id: `repo-${i+1}`,
    name: i === 0 ? 'Repo 1 - Core' : i === 1 ? 'Repo 2 - UI' : `Repo ${i+1} - Mod`,
    status: i === 2 ? 'error' : i === 1 ? 'warning' : 'healthy', // Mock some errors
    lastSync: i < 5 ? 'Just now' : '3m ago',
    errors: i === 2 ? 3 : 0
}));

// --- Sub-Components ---

const PanelHeader = ({ title, subTitle }: { title: string, subTitle?: string }) => (
    <div className="bg-gray-300 border-b-2 border-gray-400 p-2 flex items-center justify-between shadow-sm">
        <h3 className="text-gray-800 font-bold text-xs uppercase tracking-tighter">{title}</h3>
        {subTitle && <span className="text-[10px] text-gray-600 font-mono">{subTitle}</span>}
        <div className="w-2 h-2 rounded-full bg-gray-400/50 box-shadow-inner"></div>
    </div>
);

const ToggleSwitch = ({ isOn, onToggle, label }: { isOn: boolean, onToggle: () => void, label?: string }) => (
    <div className="flex items-center justify-between gap-3 bg-gray-800/90 rounded-md p-2 border border-gray-600 shadow-inner">
        {label && <span className="text-gray-300 font-bold text-[10px] uppercase truncate max-w-[80px]">{label}</span>}
        <button 
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-sm transition-all shadow-md group ${isOn ? 'bg-green-600' : 'bg-red-900'}`}
        >
            <div className={`absolute top-0.5 bottom-0.5 w-[45%] bg-gray-200 rounded-sm transition-all shadow-sm ${isOn ? 'right-0.5' : 'left-0.5'}`}>
                {/* Switch texture */}
                <div className="absolute inset-0 flex items-center justify-center gap-[1px]">
                   <div className="w-[1px] h-3 bg-gray-400"></div>
                   <div className="w-[1px] h-3 bg-gray-400"></div>
                   <div className="w-[1px] h-3 bg-gray-400"></div>
                </div>
            </div>
        </button>
    </div>
);

const DigitalStatus = ({ status }: { status: 'healthy' | 'warning' | 'error' }) => {
    const color = status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
    const text = status === 'healthy' ? 'HEALTHY' : status === 'warning' ? 'WARNING' : 'ERROR';
    return (
        <div className={`flex items-center gap-1 ${status === 'healthy' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'} px-2 py-0.5 rounded border border-white/5`}>
            <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`}></div>
            <span className="text-[9px] font-bold tracking-wider">{text}</span>
        </div>
    );
};

const LoadBar = ({ load }: { load: number }) => (
    <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-700">
        <div 
            className={`h-full ${load < 50 ? 'bg-green-500' : load < 80 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-500`} 
            style={{ width: `${load}%` }}
        ></div>
    </div>
);


const CircuitBox: React.FC = () => {
    const [agents, setAgents] = useState<AgentState[]>([]);
    const [breakers, setBreakers] = useState<BreakerSwitch[]>(MOCK_BREAKERS);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>('voice-agent');

    // Subscribe to Agents
    useEffect(() => {
        const unsub = subscribeToAgents((liveAgents) => {
            // Merge live data with registry static data
            const merged = AGENT_REGISTRY.map(staticA => {
                const live = liveAgents.find(la => la.id === staticA.id);
                return live || { 
                    ...staticA, 
                    metrics: { tasks_completed: 0, uptime_seconds: 0, error_count: 0 },
                    last_heartbeat: new Date().toISOString()
                } as AgentState;
            });
            setAgents(merged);
        });
        return () => unsub();
    }, []);

    const toggleBreaker = (id: string) => {
        setBreakers(prev => prev.map(b => {
             if (b.id === id) {
                 const newState = !b.isOn;
                 // Fire and forget update
                 updateBreakerState(id, newState); 
                 return { ...b, isOn: newState };
             }
             return b;
        }));
    };

    const getAgent = (id: string) => agents.find(a => a.id === id);
    const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

    return (
        <div className="min-h-screen bg-[#dcdde1] p-4 font-sans select-none overflow-hidden flex flex-col">
            {/* --- TOP HEADER --- */}
            <div className="flex justify-between items-center mb-4 bg-gray-300 border border-gray-400 rounded-lg p-2 shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="bg-gray-800 p-2 rounded text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   </div>
                   <div>
                       <h1 className="text-xl font-black text-gray-700 tracking-tight uppercase">Circuit Box <span className="font-light text-gray-500">- System Management</span></h1>
                       <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">System Optimal</span>
                       </div>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search/Filter Mock */}
                    <div className="hidden md:flex flex-col gap-1 w-48">
                        <div className="bg-gray-700 text-white text-[10px] px-2 py-1 rounded shadow-inner">Search...</div>
                        <div className="flex gap-1">
                            <div className="bg-gray-400 text-gray-700 text-[9px] px-2 py-0.5 rounded flex-1 font-bold">Status v</div>
                            <div className="bg-gray-400 text-gray-700 text-[9px] px-2 py-0.5 rounded flex-1 font-bold">Category v</div>
                        </div>
                    </div>
                    {/* Big Red Button Mock */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-800 shadow-xl border-4 border-gray-300 flex items-center justify-center cursor-pointer hover:scale-95 transition-transform active:scale-90">
                        <div className="w-8 h-8 rounded-full border-2 border-red-300/30"></div>
                    </div>
                </div>
            </div>

            {/* --- MAIN DASHBOARD GRID --- */}
            <div className="flex-1 grid grid-cols-12 gap-3 pb-20 overflow-y-auto">
                
                {/* PANEL 1: AI AGENTS (Left Column) */}
                <div className="col-span-12 md:col-span-3 bg-gray-200 border-2 border-gray-400 rounded-lg shadow-md flex flex-col">
                    <PanelHeader title="AI Agents Panel" />
                    <div className="p-2 space-y-2 flex-1 overflow-y-auto bg-[#cfd1d6]">
                        {agents.filter(a => a.role !== 'orchestrator').map(agent => (
                            <div 
                                key={agent.id} 
                                onClick={() => setSelectedAgentId(agent.id)}
                                className={`group p-2 rounded border-2 transition-all cursor-pointer ${
                                    selectedAgentId === agent.id 
                                        ? 'bg-gray-700 border-gray-600 shadow-inner' 
                                        : 'bg-gray-300 border-gray-400 hover:bg-gray-200'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[11px] font-bold uppercase ${selectedAgentId === agent.id ? 'text-white' : 'text-gray-700'}`}>
                                        {agent.name}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-2">
                                    <ToggleSwitch isOn={agent.status === 'active'} onToggle={() => {}} />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-[9px] text-gray-500 mb-0.5 font-mono">
                                            <span>Active Load</span>
                                            <span>{Math.floor(Math.random() * 80)}%</span>
                                        </div>
                                        <LoadBar load={Math.floor(Math.random() * 80)} />
                                    </div>
                                </div>
                                <div className="text-[9px] text-gray-500 flex justify-between">
                                    <span>Last activity: 10:05 AM</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MIDDLE COLUMN (Panels 2, 3, 4, 5) */}
                <div className="col-span-12 md:col-span-6 grid grid-rows-2 gap-3">
                    
                    {/* PANEL 2: REPOSITORIES (Top Row) */}
                    <div className="row-span-1 bg-gray-600 border-2 border-gray-500 rounded-lg shadow-md flex flex-col">
                        <PanelHeader title="Repositories Panel" subTitle="17 Intelligent Repos" />
                        <div className="p-3 bg-[#2b2e35] flex-1">
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {REPO_GRID.map((repo, i) => (
                                    <div key={repo.id} className="bg-gray-800 rounded p-1 border border-gray-700 flex flex-col items-center justify-center min-h-[50px]">
                                        <div className="flex items-center justify-between w-full px-1 mb-1">
                                            <div className={`w-2 h-2 rounded-full ${repo.status === 'healthy' ? 'bg-green-500' : repo.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                            <div className="flex gap-0.5">
                                                <div className="w-0.5 h-2 bg-gray-600"></div>
                                                <div className="w-0.5 h-3 bg-gray-600"></div>
                                                <div className="w-0.5 h-1 bg-gray-600"></div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-mono leading-tight text-center">{repo.name}</span>
                                        {repo.errors > 0 && (
                                            <span className="mt-1 bg-red-900/80 text-white text-[8px] px-1 rounded font-bold">{repo.errors}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM ROW (Panels 3, 4, 5) */}
                    <div className="row-span-1 grid grid-cols-3 gap-3">
                         {/* Panel 3: External Integrations */}
                         <div className="bg-gray-200 border-2 border-gray-400 rounded-lg flex flex-col">
                            <PanelHeader title="External Integrations" />
                            <div className="p-2 space-y-2 bg-[#cfd1d6] flex-1 overflow-y-auto">
                                {breakers.filter(b => b.category === 'external' || b.category === 'financial').map(b => (
                                    <div key={b.id} className="bg-gray-300/50 p-2 rounded border border-gray-400/50">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-gray-700">{b.name}</span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${b.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <ToggleSwitch isOn={b.isOn} onToggle={() => toggleBreaker(b.id)} label="ON" />
                                            <span className="text-[9px] font-bold text-green-700 bg-green-200 px-1 rounded">HEALTHY</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>

                         {/* Panel 4: Voice & STT/TTS */}
                         <div className="bg-gray-800 border-2 border-gray-600 rounded-lg flex flex-col">
                            <div className="bg-gray-900 border-b border-gray-700 p-2 flex justify-between">
                                <h3 className="text-gray-300 font-bold text-xs">VOICE & STT/TTS</h3>
                            </div>
                            <div className="p-2 space-y-3 bg-gray-800 flex-1">
                                {breakers.filter(b => b.category === 'voice').map(b => (
                                    <div key={b.id} className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                                         <div className="text-[10px] text-gray-400 mb-1">{b.name}</div>
                                         <div className="flex items-center justify-between">
                                            <ToggleSwitch isOn={b.isOn} onToggle={() => toggleBreaker(b.id)} label="ACTIVE" />
                                         </div>
                                    </div>
                                ))}
                                {/* Voice Mock Controls */}
                                <div className="space-y-1">
                                     <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <span>Latency monitor</span>
                                        <div className="w-8 h-4 bg-gray-700 rounded-full border border-gray-500 relative"><div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5"></div></div>
                                     </div>
                                     <div className="text-[10px] text-gray-500 font-mono">Latency: 50ms</div>
                                </div>
                            </div>
                         </div>

                         {/* Panel 5: Infrastructure */}
                         <div className="bg-gray-200 border-2 border-gray-400 rounded-lg flex flex-col">
                            <PanelHeader title="Deploy & Infra" />
                            <div className="p-2 space-y-2 bg-[#cfd1d6] flex-1 overflow-y-auto">
                                {breakers.filter(b => b.category === 'infra' || b.category === 'core').slice(0, 4).map(b => (
                                    <div key={b.id} className="bg-white/40 p-1.5 rounded border border-gray-300 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-700 leading-tight">{b.name}</div>
                                            <div className="text-[8px] text-gray-500">Last check: {b.meta?.lastCheck || '1m ago'}</div>
                                        </div>
                                        <ToggleSwitch isOn={b.isOn} onToggle={() => toggleBreaker(b.id)} />
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: DETAIL VIEW */}
                <div className="col-span-12 md:col-span-3 bg-gray-300 border-2 border-gray-400 rounded-lg shadow-xl p-4 flex flex-col">
                    <div className="bg-gradient-to-b from-gray-100 to-gray-300 border border-gray-400 rounded-lg p-6 flex flex-col items-center shadow-inner mb-4">
                        {/* BIG SWITCH */}
                        <div className="w-24 h-40 bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg border-2 border-gray-500 shadow-xl flex items-center justify-center p-2">
                             <div className={`w-full h-full rounded border border-gray-400/50 flex flex-col items-center justify-between p-2 shadow-inner transition-all ${
                                 selectedAgent?.status === 'active' ? 'bg-gradient-to-b from-green-100 to-green-200' : 'bg-gradient-to-b from-gray-200 to-gray-300'
                             }`}>
                                 <span className="text-[10px] font-bold text-gray-500">ON</span>
                                 <div className={`w-12 h-16 bg-gradient-to-b from-white to-gray-200 rounded shadow-md transform transition-transform border border-gray-300 ${
                                     selectedAgent?.status === 'active' ? 'translate-y-2' : '-translate-y-2'
                                 }`}>
                                     <div className="w-full h-1 bg-gray-300 mt-2"></div>
                                     <div className="w-full h-1 bg-gray-300 mt-1"></div>
                                 </div>
                                 <span className="text-[10px] font-bold text-gray-500">OFF</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-[#2b2e35] rounded-lg p-4 text-white flex-1 border border-gray-600 shadow-inner">
                        <h2 className="text-center font-bold text-lg mb-1">{selectedAgent?.name}</h2>
                        <div className="text-center text-xs text-blue-400 mb-6 font-mono">{selectedAgent?.role?.toUpperCase()}</div>

                        <div className="space-y-3 text-xs font-mono text-gray-400">
                             <div className="flex justify-between">
                                 <span>API Keys</span>
                                 <span>**********</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Rate Limits</span>
                                 <span>100 req/min</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Timeout</span>
                                 <span>5000ms</span>
                             </div>
                             <div className="flex justify-between">
                                 <span>Retry</span>
                                 <span>3 attempts</span>
                             </div>

                             <div className="pt-4 mt-4 border-t border-gray-700">
                                 <div className="flex justify-between mb-1">
                                     <span className="text-white">Current Load</span>
                                     <span className="text-green-400">78%</span>
                                 </div>
                                 <div className="flex justify-between mb-1">
                                     <span>Request Count</span>
                                     <span>1,245</span>
                                 </div>
                                 <div className="flex justify-between mb-1">
                                     <span>Error Rate</span>
                                     <span>0.1%</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- BOTTOM PANEL: LOGS --- */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#2b2e35] border-t-4 border-gray-500 p-2 flex items-center justify-between z-50 shadow-2xl">
                 <div className="flex flex-col h-full justify-center flex-1 px-4 border-r border-gray-700">
                     <div className="text-[10px] font-mono text-blue-400 truncate">[INFO] 10:10 AM: User 'Admin_JD' enabled 'Testing Agent' circuit.</div>
                     <div className="text-[10px] font-mono text-red-400 truncate">[ALERT] 10:08 AM: 'Repo 2 - UI' circuit tripped due to connection timeout.</div>
                 </div>
                 <div className="w-64 h-full px-4 flex flex-col justify-center space-y-1">
                     <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold">
                         <span className="text-red-500">⚠ Alerts and warnings</span>
                     </div>
                     <div className="flex items-center gap-2 text-[9px] text-yellow-500">
                         <span>⚠ 1 Critical, 2 Warnings</span>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default CircuitBox;
