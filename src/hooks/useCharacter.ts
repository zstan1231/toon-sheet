// Hook for character operations with computed values
import { useCharacterStore } from '../store/characterStore';
import { calcAbilityModifier, formatModifier } from '../types/dnd';
import { getEncumbranceLevel, getEncumbranceThresholds } from '../data/encumbrance';
import { useInventoryStore } from '../store/inventoryStore';
import { getXPForNextLevel } from '../types/dnd';
import type { EncumbranceThresholds } from '../data/encumbrance';
import type { Character } from '../types/character';
import type { AbilityScores } from '../types/character';

type AbilityMods = { str: number; dex: number; con: number; int: number; wis: number; cha: number };

export interface UseCharacterResult {
  char: Character | null;
  abilityMods: AbilityMods;
  fortTotal: number;
  refTotal: number;
  willTotal: number;
  hpPercent: number;
  totalWeight: number;
  encumbrance: ReturnType<typeof getEncumbranceLevel>;
  encumbranceThresholds: EncumbranceThresholds;
  xpForNextLevel: number;
  xpProgress: number;
  getSkillTotal: (skillId: string) => number;
  formatModifier: (n: number) => string;
  // forwarded store methods
  loadAllCharacters: () => Promise<void>;
  loadCharacter: (id: string) => Promise<void>;
  createCharacter: () => Promise<Character>;
  deleteCharacterById: (id: string) => Promise<void>;
  updateBasicInfo: (fields: Partial<Character>) => Promise<void>;
  updateAbilityScores: (scores: Partial<AbilityScores>) => Promise<void>;
  updateHitPoints: (hp: Partial<Character['hitPoints']>) => Promise<void>;
  updateArmorClass: (ac: Partial<Character['armorClass']>) => Promise<void>;
  updateSavingThrows: (saves: Partial<Character['savingThrows']>) => Promise<void>;
  updateCurrency: (currency: Partial<Character['currency']>) => Promise<void>;
  addFeat: (feat: Character['feats'][0]) => Promise<void>;
  removeFeat: (id: string) => Promise<void>;
  addSpecialAbility: (ability: Character['specialAbilities'][0]) => Promise<void>;
  removeSpecialAbility: (id: string) => Promise<void>;
  updateSkill: (skill: Character['skills'][0]) => Promise<void>;
  initSkillsFromClass: () => Promise<void>;
  updateSpellSlot: (level: number, used: number) => Promise<void>;
  addSpell: (spell: Character['spells'][0]) => Promise<void>;
  removeSpell: (id: string) => Promise<void>;
  toggleSpellCast: (id: string) => Promise<void>;
  toggleSpellPrepared: (id: string) => Promise<void>;
  refreshSpellSlots: () => Promise<void>;
  updatePortrait: (uri: string, locked: boolean) => Promise<void>;
  updateExperience: (xp: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useCharacter(): UseCharacterResult {
  const store = useCharacterStore();
  const { getTotalWeight } = useInventoryStore();
  const char = store.activeCharacter;

  const strMod = char ? calcAbilityModifier(char.abilityScores.str) : 0;
  const dexMod = char ? calcAbilityModifier(char.abilityScores.dex) : 0;
  const conMod = char ? calcAbilityModifier(char.abilityScores.con) : 0;
  const intMod = char ? calcAbilityModifier(char.abilityScores.int) : 0;
  const wisMod = char ? calcAbilityModifier(char.abilityScores.wis) : 0;
  const chaMod = char ? calcAbilityModifier(char.abilityScores.cha) : 0;

  const abilityMods: AbilityMods = { str: strMod, dex: dexMod, con: conMod, int: intMod, wis: wisMod, cha: chaMod };

  const totalWeight = getTotalWeight();
  const encumbrance = getEncumbranceLevel(totalWeight, char?.abilityScores.str ?? 10);
  const encumbranceThresholds = getEncumbranceThresholds(char?.abilityScores.str ?? 10);

  const xpForNextLevel = char ? getXPForNextLevel(char.level) : 0;
  const xpProgress = !char || char.level >= 20
    ? 1
    : char.experiencePoints / (xpForNextLevel || 1);

  const fortTotal = char
    ? char.savingThrows.fortitude.base + conMod + char.savingThrows.fortitude.magicMod + char.savingThrows.fortitude.miscMod
    : 0;
  const refTotal = char
    ? char.savingThrows.reflex.base + dexMod + char.savingThrows.reflex.magicMod + char.savingThrows.reflex.miscMod
    : 0;
  const willTotal = char
    ? char.savingThrows.will.base + wisMod + char.savingThrows.will.magicMod + char.savingThrows.will.miscMod
    : 0;

  const hpPercent = char && char.hitPoints.max > 0
    ? Math.max(0, char.hitPoints.current / char.hitPoints.max)
    : 0;

  const getSkillTotal = (skillId: string): number => {
    if (!char) return 0;
    const skill = char.skills.find(s => s.id === skillId);
    if (!skill) return 0;
    const abilityMod = abilityMods[skill.keyAbility] ?? 0;
    const classSkillBonus = skill.isClassSkill && skill.ranks > 0 ? 3 : 0;
    return skill.ranks + abilityMod + skill.miscMod + classSkillBonus + skill.synergy;
  };

  return {
    char,
    abilityMods,
    fortTotal,
    refTotal,
    willTotal,
    hpPercent,
    totalWeight,
    encumbrance,
    encumbranceThresholds,
    xpForNextLevel,
    xpProgress,
    getSkillTotal,
    formatModifier,
    loadAllCharacters: store.loadAllCharacters,
    loadCharacter: store.loadCharacter,
    createCharacter: store.createCharacter,
    deleteCharacterById: store.deleteCharacterById,
    updateBasicInfo: store.updateBasicInfo,
    updateAbilityScores: store.updateAbilityScores,
    updateHitPoints: store.updateHitPoints,
    updateArmorClass: store.updateArmorClass,
    updateSavingThrows: store.updateSavingThrows,
    updateCurrency: store.updateCurrency,
    addFeat: store.addFeat,
    removeFeat: store.removeFeat,
    addSpecialAbility: store.addSpecialAbility,
    removeSpecialAbility: store.removeSpecialAbility,
    updateSkill: store.updateSkill,
    initSkillsFromClass: store.initSkillsFromClass,
    updateSpellSlot: store.updateSpellSlot,
    addSpell: store.addSpell,
    removeSpell: store.removeSpell,
    toggleSpellCast: store.toggleSpellCast,
    toggleSpellPrepared: store.toggleSpellPrepared,
    refreshSpellSlots: store.refreshSpellSlots,
    updatePortrait: store.updatePortrait,
    updateExperience: store.updateExperience,
    isLoading: store.isLoading,
    error: store.error,
  };
}
