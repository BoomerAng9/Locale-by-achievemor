/**
 * Voice Interface for Locale - Enhanced with Human Voices
 * Handles Text-to-Speech (ElevenLabs) and Speech-to-Text (Deepgram/WebSpeech)
 * Supports voice selection and custom voice cloning
 */

// ElevenLabs Configuration
const ELEVENLABS_API_KEY = (import.meta as any).env?.VITE_ELEVENLABS_API_KEY;

// === VOICE LIBRARY ===
// Human-sounding premium voices from ElevenLabs
export const VOICE_LIBRARY = {
    // Default Professional Voices
    'rachel': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', accent: 'American', gender: 'Female', style: 'Warm & Professional' },
    'drew': { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', accent: 'American', gender: 'Male', style: 'Confident & Clear' },
    'clyde': { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', accent: 'American', gender: 'Male', style: 'Deep & Authoritative' },
    'paul': { id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul', accent: 'American', gender: 'Male', style: 'Narration & News' },
    'domi': { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', accent: 'American', gender: 'Female', style: 'Strong & Bold' },
    'bella': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', accent: 'American', gender: 'Female', style: 'Soft & Expressive' },
    'antoni': { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', accent: 'American', gender: 'Male', style: 'Well Rounded' },
    'elli': { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', accent: 'American', gender: 'Female', style: 'Young & Emotional' },
    'josh': { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', accent: 'American', gender: 'Male', style: 'Deep & Young' },
    'arnold': { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', accent: 'American', gender: 'Male', style: 'Crisp & Articulate' },
    'adam': { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', accent: 'American', gender: 'Male', style: 'Deep & Narrative' },
    'sam': { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', accent: 'American', gender: 'Male', style: 'Raspy & Warm' },
};

// Default voice for ACHEEVY
export const DEFAULT_VOICE = 'drew'; // Confident & Clear male voice

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

// === TEXT-TO-SPEECH ===
export const speakText = async (text: string, voiceOverride?: string): Promise<void> => {
    if (!ELEVENLABS_API_KEY) {
        console.warn("ElevenLabs API Key missing, using browser TTS fallback");
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        return;
    }

    // Determine which voice to use
    let voiceId: string;
    const customVoiceId = getCustomVoiceId();
    
    if (voiceOverride && VOICE_LIBRARY[voiceOverride as keyof typeof VOICE_LIBRARY]) {
        voiceId = VOICE_LIBRARY[voiceOverride as keyof typeof VOICE_LIBRARY].id;
    } else if (customVoiceId) {
        voiceId = customVoiceId; // Use custom cloned voice
    } else {
        const selectedKey = getSelectedVoice();
        voiceId = VOICE_LIBRARY[selectedKey as keyof typeof VOICE_LIBRARY]?.id || VOICE_LIBRARY[DEFAULT_VOICE].id;
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2', // Latest multilingual model
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API Error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        await audio.play();
    } catch (err) {
        console.error("TTS Failed:", err);
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
};

// === SPEECH-TO-TEXT ===
export const listenToSpeech = async (onTranscript: (text: string) => void): Promise<void> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("Browser does not support audio recording");
        return;
    }

    try {
        // Using Web Speech API as fallback (Deepgram would need backend for secure key handling)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
        };

        recognition.start();
    } catch (err) {
        console.error("STT Failed:", err);
    }
};

// === VOICE CLONING (ElevenLabs) ===
export const createVoiceClone = async (
    name: string, 
    audioFiles: File[],
    description?: string
): Promise<string | null> => {
    if (!ELEVENLABS_API_KEY) {
        console.error("ElevenLabs API Key required for voice cloning");
        return null;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || 'Custom ACHEEVY voice');
    
    audioFiles.forEach((file, index) => {
        formData.append('files', file);
    });

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Voice clone failed:", error);
            return null;
        }

        const data = await response.json();
        const voiceId = data.voice_id;
        
        // Save the custom voice ID
        setCustomVoiceId(voiceId);
        
        return voiceId;
    } catch (err) {
        console.error("Voice cloning error:", err);
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

export default {
    speakText,
    listenToSpeech,
    createVoiceClone,
    previewVoice,
    VOICE_LIBRARY,
    DEFAULT_VOICE,
    getSelectedVoice,
    setSelectedVoice,
    getCustomVoiceId,
    setCustomVoiceId
};
