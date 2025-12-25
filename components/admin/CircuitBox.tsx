/**
 * The Circuit Box - Central Command for Nervous System
 * Controls all AI Agents (Boomer_Angs) and System Modules
 * 
 * PRODUCTION MODE: Connected to Firestore 'agent_registry'
 */

import React, { useState, useEffect } from 'react';
import { AGENT_REGISTRY } from '../../lib/agents/registry';
import { AgentState, AgentTask } from '../../lib/firestore/schema';
import { subscribeToAgents, subscribeToTaskQueue, dispatchTask, registerAgentHeartbeat, subscribeToBreakers, updateBreakerState } from '../../lib/agents/manager';
import { PROCESS_FINDER_TASK } from '../../lib/agents/finder';
import { PROCESS_THESYS_TASK } from '../../lib/agents/thesys';
import { AI_PLUG_REGISTRY, AIPlug } from '../../lib/ai-plugs/registry';
import { aiPlugEngine } from '../../lib/ai-plugs/engine';
import { delegationManager, DelegationRequest } from '../../lib/ai-plugs/delegation';

import SystemLogsViewer from './SystemLogsViewer';

interface CircuitBreaker {
  id: string;
  name: string;
  category: 'core' | 'external' | 'financial';
  is_active: boolean; // Changed from status to match schema
  load_percentage: number;
}

const DEFAULT_BREAKERS: CircuitBreaker[] = [
    { id: 'auth', name: 'Auth System', category: 'core', is_active: true, load_percentage: 12 },
    { id: 'vertex', name: 'LLM Gateway (Multi-Model)', category: 'core', is_active: true, load_percentage: 45 }, // Gemini/Claude/OpenRouter
    { id: 'db', name: 'Firestore Sync', category: 'core', is_active: true, load_percentage: 23 },
    
    // Financial
    { id: 'stripe', name: 'Global Payments Router', category: 'financial', is_active: true, load_percentage: 5 }, // Stripe/PayPal
    { id: 'payouts', name: 'Payout Engine', category: 'financial', is_active: true, load_percentage: 0 },
    
    // External Tools
    { id: 'voice_synth', name: 'Voice Synthesis Engine', category: 'external', is_active: true, load_percentage: 15 }, // ElevenLabs
    { id: 'voice_recog', name: 'Voice Recognition Relay', category: 'external', is_active: true, load_percentage: 8 }, // Deepgram
    { id: 'serverless', name: 'Serverless Compute Grid', category: 'external', is_active: true, load_percentage: 2 }, // Modal
    { id: 'comms', name: 'Comms Relay (Email/Chat)', category: 'external', is_active: true, load_percentage: 1 }, // Resend/Telegram

    // C1 System
    { id: 'c1_system', name: 'C1 Implementation Core', category: 'core', is_active: true, load_percentage: 30 }, // C1 Thesys

    { id: 'ballerine', name: 'Identity Verification', category: 'external', is_active: true, load_percentage: 8 },
];

