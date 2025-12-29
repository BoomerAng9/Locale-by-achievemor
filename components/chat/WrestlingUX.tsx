/**
 * Wrestling UX - Tap-Out/Tag-In Visual System
 * 
 * Binge Code Phase: DEVELOP (Cycle 2)
 * Agent: CodeAng
 * 
 * The "Wrestling" metaphor for AI agent handoffs:
 * - TAP OUT: Agent recognizes performance degradation & signals handoff
 * - TAG IN: Fresh model takes over seamlessly
 * - Health Ring: Visual indicator of agent status
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentHealthScore } from '../../types';
import { getHealthStatusLabel, shouldTapOut } from '../../lib/agent-health';

interface WrestlingRingProps {
  currentModel: string;
  nextModel?: string;
  healthScore: AgentHealthScore;
  isTransitioning?: boolean;
  onManualTapOut?: () => void;
}

/**
 * Health Ring - Circular indicator showing agent health
 */
const HealthRing: React.FC<{ 
  health: number; 
  size?: number;
  showLabel?: boolean;
}> = ({ health, size = 120, showLabel = true }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - health);
  
  const status = getHealthStatusLabel(health);
  
  return (
    <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
      {/* Background Ring */}
      <svg className="absolute inset-0 transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-carbon-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={
            status.color === 'green' ? '#22c55e' :
            status.color === 'yellow' ? '#eab308' :
            '#ef4444'
          }
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">
          {Math.round(health * 100)}%
        </span>
        {showLabel && (
          <span className={`text-xs font-mono ${
            status.color === 'green' ? 'text-green-400' :
            status.color === 'yellow' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {status.label}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Tap Out Button - Manual trigger for agent handoff
 */
const TapOutButton: React.FC<{
  onTapOut: () => void;
  disabled?: boolean;
}> = ({ onTapOut, disabled }) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onTapOut}
      disabled={disabled}
      className={`
        relative px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase
        border-2 border-red-500/50 overflow-hidden
        ${disabled 
          ? 'bg-carbon-800 text-gray-500 cursor-not-allowed' 
          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer'
        }
      `}
    >
      {/* Pulse Effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-red-500/20"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <span className="relative">🏷️ TAP OUT</span>
    </motion.button>
  );
};

/**
 * Tag In Indicator - Shows incoming model
 */
const TagInIndicator: React.FC<{
  incomingModel: string;
  isActive: boolean;
}> = ({ incomingModel, isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/50"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 rounded-full border-2 border-green-500 border-t-transparent"
          />
          <div>
            <span className="text-xs text-gray-400">TAGGING IN</span>
            <p className="text-green-400 font-mono font-bold">{incomingModel}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Main Wrestling Ring Component - Shows the full handoff UI
 */
const WrestlingRing: React.FC<WrestlingRingProps> = ({
  currentModel,
  nextModel,
  healthScore,
  isTransitioning = false,
  onManualTapOut,
}) => {
  const needsTapOut = shouldTapOut(healthScore);
  
  return (
    <div className="relative p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700 backdrop-blur-lg">
      {/* Ring Corners (aesthetic) */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-locale-blue/30 rounded-tl" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-locale-blue/30 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-locale-blue/30 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-locale-blue/30 rounded-br" />
      
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">
          Agent Health Monitor
        </h3>
        <p className="text-white font-bold text-lg">{currentModel}</p>
      </div>

      {/* Health Ring */}
      <div className="flex justify-center mb-6">
        <HealthRing health={healthScore.overall} size={140} />
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Coherence', value: healthScore.coherence, icon: '🧠' },
          { label: 'Accuracy', value: healthScore.accuracy, icon: '🎯' },
          { label: 'Context', value: healthScore.contextRetention, icon: '📝' },
          { label: 'Efficiency', value: healthScore.efficiency, icon: '⚡' },
        ].map(metric => (
          <div 
            key={metric.label}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon-900/50"
          >
            <span>{metric.icon}</span>
            <div className="flex-1">
              <span className="text-xs text-gray-500">{metric.label}</span>
              <div className="w-full h-1.5 rounded-full bg-carbon-700 mt-1">
                <motion.div
                  className="h-full rounded-full bg-locale-blue"
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {Math.round(metric.value * 100)}%
            </span>
          </div>
        ))}
      </div>

      {/* Action Area */}
      <div className="flex items-center justify-between">
        {/* Tap Out */}
        <TapOutButton 
          onTapOut={onManualTapOut || (() => {})} 
          disabled={!needsTapOut && !onManualTapOut}
        />

        {/* Tag In Indicator */}
        {nextModel && (
          <TagInIndicator 
            incomingModel={nextModel} 
            isActive={isTransitioning || needsTapOut}
          />
        )}
      </div>

      {/* Warning Banner */}
      <AnimatePresence>
        {needsTapOut && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-400 text-sm">
                Performance degradation detected. Recommend model switch.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Mini Health Badge - Compact version for inline use
 */
export const HealthBadge: React.FC<{ health: number }> = ({ health }) => {
  const status = getHealthStatusLabel(health);
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-carbon-800/50 border border-carbon-700">
      <div className={`w-2 h-2 rounded-full ${
        status.color === 'green' ? 'bg-green-500' :
        status.color === 'yellow' ? 'bg-yellow-500' :
        'bg-red-500 animate-pulse'
      }`} />
      <span className="text-[10px] text-gray-400 font-mono">
        {Math.round(health * 100)}%
      </span>
    </div>
  );
};

export { WrestlingRing, HealthRing, TapOutButton, TagInIndicator };
export default WrestlingRing;
