/**
 * Token Estimator Page
 * Showcases the ACHEEVY Real-Time Token Estimator
 */

import React from 'react';
import { Link } from 'react-router-dom';
import TokenEstimator from '../estimator/TokenEstimator';
import { PLAN_TIERS } from '../../lib/estimator/acheevy';

const TokenEstimatorPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-carbon-900 py-16 px-6">
            {/* Header */}
            <div className="text-center mb-12">
                <Link to="/" className="text-gray-500 hover:text-white text-sm mb-4 inline-block">
                    ← Back to Home
                </Link>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Real-Time <span className="text-purple-400">Token Estimator</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    No set prices. Your job's cost is determined in real-time based on complexity, 
                    integrations, and security requirements. Analysis is free. Builds deduct from your plan.
                </p>
            </div>

            {/* Estimator Widget */}
            <TokenEstimator 
                userPlanTier="medium"
                currentBalance={750000}
            />

            {/* Plans Comparison */}
            <div className="max-w-4xl mx-auto mt-16">
                <h2 className="text-2xl font-bold text-white text-center mb-8">Token Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries(PLAN_TIERS).map(([key, plan]) => (
                        <div key={key} className="bg-carbon-800 border border-carbon-700 rounded-xl p-4 text-center hover:border-locale-blue transition-colors">
                            <div className="text-sm font-bold text-white mb-2">{plan.name}</div>
                            <div className="text-2xl font-mono text-locale-blue">${plan.price}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {plan.tokens.toLocaleString()} tokens
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Routing Explanation */}
            <div className="max-w-3xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-400 mb-3">🆓 Free Tier Routing</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        All analysis, cost checks, and planning reports use free resources. Zero tokens deducted.
                    </p>
                    <div className="space-y-2">
                        <div className="text-xs text-gray-500">Optimized For:</div>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-black/50 rounded text-xs text-green-400">Analysis</span>
                            <span className="px-2 py-1 bg-black/50 rounded text-xs text-green-400">Planning</span>
                            <span className="px-2 py-1 bg-black/50 rounded text-xs text-green-400">Cost Estimates</span>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-purple-400 mb-3">⚡ Premier Tier Routing</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Production builds use our premier infrastructure. Tokens deducted from your plan balance.
                    </p>
                    <div className="space-y-2">
                        <div className="text-xs text-gray-500">Optimized For:</div>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-black/50 rounded text-xs text-purple-400">Builds</span>
                            <span className="px-2 py-1 bg-black/50 rounded text-xs text-purple-400">Deployments</span>
                            <span className="px-2 py-1 bg-black/50 rounded text-xs text-purple-400">Execution</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenEstimatorPage;
