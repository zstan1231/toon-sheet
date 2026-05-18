import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import type { SpellSlot } from '../types/character';

interface SpellSlotTrackerProps {
  spellSlots: SpellSlot[];
  onUseSlot: (level: number, used: number) => void;
  onResetSlots: () => void;
}

export function SpellSlotTracker({ spellSlots, onUseSlot, onResetSlots }: SpellSlotTrackerProps) {
  if (spellSlots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No spell slots. Select a spellcasting class and use "Refresh Spell Slots".</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={onResetSlots}>
          <Text style={styles.refreshBtnText}>Refresh Spell Slots</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>SPELL SLOTS</Text>
        <TouchableOpacity onPress={onResetSlots} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>Reset Day</Text>
        </TouchableOpacity>
      </View>
      {spellSlots.map(slot => (
        <SpellLevelRow
          key={slot.level}
          slot={slot}
          onUse={(used) => onUseSlot(slot.level, used)}
        />
      ))}
    </View>
  );
}

function SpellLevelRow({
  slot,
  onUse,
}: {
  slot: SpellSlot;
  onUse: (used: number) => void;
}) {
  const total = slot.total + slot.bonusSlots;
  const remaining = total - slot.used;

  return (
    <View style={styles.levelRow}>
      <View style={styles.levelBadge}>
        <Text style={styles.levelNum}>{slot.level}</Text>
        <Text style={styles.levelLabel}>{slot.level === 0 ? 'CANTRIP' : 'LVL'}</Text>
      </View>

      <View style={styles.slotsRow}>
        {Array.from({ length: total }).map((_, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.slotCircle, idx < slot.used && styles.slotUsed]}
            onPress={() => {
              const newUsed = idx < slot.used ? idx : idx + 1;
              onUse(Math.max(0, Math.min(total, newUsed)));
            }}
          >
            <Text style={styles.slotCircleText}>{idx < slot.used ? '○' : '●'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.remaining, remaining === 0 && styles.remainingZero]}>
        {remaining}/{total}
      </Text>
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
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  refreshBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  refreshBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resetBtn: {
    backgroundColor: COLORS.parchmentDark,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '600',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  levelBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    width: 36,
    alignItems: 'center',
    paddingVertical: 3,
  },
  levelNum: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  levelLabel: {
    fontFamily: FONTS.serif,
    fontSize: 6,
    color: COLORS.parchmentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotsRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  slotCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotUsed: {
    backgroundColor: COLORS.parchmentDeep,
    borderColor: COLORS.textMuted,
  },
  slotCircleText: {
    fontSize: 14,
    color: COLORS.accent,
    lineHeight: 16,
  },
  remaining: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
    minWidth: 32,
    textAlign: 'right',
  },
  remainingZero: {
    color: COLORS.textMuted,
  },
});
