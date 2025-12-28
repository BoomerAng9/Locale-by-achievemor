/**
 * REBUILT TOKEN ESTIMATOR -- REAL-TIME QUOTING ENGINE
 * 
 * Logic:
 * 1. User Inputs Prompt.
 * 2. System routes prompt to FREE TIER (OpenRouter/DeepSeek).
 * 3. AI Returns "Token Estimate" + Logic.
 * 4. UI displays impact on User's Plan.
 */

import React, { useState } from 'react';
import { analyzeTokenCost } from '../../lib/ai/openrouter';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenEstimatorProps {
    userPlanTier?: string;
    currentBalance?: number;
}

const TokenEstimator: React.FC<TokenEstimatorProps> = ({ 
    userPlanTier = 'medium',
    currentBalance = 150000 
}) => {
    const [prompt, setPrompt] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [quote, setQuote] = useState<any>(null);
    const [userBalance] = useState(currentBalance); // Use prop or default

    const handleAnalyze = async () => {
        if (!prompt.trim()) return;
        setIsAnalyzing(true);
        setQuote(null);

        // Call the Dual-Model Engine
        const result = await analyzeTokenCost(prompt);
        
        setIsAnalyzing(false);
        setQuote(result);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-black/90 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
            {/* Background Grid FX */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-xl shadow-lg border border-white/10">
                        ⚡
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Tokenized Quoting Engine</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-purple-400">DUAL-MODEL ROUTING ACTIVE</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* INPUT SECTION */}
                    <div className="flex-1 space-y-4">
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 focus-within:border-purple-500 transition-colors">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your feature build (e.g., 'Build a Stripe subscription flow with webhook handlers')..."
                                className="w-full h-32 bg-transparent text-gray-200 focus:outline-none resize-none placeholder-gray-500 font-mono text-sm"
                            />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !prompt}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                                isAnalyzing 
                                    ? 'bg-gray-800 text-gray-400 cursor-wait' 
                                    : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]'
                            }`}
                        >
                            {isAnalyzing ? 'Routing to DeepSeek V3...' : 'Analyze Deployment Cost'}
                        </button>
                        <p className="text-[10px] text-gray-500 text-center font-mono">
                            Analysis routed via Free-Tier (Zero Cost to You)
                        </p>
                    </div>

                    {/* OUTPUT SECTION */}
                    <div className="flex-1">
                        <AnimatePresence>
                            {isAnalyzing && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center space-y-4 text-gray-500"
                                >
                                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                    <div className="text-xs font-mono animate-pulse">Calculating Complexity...</div>
                                </motion.div>
                            )}

                            {!isAnalyzing && quote && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-gray-900 border border-gray-700 rounded-xl p-6 h-full flex flex-col justify-between relative overflow-hidden"
                                >
                                    {/* Quote Content */}
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Estimated Load</div>
                                                <div className="text-4xl font-black text-white">{quote.estimatedTokens.toLocaleString()} <span className="text-lg text-purple-500">Tokens</span></div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 uppercase">Impact</div>
                                                <div className="text-sm font-bold text-red-400">-{((quote.estimatedTokens / userBalance) * 100).toFixed(1)}% of Plan</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="bg-black/40 rounded p-3">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Complexity (1-10)</div>
                                                <div className="flex gap-1 h-2">
                                                    {Array.from({length: 10}).map((_, i) => (
                                                        <div key={i} className={`flex-1 rounded-sm ${i < quote.complexityScore ? 'bg-purple-500' : 'bg-gray-800'}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-black/40 rounded p-3 border border-white/5">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Analysis Report</div>
                                                <p className="text-xs text-gray-300 leading-relaxed font-mono">
                                                    {quote.analysis}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="relative z-10 pt-4 border-t border-gray-700 flex gap-3">
                                        <button className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">
                                            Approve Build
                                        </button>
                                        <button className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg text-xs uppercase transition-colors">
                                            Export to C1
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            
                            {!isAnalyzing && !quote && (
                                <div className="h-full flex items-center justify-center text-center text-gray-600 text-sm px-8 border-2 border-dashed border-gray-800 rounded-xl">
                                    Awaiting Input. System idle.
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenEstimator;
