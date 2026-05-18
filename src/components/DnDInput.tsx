import React from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';

interface DnDInputProps extends TextInputProps {
  label?: string;
  error?: string;
  compact?: boolean;
}

export function DnDInput({ label, error, compact, style, ...props }: DnDInputProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          compact && styles.inputCompact,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  compact: {
    marginBottom: SPACING.xs,
  },
  label: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 36,
  },
  inputCompact: {
    minHeight: 30,
    paddingVertical: 4,
    fontSize: 13,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.danger,
    marginTop: 2,
  },
});
