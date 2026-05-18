import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCharacterStore } from '../../src/store/characterStore';
import { useCharacter } from '../../src/hooks/useCharacter';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../src/theme';
import { SectionHeader } from '../../src/components/SectionHeader';
import { AbilityScore } from '../../src/components/AbilityScore';
import { HPTracker } from '../../src/components/HPTracker';
import { ACDisplay } from '../../src/components/ACDisplay';
import { SavesDisplay } from '../../src/components/SavesDisplay';
import { AttackDisplay } from '../../src/components/AttackDisplay';
import { SkillRow, SkillRowHeader } from '../../src/components/SkillRow';
import { FeatList } from '../../src/components/FeatList';
import { SpellSlotTracker } from '../../src/components/SpellSlotTracker';
import { CurrencyTracker } from '../../src/components/CurrencyTracker';
import { DnDInput } from '../../src/components/DnDInput';
import {
  Race,
  CharacterClass,
  Alignment,
  Size,
  AbilityScoreKey,
  XP_TABLE,
  getXPForNextLevel,
} from '../../src/types/dnd';
import type { SkillEntry, Feat, SpecialAbility, SpellEntry } from '../../src/types/character';
import { CLASS_DEFINITIONS } from '../../src/data/classes';
import { ALL_SKILLS } from '../../src/data/skills';

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const ABILITY_KEYS: AbilityScoreKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export default function CharacterSheetScreen() {
  const store = useCharacterStore();
  const { char, abilityMods, fortTotal, refTotal, willTotal, hpPercent, xpForNextLevel } = useCharacter();
  const [editAbility, setEditAbility] = useState<{ key: AbilityScoreKey; value: string } | null>(null);
  const [editAC, setEditAC] = useState(false);
  const [editSaves, setEditSaves] = useState(false);
  const [editSkill, setEditSkill] = useState<SkillEntry | null>(null);
  const [showNewCharModal, setShowNewCharModal] = useState(false);
  const [addSpellVisible, setAddSpellVisible] = useState(false);
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState('0');
  const [newSpellSchool, setNewSpellSchool] = useState('');
  const [newSpellDesc, setNewSpellDesc] = useState('');

  useEffect(() => {
    if (!char && !store.isLoading) {
      store.createCharacter();
    } else if (char && char.skills.length === 0) {
      store.initSkillsFromClass();
    }
  }, [char, store.isLoading]);

  if (!char) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading character...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAbilityEdit = (key: AbilityScoreKey) => {
    setEditAbility({ key, value: String(char.abilityScores[key]) });
  };

  const saveAbilityEdit = () => {
    if (!editAbility) return;
    const val = parseInt(editAbility.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 30) {
      store.updateAbilityScores({ [editAbility.key]: val });
    }
    setEditAbility(null);
  };

  const handleAddSpell = () => {
    const level = parseInt(newSpellLevel, 10);
    if (!newSpellName.trim() || isNaN(level)) return;
    const spell: SpellEntry = {
      id: generateId(),
      name: newSpellName.trim(),
      level,
      school: newSpellSchool.trim(),
      description: newSpellDesc.trim(),
      prepared: false,
      cast: false,
    };
    store.addSpell(spell);
    setNewSpellName('');
    setNewSpellLevel('0');
    setNewSpellSchool('');
    setNewSpellDesc('');
    setAddSpellVisible(false);
  };

  const classDef = CLASS_DEFINITIONS[char.characterClass];
  const isSpellcaster = classDef?.isSpellcaster ?? false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* ── BASIC INFO ── */}
        <SectionHeader title="Character Information" />
        <View style={styles.card}>
          <View style={styles.row}>
            <DnDInput
              label="Character Name"
              value={char.name}
              onChangeText={v => store.updateBasicInfo({ name: v })}
              style={{ flex: 2 }}
            />
            <DnDInput
              label="Player"
              value={char.playerName}
              onChangeText={v => store.updateBasicInfo({ playerName: v })}
              style={{ flex: 1 }}
            />
          </View>
          <DnDInput
            label="Campaign"
            value={char.campaign}
            onChangeText={v => store.updateBasicInfo({ campaign: v })}
          />

          <View style={styles.row}>
            {/* Race Picker */}
            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>RACE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.values(Race).map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, char.race === r && styles.chipActive]}
                    onPress={() => store.updateBasicInfo({ race: r })}
                  >
                    <Text style={[styles.chipText, char.race === r && styles.chipTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.row}>
            {/* Class Picker */}
            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>CLASS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.values(CharacterClass).map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, char.characterClass === c && styles.chipActive]}
                    onPress={() => {
                      store.updateBasicInfo({ characterClass: c });
                      setTimeout(() => store.initSkillsFromClass(), 100);
                    }}
                  >
                    <Text style={[styles.chipText, char.characterClass === c && styles.chipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Level, Alignment, Deity */}
          <View style={styles.row}>
            <View style={styles.fieldThird}>
              <DnDInput
                label="Level"
                value={String(char.level)}
                onChangeText={v => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n) && n >= 1 && n <= 20) store.updateBasicInfo({ level: n });
                }}
                keyboardType="numeric"
                compact
              />
            </View>
            <View style={styles.fieldTwoThird}>
              <DnDInput
                label="Deity"
                value={char.deity}
                onChangeText={v => store.updateBasicInfo({ deity: v })}
                compact
              />
            </View>
          </View>

          {/* Alignment */}
          <Text style={styles.pickerLabel}>ALIGNMENT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
            {Object.values(Alignment).map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, char.alignment === a && styles.chipActive]}
                onPress={() => store.updateBasicInfo({ alignment: a })}
              >
                <Text style={[styles.chipText, char.alignment === a && styles.chipTextActive]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Appearance */}
          <View style={styles.row}>
            <View style={styles.fieldThird}>
              <DnDInput label="Age" value={String(char.age)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateBasicInfo({ age: n });
              }} keyboardType="numeric" compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Gender" value={char.gender} onChangeText={v => store.updateBasicInfo({ gender: v })} compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Size" value={char.size} onChangeText={v => store.updateBasicInfo({ size: v as Size })} compact />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <DnDInput label="Height" value={char.height} onChangeText={v => store.updateBasicInfo({ height: v })} compact />
            </View>
            <View style={styles.fieldHalf}>
              <DnDInput label="Weight" value={char.weight} onChangeText={v => store.updateBasicInfo({ weight: v })} compact />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.fieldThird}>
              <DnDInput label="Eyes" value={char.eyes} onChangeText={v => store.updateBasicInfo({ eyes: v })} compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Hair" value={char.hair} onChangeText={v => store.updateBasicInfo({ hair: v })} compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Skin" value={char.skin} onChangeText={v => store.updateBasicInfo({ skin: v })} compact />
            </View>
          </View>
        </View>

        {/* ── ABILITY SCORES ── */}
        <SectionHeader title="Ability Scores" />
        <View style={styles.abilityGrid}>
          {ABILITY_KEYS.map(key => (
            <AbilityScore
              key={key}
              label={key.toUpperCase()}
              score={char.abilityScores[key]}
              onPress={() => handleAbilityEdit(key)}
            />
          ))}
        </View>

        {/* ── HIT POINTS ── */}
        <SectionHeader title="Hit Points" />
        <HPTracker
          hitPoints={char.hitPoints}
          onUpdate={hp => store.updateHitPoints(hp)}
        />

        {/* ── ARMOR CLASS ── */}
        <SectionHeader title="Armor Class" />
        <ACDisplay armorClass={char.armorClass} />
        <View style={styles.card}>
          <Text style={styles.editHint}>Edit AC components:</Text>
          <View style={styles.row}>
            <View style={styles.fieldThird}>
              <DnDInput label="Armor" value={String(char.armorClass.armorBonus)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateArmorClass({ armorBonus: n });
              }} keyboardType="numeric" compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Shield" value={String(char.armorClass.shieldBonus)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateArmorClass({ shieldBonus: n });
              }} keyboardType="numeric" compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Natural" value={String(char.armorClass.naturalArmor)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateArmorClass({ naturalArmor: n });
              }} keyboardType="numeric" compact />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <DnDInput label="Deflection" value={String(char.armorClass.deflection)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateArmorClass({ deflection: n });
              }} keyboardType="numeric" compact />
            </View>
            <View style={styles.fieldHalf}>
              <DnDInput label="Misc" value={String(char.armorClass.misc)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateArmorClass({ misc: n });
              }} keyboardType="numeric" compact />
            </View>
          </View>
        </View>

        {/* ── SAVING THROWS ── */}
        <SectionHeader title="Saving Throws" />
        <SavesDisplay savingThrows={char.savingThrows} />
        <View style={styles.card}>
          <Text style={styles.editHint}>Edit base & magic saves:</Text>
          <View style={styles.row}>
            <View style={styles.fieldThird}>
              <DnDInput label="Fort Base" value={String(char.savingThrows.fortitude.base)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateSavingThrows({ fortitude: { ...char.savingThrows.fortitude, base: n } });
              }} keyboardType="numeric" compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Ref Base" value={String(char.savingThrows.reflex.base)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateSavingThrows({ reflex: { ...char.savingThrows.reflex, base: n } });
              }} keyboardType="numeric" compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Will Base" value={String(char.savingThrows.will.base)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateSavingThrows({ will: { ...char.savingThrows.will, base: n } });
              }} keyboardType="numeric" compact />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.fieldThird}>
              <DnDInput label="Fort Magic" value={String(char.savingThrows.fortitude.magicMod)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateSavingThrows({ fortitude: { ...char.savingThrows.fortitude, magicMod: n } });
              }} keyboardType="numeric" compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Ref Magic" value={String(char.savingThrows.reflex.magicMod)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateSavingThrows({ reflex: { ...char.savingThrows.reflex, magicMod: n } });
              }} keyboardType="numeric" compact />
            </View>
            <View style={styles.fieldThird}>
              <DnDInput label="Will Magic" value={String(char.savingThrows.will.magicMod)} onChangeText={v => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) store.updateSavingThrows({ will: { ...char.savingThrows.will, magicMod: n } });
              }} keyboardType="numeric" compact />
            </View>
          </View>
        </View>

        {/* ── ATTACK BONUS ── */}
        <SectionHeader title="Combat" />
        <View style={styles.card}>
          <DnDInput
            label="Base Attack Bonus"
            value={String(char.attackBonuses.baseAttackBonus)}
            onChangeText={v => {
              const n = parseInt(v, 10);
              if (!isNaN(n)) store.updateBasicInfo({
                attackBonuses: { ...char.attackBonuses, baseAttackBonus: n },
              });
            }}
            keyboardType="numeric"
            compact
          />
        </View>
        <AttackDisplay attackBonuses={char.attackBonuses} />

        {/* ── SKILLS ── */}
        <SectionHeader title="Skills" />
        <View style={styles.card}>
          <SkillRowHeader />
          {char.skills.map(skill => (
            <SkillRow
              key={skill.id}
              skill={skill}
              abilityScores={char.abilityScores}
              onPress={() => setEditSkill(skill)}
            />
          ))}
          {char.skills.length === 0 && (
            <TouchableOpacity
              style={styles.initSkillsBtn}
              onPress={() => store.initSkillsFromClass()}
            >
              <Text style={styles.initSkillsBtnText}>Initialize Skills for {char.characterClass}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── FEATS ── */}
        <SectionHeader title="Feats" />
        <View style={styles.card}>
          <FeatList
            feats={char.feats}
            onAddFeat={feat => store.addFeat(feat)}
            onRemoveFeat={id => store.removeFeat(id)}
          />
        </View>

        {/* ── SPECIAL ABILITIES ── */}
        <SectionHeader title="Special Abilities & Racial Traits" />
        <View style={styles.card}>
          {char.specialAbilities.map(ability => (
            <View key={ability.id} style={styles.abilityCard}>
              <View style={styles.abilityHeader}>
                <Text style={styles.abilityName}>{ability.name}</Text>
                <Text style={styles.abilitySource}>({ability.source})</Text>
                <TouchableOpacity onPress={() => store.removeSpecialAbility(ability.id)}>
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.abilityDesc}>{ability.description}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addAbilityBtn}
            onPress={() => {
              // Quick add from common racial traits
              const def = RACE_ABILITIES[char.race];
              if (def && def.length > 0) {
                Alert.alert(
                  'Add Racial Ability',
                  'Choose from racial traits or add custom:',
                  [
                    ...def.map(a => ({
                      text: a.name,
                      onPress: () => store.addSpecialAbility({
                        id: generateId(),
                        name: a.name,
                        description: a.desc,
                        source: `Racial (${char.race})`,
                      }),
                    })),
                    { text: 'Cancel', style: 'cancel' },
                  ],
                );
              } else {
                store.addSpecialAbility({
                  id: generateId(),
                  name: 'New Ability',
                  description: 'Describe this ability...',
                  source: 'Class/Race',
                });
              }
            }}
          >
            <Text style={styles.addAbilityBtnText}>+ Add Special Ability</Text>
          </TouchableOpacity>
        </View>

        {/* ── SPELLS ── */}
        {isSpellcaster && (
          <>
            <SectionHeader title="Spell Slots" />
            <SpellSlotTracker
              spellSlots={char.spellSlots}
              onUseSlot={(level, used) => store.updateSpellSlot(level, used)}
              onResetSlots={() => store.refreshSpellSlots()}
            />

            <SectionHeader title="Spells Known / Prepared" />
            <View style={styles.card}>
              {char.spells.map(spell => (
                <View key={spell.id} style={styles.spellRow}>
                  <View style={[styles.spellLevelBadge, spell.cast && styles.spellCast]}>
                    <Text style={styles.spellLevelText}>{spell.level}</Text>
                  </View>
                  <View style={styles.spellInfo}>
                    <Text style={[styles.spellName, spell.cast && styles.spellNameCast]}>{spell.name}</Text>
                    {spell.school ? <Text style={styles.spellSchool}>{spell.school}</Text> : null}
                  </View>
                  <TouchableOpacity
                    style={[styles.spellToggle, spell.prepared && styles.spellToggleActive]}
                    onPress={() => store.toggleSpellPrepared(spell.id)}
                  >
                    <Text style={styles.spellToggleText}>{spell.prepared ? 'Prep' : 'Prep'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.spellToggle, spell.cast && styles.spellCastBtn]}
                    onPress={() => store.toggleSpellCast(spell.id)}
                  >
                    <Text style={styles.spellToggleText}>{spell.cast ? 'Cast' : 'Cast'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => store.removeSpell(spell.id)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addAbilityBtn}
                onPress={() => setAddSpellVisible(true)}
              >
                <Text style={styles.addAbilityBtnText}>+ Add Spell</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── XP ── */}
        <SectionHeader title="Experience Points" />
        <View style={styles.card}>
          <View style={styles.xpRow}>
            <View style={styles.xpField}>
              <Text style={styles.xpLabel}>CURRENT XP</Text>
              <DnDInput
                value={String(char.experiencePoints)}
                onChangeText={v => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n) && n >= 0) store.updateExperience(n);
                }}
                keyboardType="numeric"
                compact
              />
            </View>
            <View style={styles.xpField}>
              <Text style={styles.xpLabel}>NEXT LEVEL</Text>
              <View style={styles.xpNextBox}>
                <Text style={styles.xpNextValue}>{xpForNextLevel.toLocaleString()}</Text>
              </View>
            </View>
          </View>
          {/* XP progress bar */}
          <View style={styles.xpBarContainer}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width: `${Math.min(100, (char.experiencePoints / xpForNextLevel) * 100)}%`,
                },
              ]}
            />
            <Text style={styles.xpBarLabel}>
              {char.level >= 20
                ? 'Max Level'
                : `${((char.experiencePoints / xpForNextLevel) * 100).toFixed(1)}% to level ${char.level + 1}`}
            </Text>
          </View>
        </View>

        {/* ── CURRENCY ── */}
        <SectionHeader title="Currency" />
        <CurrencyTracker
          currency={char.currency}
          onUpdate={c => store.updateCurrency(c)}
        />

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Ability Score Edit Modal */}
      <Modal visible={!!editAbility} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Edit {editAbility?.key.toUpperCase()}
            </Text>
            <TextInputNumeric
              value={editAbility?.value ?? ''}
              onChange={v => setEditAbility(prev => prev ? { ...prev, value: v } : null)}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.parchmentDark, borderWidth: 1, borderColor: COLORS.border }]}
                onPress={() => setEditAbility(null)}
              >
                <Text style={{ fontFamily: FONTS.serif, color: COLORS.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.accent }]} onPress={saveAbilityEdit}>
                <Text style={{ fontFamily: FONTS.serif, color: COLORS.white, fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Skill Modal */}
      <Modal visible={!!editSkill} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editSkill?.name}</Text>
            <Text style={styles.modalSubtitle}>Key Ability: {editSkill?.keyAbility?.toUpperCase()}</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <DnDInput
                  label="Ranks"
                  value={String(editSkill?.ranks ?? 0)}
                  onChangeText={v => {
                    if (!editSkill) return;
                    const n = parseFloat(v);
                    setEditSkill({ ...editSkill, ranks: isNaN(n) ? 0 : n });
                  }}
                  keyboardType="decimal-pad"
                  compact
                />
              </View>
              <View style={{ flex: 1 }}>
                <DnDInput
                  label="Misc Mod"
                  value={String(editSkill?.miscMod ?? 0)}
                  onChangeText={v => {
                    if (!editSkill) return;
                    const n = parseInt(v, 10);
                    setEditSkill({ ...editSkill, miscMod: isNaN(n) ? 0 : n });
                  }}
                  keyboardType="numeric"
                  compact
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.classSkillToggle, editSkill?.isClassSkill && styles.classSkillToggleActive]}
              onPress={() => {
                if (!editSkill) return;
                setEditSkill({ ...editSkill, isClassSkill: !editSkill.isClassSkill });
              }}
            >
              <Text style={styles.classSkillToggleText}>
                {editSkill?.isClassSkill ? '● Class Skill (×1 + 3 at rank 1+)' : '○ Cross-Class Skill'}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.parchmentDark, borderWidth: 1, borderColor: COLORS.border }]}
                onPress={() => setEditSkill(null)}
              >
                <Text style={{ fontFamily: FONTS.serif, color: COLORS.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.accent }]}
                onPress={() => {
                  if (editSkill) store.updateSkill(editSkill);
                  setEditSkill(null);
                }}
              >
                <Text style={{ fontFamily: FONTS.serif, color: COLORS.white, fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Spell Modal */}
      <Modal visible={addSpellVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Spell</Text>
            <DnDInput label="Name" value={newSpellName} onChangeText={setNewSpellName} compact />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <DnDInput label="Level" value={newSpellLevel} onChangeText={setNewSpellLevel} keyboardType="numeric" compact />
              </View>
              <View style={{ flex: 2 }}>
                <DnDInput label="School" value={newSpellSchool} onChangeText={setNewSpellSchool} compact />
              </View>
            </View>
            <DnDInput label="Description" value={newSpellDesc} onChangeText={setNewSpellDesc} multiline compact />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.parchmentDark, borderWidth: 1, borderColor: COLORS.border }]} onPress={() => setAddSpellVisible(false)}>
                <Text style={{ fontFamily: FONTS.serif, color: COLORS.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.accent }]} onPress={handleAddSpell}>
                <Text style={{ fontFamily: FONTS.serif, color: COLORS.white, fontWeight: '700' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TextInputNumeric({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      style={{
        backgroundColor: COLORS.inputBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        padding: SPACING.sm,
        fontFamily: FONTS.serif,
        fontSize: 28,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.md,
      }}
      value={value}
      onChangeText={onChange}
      keyboardType="numeric"
      autoFocus
      selectTextOnFocus
    />
  );
}

// Quick racial ability templates for the alert
const RACE_ABILITIES: Record<string, Array<{ name: string; desc: string }>> = {
  Human: [
    { name: 'Bonus Feat', desc: 'Humans gain one extra feat at 1st level.' },
    { name: 'Skilled', desc: 'Humans gain 4 extra skill points at 1st level, plus 1 per level after.' },
  ],
  Elf: [
    { name: 'Low-Light Vision', desc: 'Can see twice as far as humans in poor illumination.' },
    { name: 'Immunity to Sleep', desc: 'Immune to magic sleep effects.' },
    { name: 'Elven Weapon Proficiency', desc: 'Proficient with longsword, rapier, longbow, and shortbow.' },
  ],
  Dwarf: [
    { name: 'Darkvision', desc: 'Can see in the dark up to 60 feet.' },
    { name: 'Stonecunning', desc: '+2 racial bonus on Search checks related to stonework.' },
    { name: 'Stability', desc: '+4 racial bonus on checks to resist bull rush or trip.' },
  ],
  Halfling: [
    { name: 'Keen Senses', desc: '+2 racial bonus on Listen checks.' },
    { name: 'Lucky', desc: '+1 racial bonus on all saving throws.' },
    { name: 'Sure-Footed', desc: '+2 racial bonus on Climb, Jump, and Move Silently.' },
  ],
  Gnome: [
    { name: 'Low-Light Vision', desc: 'Can see twice as far as humans in poor illumination.' },
    { name: 'Illusion Affinity', desc: '+1 DC on saving throws against illusion spells you cast.' },
    { name: 'Gnome Cantrips', desc: 'dancing lights, ghost sound, prestidigitation 1/day each.' },
  ],
  'Half-Elf': [
    { name: 'Low-Light Vision', desc: 'Can see twice as far as humans in poor illumination.' },
    { name: 'Elven Blood', desc: 'Treated as elves for race-dependent effects.' },
    { name: 'Adaptable', desc: '+2 racial bonus on Diplomacy and Gather Information.' },
  ],
  'Half-Orc': [
    { name: 'Darkvision', desc: 'Can see in the dark up to 60 feet.' },
    { name: 'Orc Blood', desc: 'Treated as orcs for race-dependent effects.' },
  ],
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    ...SHADOWS.card,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  fieldHalf: { flex: 1 },
  fieldThird: { flex: 1 },
  fieldTwoThird: { flex: 2 },
  pickerGroup: {
    flex: 1,
    marginBottom: SPACING.sm,
  },
  pickerLabel: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.parchmentDark,
    marginRight: SPACING.xs,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  abilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  editHint: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  initSkillsBtn: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  initSkillsBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  abilityCard: {
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 6,
    padding: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  abilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  abilityName: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  abilitySource: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  abilityDesc: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  addAbilityBtn: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    alignItems: 'center',
    borderStyle: 'dashed',
    marginTop: SPACING.xs,
  },
  addAbilityBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  removeBtn: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '700',
    padding: 2,
  },
  spellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  spellLevelBadge: {
    backgroundColor: COLORS.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spellCast: {
    backgroundColor: COLORS.textMuted,
  },
  spellLevelText: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  spellInfo: {
    flex: 1,
  },
  spellName: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  spellNameCast: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  spellSchool: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  spellToggle: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  spellToggleActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  spellCastBtn: {
    backgroundColor: COLORS.textMuted,
    borderColor: COLORS.textMuted,
  },
  spellToggleText: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '600',
  },
  xpRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  xpField: {
    flex: 1,
  },
  xpLabel: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  xpNextBox: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: SPACING.xs,
    alignItems: 'center',
  },
  xpNextValue: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  xpBarContainer: {
    height: 20,
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  xpBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.info,
    borderRadius: 10,
  },
  xpBarLabel: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontFamily: FONTS.serif,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.parchment,
    borderRadius: 12,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  classSkillToggle: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  classSkillToggleActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  classSkillToggleText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
});
