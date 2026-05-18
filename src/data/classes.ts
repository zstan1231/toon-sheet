// D&D 3.5e class data - Base Attack Bonus and Save progressions

export type BABProgression = 'full' | 'threequarters' | 'half';
export type SaveProgression = 'good' | 'poor';

export interface ClassSaveProgression {
  fortitude: SaveProgression;
  reflex: SaveProgression;
  will: SaveProgression;
}

export interface ClassDefinition {
  name: string;
  hitDie: number;
  babProgression: BABProgression;
  saves: ClassSaveProgression;
  skillPointsPerLevel: number; // before INT mod
  classSkillCount: number;
  isSpellcaster: boolean;
  spellcastingAbility: 'int' | 'wis' | 'cha' | null;
  description: string;
}

export const CLASS_DEFINITIONS: Record<string, ClassDefinition> = {
  Fighter: {
    name: 'Fighter',
    hitDie: 10,
    babProgression: 'full',
    saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    skillPointsPerLevel: 2,
    classSkillCount: 20,
    isSpellcaster: false,
    spellcastingAbility: null,
    description: 'A master of martial combat, skilled with a variety of weapons and armor.',
  },
  Wizard: {
    name: 'Wizard',
    hitDie: 4,
    babProgression: 'half',
    saves: { fortitude: 'poor', reflex: 'poor', will: 'good' },
    skillPointsPerLevel: 2,
    classSkillCount: 20,
    isSpellcaster: true,
    spellcastingAbility: 'int',
    description: 'A powerful magic-user who prepares spells from a spellbook.',
  },
  Rogue: {
    name: 'Rogue',
    hitDie: 6,
    babProgression: 'threequarters',
    saves: { fortitude: 'poor', reflex: 'good', will: 'poor' },
    skillPointsPerLevel: 8,
    classSkillCount: 40,
    isSpellcaster: false,
    spellcastingAbility: null,
    description: 'A skilled trickster who uses stealth and cunning to overcome obstacles.',
  },
  Cleric: {
    name: 'Cleric',
    hitDie: 8,
    babProgression: 'threequarters',
    saves: { fortitude: 'good', reflex: 'poor', will: 'good' },
    skillPointsPerLevel: 2,
    classSkillCount: 20,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'A divine spellcaster who draws power from devotion to a deity.',
  },
  Paladin: {
    name: 'Paladin',
    hitDie: 10,
    babProgression: 'full',
    saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    skillPointsPerLevel: 2,
    classSkillCount: 20,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'A holy warrior who combines martial prowess with divine magic.',
  },
  Ranger: {
    name: 'Ranger',
    hitDie: 8,
    babProgression: 'full',
    saves: { fortitude: 'good', reflex: 'good', will: 'poor' },
    skillPointsPerLevel: 6,
    classSkillCount: 40,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'A skilled hunter and tracker who is at home in the wilderness.',
  },
  Barbarian: {
    name: 'Barbarian',
    hitDie: 12,
    babProgression: 'full',
    saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    skillPointsPerLevel: 4,
    classSkillCount: 30,
    isSpellcaster: false,
    spellcastingAbility: null,
    description: 'A ferocious warrior who enters a battle rage for devastating effect.',
  },
  Bard: {
    name: 'Bard',
    hitDie: 6,
    babProgression: 'threequarters',
    saves: { fortitude: 'poor', reflex: 'good', will: 'good' },
    skillPointsPerLevel: 6,
    classSkillCount: 40,
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    description: 'A versatile performer who combines arcane magic with martial ability.',
  },
  Druid: {
    name: 'Druid',
    hitDie: 8,
    babProgression: 'threequarters',
    saves: { fortitude: 'good', reflex: 'poor', will: 'good' },
    skillPointsPerLevel: 4,
    classSkillCount: 30,
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    description: 'A nature priest who wields divine magic and can transform into animals.',
  },
  Monk: {
    name: 'Monk',
    hitDie: 8,
    babProgression: 'threequarters',
    saves: { fortitude: 'good', reflex: 'good', will: 'good' },
    skillPointsPerLevel: 4,
    classSkillCount: 30,
    isSpellcaster: false,
    spellcastingAbility: null,
    description: 'A disciplined warrior who uses unarmed combat and ki powers.',
  },
  Sorcerer: {
    name: 'Sorcerer',
    hitDie: 4,
    babProgression: 'half',
    saves: { fortitude: 'poor', reflex: 'poor', will: 'good' },
    skillPointsPerLevel: 2,
    classSkillCount: 20,
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    description: 'An innate spellcaster who casts spells from natural magical ability.',
  },
};

// Base Attack Bonus by progression and level
export function getBAB(progression: BABProgression, level: number): number {
  switch (progression) {
    case 'full':
      return level;
    case 'threequarters':
      return Math.floor((level * 3) / 4);
    case 'half':
      return Math.floor(level / 2);
  }
}

// Base save bonus by progression and level
export function getBaseSave(progression: SaveProgression, level: number): number {
  if (progression === 'good') {
    return Math.floor(level / 2) + 2;
  } else {
    return Math.floor(level / 3);
  }
}

// Get all iterative attacks for a given BAB
export function getIterativeAttacks(bab: number): number[] {
  const attacks: number[] = [bab];
  let current = bab - 5;
  while (current > 0) {
    attacks.push(current);
    current -= 5;
  }
  return attacks;
}
