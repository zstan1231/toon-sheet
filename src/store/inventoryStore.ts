// Zustand store for inventory management
import { create } from 'zustand';
import type { InventoryItem } from '../types/character';
import { ItemCategory } from '../types/dnd';
import {
  getInventoryForCharacter,
  saveInventoryItem,
  deleteInventoryItem,
} from '../db/database';
import { getEncumbranceLevel, getEncumbranceThresholds } from '../data/encumbrance';
import { EncumbranceLevel } from '../types/dnd';

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;

  loadInventory: (characterId: string) => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  getTotalWeight: () => number;
  getEncumbrance: (str: number) => EncumbranceLevel;
  getItemsByCategory: () => Record<ItemCategory, InventoryItem[]>;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadInventory: async (characterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const items = await getInventoryForCharacter(characterId);
      set({ items, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addItem: async (itemData: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const item: InventoryItem = {
      ...itemData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    try {
      await saveInventoryItem(item);
      set(state => ({ items: [...state.items, item] }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  updateItem: async (item: InventoryItem) => {
    try {
      await saveInventoryItem(item);
      set(state => ({
        items: state.items.map(i => (i.id === item.id ? item : i)),
      }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  removeItem: async (id: string) => {
    try {
      await deleteInventoryItem(id);
      set(state => ({ items: state.items.filter(i => i.id !== id) }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  getTotalWeight: () => {
    return get().items.reduce((total, item) => total + item.weight * item.quantity, 0);
  },

  getEncumbrance: (str: number) => {
    const totalWeight = get().getTotalWeight();
    return getEncumbranceLevel(totalWeight, str);
  },

  getItemsByCategory: () => {
    const { items } = get();
    const grouped: Record<ItemCategory, InventoryItem[]> = {
      [ItemCategory.Weapons]: [],
      [ItemCategory.Armor]: [],
      [ItemCategory.Potions]: [],
      [ItemCategory.Scrolls]: [],
      [ItemCategory.WondrousItems]: [],
      [ItemCategory.MundaneGear]: [],
      [ItemCategory.Other]: [],
    };
    for (const item of items) {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      } else {
        grouped[ItemCategory.Other].push(item);
      }
    }
    return grouped;
  },
}));
