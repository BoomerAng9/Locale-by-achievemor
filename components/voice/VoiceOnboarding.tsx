/**
 * Voice Clone Onboarding Modal
 * Shown on first login to offer voice cloning for ACHEEVY
 */

import React, { useState, useRef } from 'react';
import { createVoiceClone, setCustomVoiceId, VOICE_LIBRARY, setSelectedVoice, previewVoice } from '../../lib/voice';

interface VoiceOnboardingProps {
    userName?: string;
    onComplete: () => void;
    onSkip: () => void;
}

const VoiceOnboarding: React.FC<VoiceOnboardingProps> = ({ userName = 'there', onComplete, onSkip }) => {
    const [step, setStep] = useState<'intro' | 'choose' | 'record' | 'processing' | 'success'>('intro');
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [recordings, setRecordings] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleChoosePreset = (voiceKey: string) => {
        setSelectedPreset(voiceKey);
        setSelectedVoice(voiceKey);
    };

    const handlePreview = async (voiceKey: string) => {
        await previewVoice(voiceKey);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `voice_sample_${Date.now()}.webm`, { type: 'audio/webm' });
                setRecordings(prev => [...prev, file]);
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleCloneVoice = async () => {
        if (recordings.length === 0) return;
        
        setStep('processing');
        
        try {
            const voiceId = await createVoiceClone(`${userName}'s Voice`, recordings, 'Custom ACHEEVY voice for Locale');
            if (voiceId) {
                setStep('success');
            } else {
                // Fallback to preset
                setStep('choose');
            }
        } catch (err) {
            console.error("Voice cloning failed:", err);
            setStep('choose');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-carbon-800 border border-carbon-600 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl">
                
                {/* STEP: Intro */}
                {step === 'intro' && (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-locale-blue to-purple-600 flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🎙️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Welcome, {userName}!</h2>
                        <p className="text-gray-400 mb-8">
                            ACHEEVY can speak to you in your preferred voice. 
                            Would you like to personalize how your AI assistant sounds?
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setStep('choose')}
                                className="bg-locale-blue hover:bg-locale-darkBlue text-white font-bold py-3 px-6 rounded-xl transition-colors"
                            >
                                Choose a Voice
                            </button>
                            <button
                                onClick={onSkip}
                                className="text-gray-400 hover:text-white py-3 px-6 transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP: Choose Voice */}
                {step === 'choose' && (
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white mb-2">Choose ACHEEVY's Voice</h2>
                        <p className="text-gray-500 text-sm mb-6">Select a preset or clone your own voice</p>
                        
                        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto mb-6">
                            {Object.entries(VOICE_LIBRARY).slice(0, 8).map(([key, voice]) => (
                                <div
                                    key={key}
                                    onClick={() => handleChoosePreset(key)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                        selectedPreset === key 
                                            ? 'bg-locale-blue/20 border-locale-blue' 
                                            : 'bg-carbon-900 border-carbon-700 hover:border-carbon-500'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            voice.gender === 'Female' ? 'bg-pink-500/20' : 'bg-blue-500/20'
                                        }`}>
                                            {voice.gender === 'Female' ? '👩' : '👨'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-white text-sm font-medium">{voice.name}</div>
                                            <div className="text-gray-500 text-xs">{voice.style}</div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePreview(key);
                                            }}
                                            className="p-2 text-gray-400 hover:text-white"
                                            title="Preview"
                                        >
                                            ▶️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Clone Option */}
                        <button
                            onClick={() => setStep('record')}
                            className="w-full p-4 rounded-xl border border-dashed border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-center"
                        >
                            <span className="text-purple-400 font-medium">🎙️ Clone My Own Voice</span>
                            <p className="text-gray-500 text-xs mt-1">Record samples to create a custom voice</p>
                        </button>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={onComplete}
                                disabled={!selectedPreset}
                                className="flex-1 bg-locale-blue hover:bg-locale-darkBlue disabled:bg-carbon-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Apply Voice
                            </button>
                            <button
                                onClick={onSkip}
                                className="text-gray-400 hover:text-white py-3 px-4 transition-colors"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP: Record */}
                {step === 'record' && (
                    <div className="p-6 text-center">
                        <h2 className="text-xl font-bold text-white mb-2">Record Your Voice</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Record at least 1 sample (30+ seconds recommended) for best results
                        </p>

                        <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center ${
                            isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-carbon-700'
                        }`}>
                            {isRecording ? (
                                <div className="text-center">
                                    <div className="text-3xl text-red-500">🔴</div>
                                    <div className="text-white font-mono text-lg mt-2">{formatTime(recordingTime)}</div>
                                </div>
                            ) : (
                                <span className="text-4xl">🎙️</span>
                            )}
                        </div>

                        <p className="text-gray-400 text-sm mb-4 max-w-xs mx-auto">
                            Say: "Hello, I'm ACHEEVY, your AI assistant. How can I help you today?"
                        </p>

                        <div className="flex gap-4 justify-center mb-6">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                                >
                                    Start Recording
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="bg-white text-carbon-900 font-bold py-3 px-8 rounded-xl transition-colors"
                                >
                                    Stop Recording
                                </button>
                            )}
                        </div>

                        {recordings.length > 0 && (
                            <div className="text-green-400 text-sm mb-4">
                                ✓ {recordings.length} sample(s) recorded
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleCloneVoice}
                                disabled={recordings.length === 0}
                                className="bg-purple-600 hover:bg-purple-500 disabled:bg-carbon-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors"
                            >
                                Create My Voice Clone
                            </button>
                            <button
                                onClick={() => setStep('choose')}
                                className="text-gray-400 hover:text-white py-3 px-4 transition-colors"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP: Processing */}
                {step === 'processing' && (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <span className="text-4xl">⚡</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-4">Creating Your Voice Clone</h2>
                        <p className="text-gray-400">This may take a few moments...</p>
                        <div className="mt-6">
                            <div className="w-48 h-2 bg-carbon-700 rounded-full mx-auto overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP: Success */}
                {step === 'success' && (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-4">Voice Clone Created!</h2>
                        <p className="text-gray-400 mb-8">
                            ACHEEVY will now respond using your custom voice.
                        </p>
                        <button
                            onClick={onComplete}
                            className="bg-locale-blue hover:bg-locale-darkBlue text-white font-bold py-3 px-8 rounded-xl transition-colors"
                        >
                            Start Using ACHEEVY
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceOnboarding;
