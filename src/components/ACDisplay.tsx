import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import type { ArmorClass } from '../types/character';

interface ACDisplayProps {
  armorClass: ArmorClass;
  onEditArmorBonus?: () => void;
  onEditShieldBonus?: () => void;
  onEditNaturalArmor?: () => void;
  onEditDeflection?: () => void;
  onEditMisc?: () => void;
}

export function ACDisplay({ armorClass }: ACDisplayProps) {
  const formatMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

  return (
    <View style={styles.container}>
      {/* Main AC values */}
      <View style={styles.mainRow}>
        <View style={styles.acMain}>
          <Text style={styles.acLabel}>ARMOR CLASS</Text>
          <Text style={styles.acValue}>{armorClass.total}</Text>
        </View>
        <View style={styles.acSecondary}>
          <View style={styles.acSub}>
            <Text style={styles.subLabel}>TOUCH</Text>
            <Text style={styles.subValue}>{armorClass.touch}</Text>
          </View>
          <View style={styles.acSub}>
            <Text style={styles.subLabel}>FLAT-FOOTED</Text>
            <Text style={styles.subValue}>{armorClass.flatFooted}</Text>
          </View>
        </View>
      </View>

      {/* Breakdown */}
      <View style={styles.breakdown}>
        <Text style={styles.breakdownTitle}>BREAKDOWN</Text>
        <View style={styles.breakdownGrid}>
          <ACModBox label="Armor" value={armorClass.armorBonus} />
          <ACModBox label="Shield" value={armorClass.shieldBonus} />
          <ACModBox label="DEX" value={armorClass.dexMod} />
          <ACModBox label="Size" value={armorClass.sizeMod} />
          <ACModBox label="Natural" value={armorClass.naturalArmor} />
          <ACModBox label="Deflect" value={armorClass.deflection} />
          <ACModBox label="Misc" value={armorClass.misc} />
          <View style={styles.baseBox}>
            <Text style={styles.baseLabel}>BASE</Text>
            <Text style={styles.baseValue}>10</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ACModBox({ label, value }: { label: string; value: number }) {
  const formatted = value >= 0 ? `+${value}` : `${value}`;
  return (
    <View style={styles.modBox}>
      <Text style={styles.modLabel}>{label}</Text>
      <Text style={[styles.modValue, value !== 0 && styles.modValueNonZero]}>{formatted}</Text>
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
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  acMain: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  acLabel: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    color: COLORS.parchmentDark,
    letterSpacing: 1,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  acValue: {
    fontFamily: FONTS.serif,
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
  },
  acSecondary: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  acSub: {
    flex: 1,
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.xs,
    alignItems: 'center',
  },
  subLabel: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  subValue: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  breakdown: {
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 6,
    padding: SPACING.xs,
  },
  breakdownTitle: {
    fontFamily: FONTS.serif,
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 4,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  modBox: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
    minWidth: 48,
  },
  modLabel: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  modValue: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  modValueNonZero: {
    color: COLORS.text,
  },
  baseBox: {
    backgroundColor: COLORS.parchment,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
    minWidth: 48,
  },
  baseLabel: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    color: COLORS.accent,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  baseValue: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
