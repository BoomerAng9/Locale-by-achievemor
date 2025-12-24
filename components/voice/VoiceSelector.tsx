/**
 * Voice Selector Panel for ACHEEVY
 * Allows users to preview and select their preferred voice
 */

import React, { useState } from 'react';
import { 
    VOICE_LIBRARY, 
    getSelectedVoice, 
    setSelectedVoice, 
    previewVoice,
    getCustomVoiceId 
} from '../../lib/voice';

interface VoiceSelectorProps {
    onClose: () => void;
    onVoiceChange?: (voiceKey: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onClose, onVoiceChange }) => {
    const [selectedVoice, setSelected] = useState(getSelectedVoice());
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const customVoiceId = getCustomVoiceId();

    const handleSelect = (voiceKey: string) => {
        setSelected(voiceKey);
        setSelectedVoice(voiceKey);
        onVoiceChange?.(voiceKey);
    };

    const handlePreview = async (voiceKey: string) => {
        setIsPlaying(voiceKey);
        await previewVoice(voiceKey);
        setTimeout(() => setIsPlaying(null), 3000);
    };

    const voiceEntries = Object.entries(VOICE_LIBRARY);

    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-carbon-800 border border-carbon-600 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-carbon-800 border-b border-carbon-700 px-4 py-3 flex justify-between items-center">
                <div>
                    <h3 className="text-white font-bold text-sm">ACHEEVY Voice</h3>
                    <p className="text-gray-500 text-xs">Choose how ACHEEVY sounds</p>
                </div>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-white p-1"
                    aria-label="Close voice panel"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Custom Voice Option */}
            {customVoiceId && (
                <div 
                    onClick={() => handleSelect('custom')}
                    className={`px-4 py-3 border-b border-carbon-700 cursor-pointer flex items-center justify-between ${
                        selectedVoice === 'custom' ? 'bg-locale-blue/20 border-l-2 border-l-locale-blue' : 'hover:bg-carbon-700'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-lg">🎙️</span>
                        </div>
                        <div>
                            <div className="text-white font-medium text-sm">Your Custom Voice</div>
                            <div className="text-gray-500 text-xs">Cloned from your recordings</div>
                        </div>
                    </div>
                    {selectedVoice === 'custom' && (
                        <span className="text-locale-blue text-xs font-bold">ACTIVE</span>
                    )}
                </div>
            )}

            {/* Voice List */}
            <div className="divide-y divide-carbon-700">
                {voiceEntries.map(([key, voice]) => (
                    <div 
                        key={key}
                        onClick={() => handleSelect(key)}
                        className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                            selectedVoice === key ? 'bg-locale-blue/20 border-l-2 border-l-locale-blue' : 'hover:bg-carbon-700'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                                voice.gender === 'Female' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                                {voice.gender === 'Female' ? '👩' : '👨'}
                            </div>
                            <div>
                                <div className="text-white font-medium text-sm">{voice.name}</div>
                                <div className="text-gray-500 text-xs">{voice.style} • {voice.accent}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Preview Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreview(key);
                                }}
                                className={`p-2 rounded-full transition-colors ${
                                    isPlaying === key 
                                        ? 'bg-locale-blue text-white animate-pulse' 
                                        : 'text-gray-400 hover:text-white hover:bg-carbon-600'
                                }`}
                                title="Preview voice"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </button>

                            {/* Active Indicator */}
                            {selectedVoice === key && (
                                <span className="text-locale-blue text-xs font-bold">✓</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer: Clone Voice CTA */}
            <div className="sticky bottom-0 bg-carbon-900 border-t border-carbon-700 px-4 py-3">
                <button className="w-full text-center text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center gap-2">
                    <span>🎙️</span>
                    <span>Clone Your Voice</span>
                    <span className="text-gray-600">(Coming Soon)</span>
                </button>
            </div>
        </div>
    );
};

export default VoiceSelector;
