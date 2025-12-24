import { CalculatorInputs, CalculatorResults } from '../../types';

export function calculateEarnings(inputs: CalculatorInputs): CalculatorResults {
  const grossRevenue = inputs.hourlyRate * inputs.estimatedHours;
  const platformFees = grossRevenue * (inputs.platformFeePercent / 100);
  const netBeforeTax = grossRevenue - platformFees - inputs.toolCosts;
  const taxes = netBeforeTax * (inputs.taxRatePercent / 100);
  const netProfit = netBeforeTax - taxes;
  
  const effectiveHourlyRate = inputs.estimatedHours > 0 
    ? netProfit / inputs.estimatedHours 
    : 0;

  // Viability Logic
  // If effective rate is < 70% of asked rate, it's low viability (taxes/fees eating too much)
  const ratio = inputs.hourlyRate > 0 ? effectiveHourlyRate / inputs.hourlyRate : 0;
  
  let viabilityScore: 'low' | 'medium' | 'high' = 'medium';
  let advice = "Your project looks stable.";

  if (ratio < 0.6) {
    viabilityScore = 'low';
    advice = "Warning: Fees and taxes are consuming over 40% of your revenue. Consider raising your rate or billing tool costs separately.";
  } else if (ratio > 0.85) {
    viabilityScore = 'high';
    advice = "Excellent. You are retaining a high percentage of your gross revenue.";
  } else {
    advice = "Standard freelance margin. Ensure you track billable hours accurately.";
  }

  return {
    grossRevenue,
    platformFees,
    netBeforeTax,
    taxes,
    netProfit,
    effectiveHourlyRate,
    viabilityScore,
    advice
  };
}