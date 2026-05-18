// Zustand store for character data
import { create } from 'zustand';
import type { Character, SkillEntry, Feat, SpecialAbility, SpellSlot, SpellEntry } from '../types/character';
import type { AbilityScores, HitPoints, ArmorClass, SavingThrows, Currency } from '../types/character';
import {
  getCharacterById,
  saveCharacter,
  createNewCharacter,
  getAllCharacters,
  deleteCharacter,
} from '../db/database';
import { calcAbilityModifier } from '../types/dnd';
import { ALL_SKILLS } from '../data/skills';
import { getSpellSlotsForClass } from '../data/spellSlots';
import { CLASS_DEFINITIONS, getBAB, getBaseSave } from '../data/classes';
import { RACE_DEFINITIONS } from '../data/races';

interface CharacterState {
  characters: Character[];
  activeCharacter: Character | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadAllCharacters: () => Promise<void>;
  loadCharacter: (id: string) => Promise<void>;
  setActiveCharacter: (character: Character) => void;
  createCharacter: () => Promise<Character>;
  deleteCharacterById: (id: string) => Promise<void>;

  updateBasicInfo: (fields: Partial<Character>) => Promise<void>;
  updateAbilityScores: (scores: Partial<AbilityScores>) => Promise<void>;
  updateHitPoints: (hp: Partial<HitPoints>) => Promise<void>;
  updateArmorClass: (ac: Partial<ArmorClass>) => Promise<void>;
  updateSavingThrows: (saves: Partial<SavingThrows>) => Promise<void>;
  updateCurrency: (currency: Partial<Currency>) => Promise<void>;

  addFeat: (feat: Feat) => Promise<void>;
  removeFeat: (id: string) => Promise<void>;

  addSpecialAbility: (ability: SpecialAbility) => Promise<void>;
  removeSpecialAbility: (id: string) => Promise<void>;

  updateSkill: (skill: SkillEntry) => Promise<void>;
  initSkillsFromClass: () => Promise<void>;

  updateSpellSlot: (level: number, used: number) => Promise<void>;
  addSpell: (spell: SpellEntry) => Promise<void>;
  removeSpell: (id: string) => Promise<void>;
  toggleSpellCast: (id: string) => Promise<void>;
  toggleSpellPrepared: (id: string) => Promise<void>;
  refreshSpellSlots: () => Promise<void>;

  updatePortrait: (uri: string, locked: boolean) => Promise<void>;
  updateExperience: (xp: number) => Promise<void>;

  // Derived calculations (helpers)
  getEffectiveAC: () => number;
  getTouchAC: () => number;
  getFlatFootedAC: () => number;
  getTotalSave: (type: 'fortitude' | 'reflex' | 'will') => number;
  getMeleeAttack: () => number;
  getRangedAttack: () => number;
  getGrapple: () => number;
  getTotalWeight: (inventoryWeights: number) => number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  activeCharacter: null,
  isLoading: false,
  error: null,

