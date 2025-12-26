/**
 * Groq Whisper Integration
 * Ultra-fast speech-to-text using Groq's LPU hardware
 * 164x faster than OpenAI Whisper with same accuracy
 * 
 * Docs: https://console.groq.com/docs/speech-text
 */

// ==========================================
// CONFIGURATION
// ==========================================

const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY;
const GROQ_WHISPER_ENDPOINT = 'https://api.groq.com/openai/v1/audio/transcriptions';

// Supported models
export const GROQ_MODELS = {
  WHISPER_LARGE_V3: 'whisper-large-v3',      // Highest accuracy
  WHISPER_LARGE_V3_TURBO: 'whisper-large-v3-turbo', // Faster, slightly less accurate
  DISTIL_WHISPER: 'distil-whisper-large-v3-en', // English only, fastest
} as const;

export type GroqModel = typeof GROQ_MODELS[keyof typeof GROQ_MODELS];

// ==========================================
// TYPES
// ==========================================

export interface GroqTranscriptionOptions {
  model?: GroqModel;
  language?: string;      // ISO 639-1 code (e.g., 'en', 'es', 'fr')
  prompt?: string;        // Optional context to improve accuracy
  temperature?: number;   // 0-1, lower = more deterministic
  responseFormat?: 'json' | 'text' | 'verbose_json';
}

export interface GroqTranscriptionResult {
  text: string;
  duration?: number;
  language?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface GroqError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

// ==========================================
// CORE TRANSCRIPTION FUNCTION
// ==========================================

/**
 * Transcribe audio using Groq's Whisper API
 * @param audioBlob - Audio file as Blob (supports mp3, wav, webm, etc.)
 * @param options - Transcription options
 * @returns Transcribed text
 */
export async function transcribeWithGroq(
  audioBlob: Blob,
  options: GroqTranscriptionOptions = {}
): Promise<GroqTranscriptionResult> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Set VITE_GROQ_API_KEY in environment.');
  }

  const {
    model = GROQ_MODELS.WHISPER_LARGE_V3,
    language,
    prompt,
    temperature = 0,
    responseFormat = 'verbose_json',
  } = options;

  // Create form data
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', model);
  formData.append('response_format', responseFormat);
  
  if (temperature !== undefined) {
    formData.append('temperature', temperature.toString());
  }
  
  if (language) {
    formData.append('language', language);
  }
  
  if (prompt) {
    formData.append('prompt', prompt);
  }

  try {
    const response = await fetch(GROQ_WHISPER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json() as GroqError;
      throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      text: data.text,
      duration: data.duration,
      language: data.language,
      segments: data.segments,
    };
  } catch (error) {
    console.error('Groq transcription failed:', error);
    throw error;
  }
}

// ==========================================
// STREAMING TRANSCRIPTION (Real-time)
// ==========================================

/**
 * Real-time transcription with progressive updates
 * Uses chunked audio processing for live feedback
 */
export class GroqRealtimeTranscriber {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onTranscript: (text: string, isFinal: boolean) => void;
  private options: GroqTranscriptionOptions;

  constructor(
    onTranscript: (text: string, isFinal: boolean) => void,
    options: GroqTranscriptionOptions = {}
  ) {
    this.onTranscript = onTranscript;
    this.options = {
      model: GROQ_MODELS.WHISPER_LARGE_V3_TURBO, // Use turbo for real-time
      ...options,
    };
  }

  async start(): Promise<void> {
    if (this.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4',
      });

      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        
        try {
          const result = await transcribeWithGroq(audioBlob, this.options);
          this.onTranscript(result.text, true);
        } catch (error) {
          console.error('Transcription error:', error);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      this.mediaRecorder.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  stop(): void {
    if (!this.isRecording || !this.mediaRecorder) return;
    
    this.isRecording = false;
    this.mediaRecorder.stop();
  }

  isActive(): boolean {
    return this.isRecording;
  }
}

// ==========================================
// VOICE ACTIVITY DETECTION (VAD)
// ==========================================

/**
 * Simple Voice Activity Detection using audio level analysis
 * Automatically starts/stops transcription based on speech
 */
export class VoiceActivityDetector {
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private isListening = false;
  private silenceTimeout: NodeJS.Timeout | null = null;
  
  private onSpeechStart: () => void;
  private onSpeechEnd: () => void;
  private silenceThreshold: number;
  private silenceDelay: number;

  constructor(
    onSpeechStart: () => void,
    onSpeechEnd: () => void,
    options: { silenceThreshold?: number; silenceDelay?: number } = {}
  ) {
    this.onSpeechStart = onSpeechStart;
    this.onSpeechEnd = onSpeechEnd;
    this.silenceThreshold = options.silenceThreshold || 30;
    this.silenceDelay = options.silenceDelay || 1500; // ms
  }

  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);
      
      this.isListening = true;
      this.detectActivity();
    } catch (error) {
      console.error('VAD start failed:', error);
    }
  }

  private detectActivity(): void {
    if (!this.isListening || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
    if (average > this.silenceThreshold) {
      // Speech detected
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }
      this.onSpeechStart();
    } else {
      // Silence - wait before triggering end
      if (!this.silenceTimeout) {
        this.silenceTimeout = setTimeout(() => {
          this.onSpeechEnd();
          this.silenceTimeout = null;
        }, this.silenceDelay);
      }
    }

    requestAnimationFrame(() => this.detectActivity());
  }

  stop(): void {
    this.isListening = false;
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if Groq API is available
 */
export function isGroqAvailable(): boolean {
  return !!GROQ_API_KEY;
}

/**
 * Get estimated cost for transcription
 * Groq pricing: ~$0.05-0.11 per hour of audio
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  const hoursOfAudio = durationSeconds / 3600;
  const costPerHour = 0.08; // Average between $0.05-0.11
  return hoursOfAudio * costPerHour;
}
