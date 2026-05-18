import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import type { AttackBonuses } from '../types/character';
import { formatModifier } from '../types/dnd';
import { getIterativeAttacks } from '../data/classes';

interface AttackDisplayProps {
  attackBonuses: AttackBonuses;
}

export function AttackDisplay({ attackBonuses }: AttackDisplayProps) {
  const iterativeAttacks = getIterativeAttacks(attackBonuses.baseAttackBonus);

  return (
    <View style={styles.container}>
      {/* BAB */}
      <View style={styles.babSection}>
        <Text style={styles.sectionLabel}>BASE ATTACK BONUS</Text>
        <View style={styles.iterativeRow}>
          {iterativeAttacks.map((atk, idx) => (
            <View key={idx} style={styles.babBox}>
              <Text style={styles.babValue}>{formatModifier(atk)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Attack modifiers */}
      <View style={styles.attackGrid}>
        <AttackBox
          label="MELEE"
          value={formatModifier(attackBonuses.meleeAttackBonus)}
          color={COLORS.danger}
        />
        <AttackBox
          label="RANGED"
          value={formatModifier(attackBonuses.rangedAttackBonus)}
          color={COLORS.info}
        />
        <AttackBox
          label="GRAPPLE"
          value={formatModifier(attackBonuses.grappleModifier)}
          color={COLORS.warning}
        />
      </View>
    </View>
  );
}

function AttackBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.attackBox, { borderColor: color }]}>
      <Text style={[styles.attackLabel, { color }]}>{label}</Text>
      <Text style={[styles.attackValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    ...SHADOWS.card,
  },
  babSection: {
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    fontFamily: FONTS.serif,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  iterativeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  babBox: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 48,
  },
  babValue: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  attackGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  attackBox: {
    flex: 1,
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 2,
    borderRadius: 6,
    padding: SPACING.xs,
    alignItems: 'center',
  },
  attackLabel: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  attackValue: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: '700',
  },
});