  loadAllCharacters: async () => {
    set({ isLoading: true, error: null });
    try {
      const characters = await getAllCharacters();
      set({ characters, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  loadCharacter: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const character = await getCharacterById(id);
      if (character) {
        // Recalculate derived values
        const enriched = enrichCharacter(character);
        set({ activeCharacter: enriched, isLoading: false });
      } else {
        set({ error: 'Character not found', isLoading: false });
      }
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  setActiveCharacter: (character: Character) => {
    set({ activeCharacter: enrichCharacter(character) });
  },

  createCharacter: async () => {
    const character = await createNewCharacter();
    const enriched = enrichCharacter(character);
    set(state => ({
      characters: [enriched, ...state.characters],
      activeCharacter: enriched,
    }));
    return enriched;
  },

  deleteCharacterById: async (id: string) => {
    await deleteCharacter(id);
    set(state => ({
      characters: state.characters.filter(c => c.id !== id),
      activeCharacter: state.activeCharacter?.id === id ? null : state.activeCharacter,
    }));
  },

  updateBasicInfo: async (fields: Partial<Character>) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = { ...activeCharacter, ...fields, updatedAt: new Date().toISOString() };
    const enriched = enrichCharacter(updated);
    set({ activeCharacter: enriched });
    await saveCharacter(enriched);
  },

  updateAbilityScores: async (scores: Partial<AbilityScores>) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      abilityScores: { ...activeCharacter.abilityScores, ...scores },
      updatedAt: new Date().toISOString(),
    };
    const enriched = enrichCharacter(updated);
    set({ activeCharacter: enriched });
    await saveCharacter(enriched);
  },

  updateHitPoints: async (hp: Partial<HitPoints>) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      hitPoints: { ...activeCharacter.hitPoints, ...hp },
      updatedAt: new Date().toISOString(),
    };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  updateArmorClass: async (ac: Partial<ArmorClass>) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updatedAC = { ...activeCharacter.armorClass, ...ac };
    const updated = { ...activeCharacter, armorClass: updatedAC };
    const enriched = enrichCharacter(updated);
    set({ activeCharacter: enriched });
    await saveCharacter(enriched);
  },

  updateSavingThrows: async (saves: Partial<SavingThrows>) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      savingThrows: { ...activeCharacter.savingThrows, ...saves },
    };
    const enriched = enrichCharacter(updated);
    set({ activeCharacter: enriched });
    await saveCharacter(enriched);
  },

  updateCurrency: async (currency: Partial<Currency>) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      currency: { ...activeCharacter.currency, ...currency },
    };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  addFeat: async (feat: Feat) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      feats: [...activeCharacter.feats, feat],
    };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  removeFeat: async (id: string) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      feats: activeCharacter.feats.filter(f => f.id !== id),
    };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  addSpecialAbility: async (ability: SpecialAbility) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      specialAbilities: [...activeCharacter.specialAbilities, ability],
    };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  removeSpecialAbility: async (id: string) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      specialAbilities: activeCharacter.specialAbilities.filter(a => a.id !== id),
    };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  updateSkill: async (skill: SkillEntry) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const idx = activeCharacter.skills.findIndex(s => s.id === skill.id);
    let updatedSkills: SkillEntry[];
    if (idx >= 0) {
      updatedSkills = [...activeCharacter.skills];
      updatedSkills[idx] = skill;
    } else {
      updatedSkills = [...activeCharacter.skills, skill];
    }
    const updated = { ...activeCharacter, skills: updatedSkills };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  initSkillsFromClass: async () => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const classSkillNames = CLASS_DEFINITIONS[activeCharacter.characterClass]
      ? ALL_SKILLS
          .filter(s => s.classSkills.includes(activeCharacter.characterClass))
          .map(s => s.name)
      : [];

    const skills: SkillEntry[] = ALL_SKILLS.map(skillDef => {
      const existing = activeCharacter.skills.find(s => s.name === skillDef.name);
      if (existing) {
        return {
          ...existing,
          isClassSkill: classSkillNames.includes(skillDef.name),
        };
      }
      return {
        id: generateId(),
        name: skillDef.name,
        keyAbility: skillDef.keyAbility,
        ranks: 0,
        miscMod: 0,
        isClassSkill: classSkillNames.includes(skillDef.name),
        synergy: 0,
        armorCheckPenalty: skillDef.armorCheckPenalty,
      };
    });

    const updated = { ...activeCharacter, skills };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  updateSpellSlot: async (level: number, used: number) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const spellSlots = activeCharacter.spellSlots.map(slot =>
      slot.level === level ? { ...slot, used } : slot,
    );
    const updated = { ...activeCharacter, spellSlots };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  addSpell: async (spell: SpellEntry) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = { ...activeCharacter, spells: [...activeCharacter.spells, spell] };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  removeSpell: async (id: string) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = {
      ...activeCharacter,
      spells: activeCharacter.spells.filter(s => s.id !== id),
    };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  toggleSpellCast: async (id: string) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const spells = activeCharacter.spells.map(s =>
      s.id === id ? { ...s, cast: !s.cast } : s,
    );
    const updated = { ...activeCharacter, spells };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  toggleSpellPrepared: async (id: string) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const spells = activeCharacter.spells.map(s =>
      s.id === id ? { ...s, prepared: !s.prepared } : s,
    );
    const updated = { ...activeCharacter, spells };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  refreshSpellSlots: async () => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const classDef = CLASS_DEFINITIONS[activeCharacter.characterClass];
    if (!classDef?.isSpellcaster) return;

    const baseSlots = getSpellSlotsForClass(
      activeCharacter.characterClass,
      activeCharacter.level,
    );

    const spellSlots: SpellSlot[] = baseSlots
      .map((total, level) => ({ level, total, used: 0, bonusSlots: 0 }))
      .filter(slot => slot.total > 0);

    const updated = { ...activeCharacter, spellSlots };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  updatePortrait: async (uri: string, locked: boolean) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = { ...activeCharacter, portraitUri: uri, portraitLocked: locked };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  updateExperience: async (xp: number) => {
    const { activeCharacter } = get();
    if (!activeCharacter) return;
    const updated = { ...activeCharacter, experiencePoints: xp };
    set({ activeCharacter: updated });
    await saveCharacter(updated);
  },

  // Derived calculations
  getEffectiveAC: () => {
    const char = get().activeCharacter;
    if (!char) return 10;
    const dexMod = calcAbilityModifier(char.abilityScores.dex);
    const sizeMod = getSizeMod(char.size);
    return (
      10 +
      char.armorClass.armorBonus +
      char.armorClass.shieldBonus +
      dexMod +
      sizeMod +
      char.armorClass.naturalArmor +
      char.armorClass.deflection +
      char.armorClass.misc
    );
  },

  getTouchAC: () => {
    const char = get().activeCharacter;
    if (!char) return 10;
    const dexMod = calcAbilityModifier(char.abilityScores.dex);
    const sizeMod = getSizeMod(char.size);
    return 10 + dexMod + sizeMod + char.armorClass.deflection + char.armorClass.misc;
  },

  getFlatFootedAC: () => {
    const char = get().activeCharacter;
    if (!char) return 10;
    const sizeMod = getSizeMod(char.size);
    return (
      10 +
      char.armorClass.armorBonus +
      char.armorClass.shieldBonus +
      sizeMod +
      char.armorClass.naturalArmor +
      char.armorClass.deflection +
      char.armorClass.misc
    );
  },

  getTotalSave: (type: 'fortitude' | 'reflex' | 'will') => {
    const char = get().activeCharacter;
    if (!char) return 0;
    const save = char.savingThrows[type];
    let abilityMod = 0;
    if (type === 'fortitude') abilityMod = calcAbilityModifier(char.abilityScores.con);
    if (type === 'reflex') abilityMod = calcAbilityModifier(char.abilityScores.dex);
    if (type === 'will') abilityMod = calcAbilityModifier(char.abilityScores.wis);
    return save.base + abilityMod + save.magicMod + save.miscMod;
  },

  getMeleeAttack: () => {
    const char = get().activeCharacter;
    if (!char) return 0;
    return char.attackBonuses.baseAttackBonus + calcAbilityModifier(char.abilityScores.str) + getSizeMod(char.size);
  },

  getRangedAttack: () => {
    const char = get().activeCharacter;
    if (!char) return 0;
    return char.attackBonuses.baseAttackBonus + calcAbilityModifier(char.abilityScores.dex) + getSizeMod(char.size);
  },

  getGrapple: () => {
    const char = get().activeCharacter;
    if (!char) return 0;
    return char.attackBonuses.baseAttackBonus + calcAbilityModifier(char.abilityScores.str) - getSizeMod(char.size);
  },

  getTotalWeight: (inventoryWeight: number) => {
    return inventoryWeight;
  },
}));

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getSizeMod(size: string): number {
  const mods: Record<string, number> = {
    Fine: 8, Diminutive: 4, Tiny: 2, Small: 1,
    Medium: 0, Large: -1, Huge: -2, Gargantuan: -4, Colossal: -8,
  };
  return mods[size] ?? 0;
}

