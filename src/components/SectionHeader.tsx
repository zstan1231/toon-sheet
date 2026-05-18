import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.lineLeft} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.lineRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  lineLeft: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.accent,
    marginRight: 8,
  },
  lineRight: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.accent,
    marginLeft: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
