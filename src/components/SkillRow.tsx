import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';
import type { SkillEntry } from '../types/character';
import type { AbilityScores } from '../types/character';
import { calcAbilityModifier } from '../types/dnd';

interface SkillRowProps {
  skill: SkillEntry;
  abilityScores: AbilityScores;
  onPress?: () => void;
}

export function SkillRow({ skill, abilityScores, onPress }: SkillRowProps) {
  const abilityMod = calcAbilityModifier(abilityScores[skill.keyAbility]);
  const classSkillBonus = skill.isClassSkill && skill.ranks > 0 ? 3 : 0;
  const total = skill.ranks + abilityMod + skill.miscMod + classSkillBonus + skill.synergy;
  const totalStr = total >= 0 ? `+${total}` : `${total}`;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {/* Class Skill Indicator */}
      <View style={[styles.classSkillDot, skill.isClassSkill && styles.classSkillDotActive]} />

      {/* Skill Name */}
      <Text style={styles.skillName} numberOfLines={1}>{skill.name}</Text>

      {/* Key Ability */}
      <Text style={styles.ability}>{skill.keyAbility.toUpperCase()}</Text>

      {/* Ranks */}
      <View style={styles.cell}>
        <Text style={styles.rankValue}>{skill.ranks}</Text>
      </View>

      {/* Ability Mod */}
      <View style={styles.cell}>
        <Text style={styles.modValue}>{abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`}</Text>
      </View>

      {/* Misc Mod */}
      <View style={styles.cell}>
        <Text style={styles.modValue}>{skill.miscMod >= 0 ? `+${skill.miscMod}` : `${skill.miscMod}`}</Text>
      </View>

      {/* Total */}
      <View style={styles.totalCell}>
        <Text style={styles.totalValue}>{totalStr}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function SkillRowHeader() {
  return (
    <View style={styles.headerRow}>
      <View style={styles.classDotHeader} />
      <Text style={[styles.headerText, { flex: 3 }]}>SKILL</Text>
      <Text style={[styles.headerText, styles.abilityHeader]}>KEY</Text>
      <Text style={[styles.headerText, styles.cellHeader]}>RANKS</Text>
      <Text style={[styles.headerText, styles.cellHeader]}>ABIL</Text>
      <Text style={[styles.headerText, styles.cellHeader]}>MISC</Text>
      <Text style={[styles.headerText, styles.totalHeader]}>TOTAL</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 4,
    gap: 4,
    marginBottom: 2,
  },
  classDotHeader: {
    width: 10,
    height: 10,
  },
  classSkillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
  },
  classSkillDotActive: {
    backgroundColor: COLORS.accent,
  },
  skillName: {
    flex: 3,
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.text,
  },
  ability: {
    width: 30,
    fontFamily: FONTS.serif,
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  cell: {
    width: 38,
    alignItems: 'center',
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 3,
    paddingVertical: 2,
  },
  rankValue: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  modValue: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  totalCell: {
    width: 38,
    alignItems: 'center',
    backgroundColor: COLORS.accentDark,
    borderRadius: 3,
    paddingVertical: 2,
  },
  totalValue: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerText: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  abilityHeader: {
    width: 30,
    textAlign: 'center',
  },
  cellHeader: {
    width: 38,
    textAlign: 'center',
  },
  totalHeader: {
    width: 38,
    textAlign: 'center',
    color: COLORS.accent,
  },
});
