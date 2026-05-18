// D&D 3.5e race data

import { AbilityScoreKey } from '../types/dnd';

export interface AbilityAdjustment {
  ability: AbilityScoreKey;
  modifier: number;
}

export interface RacialTrait {
  name: string;
  description: string;
}

export interface RaceDefinition {
  name: string;
  size: 'Small' | 'Medium';
  baseSpeed: number; // in feet
  abilityAdjustments: AbilityAdjustment[];
  traits: RacialTrait[];
  favoredClass: string;
  description: string;
  languages: string[];
  bonusLanguages: string[];
}

export const RACE_DEFINITIONS: Record<string, RaceDefinition> = {
  Human: {
    name: 'Human',
    size: 'Medium',
    baseSpeed: 30,
    abilityAdjustments: [], // +2 to any one ability score (not listed here, applied at character creation)
    traits: [
      {
        name: 'Extra Feat',
        description: 'Humans gain one extra feat at 1st level.',
      },
      {
        name: 'Extra Skill Points',
        description: 'Humans gain 4 extra skill points at 1st level, plus 1 extra skill point each level after.',
      },
      {
        name: 'Bonus Language',
        description: 'Humans can choose any language as a bonus language.',
      },
    ],
    favoredClass: 'Any',
    description: 'Humans are the most adaptable and ambitious of the common races. Whatever drives them, humans are the innovators, the achievers, and the pioneers of the worlds.',
    languages: ['Common'],
    bonusLanguages: ['Any'],
  },
  Elf: {
    name: 'Elf',
    size: 'Medium',
    baseSpeed: 30,
    abilityAdjustments: [
      { ability: 'dex', modifier: 2 },
      { ability: 'con', modifier: -2 },
    ],
    traits: [
      {
        name: 'Low-Light Vision',
        description: 'An elf can see twice as far as a human in starlight, moonlight, torchlight, and similar conditions of poor illumination.',
      },
      {
        name: 'Immunity to Sleep',
        description: 'Elves are immune to magic sleep effects.',
      },
      {
        name: '+2 Racial Saving Throw Bonus Against Enchantments',
        description: 'Elves gain a +2 racial bonus on saving throws against enchantment spells or effects.',
      },
      {
        name: 'Elven Weapon Proficiencies',
        description: 'Proficiency with longsword, rapier, longbow (including composite longbow), and shortbow (including composite shortbow).',
      },
      {
        name: '+2 Racial Bonus on Listen, Search, and Spot',
        description: 'Elves receive a +2 racial bonus on Listen, Search, and Spot skill checks.',
      },
      {
        name: 'Secret Door Detection',
        description: 'An elf who merely passes within 5 feet of a secret or concealed door is entitled to a Search check as though actively searching.',
      },
    ],
    favoredClass: 'Wizard',
    description: 'Elves are known for their grace and mastery of magic and nature. An elf usually prefers the simpler comforts: a walk in the woods, a time to meditate, or stargazing.',
    languages: ['Common', 'Elven'],
    bonusLanguages: ['Draconic', 'Gnoll', 'Gnome', 'Goblin', 'Orc', 'Sylvan'],
  },
  Dwarf: {
    name: 'Dwarf',
    size: 'Medium',
    baseSpeed: 20,
    abilityAdjustments: [
      { ability: 'con', modifier: 2 },
      { ability: 'cha', modifier: -2 },
    ],
    traits: [
      {
        name: 'Darkvision 60 ft.',
        description: 'Dwarves can see in the dark up to 60 feet.',
      },
      {
        name: 'Stonecunning',
        description: '+2 racial bonus on Search checks related to stonework. An automatic Search check when within 10 feet of such stonework.',
      },
      {
        name: 'Weapon Familiarity',
        description: 'Dwarves treat dwarven waraxes and dwarven urgroshes as martial weapons, rather than exotic weapons.',
      },
      {
        name: 'Stability',
        description: '+4 racial bonus on ability checks made to resist being bull rushed or tripped when standing on the ground.',
      },
      {
        name: '+2 Racial Bonus on Saving Throws Against Poison',
        description: 'Dwarves gain a +2 racial bonus on saving throws against poison.',
      },
      {
        name: '+2 Racial Bonus on Saving Throws Against Spells',
        description: 'Dwarves gain a +2 racial bonus on saving throws against spells and spell-like effects.',
      },
      {
        name: '+1 Racial Bonus on Attack Rolls Against Orcs and Goblinoids',
        description: 'Dwarves gain a +1 racial bonus on attack rolls against orcs and goblinoids.',
      },
      {
        name: '+4 Dodge Bonus to AC Against Giants',
        description: 'Dwarves gain a +4 dodge bonus to Armor Class against monsters of the giant type.',
      },
      {
        name: '+2 Racial Bonus on Appraise and Craft Checks',
        description: 'Dwarves receive a +2 racial bonus on Appraise checks related to stone or metal items, and a +2 racial bonus on Craft checks related to stone or metal.',
      },
    ],
    favoredClass: 'Fighter',
    description: 'Dwarves are known for their skill in warfare, their ability to withstand physical and magical punishment, their hard work, and their capacity for drinking ale.',
    languages: ['Common', 'Dwarven'],
    bonusLanguages: ['Giant', 'Gnome', 'Goblin', 'Orc', 'Terran', 'Undercommon'],
  },
  Halfling: {
    name: 'Halfling',
    size: 'Small',
    baseSpeed: 20,
    abilityAdjustments: [
      { ability: 'dex', modifier: 2 },
      { ability: 'str', modifier: -2 },
    ],
    traits: [
      {
        name: '+2 Racial Bonus on Climb, Jump, and Move Silently',
        description: 'Halflings receive a +2 racial bonus on Climb, Jump, and Move Silently checks.',
      },
      {
        name: '+2 Racial Bonus on Saving Throws',
        description: 'Halflings gain a +1 racial bonus on all saving throws.',
      },
      {
        name: '+2 Morale Bonus on Saving Throws Against Fear',
        description: 'Halflings gain a +2 morale bonus on saving throws against fear (this stacks with the +1 bonus above).',
      },
      {
        name: '+1 Racial Bonus on Attack Rolls with Thrown Weapons and Slings',
        description: 'Halflings receive a +1 racial bonus on all attack rolls made with thrown weapons and slings.',
      },
      {
        name: '+2 Racial Bonus on Listen Checks',
        description: 'Halflings have keen ears and receive a +2 racial bonus on Listen checks.',
      },
      {
        name: 'Small Size',
        description: '+1 bonus to Armor Class and attack rolls. -4 penalty on special attack checks. +4 bonus on Hide checks. Must use smaller weapons.',
      },
    ],
    favoredClass: 'Rogue',
    description: 'Halflings are clever, capable opportunists. Their curiosity and adaptability make them expert explorers and survivors in all kinds of environments.',
    languages: ['Common', 'Halfling'],
    bonusLanguages: ['Dwarven', 'Elven', 'Gnome', 'Goblin', 'Orc'],
  },
  Gnome: {
    name: 'Gnome',
    size: 'Small',
    baseSpeed: 20,
    abilityAdjustments: [
      { ability: 'con', modifier: 2 },
      { ability: 'str', modifier: -2 },
    ],
    traits: [
      {
        name: 'Low-Light Vision',
        description: 'Gnomes can see twice as far as a human in starlight, moonlight, torchlight, and similar poor illumination.',
      },
      {
        name: '+2 Racial Bonus on Saving Throws Against Illusions',
        description: 'Gnomes gain a +2 racial bonus on saving throws against illusions.',
      },
      {
        name: 'Illusion Affinity',
        description: 'Gnomes add +1 to the Difficulty Class for all saving throws against illusion spells cast by gnomes.',
      },
      {
        name: '+1 Racial Bonus on Attack Rolls Against Kobolds and Goblinoids',
        description: 'Gnomes gain a +1 racial bonus on attack rolls against kobolds and goblinoids.',
      },
      {
        name: '+4 Dodge Bonus to AC Against Giants',
        description: 'Gnomes gain a +4 dodge bonus to Armor Class against monsters of the giant type.',
      },
      {
        name: '+2 Racial Bonus on Listen and Craft (Alchemy)',
        description: 'Gnomes receive a +2 racial bonus on Listen checks and a +2 racial bonus on Craft (Alchemy) checks.',
      },
      {
        name: 'Speak with Animals',
        description: 'Once per day, a gnome can speak with a burrowing mammal (a mole, rabbit, etc.).',
      },
      {
        name: 'Gnome Cantrips',
        description: 'Gnomes with a Charisma score of 10 or higher may use dancing lights, ghost sound, and prestidigitation each once per day.',
      },
      {
        name: 'Small Size',
        description: '+1 bonus to Armor Class and attack rolls. -4 penalty on special attack checks. +4 bonus on Hide checks.',
      },
    ],
    favoredClass: 'Bard',
    description: 'Gnomes are welcome everywhere as technicians, alchemists, and inventors. They love gadgets and have a natural aptitude for magic.',
    languages: ['Common', 'Gnome'],
    bonusLanguages: ['Draconic', 'Dwarven', 'Elven', 'Giant', 'Goblin', 'Orc'],
  },
  'Half-Elf': {
    name: 'Half-Elf',
    size: 'Medium',
    baseSpeed: 30,
    abilityAdjustments: [], // No adjustments
    traits: [
      {
        name: 'Low-Light Vision',
        description: 'Half-elves can see twice as far as a human in starlight, moonlight, torchlight, and similar poor illumination.',
      },
      {
        name: 'Immunity to Sleep',
        description: 'Half-elves are immune to magic sleep effects.',
      },
      {
        name: '+2 Racial Bonus Against Enchantments',
        description: 'Half-elves gain a +2 racial bonus on saving throws against enchantment spells or effects.',
      },
      {
        name: '+1 Racial Bonus on Listen, Search, and Spot',
        description: 'Half-elves receive a +1 racial bonus on Listen, Search, and Spot checks.',
      },
      {
        name: '+2 Racial Bonus on Diplomacy and Gather Information',
        description: 'Half-elves receive a +2 racial bonus on Diplomacy and Gather Information checks.',
      },
      {
        name: 'Elven Blood',
        description: 'Half-elves are treated as elves for all effects related to race.',
      },
    ],
    favoredClass: 'Any',
    description: 'Half-elves are of two worlds but belong to neither. They have the strengths of both their human and elven parentage, but are not fully accepted by either race.',
    languages: ['Common', 'Elven'],
    bonusLanguages: ['Any'],
  },
  'Half-Orc': {
    name: 'Half-Orc',
    size: 'Medium',
    baseSpeed: 30,
    abilityAdjustments: [
      { ability: 'str', modifier: 2 },
      { ability: 'int', modifier: -2 },
      { ability: 'cha', modifier: -2 },
    ],
    traits: [
      {
        name: 'Darkvision 60 ft.',
        description: 'Half-orcs can see in the dark up to 60 feet.',
      },
      {
        name: 'Orc Blood',
        description: 'Half-orcs are treated as orcs for all effects related to race.',
      },
    ],
    favoredClass: 'Barbarian',
    description: 'Half-orcs are feared by many and scorned by nearly as many more. Those who can look past the brutish appearance often find a savage, determined, and surprisingly resourceful person.',
    languages: ['Common', 'Orc'],
    bonusLanguages: ['Draconic', 'Giant', 'Gnoll', 'Goblin', 'Abyssal'],
  },
};
