/**
 * Provider Configuration Panel
 * 
 * Allows Admin users to select the runtime implementation (Vendor) for each STRATA Capability.
 * Separates "What we do" (Capability) from "Who does it" (Implementation).
 */

import React, { useState, useEffect } from 'react';
import { STRATA_TOOLS } from '../../lib/strata/ToolRegistry';
import { GlobalConfig } from '../../lib/config/GlobalConfig';

interface ProviderConfigProps {
    onSave?: (updates: any) => void;
}

const ProviderConfig: React.FC<ProviderConfigProps> = () => {
    const [config, setConfig] = useState(GlobalConfig.getProviderConfig());
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    useEffect(() => {
        const handleUpdate = () => {
            setConfig(GlobalConfig.getProviderConfig());
            setLastUpdate(Date.now());
        };
        window.addEventListener('strata-config-changed', handleUpdate);
        return () => window.removeEventListener('strata-config-changed', handleUpdate);
    }, []);

    const categories = Array.from(new Set(STRATA_TOOLS.map(t => t.category)));

    const handleImplementationChange = (capabilityId: string, implId: string) => {
        GlobalConfig.setProvider(capabilityId, implId);
        // Visual feedback logic handled by reactive update
    };

    return (
        <div className="bg-carbon-800 rounded-2xl border border-carbon-700 overflow-hidden">
             {/* Header */}
            <div className="bg-carbon-900 px-6 py-4 border-b border-carbon-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                        🔌
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Runtime Providers</h2>
                        <p className="text-xs text-gray-500">HOTWIRED: Active Configuration Re-routes Immediately</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {categories.map(cat => (
                    <div key={cat} className="mb-8">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-carbon-700 pb-2">
                            {cat.replace('_', ' ')} LAYER
                        </h3>
                        
                        <div className="space-y-4">
                            {STRATA_TOOLS.filter(t => t.category === cat).map(capability => (
                                <div key={capability.id} className="bg-carbon-900 rounded-xl border border-carbon-700 p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-white font-bold">{capability.name}</h4>
                                            <p className="text-xs text-gray-500">{capability.description}</p>
                                        </div>
                                        <div className="text-xs bg-carbon-800 px-2 py-1 rounded text-gray-400 font-mono">
                                            Active: <span className="text-neon-green">{config[capability.id] || capability.default_implementation}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {capability.implementations.map(impl => {
                                            const isSelected = (config[capability.id] || capability.default_implementation) === impl.id;
                                            return (
                                                <button
                                                    key={impl.id}
                                                    onClick={() => handleImplementationChange(capability.id, impl.id)}
                                                    className={`relative p-3 rounded-lg border text-left transition-all ${
                                                        isSelected 
                                                            ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)] ring-1 ring-blue-500' 
                                                            : 'bg-carbon-800 border-carbon-700 hover:border-gray-500 opacity-60 hover:opacity-100'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`font-bold text-sm ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>
                                                            {impl.provider}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-glow animate-pulse" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mb-2">{impl.id}</div>
                                                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 border-t border-carbon-700/50 pt-2 mt-2">
                                                        <span>Cost:</span>
                                                        <span className={impl.cost === 0 ? 'text-green-400' : 'text-white'}>
                                                            ${impl.cost}/{impl.cost_model}
                                                        </span>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProviderConfig;
