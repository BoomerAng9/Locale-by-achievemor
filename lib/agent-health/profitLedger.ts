/**
 * Profit Ledger Module
 * 
 * Binge Code Phase: DEVELOP (Cycle 3)
 * Agent: DataAng
 * 
 * Implements per-user profit tracking with:
 * - 3x markup on model costs
 * - 1/3 reserve for refunds
 * - 2/3 net profit to platform
 */

import { ProfitLedgerEntry } from '../../types';

/**
 * Model cost lookup (per 1K tokens, approximate)
 */
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gemini-2.5-pro': { input: 0.0025, output: 0.01 },
  'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'deepseek-r1': { input: 0.00014, output: 0.00028 },
  'llama-3.3-70b': { input: 0.00059, output: 0.00079 },
  'qwen-2.5-72b': { input: 0.0004, output: 0.0004 },
};

/**
 * Pricing configuration
 */
export const PRICING_CONFIG = {
  markupMultiplier: 3.0,       // 3x markup on provider cost
  reserveRatio: 1 / 3,         // 1/3 of profit held for refunds
  netProfitRatio: 2 / 3,       // 2/3 of profit to platform
  minimumCharge: 0.01,         // Minimum charge per task ($0.01)
};

/**
 * Calculate provider cost for a task
 */
export function calculateProviderCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['gemini-1.5-flash'];
  const inputCost = (inputTokens / 1000) * costs.input;
  const outputCost = (outputTokens / 1000) * costs.output;
  return inputCost + outputCost;
}

/**
 * Calculate full profit breakdown for a task
 */
export function calculateProfitBreakdown(
  model: string,
  inputTokens: number,
  outputTokens: number
): {
  providerCost: number;
  userBilledPrice: number;
  grossProfit: number;
  reserveAmount: number;
  netProfit: number;
} {
  const providerCost = calculateProviderCost(model, inputTokens, outputTokens);
  const userBilledPrice = Math.max(
    providerCost * PRICING_CONFIG.markupMultiplier,
    PRICING_CONFIG.minimumCharge
  );
  const grossProfit = userBilledPrice - providerCost;
  const reserveAmount = grossProfit * PRICING_CONFIG.reserveRatio;
  const netProfit = grossProfit * PRICING_CONFIG.netProfitRatio;

  return {
    providerCost: Math.round(providerCost * 10000) / 10000,
    userBilledPrice: Math.round(userBilledPrice * 10000) / 10000,
    grossProfit: Math.round(grossProfit * 10000) / 10000,
    reserveAmount: Math.round(reserveAmount * 10000) / 10000,
    netProfit: Math.round(netProfit * 10000) / 10000,
  };
}

/**
 * Create a profit ledger entry for a completed task
 */
export function createLedgerEntry(
  taskId: string,
  userId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  success: boolean
): ProfitLedgerEntry {
  const breakdown = calculateProfitBreakdown(model, inputTokens, outputTokens);

  return {
    taskId,
    userId,
    modelTier: getModelTier(model),
    providerCost: breakdown.providerCost,
    userBilledPrice: breakdown.userBilledPrice,
    reserveAmount: breakdown.reserveAmount,
    netProfit: breakdown.netProfit,
    success,
    refunded: false,
    createdAt: new Date(),
  };
}

/**
 * Process a refund for a failed task
 * Refund comes from the reserve, not from net profit
 */
export function processRefund(
  entry: ProfitLedgerEntry,
  reason: string
): ProfitLedgerEntry {
  return {
    ...entry,
    refunded: true,
    refundReason: reason,
    // The reserve was already set aside, so no additional deduction needed
    // In production, this would trigger a Stripe refund
  };
}

/**
 * Get model tier label for display
 */
export function getModelTier(model: string): string {
  const costs = MODEL_COSTS[model];
  if (!costs) return 'Unknown';

  const avgCost = (costs.input + costs.output) / 2;
  if (avgCost >= 0.005) return 'Premium';
  if (avgCost >= 0.0005) return 'Standard';
  return 'Economy';
}

/**
 * Calculate cumulative user reserve balance
 */
export function calculateReserveBalance(entries: ProfitLedgerEntry[]): number {
  return entries.reduce((total, entry) => {
    if (entry.refunded) {
      // If refunded, reserve was used
      return total;
    }
    return total + entry.reserveAmount;
  }, 0);
}

/**
 * Get refund eligibility for a task
 * A task is eligible for refund if:
 * - It failed (success = false)
 * - It hasn't been refunded yet
 * - User's reserve balance covers it
 */
export function isRefundEligible(
  entry: ProfitLedgerEntry,
  userReserveBalance: number
): boolean {
  return (
    !entry.success &&
    !entry.refunded &&
    userReserveBalance >= entry.reserveAmount
  );
}
