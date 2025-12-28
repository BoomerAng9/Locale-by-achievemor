/**
 * AI Plug Dashboard Component
 * Provides a comprehensive interface for browsing, executing, and monitoring AI plugs
 * Integrated with II-Agent capabilities and autonomous execution
 */

import React, { useState, useEffect } from 'react';
import { AI_PLUG_REGISTRY, AIPlug, AIPlugExecution, IIAgentCapability } from '../lib/ai-plugs/registry';
import { aiPlugEngine } from '../lib/ai-plugs/engine';

interface AIPlugDashboardProps {
  userId: string;
  onPlugExecution?: (execution: AIPlugExecution) => void;
}

export const AIPlugDashboard: React.FC<AIPlugDashboardProps> = ({
  userId,
  onPlugExecution
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [executingPlugs, setExecutingPlugs] = useState<Set<string>>(new Set());
  const [executionHistory, setExecutionHistory] = useState<AIPlugExecution[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<AIPlugExecution[]>([]);
  const [selectedPlug, setSelectedPlug] = useState<AIPlug | null>(null);
  const [executionInput, setExecutionInput] = useState<any>({});
  const [executionProgress, setExecutionProgress] = useState<string>('');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(AI_PLUG_REGISTRY.map(plug => plug.category)))];

  // Filter plugs based on category and search
  const filteredPlugs = AI_PLUG_REGISTRY.filter(plug => {
    const matchesCategory = selectedCategory === 'all' || plug.category === selectedCategory;
    const matchesSearch = plug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plug.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    // Load execution history and active executions
    const history = aiPlugEngine.getExecutionHistory(userId);
    const active = aiPlugEngine.getActiveExecutions(userId);

    setExecutionHistory(history);
    setActiveExecutions(active);
  }, [userId]);

  const handleExecutePlug = async (plug: AIPlug) => {
    if (executingPlugs.has(plug.id)) return;

    setExecutingPlugs(prev => new Set(prev).add(plug.id));
    setExecutionProgress('Starting execution...');

    try {
      const execution = await aiPlugEngine.executePlug(
        plug.id,
        userId,
        executionInput,
        (progress) => setExecutionProgress(progress)
      );

      setExecutionHistory(prev => [execution, ...prev]);
      onPlugExecution?.(execution);

      // Show success message
      setExecutionProgress(`✅ ${plug.name} executed successfully!`);

    } catch (error) {
      setExecutionProgress(`❌ Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExecutingPlugs(prev => {
        const newSet = new Set(prev);
        newSet.delete(plug.id);
        return newSet;
      });

      // Clear progress after 3 seconds
      setTimeout(() => setExecutionProgress(''), 3000);
    }
  };

  const getCapabilityIcon = (capability: IIAgentCapability): string => {
    const icons: Record<IIAgentCapability, string> = {
      'web-search': '🔍',
      'source-triangulation': '🎯',
      'content-generation': '✍️',
      'data-analysis': '📊',
      'code-synthesis': '💻',
      'script-generation': '📝',
      'browser-automation': '🌐',
      'file-management': '📁',
      'problem-decomposition': '🧩',
      'stepwise-reasoning': '🧠',
      'pdf-processing': '📄',
      'image-analysis': '🖼️',
      'video-processing': '🎥',
      'deep-research': '🔬',
      'context-management': '📚',
      'token-optimization': '⚡',
      'workflow-automation': '🔄',
      'alternative-path-exploration': '🛤️'
    };
    return icons[capability] || '🤖';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      case 'queued': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="ai-plug-dashboard p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Plug Dashboard</h1>
        <p className="text-gray-600">Execute autonomous business automation with II-Agent enhanced capabilities</p>
      </div>

      {/* Progress indicator */}
      {executionProgress && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">{executionProgress}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search AI plugs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Plug Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlugs.map(plug => (
              <div
                key={plug.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPlug(plug)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{plug.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    plug.accessLevel === 'ownership' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {plug.accessLevel}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plug.description}</p>

                {/* II-Agent Capabilities */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {plug.iiAgentCapabilities.slice(0, 4).map(cap => (
                      <span
                        key={cap}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        title={cap}
                      >
                        {getCapabilityIcon(cap)}
                      </span>
                    ))}
                    {plug.iiAgentCapabilities.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{plug.iiAgentCapabilities.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    ${plug.pricing.baseCost} / {plug.pricing.unit}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecutePlug(plug);
                    }}
                    disabled={executingPlugs.has(plug.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      executingPlugs.has(plug.id)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {executingPlugs.has(plug.id) ? 'Executing...' : 'Execute'}
                  </button>
                </div>

                {/* Metrics */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Executions: {plug.metrics.totalExecutions}</span>
                    <span>Success: {Math.round(plug.metrics.successRate)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Executions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Executions</h3>
            {activeExecutions.length === 0 ? (
              <p className="text-gray-500 text-sm">No active executions</p>
            ) : (
              <div className="space-y-3">
                {activeExecutions.map(execution => {
                  const plug = AI_PLUG_REGISTRY.find(p => p.id === execution.plugId);
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{plug?.name}</p>
                        <p className={`text-xs ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </p>
                      </div>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent History */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h3>
            {executionHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No execution history</p>
            ) : (
              <div className="space-y-3">
                {executionHistory.slice(0, 5).map(execution => {
                  const plug = AI_PLUG_REGISTRY.find(p => p.id === execution.plugId);
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{plug?.name}</p>
                        <p className={`text-xs ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(execution.startedAt!).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Plug Details */}
          {selectedPlug && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plug Details</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{selectedPlug.name}</h4>
                  <p className="text-sm text-gray-600">{selectedPlug.description}</p>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">II-Agent Capabilities</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedPlug.iiAgentCapabilities.map(cap => (
                      <span
                        key={cap}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {getCapabilityIcon(cap)} {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Execution Input</h5>
                  <textarea
                    placeholder="Enter execution parameters as JSON..."
                    value={JSON.stringify(executionInput, null, 2)}
                    onChange={(e) => {
                      try {
                        setExecutionInput(JSON.parse(e.target.value));
                      } catch {
                        // Invalid JSON, keep as string for now
                      }
                    }}
                    className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleExecutePlug(selectedPlug)}
                  disabled={executingPlugs.has(selectedPlug.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {executingPlugs.has(selectedPlug.id) ? 'Executing...' : 'Execute Plug'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPlugDashboard;