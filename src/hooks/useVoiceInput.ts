// Hook for voice input using expo-speech
import { useState, useCallback } from 'react';
import * as Speech from 'expo-speech';

interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

export function useVoiceInput() {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: '',
    error: null,
  });

  // expo-speech is text-to-speech only; for speech recognition we provide a mock/placeholder
  // In a full implementation, this would use @react-native-voice/voice or expo-av with audio recording
  const startListening = useCallback(async () => {
    setState(prev => ({ ...prev, isListening: true, error: null, transcript: '' }));
    // Simulate listening for demo purposes
    // Real implementation would use AudioRecorder + Whisper API or native STT
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isListening: false,
        transcript: '',
        error: 'Speech recognition requires additional native modules. Please type your input.',
      }));
    }, 2000);
  }, []);

  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', error: null }));
  }, []);

  const speak = useCallback((text: string) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
  }, []);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    error: state.error,
    startListening,
    stopListening,
    clearTranscript,
    speak,
    stopSpeaking,
  };
}
