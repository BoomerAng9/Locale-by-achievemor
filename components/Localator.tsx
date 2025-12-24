
import React, { useState, useEffect } from 'react';
import { CalculatorInputs, CalculatorResults, Profile } from '../types';
import { calculateEarnings } from '../lib/localator/engine';
import { sendMessageToGLM } from '../lib/llm/glm';
import { MOCK_PROFILES } from '../lib/constants';
import ProfessionalCard from './ProfessionalCard';

const Localator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    hourlyRate: 85,
    estimatedHours: 40,
    platformFeePercent: 15, // Default to Garage Tier
    toolCosts: 150,
    taxRatePercent: 25
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [matchedExperts, setMatchedExperts] = useState<Profile[]>([]);
  const [activeTier, setActiveTier] = useState<'garage' | 'community' | 'global'>('garage');

  // Tier Fee Mapping
  const TIER_FEES = {
    garage: 15,
    community: 10,
    global: 5
  };

  useEffect(() => {
    setResults(calculateEarnings(inputs));
    setAiAnalysis(null); // Reset AI on change
    
    // Expert Locator Logic: Find pros within +/- 25% of input rate
    const matches = MOCK_PROFILES.filter(p => {
        const minRate = inputs.hourlyRate * 0.75;
        const maxRate = inputs.hourlyRate * 1.25;
        return p.hourlyRate >= minRate && p.hourlyRate <= maxRate;
    });
    setMatchedExperts(matches);

  }, [inputs]);

  const handleChange = (field: keyof CalculatorInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleTierChange = (tier: 'garage' | 'community' | 'global') => {
    setActiveTier(tier);
    setInputs(prev => ({ ...prev, platformFeePercent: TIER_FEES[tier] }));
  };

  const runAiAnalysis = async () => {
    if (!results) return;
    setAnalyzing(true);
    // Construct context for the AI
    const context = `calculator: Rate=${inputs.hourlyRate}, Hours=${inputs.estimatedHours}, NetProfit=${results.netProfit}, Viability=${results.viabilityScore}`;
    const response = await sendMessageToGLM([{ id: '1', role: 'user', content: 'Analyze my project earnings.', timestamp: Date.now() }], context);
    setAiAnalysis(response);
    setAnalyzing(false);
  };

  const getViabilityColor = (score: string) => {
    if (score === 'high') return 'text-locale-success border-locale-success/30 bg-locale-success/10';
    if (score === 'low') return 'text-red-500 border-red-500/30 bg-red-500/10';
    return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
  };

  // Calculations for Expert Locator Display
  const estProjectCost = inputs.hourlyRate * inputs.estimatedHours;
  const proDiscount = estProjectCost * 0.15;
  const proProjectCost = estProjectCost - proDiscount;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        
    {/* CALCULATOR SECTION */}
    <div className="bg-carbon-800 rounded-2xl shadow-xl border border-carbon-700 overflow-hidden">
      <div className="bg-carbon-900 border-b border-carbon-700 px-8 py-6 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-white">Localator</h2>
           <p className="text-gray-400 text-sm mt-1">Project ROI & Net Profit Calculator</p>
        </div>
        <div className="w-10 h-10 bg-locale-blue rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-glow">
          $
        </div>
      </div>

      <div className="grid md:grid-cols-12 min-h-[500px]">
        {/* Input Column */}
        <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-carbon-700 p-8 bg-carbon-800/50">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Input Parameters</h3>
           
           <div className="space-y-6">
             {/* Tier Selector */}
             <div>
                <label className="block text-xs text-gray-500 mb-2">Select Your Tier (Auto-sets Fee)</label>
                <div className="flex bg-carbon-900 rounded-lg p-1 border border-carbon-600">
                    {(['garage', 'community', 'global'] as const).map(tier => (
                        <button
                            key={tier}
                            onClick={() => handleTierChange(tier)}
                            className={`flex-1 py-1.5 text-xs font-bold uppercase rounded transition-all ${activeTier === tier ? 'bg-locale-blue text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tier}
                        </button>
                    ))}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Hourly Rate ($)</label>
                   <input 
                      type="number" 
                      value={inputs.hourlyRate}
                      onChange={(e) => handleChange('hourlyRate', e.target.value)}
                      className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-locale-blue transition-colors"
                   />
                </div>
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Est. Hours</label>
                   <input 
                      type="number" 
                      value={inputs.estimatedHours}
                      onChange={(e) => handleChange('estimatedHours', e.target.value)}
                      className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-locale-blue transition-colors"
                   />
                </div>
             </div>

             <div>
                <label className="block text-xs text-gray-500 mb-1">Platform Fee (%)</label>
                <div className="relative">
                  <input 
                      type="number" 
                      value={inputs.platformFeePercent}
                      onChange={(e) => handleChange('platformFeePercent', e.target.value)}
                      className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-locale-blue transition-colors"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 text-sm">%</div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 text-right">Based on {activeTier} tier</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Tool Costs ($)</label>
                   <input 
                      type="number" 
                      value={inputs.toolCosts}
                      onChange={(e) => handleChange('toolCosts', e.target.value)}
                      className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-locale-blue transition-colors"
                   />
                </div>
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Tax Estimate (%)</label>
                   <input 
                      type="number" 
                      value={inputs.taxRatePercent}
                      onChange={(e) => handleChange('taxRatePercent', e.target.value)}
                      className="w-full bg-carbon-700 border border-carbon-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-locale-blue transition-colors"
                   />
                </div>
             </div>
           </div>
        </div>

        {/* Results Column */}
        <div className="md:col-span-7 p-8 flex flex-col">
          {results && (
            <>
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Projected Outcome</h3>
                    <div className="mt-2 text-4xl font-bold text-white tracking-tight">
                       ${results.netProfit.toFixed(2)}
                       <span className="text-lg text-gray-500 font-normal ml-2">Net Profit</span>
                    </div>
                 </div>
                 <div className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-wide ${getViabilityColor(results.viabilityScore)}`}>
                    {results.viabilityScore} Viability
                 </div>
              </div>

              <div className="space-y-3 mb-8">
                 <div className="flex justify-between text-sm p-3 bg-carbon-700/30 rounded-lg">
                    <span className="text-gray-400">Gross Revenue</span>
                    <span className="text-white font-mono">${results.grossRevenue.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm p-3 bg-carbon-700/30 rounded-lg">
                    <span className="text-gray-400">Platform Fees ({inputs.platformFeePercent}%)</span>
                    <span className="text-red-400 font-mono">-${results.platformFees.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm p-3 bg-carbon-700/30 rounded-lg">
                    <span className="text-gray-400">Est. Taxes ({inputs.taxRatePercent}%)</span>
                    <span className="text-red-400 font-mono">-${results.taxes.toFixed(2)}</span>
                 </div>
              </div>

              <div className="mt-auto">
                 {aiAnalysis ? (
                   <div className="bg-locale-blue/10 border border-locale-blue/30 p-4 rounded-xl animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-locale-blue font-bold text-sm">GLM-4.7 Analysis</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis}</p>
                   </div>
                 ) : (
                   <button 
                     onClick={runAiAnalysis}
                     disabled={analyzing}
                     className="w-full py-4 rounded-xl border border-carbon-600 text-gray-300 font-medium hover:bg-carbon-700 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                     {analyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Analyzing with GLM-4.7...
                        </>
                     ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          Ask AI Assistant to Analyze
                        </>
                     )}
                   </button>
                 )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {/* EXPERT LOCATOR SECTION */}
    <div className="animate-fade-in-up delay-200">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
                <h3 className="text-xl font-bold text-white mb-2">Expert Locator</h3>
                <p className="text-gray-400 text-sm">Sourcing talent based on your estimated rate of <span className="text-locale-blue font-bold">${inputs.hourlyRate}/hr</span></p>
            </div>
            {matchedExperts.length > 0 && (
                <div className="text-right bg-carbon-800 p-4 rounded-xl border border-carbon-700 flex gap-6">
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Standard Cost</div>
                        <div className="text-lg font-bold text-gray-300 decoration-slate-500 line-through decoration-2">${estProjectCost.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-xs text-locale-blue uppercase font-bold tracking-wider mb-1">Pro Member Cost</div>
                        <div className="text-xl font-black text-white">${proProjectCost.toLocaleString()}</div>
                    </div>
                    <div className="bg-locale-blue/20 px-2 rounded flex flex-col justify-center items-center">
                        <span className="text-xs text-locale-blue font-bold">SAVE</span>
                        <span className="text-sm text-white font-bold">${proDiscount.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>

        {matchedExperts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {matchedExperts.map(expert => (
                    <ProfessionalCard key={expert.id} profile={expert} />
                ))}
            </div>
        ) : (
            <div className="bg-carbon-800/50 border border-dashed border-carbon-700 rounded-xl p-12 text-center text-gray-500">
                <p>No experts found exactly in this rate range ({`$${(inputs.hourlyRate * 0.75).toFixed(0)} - $${(inputs.hourlyRate * 1.25).toFixed(0)}`}).</p>
                <p className="text-sm mt-2">Try adjusting the hourly rate or explore categories.</p>
            </div>
        )}
    </div>

    </div>
  );
};

export default Localator;
