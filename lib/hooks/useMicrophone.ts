/**
 * useMicrophone Hook
 * PWA-ready microphone capture with waveform visualization
 * Used for voice input across all chat interfaces
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { transcribeAudio } from '../voice/providerSwitch';

// ==========================================
// TYPES
// ==========================================

export interface MicrophoneState {
  isRecording: boolean;
  isProcessing: boolean;
  audioLevel: number;           // 0-100 for visualization
  duration: number;             // Recording duration in seconds
  error: string | null;
  transcript: string | null;
}

export interface UseMicrophoneOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  maxDuration?: number;          // Max recording duration in seconds
  silenceTimeout?: number;       // Auto-stop after silence (ms)
  language?: string;             // Transcription language
}

export interface UseMicrophoneReturn extends MicrophoneState {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  toggleRecording: () => Promise<void>;
  cancelRecording: () => void;
  waveformData: number[];        // For visualization
}

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

export function useMicrophone(options: UseMicrophoneOptions = {}): UseMicrophoneReturn {
  const {
    onTranscript,
    onError,
    onStart,
    onStop,
    maxDuration = 60,
    silenceTimeout = 3000,
    language = 'en',
  } = options;

  const [state, setState] = useState<MicrophoneState>({
    isRecording: false,
    isProcessing: false,
    audioLevel: 0,
    duration: 0,
    error: null,
    transcript: null,
  });

  const [waveformData, setWaveformData] = useState<number[]>(new Array(50).fill(0));

  // Refs for cleanup
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // ==========================================
  // AUDIO LEVEL ANALYSIS
  // ==========================================

  const analyzeAudioLevel = useCallback(() => {
    if (!analyserRef.current || !state.isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average level
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = Math.min(100, (average / 128) * 100);

    setState(prev => ({ ...prev, audioLevel: normalizedLevel }));

    // Update waveform visualization
    setWaveformData(prev => {
      const newData = [...prev.slice(1), normalizedLevel];
      return newData;
    });

    // Check for silence (auto-stop)
    if (normalizedLevel < 5) {
      if (!silenceTimeoutRef.current) {
        silenceTimeoutRef.current = setTimeout(() => {
          stopRecording();
        }, silenceTimeout);
      }
    } else {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevel);
  }, [state.isRecording, silenceTimeout]);

  // ==========================================
  // START RECORDING
  // ==========================================

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, transcript: null }));

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms

      setState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
      }));

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return { ...prev, duration: newDuration };
        });
      }, 1000);

      // Start audio level analysis
      analyzeAudioLevel();

      onStart?.();
    } catch (error: any) {
      const errorMessage = error.name === 'NotAllowedError'
        ? 'Microphone access denied. Please allow microphone access.'
        : error.message || 'Failed to access microphone';
      
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [analyzeAudioLevel, maxDuration, onError, onStart]);

  // ==========================================
  // STOP RECORDING
  // ==========================================

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      // Clear timers
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setState(prev => ({ ...prev, isRecording: false }));
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));

        // Create audio blob
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
        audioContextRef.current?.close();

        try {
          // Transcribe
          const transcript = await transcribeAudio(audioBlob, { language });
          
          setState(prev => ({
            ...prev,
            isProcessing: false,
            transcript,
            audioLevel: 0,
          }));

          onTranscript?.(transcript);
          onStop?.();
          resolve(transcript);
        } catch (error: any) {
          const errorMessage = error.message || 'Transcription failed';
          setState(prev => ({
            ...prev,
            isProcessing: false,
            error: errorMessage,
            audioLevel: 0,
          }));
          onError?.(errorMessage);
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [language, onError, onStop, onTranscript]);

  // ==========================================
  // TOGGLE RECORDING
  // ==========================================

  const toggleRecording = useCallback(async () => {
    if (state.isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [state.isRecording, startRecording, stopRecording]);

  // ==========================================
  // CANCEL RECORDING
  // ==========================================

  const cancelRecording = useCallback(() => {
    // Clear timers
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop recording without processing
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {};
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();

    setState({
      isRecording: false,
      isProcessing: false,
      audioLevel: 0,
      duration: 0,
      error: null,
      transcript: null,
    });

    setWaveformData(new Array(50).fill(0));
  }, []);

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      cancelRecording();
    };
  }, [cancelRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    toggleRecording,
    cancelRecording,
    waveformData,
  };
}

export default useMicrophone;
