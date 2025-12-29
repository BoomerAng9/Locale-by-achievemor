/**
 * Agent Health Module - Barrel Export
 * 
 * Binge Code Phase: DEVELOP
 * 
 * This module provides:
 * - Health scoring for AI agents (coherence, accuracy, efficiency)
 * - Tap-out/Tag-in rotation logic
 * - Profit ledger with per-user reserves
 * - Refund processing for failed tasks
 */

export {
  calculateHealthScore,
  shouldTapOut,
  getHealthStatusLabel,
  selectTagInModel,
  MODEL_TIERS,
  type AgentMetrics,
} from './healthScoring';

export {
  calculateProviderCost,
  calculateProfitBreakdown,
  createLedgerEntry,
  processRefund,
  getModelTier,
  calculateReserveBalance,
  isRefundEligible,
  MODEL_COSTS,
  PRICING_CONFIG,
} from './profitLedger';
