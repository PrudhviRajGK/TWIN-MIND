import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioChunk, RecordingError } from '@/types';
import { useTranscriptStore } from '@/store/useTranscriptStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { retryWithBackoff } from '@/utils/retry';

const CHUNK_DURATION_MS = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

interface UseMicrophoneRecorderReturn {
  isRecording: boolean;
  error: RecordingError | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioChunks: AudioChunk[];
  retryCount: number;
}

export function useMicrophoneRecorder(): UseMicrophoneRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<RecordingError | null>(null);
  const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const { addTranscript, setLoading, setError: setTranscriptError } = useTranscriptStore();
  const { groqApiKey } = useSettingsStore();

  const sendAudioChunk = useCallback(async (audioBlob: Blob, duration: number) => {
    // Check if API key is configured
    if (!groqApiKey || groqApiKey.trim() === '') {
      setError({
        type: 'unknown',
        message: 'Groq API key not configured. Please add your API key in settings.',
      });
      setTranscriptError('API key not configured');
      return;
    }

    const chunk: AudioChunk = {
      id: `chunk-${Date.now()}`,
      blob: audioBlob,
      timestamp: new Date(),
      duration,
    };

    setAudioChunks((prev) => [...prev, chunk]);

    try {
      setLoading(true);
      setRetryCount(0);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('timestamp', Date.now().toString());

      // Retry with exponential backoff
      await retryWithBackoff(
        async () => {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: {
              'x-groq-api-key': groqApiKey,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || 'Transcription failed');
          }

          return response.json();
        },
        {
          maxAttempts: MAX_RETRY_ATTEMPTS,
          delayMs: 1000,
          backoff: true,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt}:`, error.message);
            setRetryCount(attempt);
          },
        }
      ).then((data) => {
        if (data.transcript && data.transcript.trim()) {
          const minutes = Math.floor(duration / 60000);
          const seconds = Math.floor((duration % 60000) / 1000);
          const timestamp = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

          addTranscript({
            timestamp,
            speaker: 'user',
            text: data.transcript.trim(),
          });
        }

        setTranscriptError(null);
        setError(null);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      console.error('Transcription error:', errorMessage);
      
      // Determine error type
      let errorType: RecordingError['type'] = 'upload';
      if (errorMessage.includes('API key')) {
        errorType = 'permission';
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        errorType = 'network';
      }

      setError({
        type: errorType,
        message: `${errorMessage}${retryCount > 0 ? ` (after ${retryCount} retries)` : ''}`,
      });
      setTranscriptError(errorMessage);
    } finally {
      setLoading(false);
      setRetryCount(0);
    }
  }, [addTranscript, setLoading, setTranscriptError, groqApiKey, retryCount]);

  const processChunk = useCallback(() => {
    if (chunksRef.current.length === 0) return;

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const duration = Date.now() - startTimeRef.current;
    
    sendAudioChunk(audioBlob, duration);
    
    chunksRef.current = [];
    startTimeRef.current = Date.now();
  }, [sendAudioChunk]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Check API key before starting
      if (!groqApiKey || groqApiKey.trim() === '') {
        setError({
          type: 'permission',
          message: 'Please configure your Groq API key in settings before recording.',
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError({
          type: 'unknown',
          message: 'Recording error occurred',
        });
        stopRecording();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Process chunks every 30 seconds
      chunkTimerRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          processChunk();
        }
      }, CHUNK_DURATION_MS);

    } catch (err) {
      console.error('Failed to start recording:', err);
      
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError({
          type: 'permission',
          message: 'Microphone permission denied. Please allow access to continue.',
        });
      } else {
        setError({
          type: 'unknown',
          message: 'Failed to access microphone',
        });
      }
    }
  }, [processChunk, groqApiKey]);

  const stopRecording = useCallback(() => {
    if (chunkTimerRef.current) {
      clearInterval(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Process any remaining chunks
      setTimeout(() => {
        processChunk();
      }, 100);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  }, [processChunk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
    audioChunks,
    retryCount,
  };
}
