/**
 * Agent Health Module
 * 
 * Binge Code Phase: DEVELOP (Cycle 4)
 * Agent: CodeAng
 * 
 * Implements the health scoring engine for AI agents with:
 * - 5 metric dimensions (coherence, accuracy, context, efficiency, time)
 * - TAP-OUT logic at < 0.65 health score
 * - Tag-in handoff with context preservation
 */

import { AgentHealthScore } from '../../types';

/**
 * Metrics captured during agent execution
 */
export interface AgentMetrics {
  responseTokens: number;
  promptTokens: number;
  responseTimeMs: number;
  factualClaims: number;
  verifiedClaims: number;
  contextReferences: number;
  expectedContextRefs: number;
  logicalErrors: number;
  totalStatements: number;
}

/**
 * Calculate overall health score from agent metrics
 * 
 * Each dimension is weighted:
 * - Coherence: 25% (logical consistency)
 * - Accuracy: 30% (factual correctness - most important)
 * - Context Retention: 20% (maintains conversation context)
 * - Efficiency: 15% (token usage)
 * - Response Time: 10% (speed)
 */
export function calculateHealthScore(metrics: AgentMetrics): AgentHealthScore {
  // Coherence: (1 - logical errors / total statements)
  const coherence = metrics.totalStatements > 0 
    ? Math.max(0, 1 - (metrics.logicalErrors / metrics.totalStatements))
    : 1;

  // Accuracy: verified claims / total claims
  const accuracy = metrics.factualClaims > 0
    ? metrics.verifiedClaims / metrics.factualClaims
    : 1;

  // Context Retention: references used / expected references
  const contextRetention = metrics.expectedContextRefs > 0
    ? Math.min(1, metrics.contextReferences / metrics.expectedContextRefs)
    : 1;

  // Efficiency: Penalize if response tokens > 3x prompt tokens (verbose)
  const tokenRatio = metrics.promptTokens > 0 
    ? metrics.responseTokens / metrics.promptTokens 
    : 1;
  const efficiency = tokenRatio <= 3 ? 1 : Math.max(0, 1 - ((tokenRatio - 3) / 10));

  // Response Time: Scale from 0-1 based on 0-10 second range
  const responseTime = Math.max(0, 1 - (metrics.responseTimeMs / 10000));

  // Weighted overall score
  const overall = (
    coherence * 0.25 +
    accuracy * 0.30 +
    contextRetention * 0.20 +
    efficiency * 0.15 +
    responseTime * 0.10
  );

  return {
    coherence: Math.round(coherence * 100) / 100,
    accuracy: Math.round(accuracy * 100) / 100,
    contextRetention: Math.round(contextRetention * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    responseTime: Math.round(responseTime * 100) / 100,
    overall: Math.round(overall * 100) / 100,
  };
}

/**
 * Determine if agent should TAP OUT based on health score
 * 
 * Threshold: 0.65 (configurable)
 * Below this, agent performance is degraded and should hand off
 */
export function shouldTapOut(healthScore: AgentHealthScore, threshold = 0.65): boolean {
  return healthScore.overall < threshold;
}

/**
 * Get the health status label for UI display
 */
export function getHealthStatusLabel(overall: number): {
  label: string;
  color: 'green' | 'yellow' | 'red';
  action: string;
} {
  if (overall >= 0.85) {
    return { label: 'Excellent', color: 'green', action: 'Continue' };
  } else if (overall >= 0.65) {
    return { label: 'Good', color: 'yellow', action: 'Monitor' };
  } else {
    return { label: 'Degraded', color: 'red', action: 'Tap Out' };
  }
}

/**
 * Model tiers for rotation/tag-in logic
 */
export const MODEL_TIERS = {
  tier1: {
    name: 'Premium',
    models: ['gemini-2.5-pro', 'claude-3.5-sonnet', 'gpt-4o'],
    costMultiplier: 1.0,
  },
  tier2: {
    name: 'Standard', 
    models: ['gemini-2.0-flash', 'claude-3-haiku', 'deepseek-r1'],
    costMultiplier: 0.3,
  },
  tier3: {
    name: 'Economy',
    models: ['gemini-1.5-flash', 'llama-3.3-70b', 'qwen-2.5-72b'],
    costMultiplier: 0.1,
  },
};

/**
 * Select next model for tag-in based on current model's tier
 * Rotates within tier first, then falls back to lower tier if needed
 */
export function selectTagInModel(currentModel: string, degradationLevel: number): string {
  // Find current tier
  let currentTier: keyof typeof MODEL_TIERS = 'tier1';
  for (const [tier, config] of Object.entries(MODEL_TIERS)) {
    if (config.models.includes(currentModel)) {
      currentTier = tier as keyof typeof MODEL_TIERS;
      break;
    }
  }

  const tierConfig = MODEL_TIERS[currentTier];
  const currentIndex = tierConfig.models.indexOf(currentModel);
  
  // If degradation is severe (< 0.5), drop to lower tier
  if (degradationLevel < 0.5 && currentTier !== 'tier3') {
    const nextTier = currentTier === 'tier1' ? 'tier2' : 'tier3';
    return MODEL_TIERS[nextTier].models[0];
  }

  // Otherwise, rotate within tier
  const nextIndex = (currentIndex + 1) % tierConfig.models.length;
  return tierConfig.models[nextIndex];
}
