import { FreelanceInputs, FreelanceResults } from '../types';

export function calculateFreelanceVibe(inputs: FreelanceInputs): FreelanceResults {
  const grossRevenue = inputs.clientBudget;
  const platformFees = grossRevenue * (inputs.platformFeePercent / 100);
  const toolCosts = inputs.toolCosts;
  const grossProfit = grossRevenue - platformFees - toolCosts;
  
  // Tax is calculated on Gross Profit
  const taxes = grossProfit * (inputs.taxRateEstimate / 100);
  
  const netProfit = grossProfit - taxes;
  
  // Prevent division by zero
  const effectiveHourlyRate = inputs.expectedHours > 0 
    ? netProfit / inputs.expectedHours 
    : 0;
  
  // Vibe Logic
  let dealVibe: 'HARD_PASS' | 'DECENT' | 'PRIME' = 'DECENT';
  
  const hourlyMultiplier = effectiveHourlyRate / inputs.hourlyRate;
  
  if (effectiveHourlyRate < (inputs.hourlyRate * 0.75)) {
    dealVibe = 'HARD_PASS';
  } else if (effectiveHourlyRate >= (inputs.hourlyRate * 1.25)) {
    dealVibe = 'PRIME';
  } else {
    dealVibe = 'DECENT';
  }
  
  const profitMarginPercent = grossRevenue > 0 
    ? (netProfit / grossRevenue) * 100 
    : 0;

  return {
    grossRevenue,
    platformFees,
    toolCosts,
    grossProfit,
    taxes,
    netProfit,
    effectiveHourlyRate,
    dealVibe,
    profitMarginPercent
  };
}