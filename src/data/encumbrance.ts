// D&D 3.5e Encumbrance tables
// Source: Player's Handbook, Table 9-1

import { EncumbranceLevel } from '../types/dnd';

export interface EncumbranceThresholds {
  light: number;  // max weight for Light load
  medium: number; // max weight for Medium load
  heavy: number;  // max weight for Heavy load
  // Overload is anything above heavy
}

// Encumbrance by STR score (in pounds)
export const ENCUMBRANCE_TABLE: Record<number, EncumbranceThresholds> = {
  1:  { light: 3,    medium: 6,    heavy: 10 },
  2:  { light: 6,    medium: 13,   heavy: 20 },
  3:  { light: 10,   medium: 20,   heavy: 30 },
  4:  { light: 13,   medium: 26,   heavy: 40 },
  5:  { light: 16,   medium: 33,   heavy: 50 },
  6:  { light: 20,   medium: 40,   heavy: 60 },
  7:  { light: 23,   medium: 46,   heavy: 70 },
  8:  { light: 26,   medium: 53,   heavy: 80 },
  9:  { light: 30,   medium: 60,   heavy: 90 },
  10: { light: 33,   medium: 66,   heavy: 100 },
  11: { light: 38,   medium: 76,   heavy: 115 },
  12: { light: 43,   medium: 86,   heavy: 130 },
  13: { light: 50,   medium: 100,  heavy: 150 },
  14: { light: 58,   medium: 116,  heavy: 175 },
  15: { light: 66,   medium: 133,  heavy: 200 },
  16: { light: 76,   medium: 153,  heavy: 230 },
  17: { light: 86,   medium: 173,  heavy: 260 },
  18: { light: 100,  medium: 200,  heavy: 300 },
  19: { light: 116,  medium: 233,  heavy: 350 },
  20: { light: 133,  medium: 266,  heavy: 400 },
  21: { light: 153,  medium: 306,  heavy: 460 },
  22: { light: 173,  medium: 346,  heavy: 520 },
  23: { light: 200,  medium: 400,  heavy: 600 },
  24: { light: 233,  medium: 466,  heavy: 700 },
  25: { light: 266,  medium: 533,  heavy: 800 },
  26: { light: 306,  medium: 613,  heavy: 920 },
  27: { light: 346,  medium: 693,  heavy: 1040 },
  28: { light: 400,  medium: 800,  heavy: 1200 },
  29: { light: 466,  medium: 933,  heavy: 1400 },
};

export function getEncumbranceThresholds(str: number): EncumbranceThresholds {
  const clamped = Math.max(1, Math.min(29, str));
  return ENCUMBRANCE_TABLE[clamped] ?? ENCUMBRANCE_TABLE[10];
}

export function getEncumbranceLevel(
  totalWeight: number,
  str: number,
): EncumbranceLevel {
  const thresholds = getEncumbranceThresholds(str);
  if (totalWeight <= thresholds.light) return EncumbranceLevel.Light;
  if (totalWeight <= thresholds.medium) return EncumbranceLevel.Medium;
  if (totalWeight <= thresholds.heavy) return EncumbranceLevel.Heavy;
  return EncumbranceLevel.Overload;
}

export interface EncumbrancePenalties {
  maxDexBonus: number | null; // null means no limit
  armorCheckPenalty: number;
  speedMultiplier: number; // multiplier on base speed
  runMultiplier: number;
}

export const ENCUMBRANCE_PENALTIES: Record<EncumbranceLevel, EncumbrancePenalties> = {
  [EncumbranceLevel.Light]: {
    maxDexBonus: null,
    armorCheckPenalty: 0,
    speedMultiplier: 1,
    runMultiplier: 4,
  },
  [EncumbranceLevel.Medium]: {
    maxDexBonus: 3,
    armorCheckPenalty: -3,
    speedMultiplier: 0.75,
    runMultiplier: 4,
  },
  [EncumbranceLevel.Heavy]: {
    maxDexBonus: 1,
    armorCheckPenalty: -6,
    speedMultiplier: 0.75,
    runMultiplier: 3,
  },
  [EncumbranceLevel.Overload]: {
    maxDexBonus: 0,
    armorCheckPenalty: -6,
    speedMultiplier: 0,
    runMultiplier: 0,
  },
};
