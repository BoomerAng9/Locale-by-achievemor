import { ProjectInputs, ProjectResults } from '../../types';

export function calculateProject(inputs: ProjectInputs): ProjectResults {
  const grossRevenue = inputs.clientBudget;
  const platformFees = grossRevenue * (inputs.platformFeePercent / 100);
  const netBeforeTax = grossRevenue - platformFees - inputs.toolCosts;
  
  const taxes = netBeforeTax * (inputs.taxRateEstimate / 100);
  const netProfit = netBeforeTax - taxes;
  
  const effectiveHourlyRate = inputs.expectedHours > 0 
    ? netProfit / inputs.expectedHours 
    : 0;
    
  const profitMargin = grossRevenue > 0 
    ? (netProfit / grossRevenue) * 100 
    : 0;
  
  let dealViability: 'avoid' | 'acceptable' | 'great';
  if (effectiveHourlyRate < inputs.hourlyRate * 0.7) dealViability = 'avoid';
  else if (effectiveHourlyRate < inputs.hourlyRate * 1.2) dealViability = 'acceptable';
  else dealViability = 'great';
  
  return {
    grossRevenue,
    platformFees,
    netBeforeTax,
    taxes,
    netProfit,
    effectiveHourlyRate,
    profitMargin,
    dealViability
  };
}