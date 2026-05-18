import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../theme';
import { calcAbilityModifier, formatModifier } from '../types/dnd';

interface AbilityScoreProps {
  label: string;
  score: number;
  onPress?: () => void;
  size?: 'small' | 'normal';
}

export function AbilityScore({ label, score, onPress, size = 'normal' }: AbilityScoreProps) {
  const modifier = calcAbilityModifier(score);
  const modStr = formatModifier(modifier);
  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={[styles.container, isSmall && styles.containerSmall, SHADOWS.card]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.label, isSmall && styles.labelSmall]}>{label}</Text>
      <View style={[styles.scoreBox, isSmall && styles.scoreBoxSmall]}>
        <Text style={[styles.score, isSmall && styles.scoreSmall]}>{score}</Text>
      </View>
      <View style={[styles.modBox, isSmall && styles.modBoxSmall]}>
        <Text style={[styles.modifier, isSmall && styles.modifierSmall]}>{modStr}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 64,
  },
  containerSmall: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    minWidth: 48,
    borderWidth: 1,
  },
  label: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  labelSmall: {
    fontSize: 9,
    marginBottom: 2,
  },
  scoreBox: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreBoxSmall: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 28,
    marginBottom: 2,
  },
  score: {
    fontFamily: FONTS.serif,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  scoreSmall: {
    fontSize: 16,
  },
  modBox: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 36,
    alignItems: 'center',
  },
  modBoxSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 26,
    borderRadius: 8,
  },
  modifier: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  modifierSmall: {
    fontSize: 11,
  },
});