const CircuitBox: React.FC = () => {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [breakers, setBreakers] = useState<CircuitBreaker[]>(DEFAULT_BREAKERS);
  const [activeTab, setActiveTab] = useState<'overview' | 'wiring' | 'ai-plugs' | 'logs'>('overview');
  const [delegations, setDelegations] = useState<DelegationRequest[]>([]);
  const [delegationStats, setDelegationStats] = useState({
    totalDelegations: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    inProgress: 0,
    averageCompletionTime: 0
  });
  
  // Real-time subscriptions
  useEffect(() => {
     // 1. Subscribe to Agent Registry
     const unsubAgents = subscribeToAgents((updatedAgents) => {
        const fullList = AGENT_REGISTRY.map(staticAgent => {
           const live = updatedAgents.find(a => a.id === staticAgent.id);
           return live || { 
              ...staticAgent, 
              last_heartbeat: new Date().toISOString(), 
              metrics: { tasks_completed: 0, uptime_seconds: 0, error_count: 0 } 
           } as AgentState;
        });
        setAgents(fullList);
     });

     // 2. Subscribe to Active Task Queue
     const unsubTasks = subscribeToTaskQueue((updatedTasks) => {
        setTasks(updatedTasks);
        
        // --- SIMULATION RUNNER ---
        // automatically process queued tasks for demo agents
        updatedTasks.forEach(t => {
            if (t.status === 'queued') {
                if (t.target_agent_id === 'finder-ang') {
                    PROCESS_FINDER_TASK(t.id);
                } else if (t.target_agent_id === 'thesys-ang') {
                    PROCESS_THESYS_TASK(t.id);
                }
            }
        });
     });

     // 3. Subscribe to System Breakers
     const unsubBreakers = subscribeToBreakers((updatedBreakers) => {
        if (updatedBreakers.length === 0) return; // Keep defaults if empty
        
        // Merge defaults with live data
        const merged = DEFAULT_BREAKERS.map(def => {
            const live = updatedBreakers.find(b => b.id === def.id);
            return live ? { ...def, ...live } : def;
        });
        setBreakers(merged);
     });

     // 4. Track delegation updates (poll every 2 seconds)
     const delegationInterval = setInterval(() => {
        setDelegationStats(delegationManager.getStatistics());
     }, 2000);

     return () => {
        unsubAgents();
        unsubTasks();
        unsubBreakers();
        clearInterval(delegationInterval);
     };
  }, []);

  const toggleBreaker = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setBreakers(prev => prev.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b));
    await updateBreakerState(id, !currentStatus);
  };

  const toggleAgent = async (id: string, currentStatus: string) => {
     // In production, this sets a 'desired_status' flag in DB that the agent reads.
     // For now, we simulate the agent responding to a command by updating its heartbeat status directly.
     const newStatus = currentStatus === 'active' ? 'offline' : 'active';
     await registerAgentHeartbeat(id, newStatus);
  };

  const handleTestDispatch = async () => {
     const taskId = await dispatchTask('research_request', { query: 'React developers in Austin, TX' }, 'finder-ang');
     console.log('Task Dispatched:', taskId);
     // Simulate the "Worker" picking it up (since we don't have the Python script running)
     setTimeout(() => PROCESS_FINDER_TASK(taskId), 2000); 
  };

  return (
    <div className="min-h-screen bg-carbon-900 text-white p-6 pb-20">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-black text-white mb-2 tracking-tighter flex items-center gap-3">
             <span className="text-orange-500">⚡</span> CIRCUIT BOX
           </h1>
           <p className="text-gray-400 font-mono text-sm max-w-xl">
             INTERNAL OPERATIONS // NERVOUS SYSTEM CONTROL<br/>
             Authorized Personnel Only. Orchestrated by ACHEEVY.
           </p>
        </div>
        <div className="flex gap-2">
           {['overview', 'wiring', 'ai-plugs', 'logs'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                 activeTab === tab 
                   ? 'bg-locale-blue text-white shadow-lg shadow-locale-blue/20' 
                   : 'bg-carbon-800 text-gray-500 hover:text-white'
               }`}
             >
               {tab === 'ai-plugs' ? 'AI PLUGS' : tab.toUpperCase()}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Orchestrator */}
          <div className="md:col-span-2 bg-gradient-to-br from-carbon-800 to-carbon-900 border border-carbon-700 rounded-2xl p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-64 h-64 text-locale-blue" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
             </div>
             
             <div className="relative z-10 flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-black border-2 border-locale-blue flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse">
                   🤖
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-white mb-1">ACHEEVY <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-2 align-middle">ONLINE</span></h2>
                   <p className="text-locale-blue font-mono text-sm mb-4">Master Orchestrator // ii-agent framework</p>
                   <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                      Monitoring system health. Delegating tasks to {agents.filter(a => a.status === 'active' && a.role !== 'orchestrator').length} active Boomer_Angs.
                      Running Tasks: <span className="text-white font-bold">{tasks.length}</span>
                   </p>
                </div>
             </div>
             
             {/* Quick Stats */}
             <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-carbon-700/50">
                <div>
                   <div className="text-xs text-gray-500 uppercase tracking-wide">System Load</div>
                   <div className="text-2xl font-mono text-white">14%</div>
                </div>
                <div>
                   <div className="text-xs text-gray-500 uppercase tracking-wide">Active Threads</div>
                   <div className="text-2xl font-mono text-locale-blue">{tasks.length}</div>
                </div>
                <div>
                   <div className="text-xs text-gray-500 uppercase tracking-wide">Uptime</div>
                   <div className="text-2xl font-mono text-green-400">99.9%</div>
                </div>
             </div>
          </div>

          {/* System Health / Breakers Summary */}
          <div className="bg-carbon-800 border-l-4 border-orange-500 rounded-r-2xl p-6">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                Active Breakers
             </h3>
             <div className="space-y-4">
               {breakers.slice(0, 5).map(breaker => (
                 <div key={breaker.id} className="flex items-center justify-between group">
                    <span className={`text-sm ${breaker.is_active ? 'text-gray-300' : 'text-gray-600 line-through'}`}>{breaker.name}</span>
                    <div className="flex items-center gap-2">
                       {breaker.is_active && <span className="text-xs font-mono text-orange-500/80">{breaker.load_percentage}%</span>}
                       <div className={`w-3 h-3 rounded-full ${breaker.is_active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-900'}`}></div>
                    </div>
                 </div>
               ))}
             </div>
             <button 
                onClick={() => setActiveTab('wiring')}
                className="mt-6 w-full py-2 bg-carbon-700 hover:bg-carbon-600 text-xs font-bold uppercase tracking-wider rounded transition-colors"
             >
                Configure Wiring
             </button>
             
             {/* TEST DISPATCH BUTTON */}
             <button 
                onClick={handleTestDispatch}
                className="mt-2 w-full py-2 bg-locale-blue/20 hover:bg-locale-blue/30 text-locale-blue text-xs font-bold uppercase tracking-wider rounded transition-colors border border-locale-blue/50"
             >
                Test Dispatch: Finder_Ang
             </button>
          </div>

          {/* New: Pricing Tiers / Plans Check */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
             {['Free', 'Coffee ($9)', 'Community', 'Pro'].map((tier, i) => (
                <div key={tier} className="bg-carbon-800 border border-carbon-700 p-4 rounded-xl flex items-center justify-between">
                   <span className="font-bold text-gray-300">{tier}</span>
                   <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">ACTIVE</span>
                </div>
             ))}
          </div>
          
          {/* Recent Tasks List */}
          {tasks.length > 0 && (
            <div className="md:col-span-3 bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4">Live Task Queue</h3>
                <div className="space-y-2">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-carbon-900/50 p-3 rounded flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className={`text-xs px-2 py-1 rounded uppercase font-bold mr-3 ${
                                        task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                                    }`}>
                                        {task.status}
                                    </span>
                                    <span className="text-sm font-mono text-gray-300">{task.type}</span>
                                    <span className="text-xs text-gray-500 ml-2">via {task.target_agent_id}</span>
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                    {task.created_at.split('T')[1].split('.')[0]}
                                </div>
                            </div>
                            
                            {/* Result Preview (Thesys Output) */}
                            {task.target_agent_id === 'thesys-ang' && task.status === 'completed' && task.result && (
                                <div className="mt-2 p-3 bg-black/40 rounded border border-carbon-700 text-xs font-mono text-green-400 overflow-hidden">
                                    <strong>Build Plan Generated:</strong>
                                    <pre className="mt-1 whitespace-pre-wrap">{task.result.replace(/\\n/g, '\n').slice(0, 300)}...</pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          )}

        </div>
      )}

      {activeTab === 'wiring' && (
        <div className="space-y-8">
           
           {/* Section 1: Boomer_Angs (Agents) */}
           <div>
              <h3 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-locale-blue">
                 Boomer_Angs <span className="text-gray-500 text-sm font-normal ml-2">// AI Agent Fleet</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {agents.filter(a => a.role !== 'orchestrator').map(agent => (
                    <div key={agent.id} className={`relative bg-carbon-800 border ${agent.status === 'active' ? 'border-locale-blue/50' : 'border-carbon-700'} rounded-2xl p-6 transition-all`}>
                       {agent.status === 'active' && <div className="absolute top-3 right-3 w-2 h-2 bg-locale-blue rounded-full animate-ping"></div>}
                       
                       <div className="flex items-center gap-4 mb-4">
                          <div className="text-3xl bg-carbon-900 w-12 h-12 flex items-center justify-center rounded-xl border border-carbon-700">
                             {/* Emoji Icon based on role if missing */}
                             {agent.role === 'finder' ? '🔍' : agent.role === 'debugger' ? '🐞' : '⚡'}
                          </div>
                          <div>
                             <h4 className="font-bold text-white">{agent.name}</h4>
                             <p className="text-xs text-locale-blue font-mono uppercase">{agent.role}</p>
                          </div>
                       </div>
                       
                       {/* Agent Metrics */}
                       <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                          <div className="bg-carbon-900 rounded p-1">
                             <div className="text-[10px] text-gray-500">TASKS</div>
                             <div className="text-xs font-bold text-white">{agent.metrics?.tasks_completed || 0}</div>
                          </div>
                          <div className="bg-carbon-900 rounded p-1">
                              <div className="text-[10px] text-gray-500">ERRORS</div>
                              <div className="text-xs font-bold text-red-400">{agent.metrics?.error_count || 0}</div>
                          </div>
                          <div className="bg-carbon-900 rounded p-1">
                              <div className="text-[10px] text-gray-500">PING</div>
                              <div className="text-xs font-bold text-green-400">OK</div>
                          </div>
                       </div>
                       
                       <div className="mb-4 flex flex-wrap gap-1">
                          {agent.capabilities?.map(cap => (
                             <span key={cap} className="text-[10px] px-2 py-0.5 bg-carbon-900 text-gray-500 rounded border border-carbon-700">
                                {cap}
                             </span>
                          ))}
                       </div>

                       <div className="flex items-center justify-between pt-4 border-t border-carbon-700">
                          <div className="text-xs font-mono text-gray-600">
                             ID: {agent.id}
                          </div>
                          <button 
                             onClick={() => toggleAgent(agent.id, agent.status)}
                             className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${
                                agent.status === 'active' 
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                             }`}
                          >
                             {agent.status === 'active' ? 'Disable' : 'Activate'}
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Section 2: System Breakers */}
           <div>
              <h3 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-orange-500">
                 System Breakers <span className="text-gray-500 text-sm font-normal ml-2">// Manual Overrides</span>
              </h3>
              <div className="bg-carbon-800 rounded-2xl border border-carbon-700 overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-black/20 text-xs uppercase text-gray-500 font-mono">
                       <tr>
                          <th className="px-6 py-3">Module</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">Load</th>
                          <th className="px-6 py-3 text-right">State</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-carbon-700">
                       {breakers.map(breaker => (
                          <tr key={breaker.id} className="hover:bg-active-row transition-colors">
                             <td className="px-6 py-4 font-bold text-gray-300">{breaker.name}</td>
                             <td className="px-6 py-4">
                                <span className={`text-xs px-2 py-1 rounded uppercase font-bold
                                   ${breaker.category === 'core' ? 'bg-purple-500/10 text-purple-400' : 
                                     breaker.category === 'financial' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}
                                `}>
                                   {breaker.category}
                                </span>
                             </td>
                             <td className="px-6 py-4 font-mono text-sm text-gray-500">
                                <div className="w-24 h-1.5 bg-carbon-900 rounded-full overflow-hidden">
                                   <div className={`h-full ${breaker.load_percentage > 80 ? 'bg-red-500' : 'bg-locale-blue'}`} style={{width: `${breaker.load_percentage}%`}}></div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button
                                   onClick={() => toggleBreaker(breaker.id, breaker.is_active)}
                                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${breaker.is_active ? 'bg-locale-blue' : 'bg-gray-700'}`}
                                >
                                   <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${breaker.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'ai-plugs' && (
        <div className="space-y-8">
          {/* Delegation System Status */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">🔀</span>
              AI Delegation System
              <span className="text-gray-500 text-sm font-normal ml-2">// Task Distribution to Boomer_Ang</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-purple-900/20 border border-purple-700/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-300">{delegationStats.totalDelegations}</div>
                <div className="text-xs text-gray-400 uppercase">Total Tasks</div>
              </div>
              <div className="bg-blue-900/20 border border-blue-700/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-300">{delegationStats.inProgress}</div>
                <div className="text-xs text-gray-400 uppercase">In Progress</div>
              </div>
              <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-300">{delegationStats.completed}</div>
                <div className="text-xs text-gray-400 uppercase">Completed</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-yellow-300">{delegationStats.pending}</div>
                <div className="text-xs text-gray-400 uppercase">Pending</div>
              </div>
              <div className="bg-red-900/20 border border-red-700/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-red-300">{delegationStats.failed}</div>
                <div className="text-xs text-gray-400 uppercase">Failed</div>
              </div>
              <div className="bg-orange-900/20 border border-orange-700/30 p-4 rounded-xl">
                <div className="text-2xl font-bold text-orange-300">{delegationStats.averageCompletionTime}s</div>
                <div className="text-xs text-gray-400 uppercase">Avg Time</div>
              </div>
            </div>
          </div>

          {/* AI Plugs Overview */}
          <div className="bg-gradient-to-br from-carbon-800 to-carbon-900 border border-carbon-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-500">🔌</span>
              AI Plug Registry
              <span className="text-gray-500 text-sm font-normal ml-2">// 100 Automated Business Ideas</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-carbon-900/50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-white">{AI_PLUG_REGISTRY.length}</div>
                <div className="text-xs text-gray-500 uppercase">Total Plugs</div>
              </div>
              <div className="bg-carbon-900/50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-400">
                  {AI_PLUG_REGISTRY.filter(p => p.status === 'active').length}
                </div>
                <div className="text-xs text-gray-500 uppercase">Active</div>
              </div>
              <div className="bg-carbon-900/50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-400">
                  {AI_PLUG_REGISTRY.reduce((sum, p) => sum + p.metrics.totalExecutions, 0)}
                </div>
                <div className="text-xs text-gray-500 uppercase">Total Executions</div>
              </div>
              <div className="bg-carbon-900/50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-yellow-400">
                  ${AI_PLUG_REGISTRY.reduce((sum, p) => sum + p.metrics.revenueGenerated, 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 uppercase">Revenue Generated</div>
              </div>
            </div>
          </div>

          {/* AI Plugs by Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'content-creation',
              'legal-compliance',
              'ecommerce-retail',
              'marketing-seo',
              'voice-chatbots',
              'education-training',
              'healthcare-wellness',
              'finance-accounting',
              'real-estate',
              'hr-recruiting',
              'creative-media',
              'operations-workflow'
            ].map(category => {
              const categoryPlugs = AI_PLUG_REGISTRY.filter(p => p.category === category);
              const activePlugs = categoryPlugs.filter(p => p.status === 'active');

              return (
                <div key={category} className="bg-carbon-800 border border-carbon-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white capitalize">
                      {category.replace('-', ' ')}
                    </h4>
                    <span className="text-xs bg-carbon-900 text-gray-400 px-2 py-1 rounded">
                      {activePlugs.length}/{categoryPlugs.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {categoryPlugs.slice(0, 3).map(plug => (
                      <div key={plug.id} className="flex items-center justify-between p-3 bg-carbon-900/50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-300 truncate">
                            {plug.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {plug.metrics.totalExecutions} executions
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          plug.status === 'active' ? 'bg-green-500' :
                          plug.status === 'standby' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    ))}

                    {categoryPlugs.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-2 border-t border-carbon-700">
                        +{categoryPlugs.length - 3} more plugs
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Performing Plugs */}
          <div className="bg-carbon-800 border border-carbon-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top Performing AI Plugs</h3>
            <div className="space-y-3">
              {AI_PLUG_REGISTRY
                .sort((a, b) => b.metrics.revenueGenerated - a.metrics.revenueGenerated)
                .slice(0, 10)
                .map((plug, index) => (
                  <div key={plug.id} className="flex items-center justify-between p-3 bg-carbon-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{plug.name}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {plug.category.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        ${plug.metrics.revenueGenerated.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {plug.metrics.totalExecutions} exec
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div>
           <SystemLogsViewer maxLogs={100} />
        </div>
      )}
    </div>
  );
};

export default CircuitBox;
