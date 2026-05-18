// D&D 3.5e enums and constants

export enum Race {
  Human = 'Human',
  Elf = 'Elf',
  Dwarf = 'Dwarf',
  Halfling = 'Halfling',
  Gnome = 'Gnome',
  HalfElf = 'Half-Elf',
  HalfOrc = 'Half-Orc',
}

export enum CharacterClass {
  Fighter = 'Fighter',
  Wizard = 'Wizard',
  Rogue = 'Rogue',
  Cleric = 'Cleric',
  Paladin = 'Paladin',
  Ranger = 'Ranger',
  Barbarian = 'Barbarian',
  Bard = 'Bard',
  Druid = 'Druid',
  Monk = 'Monk',
  Sorcerer = 'Sorcerer',
}

export enum Alignment {
  LawfulGood = 'Lawful Good',
  NeutralGood = 'Neutral Good',
  ChaoticGood = 'Chaotic Good',
  LawfulNeutral = 'Lawful Neutral',
  TrueNeutral = 'True Neutral',
  ChaoticNeutral = 'Chaotic Neutral',
  LawfulEvil = 'Lawful Evil',
  NeutralEvil = 'Neutral Evil',
  ChaoticEvil = 'Chaotic Evil',
}

export enum Size {
  Fine = 'Fine',
  Diminutive = 'Diminutive',
  Tiny = 'Tiny',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  Huge = 'Huge',
  Gargantuan = 'Gargantuan',
  Colossal = 'Colossal',
}

export enum AbilityName {
  STR = 'STR',
  DEX = 'DEX',
  CON = 'CON',
  INT = 'INT',
  WIS = 'WIS',
  CHA = 'CHA',
}

export enum SaveType {
  Fortitude = 'Fortitude',
  Reflex = 'Reflex',
  Will = 'Will',
}

export enum EquipmentSlot {
  Head = 'Head',
  Face = 'Face',
  Throat = 'Throat',
  Shoulders = 'Shoulders',
  Body = 'Body',
  Torso = 'Torso',
  Arms = 'Arms',
  Hands = 'Hands',
  RingLeft = 'Ring (Left)',
  RingRight = 'Ring (Right)',
  Waist = 'Waist',
  Feet = 'Feet',
  WeaponMain = 'Weapon (Main)',
  OffHand = 'Off-Hand',
}

export enum ItemCategory {
  Weapons = 'Weapons',
  Armor = 'Armor',
  Potions = 'Potions',
  Scrolls = 'Scrolls',
  WondrousItems = 'Wondrous Items',
  MundaneGear = 'Mundane Gear',
  Other = 'Other',
}

export enum EncumbranceLevel {
  Light = 'Light',
  Medium = 'Medium',
  Heavy = 'Heavy',
  Overload = 'Overload',
}

export type AbilityScoreKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export const ABILITY_LABELS: Record<AbilityScoreKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export const ABILITY_SHORT: Record<AbilityScoreKey, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

// D&D 3.5e XP table (cumulative XP needed to reach each level)
export const XP_TABLE: Record<number, number> = {
  1: 0,
  2: 1000,
  3: 3000,
  4: 6000,
  5: 10000,
  6: 15000,
  7: 21000,
  8: 28000,
  9: 36000,
  10: 45000,
  11: 55000,
  12: 66000,
  13: 78000,
  14: 91000,
  15: 105000,
  16: 120000,
  17: 136000,
  18: 153000,
  19: 171000,
  20: 190000,
};

export function getXPForNextLevel(level: number): number {
  if (level >= 20) return XP_TABLE[20];
  return XP_TABLE[level + 1] ?? XP_TABLE[20];
}

export function calcAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
