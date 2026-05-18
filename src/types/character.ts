import {
  Race,
  CharacterClass,
  Alignment,
  Size,
  AbilityScoreKey,
  ItemCategory,
  EquipmentSlot,
} from './dnd';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface HitPoints {
  max: number;
  current: number;
  temporary: number;
  nonlethal: number;
}

export interface ArmorClass {
  total: number;
  touch: number;
  flatFooted: number;
  armorBonus: number;
  shieldBonus: number;
  dexMod: number;
  sizeMod: number;
  naturalArmor: number;
  deflection: number;
  misc: number;
}

export interface SavingThrow {
  base: number;
  abilityMod: number;
  magicMod: number;
  miscMod: number;
}

export interface SavingThrows {
  fortitude: SavingThrow;
  reflex: SavingThrow;
  will: SavingThrow;
}

export interface AttackBonuses {
  baseAttackBonus: number;
  grappleModifier: number;
  meleeAttackBonus: number;
  rangedAttackBonus: number;
}

export interface SkillEntry {
  id: string;
  name: string;
  keyAbility: AbilityScoreKey;
  ranks: number;
  miscMod: number;
  isClassSkill: boolean;
  synergy: number;
  armorCheckPenalty: boolean;
}

export interface Feat {
  id: string;
  name: string;
  description: string;
  prerequisites: string;
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  source: string;
}

export interface SpellSlot {
  level: number;
  total: number;
  used: number;
  bonusSlots: number;
}

export interface SpellEntry {
  id: string;
  name: string;
  level: number;
  school: string;
  description: string;
  prepared: boolean;
  cast: boolean;
}

export interface Currency {
  platinum: number;
  gold: number;
  silver: number;
  copper: number;
  electrum: number;
}

export interface Character {
  id: string;
  // Basic Info
  name: string;
  playerName: string;
  campaign: string;
  race: Race;
  characterClass: CharacterClass;
  level: number;
  alignment: Alignment;
  deity: string;
  size: Size;
  age: number;
  gender: string;
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  skin: string;
  // Ability Scores
  abilityScores: AbilityScores;
  // HP
  hitPoints: HitPoints;
  // AC
  armorClass: ArmorClass;
  // Saves
  savingThrows: SavingThrows;
  // Attack
  attackBonuses: AttackBonuses;
  // Skills
  skills: SkillEntry[];
  // Feats
  feats: Feat[];
  // Special Abilities
  specialAbilities: SpecialAbility[];
  // Spells
  spellSlots: SpellSlot[];
  spells: SpellEntry[];
  // XP
  experiencePoints: number;
  // Currency
  currency: Currency;
  // Portrait
  portraitUri: string | null;
  portraitLocked: boolean;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  characterId: string;
  name: string;
  description: string;
  weight: number;
  quantity: number;
  category: ItemCategory;
  value: number; // in gold pieces
  notes: string;
  createdAt: string;
}

export interface EquippedItem {
  id: string;
  characterId: string;
  slot: EquipmentSlot;
  itemId: string | null;
  itemName: string;
  itemDescription: string;
  artworkUri: string | null;
  artworkPrompt: string | null;
}

export function createDefaultCharacter(id: string): Character {
  return {
    id,
    name: 'New Character',
    playerName: '',
    campaign: '',
    race: Race.Human,
    characterClass: CharacterClass.Fighter,
    level: 1,
    alignment: Alignment.TrueNeutral,
    deity: '',
    size: Size.Medium,
    age: 25,
    gender: '',
    height: "5'10\"",
    weight: '175 lbs',
    eyes: 'Brown',
    hair: 'Brown',
    skin: 'Fair',
    abilityScores: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
    hitPoints: {
      max: 10,
      current: 10,
      temporary: 0,
      nonlethal: 0,
    },
    armorClass: {
      total: 10,
      touch: 10,
      flatFooted: 10,
      armorBonus: 0,
      shieldBonus: 0,
      dexMod: 0,
      sizeMod: 0,
      naturalArmor: 0,
      deflection: 0,
      misc: 0,
    },
    savingThrows: {
      fortitude: { base: 2, abilityMod: 0, magicMod: 0, miscMod: 0 },
      reflex: { base: 0, abilityMod: 0, magicMod: 0, miscMod: 0 },
      will: { base: 0, abilityMod: 0, magicMod: 0, miscMod: 0 },
    },
    attackBonuses: {
      baseAttackBonus: 1,
      grappleModifier: 1,
      meleeAttackBonus: 1,
      rangedAttackBonus: 1,
    },
    skills: [],
    feats: [],
    specialAbilities: [],
    spellSlots: [],
    spells: [],
    experiencePoints: 0,
    currency: {
      platinum: 0,
      gold: 0,
      silver: 0,
      copper: 0,
      electrum: 0,
    },
    portraitUri: null,
    portraitLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
