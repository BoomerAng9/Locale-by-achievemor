/**
 * Voice Provider Switch
 * Manages voice provider selection with fallback chain
 * Super Admin can toggle providers via Firestore config
 * 
 * Default Chain: Groq Whisper → Deepgram → WebSpeech
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../gcp';
import { transcribeWithGroq, isGroqAvailable, GROQ_MODELS } from './groq';
import { listenToSpeech, speakText, VOICE_LIBRARY, getSelectedVoice } from './index';

// ==========================================
// CONFIGURATION
// ==========================================

const VOICE_CONFIG_DOC = 'system_settings/voice_config';

// ==========================================
// TYPES
// ==========================================

export type STTProvider = 'groq' | 'deepgram' | 'webspeech';
export type TTSProvider = 'elevenlabs' | 'gemini' | 'webspeech';

export interface VoiceConfig {
  // Speech-to-Text Settings
  stt_provider: STTProvider;
  stt_fallback_chain: STTProvider[];
  groq_model: string;
  
  // Text-to-Speech Settings
  tts_provider: TTSProvider;
  tts_fallback_chain: TTSProvider[];
  default_voice_id: string;
  
  // Feature Flags
  voice_enabled: boolean;
  realtime_transcription: boolean;
  voice_cloning_enabled: boolean;
  
  // Metadata
  updated_at: Date;
  updated_by?: string;
}

// Default configuration
export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  stt_provider: 'groq',
  stt_fallback_chain: ['groq', 'deepgram', 'webspeech'],
  groq_model: GROQ_MODELS.WHISPER_LARGE_V3,
  
  tts_provider: 'elevenlabs',
  tts_fallback_chain: ['elevenlabs', 'webspeech'],
  default_voice_id: 'drew',
  
  voice_enabled: true,
  realtime_transcription: true,
  voice_cloning_enabled: true,
  
  updated_at: new Date(),
};

// ==========================================
// CONFIG MANAGEMENT
// ==========================================

/**
 * Get the current voice configuration
 */
export async function getVoiceConfig(): Promise<VoiceConfig> {
  try {
    const configRef = doc(db, VOICE_CONFIG_DOC);
    const configSnap = await getDoc(configRef);
    
    if (!configSnap.exists()) {
      // Initialize with defaults
      await setDoc(configRef, DEFAULT_VOICE_CONFIG);
      return DEFAULT_VOICE_CONFIG;
    }
    
    return configSnap.data() as VoiceConfig;
  } catch (error) {
    console.warn('Failed to fetch voice config, using defaults:', error);
    return DEFAULT_VOICE_CONFIG;
  }
}

/**
 * Update voice configuration (Super Admin only)
 */
export async function updateVoiceConfig(
  updates: Partial<VoiceConfig>,
  updatedBy?: string
): Promise<boolean> {
  try {
    const configRef = doc(db, VOICE_CONFIG_DOC);
    await setDoc(configRef, {
      ...updates,
      updated_at: new Date(),
      updated_by: updatedBy,
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to update voice config:', error);
    return false;
  }
}

// ==========================================
// SPEECH-TO-TEXT SWITCH
// ==========================================

/**
 * Transcribe audio using the configured provider with fallback
 */
export async function transcribeAudio(
  audioBlob: Blob,
  options?: { language?: string; prompt?: string }
): Promise<string> {
  const config = await getVoiceConfig();
  const fallbackChain = config.stt_fallback_chain;
  
  for (const provider of fallbackChain) {
    try {
      switch (provider) {
        case 'groq':
          if (!isGroqAvailable()) {
            console.log('Groq not available, trying next provider...');
            continue;
          }
          const result = await transcribeWithGroq(audioBlob, {
            model: config.groq_model as any,
            language: options?.language,
            prompt: options?.prompt,
          });
          console.log('✓ Transcribed with Groq Whisper');
          return result.text;
          
        case 'deepgram':
          // Deepgram fallback (uses existing implementation)
          const deepgramResult = await transcribeWithDeepgram(audioBlob);
          if (deepgramResult) {
            console.log('✓ Transcribed with Deepgram');
            return deepgramResult;
          }
          continue;
          
        case 'webspeech':
          // WebSpeech API fallback (browser native)
          const webSpeechResult = await transcribeWithWebSpeech();
          if (webSpeechResult) {
            console.log('✓ Transcribed with WebSpeech API');
            return webSpeechResult;
          }
          continue;
      }
    } catch (error) {
      console.warn(`${provider} transcription failed:`, error);
      continue;
    }
  }
  
  throw new Error('All transcription providers failed');
}

/**
 * Deepgram transcription (from existing implementation)
 */
async function transcribeWithDeepgram(audioBlob: Blob): Promise<string | null> {
  const DEEPGRAM_API_KEY = (import.meta as any).env?.VITE_DEEPGRAM_API_KEY;
  if (!DEEPGRAM_API_KEY) return null;
  
  try {
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': audioBlob.type || 'audio/webm',
      },
      body: audioBlob,
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.results?.channels?.[0]?.alternatives?.[0]?.transcript || null;
  } catch (error) {
    return null;
  }
}

/**
 * WebSpeech API transcription (browser native)
 */
function transcribeWithWebSpeech(): Promise<string | null> {
  return new Promise((resolve) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      resolve(null);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };
    
    recognition.onerror = () => resolve(null);
    recognition.onnomatch = () => resolve(null);
    
    recognition.start();
    
    // Timeout after 10 seconds
    setTimeout(() => {
      recognition.stop();
      resolve(null);
    }, 10000);
  });
}

// ==========================================
// TEXT-TO-SPEECH SWITCH
// ==========================================

/**
 * Speak text using the configured TTS provider
 */
export async function speak(
  text: string,
  voiceOverride?: string,
  personaVoiceId?: string
): Promise<void> {
  const config = await getVoiceConfig();
  
  if (!config.voice_enabled) {
    console.log('Voice is disabled globally');
    return;
  }
  
  // Determine voice to use
  const voiceId = personaVoiceId || voiceOverride || config.default_voice_id || getSelectedVoice();
  
  for (const provider of config.tts_fallback_chain) {
    try {
      switch (provider) {
        case 'elevenlabs':
          await speakText(text, voiceId);
          console.log('✓ Spoke with ElevenLabs');
          return;
          
        case 'gemini':
          // Gemini TTS placeholder
          console.log('Gemini TTS not yet implemented');
          continue;
          
        case 'webspeech':
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
          console.log('✓ Spoke with WebSpeech API');
          return;
      }
    } catch (error) {
      console.warn(`${provider} TTS failed:`, error);
      continue;
    }
  }
  
  console.error('All TTS providers failed');
}

// ==========================================
// PROVIDER STATUS
// ==========================================

export interface ProviderStatus {
  groq: boolean;
  deepgram: boolean;
  elevenlabs: boolean;
  webspeech: boolean;
}

/**
 * Check which providers are available
 */
export async function getProviderStatus(): Promise<ProviderStatus> {
  const ELEVENLABS_API_KEY = (import.meta as any).env?.VITE_ELEVENLABS_API_KEY;
  const DEEPGRAM_API_KEY = (import.meta as any).env?.VITE_DEEPGRAM_API_KEY;
  
  return {
    groq: isGroqAvailable(),
    deepgram: !!DEEPGRAM_API_KEY,
    elevenlabs: !!ELEVENLABS_API_KEY,
    webspeech: !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    ),
  };
}

// ==========================================
// CONVENIENCE EXPORTS
// ==========================================

export { VOICE_LIBRARY, getSelectedVoice, speakText };
