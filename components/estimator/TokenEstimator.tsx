/**
 * Token Estimator Component
 * Simple cost estimation UI for AI operations
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
    const [quote, setQuote] = useState<{
        estimatedTokens: number;
        estimatedCost: number;
        complexity: string;
    } | null>(null);

    const handleAnalyze = async () => {
        if (!prompt.trim()) return;
        setIsAnalyzing(true);
        
        // Simple estimation logic
        await new Promise(r => setTimeout(r, 500));
        
        const words = prompt.split(/\s+/).length;
        const estimatedTokens = Math.ceil(words * 1.3);
        const complexity = words > 100 ? 'complex' : words > 30 ? 'medium' : 'simple';
        const costMultiplier = complexity === 'complex' ? 0.003 : complexity === 'medium' ? 0.001 : 0.0005;
        
        setQuote({
            estimatedTokens,
            estimatedCost: estimatedTokens * costMultiplier,
            complexity
        });
        setIsAnalyzing(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-carbon-800 border border-carbon-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Token Estimator</h3>
                
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your task to estimate token usage..."
                    className="w-full bg-carbon-900 border border-carbon-700 rounded-xl p-4 text-white min-h-[120px] mb-4"
                />
                
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !prompt.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Estimate Cost'}
                </button>
                
                {quote && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 grid grid-cols-3 gap-4"
                    >
                        <div className="bg-carbon-900 rounded-xl p-4 text-center">
                            <div className="text-2xl font-mono text-blue-400">
                                {quote.estimatedTokens.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Est. Tokens</div>
                        </div>
                        <div className="bg-carbon-900 rounded-xl p-4 text-center">
                            <div className="text-2xl font-mono text-green-400">
                                ${quote.estimatedCost.toFixed(4)}
                            </div>
                            <div className="text-xs text-gray-500">Est. Cost</div>
                        </div>
                        <div className="bg-carbon-900 rounded-xl p-4 text-center">
                            <div className="text-2xl font-mono text-purple-400 capitalize">
                                {quote.complexity}
                            </div>
                            <div className="text-xs text-gray-500">Complexity</div>
                        </div>
                    </motion.div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                    Current Balance: {currentBalance.toLocaleString()} tokens ({userPlanTier} tier)
                </div>
            </div>
        </div>
    );
};

export default TokenEstimator;
