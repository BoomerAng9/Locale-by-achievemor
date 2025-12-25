/**
 * AI Plug Interface - User-facing component for executing AI Plugs
 * Integrates with ConciergeBot for seamless user experience
 */

import React, { useState, useEffect } from 'react';
import { AI_PLUG_REGISTRY, AIPlug } from '../../lib/ai-plugs/registry';
import { aiPlugEngine, AIPlugExecution } from '../../lib/ai-plugs/engine';

interface AIPlugInterfaceProps {
  userId: string;
  userRole: 'technician' | 'client' | 'admin' | 'professional';
  onExecutionComplete?: (execution: AIPlugExecution) => void;
}

const AIPlugInterface: React.FC<AIPlugInterfaceProps> = ({
  userId,
  userRole,
  onExecutionComplete
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlug, setSelectedPlug] = useState<AIPlug | null>(null);
  const [executionInput, setExecutionInput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<AIPlugExecution[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load execution history on mount
  useEffect(() => {
    const history = aiPlugEngine.getExecutionHistory(userId);
    setExecutionHistory(history);
  }, [userId]);

  // Filter plugs based on user access level
  const getAccessiblePlugs = () => {
    return AI_PLUG_REGISTRY.filter(plug => {
      if (userRole === 'admin' || userRole === 'professional') return true;
      if (userRole === 'technician' && plug.accessLevel !== 'ownership') return true;
      if (userRole === 'client' && plug.accessLevel === 'clients') return true;
      return false;
    });
  };

  const categories = [
    { id: 'all', name: 'All Categories', emoji: '🔌' },
    { id: 'content-creation', name: 'Content Creation', emoji: '✍️' },
    { id: 'legal-compliance', name: 'Legal & Compliance', emoji: '⚖️' },
    { id: 'ecommerce-retail', name: 'E-commerce & Retail', emoji: '🛒' },
    { id: 'marketing-seo', name: 'Marketing & SEO', emoji: '📈' },
    { id: 'voice-chatbots', name: 'Voice & Chatbots', emoji: '🎙️' },
    { id: 'education-training', name: 'Education & Training', emoji: '🎓' },
    { id: 'healthcare-wellness', name: 'Healthcare & Wellness', emoji: '🏥' },
    { id: 'finance-accounting', name: 'Finance & Accounting', emoji: '💰' },
    { id: 'real-estate', name: 'Real Estate', emoji: '🏠' },
    { id: 'hr-recruiting', name: 'HR & Recruiting', emoji: '👥' },
    { id: 'creative-media', name: 'Creative & Media', emoji: '🎨' },
    { id: 'operations-workflow', name: 'Operations & Workflow', emoji: '⚙️' }
  ];

  const filteredPlugs = selectedCategory === 'all'
    ? getAccessiblePlugs()
    : getAccessiblePlugs().filter(plug => plug.category === selectedCategory);

  const handleExecutePlug = async () => {
    if (!selectedPlug || !executionInput.trim()) return;

    setIsExecuting(true);
    try {
      let input: any = executionInput;

      // Try to parse as JSON for structured input
      try {
        input = JSON.parse(executionInput);
      } catch {
        // Keep as string if not valid JSON
      }

      const execution = await aiPlugEngine.executePlug(
        selectedPlug.id,
        userId,
        input,
        (status) => console.log(`Execution status: ${status}`)
      );

      // Update history
      setExecutionHistory(prev => [execution, ...prev.slice(0, 49)]);

      // Notify parent
      onExecutionComplete?.(execution);

      // Reset form
      setExecutionInput('');
      setSelectedPlug(null);

    } catch (error) {
      console.error('Execution failed:', error);
      alert(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: AIPlugExecution['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'running': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-carbon-800 border border-carbon-700 rounded-2xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-purple-500">🔌</span>
            AI Plug Marketplace
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Execute automated AI-powered business services
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 bg-carbon-700 hover:bg-carbon-600 text-gray-300 text-sm rounded-lg transition-colors"
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-purple-500 text-white'
                : 'bg-carbon-700 text-gray-300 hover:bg-carbon-600'
            }`}
          >
            <span>{category.emoji}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* AI Plugs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredPlugs.map(plug => (
          <div
            key={plug.id}
            className={`bg-carbon-900/50 border rounded-xl p-4 cursor-pointer transition-all hover:bg-carbon-700/50 ${
              selectedPlug?.id === plug.id ? 'border-purple-500 bg-purple-500/10' : 'border-carbon-700'
            }`}
            onClick={() => setSelectedPlug(plug)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm mb-1">{plug.name}</h3>
                <p className="text-xs text-gray-400 capitalize">
                  {plug.category.replace('-', ' ')}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                plug.status === 'active' ? 'bg-green-500' :
                plug.status === 'standby' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>

            <p className="text-xs text-gray-300 mb-3 line-clamp-2">
              {plug.description}
            </p>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {formatCurrency(plug.pricing.baseCost)}/{plug.pricing.unit}
              </span>
              <span className="text-gray-500">
                {plug.metrics.totalExecutions} uses
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Panel */}
      {selectedPlug && (
        <div className="bg-carbon-900/50 border border-purple-500/50 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl">
              🔌
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{selectedPlug.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{selectedPlug.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Cost: {formatCurrency(selectedPlug.pricing.baseCost)}/{selectedPlug.pricing.unit}</span>
                <span>Success Rate: {selectedPlug.metrics.successRate.toFixed(1)}%</span>
                <span>Avg Response: {(selectedPlug.metrics.avgResponseTime / 1000).toFixed(1)}s</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Input Parameters (JSON or plain text)
              </label>
              <textarea
                value={executionInput}
                onChange={(e) => setExecutionInput(e.target.value)}
                placeholder={`Enter input for ${selectedPlug.name}...`}
                className="w-full h-32 bg-carbon-800 border border-carbon-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedPlug(null)}
                className="px-4 py-2 bg-carbon-700 hover:bg-carbon-600 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePlug}
                disabled={isExecuting || !executionInput.trim()}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Execute Plug
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution History */}
      {showHistory && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-4">Execution History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {executionHistory.map(execution => (
              <div key={execution.id} className="bg-carbon-900/50 border border-carbon-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {AI_PLUG_REGISTRY.find(p => p.id === execution.plugId)?.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(execution.startedAt!).toLocaleString()}
                  </span>
                </div>

                {execution.output && (
                  <div className="mt-2 p-3 bg-black/40 rounded border border-carbon-700">
                    <div className="text-xs text-gray-400 mb-1">Output:</div>
                    <pre className="text-xs text-green-400 whitespace-pre-wrap overflow-x-auto">
                      {typeof execution.output === 'string'
                        ? execution.output
                        : JSON.stringify(execution.output, null, 2)
                      }
                    </pre>
                  </div>
                )}

                {execution.error && (
                  <div className="mt-2 p-3 bg-red-900/20 rounded border border-red-700">
                    <div className="text-xs text-red-400 mb-1">Error:</div>
                    <div className="text-xs text-red-300">{execution.error}</div>
                  </div>
                )}
              </div>
            ))}

            {executionHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No executions yet. Select an AI Plug to get started!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlugInterface;