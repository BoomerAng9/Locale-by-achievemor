/**
 * Provider Configuration Panel
 * 
 * Runtime provider selection for LLM and AI capabilities
 * Simplified after FOSTER phase cleanup
 */

import React, { useState } from 'react';

// Simplified capability definitions (replaces deleted STRATA_TOOLS)
const CAPABILITIES = [
    { id: 'llm_primary', name: 'Primary LLM', category: 'ai', default_implementation: 'gemini-2.0-flash-exp' },
    { id: 'llm_fallback', name: 'Fallback LLM', category: 'ai', default_implementation: 'deepseek/deepseek-chat' },
    { id: 'voice_stt', name: 'Voice STT', category: 'voice', default_implementation: 'browser-native' },
    { id: 'voice_tts', name: 'Voice TTS', category: 'voice', default_implementation: 'browser-native' },
];

// Available models per capability
const MODEL_OPTIONS: Record<string, string[]> = {
    llm_primary: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'claude-3-5-sonnet'],
    llm_fallback: ['deepseek/deepseek-chat', 'openai/gpt-4o-mini', 'anthropic/claude-3-haiku'],
    voice_stt: ['browser-native', 'whisper-api'],
    voice_tts: ['browser-native', 'elevenlabs'],
};

interface ProviderConfigProps {
    onSave?: (updates: any) => void;
}

const ProviderConfig: React.FC<ProviderConfigProps> = () => {
    const [config, setConfig] = useState<Record<string, string>>({
        llm_primary: 'gemini-2.0-flash-exp',
        llm_fallback: 'deepseek/deepseek-chat',
        voice_stt: 'browser-native',
        voice_tts: 'browser-native'
    });

    const categories = Array.from(new Set(CAPABILITIES.map(t => t.category)));

    const handleImplementationChange = (capabilityId: string, implId: string) => {
        setConfig(prev => ({ ...prev, [capabilityId]: implId }));
        console.log(`[ProviderConfig] Updated ${capabilityId} to ${implId}`);
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
                        <p className="text-xs text-gray-500">Configure AI model routing</p>
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
                            {CAPABILITIES.filter(t => t.category === cat).map(capability => (
                                <div key={capability.id} className="bg-carbon-900 rounded-xl border border-carbon-700 p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-white font-bold">{capability.name}</h4>
                                            <p className="text-xs text-gray-500">ID: {capability.id}</p>
                                        </div>
                                        <div className="text-xs bg-carbon-800 px-2 py-1 rounded text-gray-400 font-mono">
                                            Active: <span className="text-green-400">{config[capability.id] || capability.default_implementation}</span>
                                        </div>
                                    </div>

                                    {/* Model Selection */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {(MODEL_OPTIONS[capability.id] || []).map(model => {
                                            const isSelected = (config[capability.id] || capability.default_implementation) === model;
                                            return (
                                                <button
                                                    key={model}
                                                    onClick={() => handleImplementationChange(capability.id, model)}
                                                    className={`p-2 rounded-lg border text-left transition-all ${
                                                        isSelected 
                                                            ? 'bg-blue-600/10 border-blue-500' 
                                                            : 'bg-carbon-800 border-carbon-700 hover:border-gray-500 opacity-60'
                                                    }`}
                                                >
                                                    <span className={`font-mono text-xs ${isSelected ? 'text-blue-400' : 'text-gray-400'}`}>
                                                        {model}
                                                    </span>
                                                </button>
                                            );
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
