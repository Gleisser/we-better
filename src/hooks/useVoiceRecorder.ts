import { useState, useCallback, useRef } from 'react';

interface VoiceRecorderState {
  isRecording: boolean;
  audioUrl: string | null;
  error: string | null;
}

export const useVoiceRecorder = () => {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    audioUrl: null,
    error: null
  });
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      // Clear previous recording
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setState(prev => ({ ...prev, audioUrl: url, isRecording: false }));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(100); // Collect data every 100ms
      setMediaRecorder(recorder);
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific error types
        if ((err as any).name === 'NotAllowedError') {
          setState(prev => ({ 
            ...prev, 
            error: 'Microphone access was denied. Please allow access in your browser settings.'
          }));
        } else if ((err as any).name === 'NotFoundError') {
          setState(prev => ({ 
            ...prev, 
            error: 'No microphone found. Please connect a microphone and try again.'
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            error: `Error accessing microphone: ${err.message}`
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'An unknown error occurred while trying to access the microphone.'
        }));
      }
      console.error('Microphone access error:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && state.isRecording) {
      mediaRecorder.stop();
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, [mediaRecorder, state.isRecording]);

  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
      setState(prev => ({ ...prev, audioUrl: null }));
      chunksRef.current = [];
    }
  }, [state.audioUrl]);

  return {
    isRecording: state.isRecording,
    audioUrl: state.audioUrl,
    error: state.error,
    startRecording,
    stopRecording,
    clearRecording
  };
}; 