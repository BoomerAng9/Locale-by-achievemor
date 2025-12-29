/**
 * Agent Health Dashboard - Admin monitoring panel
 * 
 * Binge Code Phase: DEVELOP (Cycle 2)
 * Agent: CodeAng
 * 
 * Features:
 * - Real-time agent health monitoring
 * - Model performance comparison
 * - Tap-out history and trends
 * - Cost/profit analytics
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WrestlingRing, HealthBadge } from '../chat/WrestlingUX';
import { AgentHealthScore } from '../../types';
import { getHealthStatusLabel, selectTagInModel } from '../../lib/agent-health';

// Create health scores directly for mock data
const createMockHealthScore = (
  coherence: number,
  accuracy: number,
  contextRetention: number,
  efficiency: number,
  responseTime: number
): AgentHealthScore => {
  const overall = (
    coherence * 0.25 +
    accuracy * 0.30 +
    contextRetention * 0.20 +
    efficiency * 0.15 +
    responseTime * 0.10
  );
  return { coherence, accuracy, contextRetention, efficiency, responseTime, overall };
};

// Mock data for demonstration
const MOCK_AGENTS = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    healthScore: createMockHealthScore(0.92, 0.88, 0.85, 0.95, 0.90),
    requestsToday: 1247,
    avgLatency: 890,
    costToday: 2.34,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'OpenRouter',
    healthScore: createMockHealthScore(0.78, 0.82, 0.70, 0.88, 0.72),
    requestsToday: 432,
    avgLatency: 1200,
    costToday: 0.89,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'OpenRouter',
    healthScore: createMockHealthScore(0.95, 0.94, 0.92, 0.80, 0.75),
    requestsToday: 156,
    avgLatency: 2100,
    costToday: 4.56,
  },
];

const MOCK_TAP_OUT_HISTORY = [
  { time: '10:23 AM', from: 'DeepSeek R1', to: 'Gemini Flash', reason: 'Context degradation', health: 0.58 },
  { time: '09:45 AM', from: 'Gemini Flash', to: 'Claude Sonnet', reason: 'Complex reasoning required', health: 0.72 },
  { time: '08:12 AM', from: 'DeepSeek R1', to: 'Gemini Flash', reason: 'Rate limit approaching', health: 0.65 },
];

/**
 * Agent Card - Shows individual agent status
 */
const AgentCard: React.FC<{
  agent: typeof MOCK_AGENTS[0];
  isSelected: boolean;
  onSelect: () => void;
}> = ({ agent, isSelected, onSelect }) => {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full p-4 rounded-xl text-left transition-all
        ${isSelected 
          ? 'bg-locale-blue/20 border-2 border-locale-blue' 
          : 'bg-carbon-800/50 border border-carbon-700 hover:border-carbon-600'
        }
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-white font-bold">{agent.name}</h4>
          <span className="text-xs text-gray-500">{agent.provider}</span>
        </div>
        <HealthBadge health={agent.healthScore.overall} />
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded bg-carbon-900/50">
          <span className="text-xs text-gray-500 block">Requests</span>
          <span className="text-white font-mono">{agent.requestsToday.toLocaleString()}</span>
        </div>
        <div className="p-2 rounded bg-carbon-900/50">
          <span className="text-xs text-gray-500 block">Latency</span>
          <span className="text-white font-mono">{agent.avgLatency}ms</span>
        </div>
        <div className="p-2 rounded bg-carbon-900/50">
          <span className="text-xs text-gray-500 block">Cost</span>
          <span className="text-green-400 font-mono">${agent.costToday.toFixed(2)}</span>
        </div>
      </div>
    </motion.button>
  );
};

/**
 * Tap-Out History Row
 */
