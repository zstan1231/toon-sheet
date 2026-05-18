import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { COLORS, FONTS } from '../theme';

interface VoiceInputButtonProps {
  isListening: boolean;
  onPress: () => void;
  size?: number;
}

export function VoiceInputButton({ isListening, onPress, size = 44 }: VoiceInputButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        isListening && styles.buttonListening,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isListening ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={[styles.icon, { fontSize: size * 0.45 }]}>🎙</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonListening: {
    backgroundColor: COLORS.accentLight,
  },
  icon: {
    lineHeight: undefined,
  },
});