function enrichCharacter(char: Character): Character {
  // Recalculate AC totals
  const dexMod = calcAbilityModifier(char.abilityScores.dex);
  const conMod = calcAbilityModifier(char.abilityScores.con);
  const wisMod = calcAbilityModifier(char.abilityScores.wis);
  const sizeMod = getSizeMod(char.size);
  const strMod = calcAbilityModifier(char.abilityScores.str);

  const acTotal =
    10 +
    char.armorClass.armorBonus +
    char.armorClass.shieldBonus +
    dexMod +
    sizeMod +
    char.armorClass.naturalArmor +
    char.armorClass.deflection +
    char.armorClass.misc;

  const acTouch = 10 + dexMod + sizeMod + char.armorClass.deflection + char.armorClass.misc;

  const acFlatFooted =
    10 +
    char.armorClass.armorBonus +
    char.armorClass.shieldBonus +
    sizeMod +
    char.armorClass.naturalArmor +
    char.armorClass.deflection +
    char.armorClass.misc;

  // Recalculate grapple and attack bonuses
  const bab = char.attackBonuses.baseAttackBonus;
  const grapple = bab + strMod + getSizeGrappleMod(char.size);
  const meleeAttack = bab + strMod + sizeMod;
  const rangedAttack = bab + dexMod + sizeMod;

  // Recalculate saving throw ability mods
  const savingThrows = {
    fortitude: { ...char.savingThrows.fortitude, abilityMod: conMod },
    reflex: { ...char.savingThrows.reflex, abilityMod: dexMod },
    will: { ...char.savingThrows.will, abilityMod: wisMod },
  };

  return {
    ...char,
    armorClass: {
      ...char.armorClass,
      total: acTotal,
      touch: acTouch,
      flatFooted: acFlatFooted,
      dexMod,
      sizeMod,
    },
    attackBonuses: {
      ...char.attackBonuses,
      grappleModifier: grapple,
      meleeAttackBonus: meleeAttack,
      rangedAttackBonus: rangedAttack,
    },
    savingThrows,
  };
}

function getSizeGrappleMod(size: string): number {
  const mods: Record<string, number> = {
    Fine: -16, Diminutive: -12, Tiny: -8, Small: -4,
    Medium: 0, Large: 4, Huge: 8, Gargantuan: 12, Colossal: 16,
  };
  return mods[size] ?? 0;
}