const TapOutRow: React.FC<{ event: typeof MOCK_TAP_OUT_HISTORY[0] }> = ({ event }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-carbon-900/30 border border-carbon-700/50">
      <span className="text-xs text-gray-500 font-mono w-20">{event.time}</span>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-red-400 text-sm">{event.from}</span>
        <span className="text-gray-600">→</span>
        <span className="text-green-400 text-sm">{event.to}</span>
      </div>
      <span className="text-xs text-gray-400">{event.reason}</span>
      <HealthBadge health={event.health} />
    </div>
  );
};

/**
 * Main Health Dashboard Component
 */
const HealthDashboard: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState(MOCK_AGENTS[0]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  // Calculate recommended tag-in model using health degradation level
  const tagInRecommendation = selectTagInModel(selectedAgent.id, selectedAgent.healthScore.overall);

  return (
    <div className="min-h-screen bg-carbon-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Agent Health Dashboard</h1>
        <p className="text-gray-400">Real-time monitoring of AI model performance and health metrics</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {(['1h', '24h', '7d'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-mono ${
              timeRange === range
                ? 'bg-locale-blue text-white'
                : 'bg-carbon-800 text-gray-400 hover:text-white'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Agent List */}
        <div className="col-span-4 space-y-4">
          <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider mb-4">
            Active Agents
          </h2>
          {MOCK_AGENTS.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent.id === agent.id}
              onSelect={() => setSelectedAgent(agent)}
            />
          ))}
        </div>

        {/* Wrestling Ring Detail */}
        <div className="col-span-4">
          <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider mb-4">
            Health Monitor
          </h2>
          <WrestlingRing
            currentModel={selectedAgent.name}
            nextModel={tagInRecommendation}
            healthScore={selectedAgent.healthScore}
            isTransitioning={false}
          />
        </div>

        {/* Stats Panel */}
        <div className="col-span-4 space-y-6">
          {/* Summary Stats */}
          <div>
            <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider mb-4">
              Today's Summary
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-carbon-800/50 border border-carbon-700">
                <span className="text-xs text-gray-500">Total Requests</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {MOCK_AGENTS.reduce((sum, a) => sum + a.requestsToday, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-carbon-800/50 border border-carbon-700">
                <span className="text-xs text-gray-500">Total Cost</span>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  ${MOCK_AGENTS.reduce((sum, a) => sum + a.costToday, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-carbon-800/50 border border-carbon-700">
                <span className="text-xs text-gray-500">Tap-Outs Today</span>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  {MOCK_TAP_OUT_HISTORY.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-carbon-800/50 border border-carbon-700">
                <span className="text-xs text-gray-500">Avg Health</span>
                <p className="text-2xl font-bold text-locale-blue mt-1">
                  {Math.round(MOCK_AGENTS.reduce((sum, a) => sum + a.healthScore.overall, 0) / MOCK_AGENTS.length * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Tap-Out History */}
          <div>
            <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider mb-4">
              Recent Tap-Outs
            </h2>
            <div className="space-y-2">
              {MOCK_TAP_OUT_HISTORY.map((event, idx) => (
                <TapOutRow key={idx} event={event} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profit Ledger Section */}
      <div className="mt-8 p-6 rounded-2xl bg-carbon-800/30 border border-carbon-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm text-gray-500 font-mono uppercase tracking-wider">
            Profit Ledger Overview
          </h2>
          <button className="px-4 py-2 rounded-lg bg-locale-blue text-white text-sm font-bold">
            View Full Ledger
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-carbon-900/50">
            <span className="text-xs text-gray-500">Gross Revenue</span>
            <p className="text-2xl font-bold text-white mt-1">$23.67</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-carbon-900/50">
            <span className="text-xs text-gray-500">Provider Costs</span>
            <p className="text-2xl font-bold text-red-400 mt-1">-$7.89</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-carbon-900/50">
            <span className="text-xs text-gray-500">Reserve (33%)</span>
            <p className="text-2xl font-bold text-yellow-400 mt-1">$5.26</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-carbon-900/50">
            <span className="text-xs text-gray-500">Net Profit</span>
            <p className="text-2xl font-bold text-green-400 mt-1">$10.52</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
