import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import type { SavingThrows } from '../types/character';
import { formatModifier } from '../types/dnd';

interface SavesDisplayProps {
  savingThrows: SavingThrows;
}

export function SavesDisplay({ savingThrows }: SavesDisplayProps) {
  const fortTotal =
    savingThrows.fortitude.base +
    savingThrows.fortitude.abilityMod +
    savingThrows.fortitude.magicMod +
    savingThrows.fortitude.miscMod;

  const refTotal =
    savingThrows.reflex.base +
    savingThrows.reflex.abilityMod +
    savingThrows.reflex.magicMod +
    savingThrows.reflex.miscMod;

  const willTotal =
    savingThrows.will.base +
    savingThrows.will.abilityMod +
    savingThrows.will.magicMod +
    savingThrows.will.miscMod;

  return (
    <View style={styles.container}>
      <SaveRow
        name="FORTITUDE"
        ability="CON"
        total={fortTotal}
        save={savingThrows.fortitude}
      />
      <View style={styles.divider} />
      <SaveRow
        name="REFLEX"
        ability="DEX"
        total={refTotal}
        save={savingThrows.reflex}
      />
      <View style={styles.divider} />
      <SaveRow
        name="WILL"
        ability="WIS"
        total={willTotal}
        save={savingThrows.will}
      />
    </View>
  );
}

interface SaveRowProps {
  name: string;
  ability: string;
  total: number;
  save: { base: number; abilityMod: number; magicMod: number; miscMod: number };
}

function SaveRow({ name, ability, total, save }: SaveRowProps) {
  return (
    <View style={styles.saveRow}>
      <View style={styles.totalBox}>
        <Text style={styles.totalValue}>{formatModifier(total)}</Text>
        <Text style={styles.totalLabel}>{name}</Text>
      </View>
      <View style={styles.breakdown}>
        <SaveField label="Base" value={save.base} />
        <Text style={styles.plus}>+</Text>
        <SaveField label={ability} value={save.abilityMod} />
        <Text style={styles.plus}>+</Text>
        <SaveField label="Magic" value={save.magicMod} />
        <Text style={styles.plus}>+</Text>
        <SaveField label="Misc" value={save.miscMod} />
      </View>
    </View>
  );
}

function SaveField({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.saveField}>
      <Text style={styles.saveFieldValue}>{value >= 0 ? `+${value}` : `${value}`}</Text>
      <Text style={styles.saveFieldLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.xs,
    ...SHADOWS.card,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    gap: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.xs,
  },
  totalBox: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 48,
  },
  totalValue: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  totalLabel: {
    fontFamily: FONTS.serif,
    fontSize: 7,
    color: COLORS.parchmentDark,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  breakdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  saveField: {
    alignItems: 'center',
    minWidth: 32,
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  saveFieldValue: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveFieldLabel: {
    fontFamily: FONTS.serif,
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  plus: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
});
