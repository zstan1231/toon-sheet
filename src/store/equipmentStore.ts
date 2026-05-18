// Zustand store for equipment (paper doll)
import { create } from 'zustand';
import type { EquippedItem } from '../types/character';
import { EquipmentSlot } from '../types/dnd';
import {
  getEquipmentForCharacter,
  saveEquippedItem,
  clearEquipmentSlot,
  initializeEquipmentSlots,
} from '../db/database';

interface EquipmentState {
  equipment: Record<EquipmentSlot, EquippedItem | null>;
  isLoading: boolean;
  error: string | null;

  loadEquipment: (characterId: string) => Promise<void>;
  equipItem: (
    characterId: string,
    slot: EquipmentSlot,
    itemName: string,
    itemDescription: string,
    itemId?: string,
  ) => Promise<void>;
  unequipSlot: (characterId: string, slot: EquipmentSlot) => Promise<void>;
  updateArtwork: (
    characterId: string,
    slot: EquipmentSlot,
    artworkUri: string,
    prompt: string,
  ) => Promise<void>;
  getEquippedInSlot: (slot: EquipmentSlot) => EquippedItem | null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function createEmptyEquipment(): Record<EquipmentSlot, EquippedItem | null> {
  const result = {} as Record<EquipmentSlot, EquippedItem | null>;
  for (const slot of Object.values(EquipmentSlot)) {
    result[slot] = null;
  }
  return result;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: createEmptyEquipment(),
  isLoading: false,
  error: null,

  loadEquipment: async (characterId: string) => {
    set({ isLoading: true, error: null });
    try {
      let items = await getEquipmentForCharacter(characterId);
      if (items.length === 0) {
        items = await initializeEquipmentSlots(characterId);
      }
      const equipment = createEmptyEquipment();
      for (const item of items) {
        equipment[item.slot] = item;
      }
      set({ equipment, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  equipItem: async (
    characterId: string,
    slot: EquipmentSlot,
    itemName: string,
    itemDescription: string,
    itemId?: string,
  ) => {
    const existing = get().equipment[slot];
    const item: EquippedItem = {
      id: existing?.id ?? generateId(),
      characterId,
      slot,
      itemId: itemId ?? null,
      itemName,
      itemDescription,
      artworkUri: existing?.artworkUri ?? null,
      artworkPrompt: existing?.artworkPrompt ?? null,
    };
    try {
      await saveEquippedItem(item);
      set(state => ({
        equipment: { ...state.equipment, [slot]: item },
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  unequipSlot: async (characterId: string, slot: EquipmentSlot) => {
    try {
      await clearEquipmentSlot(characterId, slot);
      set(state => ({
        equipment: { ...state.equipment, [slot]: null },
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  updateArtwork: async (
    characterId: string,
    slot: EquipmentSlot,
    artworkUri: string,
    prompt: string,
  ) => {
    const existing = get().equipment[slot];
    if (!existing) return;
    const updated: EquippedItem = {
      ...existing,
      artworkUri,
      artworkPrompt: prompt,
    };
    try {
      await saveEquippedItem(updated);
      set(state => ({
        equipment: { ...state.equipment, [slot]: updated },
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  getEquippedInSlot: (slot: EquipmentSlot) => {
    return get().equipment[slot];
  },
}));
