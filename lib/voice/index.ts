/**
 * Voice Agent Integration (ElevenLabs & Deepgram)
 * Handles TTS (ElevenLabs) and STT (Deepgram)
 * NO HARDCODING - All API keys from environment variables
 */

// === API KEYS FROM ENVIRONMENT ===
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY || '';

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

// === TEXT-TO-SPEECH (ElevenLabs) ===
export const speakText = async (text: string, voiceOverride?: string): Promise<void> => {
    if (!ELEVENLABS_API_KEY) {
        console.warn("[Voice] ElevenLabs API Key missing, using browser TTS fallback");
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
        console.log('[Voice] Calling ElevenLabs TTS...');
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
        console.log('[Voice] TTS playback started');
    } catch (err) {
        console.error("[Voice] TTS Failed:", err);
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
};

// === SPEECH-TO-TEXT (Deepgram) ===
export const listenToSpeech = async (onTranscript: (text: string) => void): Promise<void> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("[Voice] Browser does not support audio recording");
        // Fallback to Web Speech immediately if media devices not available
        fallbackToWebSpeech(onTranscript);
        return;
    }

    // If Deepgram API key is available, use Deepgram SDK
    if (DEEPGRAM_API_KEY) {
        try {
            console.log('[Voice] Using Deepgram SDK...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                
                try {
                    // Dynamic import to avoid SSR issues if any, though likely client-side only
                    const { createClient } = await import('@deepgram/sdk');
                    const deepgram = createClient(DEEPGRAM_API_KEY);

                    console.log('[Voice] Sending audio to Deepgram...');
                    // Cast to any to avoid TypeScript error as SDK types seem to favor Node.js Buffer
                    const source = audioBlob as any; 
                    
                    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
                        source,
                        {
                            model: 'nova-2',
                            smart_format: true,
                            mimetype: 'audio/webm',
                        }
                    );

                    if (error) {
                        console.error('[Voice] Deepgram error:', error);
                        throw new Error(error.message);
                    }

                    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
                    console.log('[Voice] Deepgram transcript:', transcript);
                    if (transcript) {
                        onTranscript(transcript);
                    } else {
                        console.warn('[Voice] No transcript received');
                    }

                } catch (err) {
                    console.error('[Voice] Deepgram STT failed:', err);
                    // Could fallback to Web Speech here if needed, but better to show error
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            // Record for 5 seconds then stop
            // TODO: In future, implement VAD (Voice Activity Detection) or manual stop
            mediaRecorder.start();
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 5000);

            return;
        } catch (err) {
            console.error('[Voice] Deepgram setup failed, falling back to Web Speech API:', err);
            fallbackToWebSpeech(onTranscript);
        }
    } else {
        fallbackToWebSpeech(onTranscript);
    }
};

// Fallback Helper
const fallbackToWebSpeech = (onTranscript: (text: string) => void) => {
    try {
        console.log('[Voice] Using Web Speech API fallback...');
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn("[Voice] Speech recognition not supported in this browser");
            alert("Voice input not supported in this browser. Please type your query.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('[Voice] Web Speech transcript:', transcript);
            onTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("[Voice] Speech recognition error:", event.error);
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
        return null;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || 'Custom ACHEEVY voice');
    
    audioFiles.forEach((file) => {
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
            console.error("[Voice] Clone failed:", error);
            return null;
        }

        const data = await response.json();
        const voiceId = data.voice_id;
        
        // Save the custom voice ID
        setCustomVoiceId(voiceId);
        
        return voiceId;
    } catch (err) {
        console.error("[Voice] Cloning error:", err);
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
    setCustomVoiceId
};
