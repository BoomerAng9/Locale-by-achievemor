/**
 * ACHEEVY Real-Time Token Estimator Widget
 * Embeddable calculator for Deploy by ACHIEVEMOR
 */

import React, { useState, useEffect } from 'react';
import { 
    estimateTokens, 
    classifyIntent, 
    TokenEstimate, 
    PLAN_TIERS 
} from '../../lib/estimator/acheevy';

interface TokenEstimatorProps {
    userPlanTier?: keyof typeof PLAN_TIERS;
    currentBalance?: number;
    onEstimate?: (estimate: TokenEstimate) => void;
}

const TokenEstimator: React.FC<TokenEstimatorProps> = ({
    userPlanTier = 'medium',
    currentBalance = 750000,
    onEstimate
}) => {
    const [prompt, setPrompt] = useState('');
    const [integrations, setIntegrations] = useState(0);
    const [securityLevel, setSecurityLevel] = useState<'light' | 'medium' | 'heavy' | 'defense-grade'>('medium');
    const [estimate, setEstimate] = useState<TokenEstimate | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Real-time estimation as user types
    useEffect(() => {
        if (prompt.trim().length < 10) {
            setEstimate(null);
            return;
        }

        const debounce = setTimeout(() => {
            const result = estimateTokens(prompt, userPlanTier, currentBalance, integrations, securityLevel);
            setEstimate(result);
            onEstimate?.(result);
        }, 300);

        return () => clearTimeout(debounce);
    }, [prompt, integrations, securityLevel, userPlanTier, currentBalance, onEstimate]);

    const formatNumber = (num: number) => num.toLocaleString();

    return (
        <div className="bg-carbon-900 border border-carbon-700 rounded-2xl p-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        ACHEEVY Token Estimator
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Real-time job estimation • No set prices</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500">Your Balance</div>
                    <div className="text-lg font-mono text-green-400">{formatNumber(currentBalance)} tokens</div>
                </div>
            </div>

            {/* Prompt Input */}
            <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Describe Your Task</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Build me an e-commerce site with Stripe integration..."
                    className="w-full bg-black/50 border border-carbon-600 rounded-xl p-4 text-white text-sm placeholder-gray-600 focus:border-locale-blue focus:outline-none resize-none h-24"
                />
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="integrations-input" className="block text-gray-400 text-xs mb-2">Integrations Needed</label>
                    <input
                        id="integrations-input"
                        type="number"
                        min="0"
                        max="10"
                        value={integrations}
                        onChange={(e) => setIntegrations(parseInt(e.target.value) || 0)}
                        title="Number of API integrations"
                        className="w-full bg-black/50 border border-carbon-600 rounded-lg px-4 py-2 text-white text-sm focus:border-locale-blue focus:outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="security-select" className="block text-gray-400 text-xs mb-2">Security Tier</label>
                    <select
                        id="security-select"
                        value={securityLevel}
                        onChange={(e) => setSecurityLevel(e.target.value as any)}
                        title="Select security level"
                        className="w-full bg-black/50 border border-carbon-600 rounded-lg px-4 py-2 text-white text-sm focus:border-locale-blue focus:outline-none"
                    >
                        <option value="light">Light (1.0x)</option>
                        <option value="medium">Medium (1.1x)</option>
                        <option value="heavy">Heavy (1.25x)</option>
                        <option value="defense-grade">Defense-Grade (1.5x)</option>
                    </select>
                </div>
            </div>

            {/* Estimation Results */}
            {estimate && (
                <div className={`rounded-xl p-5 border ${
                    estimate.routing === 'free' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-purple-500/10 border-purple-500/30'
                }`}>
                    {/* Routing Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${
                            estimate.routing === 'free'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-purple-500/20 text-purple-400'
                        }`}>
                            {estimate.routing === 'free' ? '🆓 Free Tier Routing' : '⚡ Premier Tier Routing'}
                        </div>
                        <div className="text-xs text-gray-500">
                            Tier: <span className="text-gray-300 font-mono">{estimate.routing === 'free' ? 'Free Analysis' : 'Premium Build'}</span>
                        </div>
                    </div>

                    {/* Token Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-white font-mono">
                                {formatNumber(estimate.estimatedTokens)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Estimated Token Load</div>
                        </div>
                        <div>
                            <div className={`text-2xl font-bold font-mono ${
                                estimate.planImpact === 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {estimate.planImpact === 0 ? '0' : estimate.planImpact.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Plan Impact</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-400 font-mono">
                                {formatNumber(estimate.remainingBalance)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Remaining Balance</div>
                        </div>
                    </div>

                    {/* Runtime */}
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <div className="text-xs text-gray-500">Est. Runtime (FDH)</div>
                        <div className="text-lg text-white font-mono">{estimate.runtimeEstimate}</div>
                    </div>

                    {/* Intent Detection */}
                    <div className="mt-4 text-center">
                        <span className="text-xs text-gray-500">Detected Intent: </span>
                        <span className={`text-xs font-mono uppercase ${
                            estimate.intent === 'analysis' ? 'text-green-400' : 'text-purple-400'
                        }`}>
                            {estimate.intent}
                        </span>
                    </div>
                </div>
            )}

            {/* CTA */}
            {estimate && estimate.routing === 'premier' && (
                <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                    Execute with ACHEEVY →
                </button>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-600">
                <span className="text-gray-500">Analysis </span>
                <span className="text-green-400">(Free)</span>
                <span className="text-gray-500"> • Builds </span>
                <span className="text-purple-400">(Deducted from Plan)</span>
            </div>
        </div>
    );
};

export default TokenEstimator;
