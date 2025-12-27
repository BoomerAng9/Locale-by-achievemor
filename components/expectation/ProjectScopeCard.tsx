/**
 * Project Scope Card
 * 
 * The "Contract of Engagement" UI - displays the dynamic SOW
 * with voice briefing, action list, and acceptance gate.
 */

import React, { useState, useEffect } from 'react';
import { ProjectScope, acceptScope, declineScope, generateVoiceScript } from '../../lib/expectation/ExpectationEngine';
import { speakText } from '../../lib/voice';

interface ProjectScopeCardProps {
  scope: ProjectScope;
  onAccept: () => void;
  onDecline: (reason: string) => void;
  autoPlayVoice?: boolean;
}

const ProjectScopeCard: React.FC<ProjectScopeCardProps> = ({
  scope,
  onAccept,
  onDecline,
  autoPlayVoice = false,
}) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Auto-play voice briefing on mount
  useEffect(() => {
    if (autoPlayVoice) {
      handlePlayVoice();
    }
  }, [autoPlayVoice]);

  const handlePlayVoice = async () => {
    setIsPlaying(true);
    const script = generateVoiceScript(scope);
    try {
      await speakText(script);
    } finally {
      setIsPlaying(false);
    }
  };

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAccept = () => {
    acceptScope(scope.id);
    onAccept();
  };

  const handleDecline = () => {
    declineScope(scope.id, declineReason);
    onDecline(declineReason);
    setShowDeclineModal(false);
  };

  const allRequiredComplete = scope.user_obligations
    .filter(o => o.required)
    .every(o => completedTasks[o.id]);

  return (
    <div className="bg-carbon-800 rounded-2xl border border-carbon-700 overflow-hidden shadow-2xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-carbon-900 px-6 py-4 border-b border-carbon-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Project Scope Document
            </div>
            <h2 className="text-xl font-bold text-white">{scope.title}</h2>
          </div>
          <button
            onClick={handlePlayVoice}
            disabled={isPlaying}
            className={`p-3 rounded-xl transition-all ${
              isPlaying 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-carbon-700 hover:bg-carbon-600 text-gray-400 hover:text-white'
            }`}
            title="Play voice briefing"
          >
            {isPlaying ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Speaking...
              </span>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-b border-carbon-700">
        <p className="text-gray-400">{scope.summary}</p>
      </div>

      {/* Your Obligations */}
      <div className="px-6 py-4 border-b border-carbon-700">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="text-amber-400">📋</span> Your Action Items
        </h3>
        <div className="space-y-3">
          {scope.user_obligations.map(obligation => (
            <div 
              key={obligation.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                completedTasks[obligation.id]
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-carbon-900 border-carbon-700'
              }`}
            >
              <button
                onClick={() => toggleTask(obligation.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  completedTasks[obligation.id]
                    ? 'bg-green-500 border-green-500 text-black'
                    : 'border-gray-600 hover:border-green-400'
                }`}
              >
                {completedTasks[obligation.id] && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${completedTasks[obligation.id] ? 'text-green-400' : 'text-white'}`}>
                    {obligation.task}
                  </span>
                  {obligation.required && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">Required</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{obligation.description}</p>
                <p className="text-xs text-gray-600 mt-1">⏱ {obligation.estimated_time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="px-6 py-4 border-b border-carbon-700">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="text-green-400">💰</span> Project Cost Estimate
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-carbon-900 rounded-xl p-4 border border-carbon-700">
            <div className="text-2xl font-black text-white">{scope.estimated_human_time}</div>
            <div className="text-xs text-gray-500 uppercase">Your Time Investment</div>
          </div>
          <div className="bg-carbon-900 rounded-xl p-4 border border-carbon-700">
            <div className="text-2xl font-black text-green-400">${scope.estimated_dollar_cost.toFixed(2)}</div>
            <div className="text-xs text-gray-500 uppercase">Estimated Cost</div>
          </div>
        </div>
        
        {/* Token Balance */}
        <div className={`mt-4 p-4 rounded-xl border ${
          scope.tier_recommendation.sufficient
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400 uppercase">Token Balance</div>
              <div className="text-lg font-bold text-white">
                {scope.tier_recommendation.current_balance.toLocaleString()} tokens
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase">Required</div>
              <div className={`text-lg font-bold ${
                scope.tier_recommendation.sufficient ? 'text-green-400' : 'text-amber-400'
              }`}>
                {scope.estimated_token_cost.toLocaleString()} tokens
              </div>
            </div>
          </div>
          {!scope.tier_recommendation.sufficient && (
            <div className="mt-3 text-sm text-amber-400">
              ⚠️ {scope.tier_recommendation.upgrade_suggestion}
            </div>
          )}
        </div>
      </div>

      {/* Warnings */}
      {scope.warnings.length > 0 && (
        <div className="px-6 py-4 border-b border-carbon-700">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>⚠️</span> Important Notes
          </h3>
          <ul className="space-y-2">
            {scope.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deliverables */}
      <div className="px-6 py-4 border-b border-carbon-700">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="text-green-400">📦</span> What You'll Receive
        </h3>
        <div className="flex flex-wrap gap-2">
          {scope.deliverables.map(del => (
            <span 
              key={del.id}
              className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm border border-green-500/30"
            >
              {del.name}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-carbon-900">
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeclineModal(true)}
            className="flex-1 py-3 bg-carbon-700 hover:bg-carbon-600 text-gray-400 hover:text-white rounded-xl font-medium transition-colors"
          >
            Need to Simplify
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-black rounded-xl font-bold transition-colors"
          >
            I Understand & Accept ✓
          </button>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email to Me
          </button>
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-carbon-800 rounded-2xl border border-carbon-700 max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-white mb-4">Let's Simplify</h3>
            <p className="text-gray-400 text-sm mb-4">
              Tell me what constraints you have, and I'll find a simpler approach.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., I only have 1 hour, or I can only handle 10 students..."
              className="w-full bg-carbon-900 border border-carbon-700 rounded-xl p-3 text-white placeholder-gray-600 focus:border-green-400 outline-none resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-2 bg-carbon-700 text-gray-400 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 py-2 bg-amber-500 text-black font-bold rounded-xl"
              >
                Simplify My Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectScopeCard;
