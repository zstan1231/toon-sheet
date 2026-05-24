import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Character,
  InventoryItem,
  EquippedItem,
  SkillEntry,
} from '../types/character';
import { createDefaultCharacter } from '../types/character';
import { EquipmentSlot, ItemCategory } from '../types/dnd';

const KEYS = {
  characterList: '@toonsheet:characters',
  character: (id: string) => `@toonsheet:character:${id}`,
  inventory: (characterId: string) => `@toonsheet:inventory:${characterId}`,
  equipment: (characterId: string) => `@toonsheet:equipment:${characterId}`,
};

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ──────────────────────────────────────────────
// CHARACTER CRUD
// ──────────────────────────────────────────────

export async function getAllCharacters(): Promise<Character[]> {
  const raw = await AsyncStorage.getItem(KEYS.characterList);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  const characters: Character[] = [];
  for (const id of ids) {
    const c = await getCharacterById(id);
    if (c) characters.push(c);
  }
  return characters;
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const raw = await AsyncStorage.getItem(KEYS.character(id));
  if (!raw) return null;
  return JSON.parse(raw) as Character;
}

export async function saveCharacter(character: Character): Promise<void> {
  const now = new Date().toISOString();
  const toSave = { ...character, updatedAt: now };
  await AsyncStorage.setItem(KEYS.character(character.id), JSON.stringify(toSave));

  // Keep the ID list in sync
  const raw = await AsyncStorage.getItem(KEYS.characterList);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  if (!ids.includes(character.id)) {
    ids.unshift(character.id);
    await AsyncStorage.setItem(KEYS.characterList, JSON.stringify(ids));
  }
}

export async function createNewCharacter(): Promise<Character> {
  const id = generateId();
  const character = createDefaultCharacter(id);
  await saveCharacter(character);
  return character;
}

export async function deleteCharacter(id: string): Promise<void> {
  await AsyncStorage.removeItem(KEYS.character(id));
  await AsyncStorage.removeItem(KEYS.inventory(id));
  await AsyncStorage.removeItem(KEYS.equipment(id));

  const raw = await AsyncStorage.getItem(KEYS.characterList);
  const ids: string[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem(
    KEYS.characterList,
    JSON.stringify(ids.filter(i => i !== id)),
  );
}

// ──────────────────────────────────────────────
// SKILL helpers (stored on the character object)
// ──────────────────────────────────────────────

export async function updateSkill(
  characterId: string,
  skill: SkillEntry,
): Promise<void> {
  const character = await getCharacterById(characterId);
  if (!character) return;
  const idx = character.skills.findIndex(s => s.id === skill.id);
  if (idx >= 0) character.skills[idx] = skill;
  else character.skills.push(skill);
  await saveCharacter(character);
}

// ──────────────────────────────────────────────
// INVENTORY
// ──────────────────────────────────────────────

export async function getInventoryForCharacter(
  characterId: string,
): Promise<InventoryItem[]> {
  const raw = await AsyncStorage.getItem(KEYS.inventory(characterId));
  if (!raw) return [];
  return JSON.parse(raw) as InventoryItem[];
}

export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  const items = await getInventoryForCharacter(item.characterId);
  const idx = items.findIndex(i => i.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  await AsyncStorage.setItem(KEYS.inventory(item.characterId), JSON.stringify(items));
}

export async function deleteInventoryItem(
  id: string,
  characterId: string,
): Promise<void> {
  const items = await getInventoryForCharacter(characterId);
  await AsyncStorage.setItem(
    KEYS.inventory(characterId),
    JSON.stringify(items.filter(i => i.id !== id)),
  );
}

// ──────────────────────────────────────────────
// EQUIPMENT (Paper Doll)
// ──────────────────────────────────────────────

export async function getEquipmentForCharacter(
  characterId: string,
): Promise<EquippedItem[]> {
  const raw = await AsyncStorage.getItem(KEYS.equipment(characterId));
  if (!raw) return [];
  return JSON.parse(raw) as EquippedItem[];
}

export async function saveEquippedItem(item: EquippedItem): Promise<void> {
  const items = await getEquipmentForCharacter(item.characterId);
  const idx = items.findIndex(i => i.slot === item.slot);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  await AsyncStorage.setItem(KEYS.equipment(item.characterId), JSON.stringify(items));
}

export async function clearEquipmentSlot(
  characterId: string,
  slot: EquipmentSlot,
): Promise<void> {
  const items = await getEquipmentForCharacter(characterId);
  const updated = items.map(i =>
    i.slot === slot
      ? { ...i, itemId: null, itemName: '', itemDescription: '', artworkUri: null, artworkPrompt: null }
      : i,
  );
  await AsyncStorage.setItem(KEYS.equipment(characterId), JSON.stringify(updated));
}

export async function initializeEquipmentSlots(
  characterId: string,
): Promise<EquippedItem[]> {
  const existing = await getEquipmentForCharacter(characterId);
  if (existing.length > 0) return existing;

  const slots = Object.values(EquipmentSlot);
  const items: EquippedItem[] = slots.map(slot => ({
    id: generateId(),
    characterId,
    slot,
    itemId: null,
    itemName: '',
    itemDescription: '',
    artworkUri: null,
    artworkPrompt: null,
  }));
  await AsyncStorage.setItem(KEYS.equipment(characterId), JSON.stringify(items));
  return items;
}

// Kept for compatibility — no-op since AsyncStorage needs no init
export async function getDatabase(): Promise<null> {
  return null;
}

// Kept for compatibility — spell slot used count stored on character object
export async function updateSpellSlotUsed(
  characterId: string,
  spellLevel: number,
  used: number,
): Promise<void> {
  const character = await getCharacterById(characterId);
  if (!character) return;
  const slot = character.spellSlots.find(s => s.level === spellLevel);
  if (slot) slot.used = used;
  await saveCharacter(character);
}
