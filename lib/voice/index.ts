/**
 * Voice Agent Integration (ElevenLabs, Deepgram, Groq Whisper)
 * Handles TTS (ElevenLabs) and STT (Deepgram/Groq Whisper)
 * NO MOCKS - All LIVE API calls
 */

// === API KEYS FROM ENVIRONMENT ===
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY || '';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || '';

// === VOICE LIBRARY ===
// Human-sounding premium voices from ElevenLabs
export const VOICE_LIBRARY = {
    // ElevenLabs Premium Voices
    'rachel': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', accent: 'American', gender: 'Female', style: 'Warm & Professional', provider: 'elevenlabs' },
    'drew': { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', accent: 'American', gender: 'Male', style: 'Confident & Clear', provider: 'elevenlabs' },
    'clyde': { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', accent: 'American', gender: 'Male', style: 'Deep & Authoritative', provider: 'elevenlabs' },
    'paul': { id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul', accent: 'American', gender: 'Male', style: 'Narration & News', provider: 'elevenlabs' },
    'domi': { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', accent: 'American', gender: 'Female', style: 'Strong & Bold', provider: 'elevenlabs' },
    'bella': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', accent: 'American', gender: 'Female', style: 'Soft & Expressive', provider: 'elevenlabs' },
    'antoni': { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', accent: 'American', gender: 'Male', style: 'Well Rounded', provider: 'elevenlabs' },
    'elli': { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', accent: 'American', gender: 'Female', style: 'Young & Emotional', provider: 'elevenlabs' },
    'josh': { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', accent: 'American', gender: 'Male', style: 'Deep & Young', provider: 'elevenlabs' },
    'arnold': { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', accent: 'American', gender: 'Male', style: 'Crisp & Articulate', provider: 'elevenlabs' },
    'adam': { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', accent: 'American', gender: 'Male', style: 'Deep & Narrative', provider: 'elevenlabs' },
    'sam': { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', accent: 'American', gender: 'Male', style: 'Raspy & Warm', provider: 'elevenlabs' },
};

// Custom saved voices (stored in localStorage)
export interface CustomVoice {
    id: string;
    name: string;
    createdAt: number;
    provider: 'elevenlabs' | 'custom';
}

export const getCustomVoices = (): CustomVoice[] => {
    const stored = localStorage.getItem('acheevy_custom_voices');
    return stored ? JSON.parse(stored) : [];
};

export const saveCustomVoice = (voice: CustomVoice): void => {
    const voices = getCustomVoices();
    voices.push(voice);
    localStorage.setItem('acheevy_custom_voices', JSON.stringify(voices));
};

export const deleteCustomVoice = (voiceId: string): void => {
    const voices = getCustomVoices().filter(v => v.id !== voiceId);
    localStorage.setItem('acheevy_custom_voices', JSON.stringify(voices));
};

// Default voice for ACHEEVY
export const DEFAULT_VOICE = 'drew';

// User's selected voice (persisted to localStorage)
export const getSelectedVoice = (): string => {
    return localStorage.getItem('acheevy_voice') || DEFAULT_VOICE;
};

export const setSelectedVoice = (voiceKey: string): void => {
    localStorage.setItem('acheevy_voice', voiceKey);
};

// Custom voice (for voice cloning feature)
export const getCustomVoiceId = (): string | null => {
    return localStorage.getItem('acheevy_custom_voice_id');
};

export const setCustomVoiceId = (voiceId: string): void => {
    localStorage.setItem('acheevy_custom_voice_id', voiceId);
};

// === STT PROVIDER PREFERENCE ===
import { GlobalConfig } from '../config/GlobalConfig';

export type STTProvider = 'groq' | 'deepgram' | 'browser';

export const getSTTProvider = (): STTProvider => {
    // 1. Check Global Admin Config (The Scribe)
    const globalConf = GlobalConfig.getProviderConfig();
    const activeImplementation = globalConf['speech_to_text'];
    
    if (activeImplementation === 'groq_whisper') return 'groq';
    if (activeImplementation === 'deepgram_nova') return 'deepgram';

    // 2. Legacy / User Preference Fallback
    return (localStorage.getItem('acheevy_stt_provider') as STTProvider) || 
           (GROQ_API_KEY ? 'groq' : DEEPGRAM_API_KEY ? 'deepgram' : 'browser');
};

export const setSTTProvider = (provider: STTProvider): void => {
    localStorage.setItem('acheevy_stt_provider', provider);
};

// === TEXT-TO-SPEECH (ElevenLabs) ===
export const speakText = async (text: string, voiceOverride?: string): Promise<void> => {
    if (!ELEVENLABS_API_KEY) {
        console.warn("[Voice] ElevenLabs API Key missing, using browser TTS");
        return browserTTS(text);
    }

    // Determine which voice to use
    let voiceId: string;
    const customVoiceId = getCustomVoiceId();
    
    if (voiceOverride && VOICE_LIBRARY[voiceOverride as keyof typeof VOICE_LIBRARY]) {
        voiceId = VOICE_LIBRARY[voiceOverride as keyof typeof VOICE_LIBRARY].id;
    } else if (customVoiceId) {
        voiceId = customVoiceId;
    } else {
        const selectedKey = getSelectedVoice();
        voiceId = VOICE_LIBRARY[selectedKey as keyof typeof VOICE_LIBRARY]?.id || VOICE_LIBRARY[DEFAULT_VOICE].id;
    }

    try {
        console.log('[Voice] Calling ElevenLabs TTS with voice:', voiceId);
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Voice] ElevenLabs error:', response.status, errorText);
            throw new Error(`ElevenLabs API Error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        await audio.play();
        console.log('[Voice] TTS playback started');
    } catch (err) {
        console.error("[Voice] ElevenLabs TTS Failed:", err);
        // Fallback to browser TTS
        browserTTS(text);
    }
};

// Browser TTS fallback
const browserTTS = (text: string): void => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
};

// === SPEECH-TO-TEXT ===
export const listenToSpeech = async (onTranscript: (text: string) => void): Promise<void> => {
    const provider = getSTTProvider();
    
    console.log('[Voice] Using STT provider:', provider);
    
    switch (provider) {
        case 'groq':
            return groqWhisperSTT(onTranscript);
        case 'deepgram':
            return deepgramSTT(onTranscript);
        default:
            return browserSTT(onTranscript);
    }
};

// === GROQ WHISPER STT (Primary) ===
const groqWhisperSTT = async (onTranscript: (text: string) => void): Promise<void> => {
    if (!navigator.mediaDevices?.getUserMedia) {
        console.warn("[Voice] Browser does not support audio recording");
        return browserSTT(onTranscript);
    }

    try {
        console.log('[Voice] Recording for Groq Whisper...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            try {
                // Convert to base64 for Groq API
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    
                    // Call Groq Whisper via OpenRouter
                    const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${GROQ_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: 'whisper-large-v3',
                            file: base64Audio,
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const transcript = data.text || '';
                        console.log('[Voice] Groq Whisper transcript:', transcript);
                        if (transcript) onTranscript(transcript);
                    } else {
                        console.warn('[Voice] Groq failed, falling back to browser');
                        browserSTT(onTranscript);
                    }
                };
            } catch (err) {
                console.error('[Voice] Groq Whisper failed:', err);
                browserSTT(onTranscript);
            }
        };

        // Record for 5 seconds
        mediaRecorder.start();
        setTimeout(() => {
            if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        }, 5000);
    } catch (err) {
        console.error('[Voice] Recording failed:', err);
        browserSTT(onTranscript);
    }
};

// === DEEPGRAM STT ===
const deepgramSTT = async (onTranscript: (text: string) => void): Promise<void> => {
    if (!DEEPGRAM_API_KEY || !navigator.mediaDevices?.getUserMedia) {
        return browserSTT(onTranscript);
    }

    try {
        console.log('[Voice] Recording for Deepgram...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            try {
                // Call Deepgram API directly
                const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
                        'Content-Type': 'audio/webm',
                    },
                    body: audioBlob
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
                    console.log('[Voice] Deepgram transcript:', transcript);
                    if (transcript) onTranscript(transcript);
                } else {
                    console.warn('[Voice] Deepgram failed:', await response.text());
                }
            } catch (err) {
                console.error('[Voice] Deepgram STT failed:', err);
            }
        };

        mediaRecorder.start();
        setTimeout(() => {
            if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        }, 5000);
    } catch (err) {
        console.error('[Voice] Recording failed:', err);
        browserSTT(onTranscript);
    }
};

// === BROWSER STT ===
const browserSTT = (onTranscript: (text: string) => void): void => {
    try {
        console.log('[Voice] Using Web Speech API...');
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn("[Voice] Speech recognition not supported");
            alert("Voice input not supported. Please type your query.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('[Voice] Browser transcript:', transcript);
            onTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("[Voice] Recognition error:", event.error);
        };

        recognition.start();
    } catch (err) {
        console.error("[Voice] STT Failed:", err);
    }
};

// === VOICE CLONING (ElevenLabs) ===
export const createVoiceClone = async (
    name: string, 
    audioFiles: File[],
    description?: string
): Promise<string | null> => {
    if (!ELEVENLABS_API_KEY) {
        console.error("[Voice] ElevenLabs API Key required for voice cloning");
        alert("Voice cloning requires a valid ElevenLabs API key. Please check your configuration.");
        return null;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || `Custom ACHEEVY voice: ${name}`);
    
    audioFiles.forEach((file) => {
        formData.append('files', file);
    });

    try {
        console.log('[Voice] Creating voice clone:', name);
        const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("[Voice] Clone failed:", error);
            alert(`Voice cloning failed: ${error.detail?.message || 'Unknown error'}`);
            return null;
        }

        const data = await response.json();
        const voiceId = data.voice_id;
        
        // Save the custom voice
        setCustomVoiceId(voiceId);
        saveCustomVoice({
            id: voiceId,
            name: name,
            createdAt: Date.now(),
            provider: 'elevenlabs'
        });
        
        console.log('[Voice] Clone created successfully:', voiceId);
        return voiceId;
    } catch (err) {
        console.error("[Voice] Cloning error:", err);
        alert("Voice cloning failed. Please try again.");
        return null;
    }
};

// === VOICE PREVIEW ===
export const previewVoice = async (voiceKey: string): Promise<void> => {
    const greetings = [
        "Hello! I'm ACHEEVY, your AI assistant.",
        "Welcome to Locale. How can I help you today?",
        "Think it. Prompt it. Let me manage it."
    ];
    const text = greetings[Math.floor(Math.random() * greetings.length)];
    await speakText(text, voiceKey);
};

// === CHECK API STATUS ===
export const getVoiceApiStatus = () => ({
    elevenlabs: !!ELEVENLABS_API_KEY,
    deepgram: !!DEEPGRAM_API_KEY,
    groq: !!GROQ_API_KEY,
    preferred_stt: getSTTProvider(),
});

export default {
    speakText,
    listenToSpeech,
    createVoiceClone,
    previewVoice,
    getVoiceApiStatus,
    VOICE_LIBRARY,
    DEFAULT_VOICE,
    getSelectedVoice,
    setSelectedVoice,
    getCustomVoiceId,
    setCustomVoiceId,
    getCustomVoices,
    saveCustomVoice,
    deleteCustomVoice,
    getSTTProvider,
    setSTTProvider,
};
