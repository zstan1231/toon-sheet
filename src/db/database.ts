// SQLite database operations for Toon Sheet
import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';
import type {
  Character,
  InventoryItem,
  EquippedItem,
  SkillEntry,
  Feat,
  SpecialAbility,
  SpellSlot,
  SpellEntry,
} from '../types/character';
import { createDefaultCharacter } from '../types/character';
import { Race, CharacterClass, Alignment, Size, ItemCategory, EquipmentSlot } from '../types/dnd';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('toonsheet.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await database.execAsync('PRAGMA foreign_keys = ON;');
  // Split and execute each statement
  const statements = CREATE_TABLES_SQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  for (const stmt of statements) {
    await database.execAsync(stmt + ';');
  }
}

// ──────────────────────────────────────────────
// CHARACTER CRUD
// ──────────────────────────────────────────────

export async function getAllCharacters(): Promise<Character[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM characters ORDER BY updated_at DESC',
  );
  const characters: Character[] = [];
  for (const row of rows) {
    const char = rowToCharacter(row);
    char.skills = await getSkillsForCharacter(char.id);
    char.feats = await getFeatsForCharacter(char.id);
    char.specialAbilities = await getSpecialAbilitiesForCharacter(char.id);
    char.spellSlots = await getSpellSlotsForCharacter(char.id);
    char.spells = await getSpellsForCharacter(char.id);
    characters.push(char);
  }
  return characters;
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM characters WHERE id = ?',
    [id],
  );
  if (!row) return null;
  const char = rowToCharacter(row);
  char.skills = await getSkillsForCharacter(id);
  char.feats = await getFeatsForCharacter(id);
  char.specialAbilities = await getSpecialAbilitiesForCharacter(id);
  char.spellSlots = await getSpellSlotsForCharacter(id);
  char.spells = await getSpellsForCharacter(id);
  return char;
}

export async function saveCharacter(character: Character): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `INSERT OR REPLACE INTO characters (
      id, name, player_name, campaign, race, character_class, level, alignment,
      deity, size, age, gender, height, weight, eyes, hair, skin,
      str, dex, con, int, wis, cha,
      hp_max, hp_current, hp_temporary, hp_nonlethal,
      ac_armor_bonus, ac_shield_bonus, ac_natural_armor, ac_deflection, ac_misc,
      save_fort_base, save_fort_magic, save_fort_misc,
      save_ref_base, save_ref_magic, save_ref_misc,
      save_will_base, save_will_magic, save_will_misc,
      bab, experience_points,
      currency_platinum, currency_gold, currency_silver, currency_copper, currency_electrum,
      portrait_uri, portrait_locked,
      created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      character.id,
      character.name,
      character.playerName,
      character.campaign,
      character.race,
      character.characterClass,
      character.level,
      character.alignment,
      character.deity,
      character.size,
      character.age,
      character.gender,
      character.height,
      character.weight,
      character.eyes,
      character.hair,
      character.skin,
      character.abilityScores.str,
      character.abilityScores.dex,
      character.abilityScores.con,
      character.abilityScores.int,
      character.abilityScores.wis,
      character.abilityScores.cha,
      character.hitPoints.max,
      character.hitPoints.current,
      character.hitPoints.temporary,
      character.hitPoints.nonlethal,
      character.armorClass.armorBonus,
      character.armorClass.shieldBonus,
      character.armorClass.naturalArmor,
      character.armorClass.deflection,
      character.armorClass.misc,
      character.savingThrows.fortitude.base,
      character.savingThrows.fortitude.magicMod,
      character.savingThrows.fortitude.miscMod,
      character.savingThrows.reflex.base,
      character.savingThrows.reflex.magicMod,
      character.savingThrows.reflex.miscMod,
      character.savingThrows.will.base,
      character.savingThrows.will.magicMod,
      character.savingThrows.will.miscMod,
      character.attackBonuses.baseAttackBonus,
      character.experiencePoints,
      character.currency.platinum,
      character.currency.gold,
      character.currency.silver,
      character.currency.copper,
      character.currency.electrum,
      character.portraitUri,
      character.portraitLocked ? 1 : 0,
      character.createdAt,
      now,
    ],
  );
  // Save related data
  await saveSkillsForCharacter(character.id, character.skills);
  await saveFeatsForCharacter(character.id, character.feats);
  await saveSpecialAbilitiesForCharacter(character.id, character.specialAbilities);
  await saveSpellSlotsForCharacter(character.id, character.spellSlots);
  await saveSpellsForCharacter(character.id, character.spells);
}

export async function createNewCharacter(): Promise<Character> {
  const id = generateId();
  const character = createDefaultCharacter(id);
  await saveCharacter(character);
  return character;
}

export async function deleteCharacter(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM characters WHERE id = ?', [id]);
}

// ──────────────────────────────────────────────
// SKILLS
// ──────────────────────────────────────────────

async function getSkillsForCharacter(characterId: string): Promise<SkillEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM character_skills WHERE character_id = ?',
    [characterId],
  );
  return rows.map(r => ({
    id: r.id as string,
    name: r.skill_name as string,
    keyAbility: r.key_ability as SkillEntry['keyAbility'],
    ranks: r.ranks as number,
    miscMod: r.misc_mod as number,
    isClassSkill: (r.is_class_skill as number) === 1,
    synergy: 0,
    armorCheckPenalty: (r.armor_check_penalty as number) === 1,
  }));
}

async function saveSkillsForCharacter(
  characterId: string,
  skills: SkillEntry[],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM character_skills WHERE character_id = ?',
    [characterId],
  );
  for (const skill of skills) {
    await database.runAsync(
      `INSERT INTO character_skills (id, character_id, skill_name, key_ability, ranks, misc_mod, is_class_skill, armor_check_penalty)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        skill.id,
        characterId,
        skill.name,
        skill.keyAbility,
        skill.ranks,
        skill.miscMod,
        skill.isClassSkill ? 1 : 0,
        skill.armorCheckPenalty ? 1 : 0,
      ],
    );
  }
}

export async function updateSkill(
  characterId: string,
  skill: SkillEntry,
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO character_skills (id, character_id, skill_name, key_ability, ranks, misc_mod, is_class_skill, armor_check_penalty)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      skill.id,
      characterId,
      skill.name,
      skill.keyAbility,
      skill.ranks,
      skill.miscMod,
      skill.isClassSkill ? 1 : 0,
      skill.armorCheckPenalty ? 1 : 0,
    ],
  );
}

// ──────────────────────────────────────────────
// FEATS
// ──────────────────────────────────────────────

async function getFeatsForCharacter(characterId: string): Promise<Feat[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM character_feats WHERE character_id = ? ORDER BY sort_order',
    [characterId],
  );
  return rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    description: r.description as string,
    prerequisites: r.prerequisites as string,
  }));
}

async function saveFeatsForCharacter(
  characterId: string,
  feats: Feat[],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM character_feats WHERE character_id = ?',
    [characterId],
  );
  for (let i = 0; i < feats.length; i++) {
    const feat = feats[i];
    await database.runAsync(
      `INSERT INTO character_feats (id, character_id, name, description, prerequisites, sort_order)
       VALUES (?,?,?,?,?,?)`,
      [feat.id, characterId, feat.name, feat.description, feat.prerequisites, i],
    );
  }
}

// ──────────────────────────────────────────────
// SPECIAL ABILITIES
// ──────────────────────────────────────────────

async function getSpecialAbilitiesForCharacter(
  characterId: string,
): Promise<SpecialAbility[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM character_special_abilities WHERE character_id = ? ORDER BY sort_order',
    [characterId],
  );
  return rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    description: r.description as string,
    source: r.source as string,
  }));
}

async function saveSpecialAbilitiesForCharacter(
  characterId: string,
  abilities: SpecialAbility[],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM character_special_abilities WHERE character_id = ?',
    [characterId],
  );
  for (let i = 0; i < abilities.length; i++) {
    const ability = abilities[i];
    await database.runAsync(
      `INSERT INTO character_special_abilities (id, character_id, name, description, source, sort_order)
       VALUES (?,?,?,?,?,?)`,
      [ability.id, characterId, ability.name, ability.description, ability.source, i],
    );
  }
}

// ──────────────────────────────────────────────
// SPELL SLOTS
// ──────────────────────────────────────────────

async function getSpellSlotsForCharacter(characterId: string): Promise<SpellSlot[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM character_spell_slots WHERE character_id = ? ORDER BY spell_level',
    [characterId],
  );
  return rows.map(r => ({
    level: r.spell_level as number,
    total: r.total as number,
    used: r.used as number,
    bonusSlots: r.bonus_slots as number,
  }));
}

async function saveSpellSlotsForCharacter(
  characterId: string,
  slots: SpellSlot[],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM character_spell_slots WHERE character_id = ?',
    [characterId],
  );
  for (const slot of slots) {
    await database.runAsync(
      `INSERT INTO character_spell_slots (id, character_id, spell_level, total, used, bonus_slots)
       VALUES (?,?,?,?,?,?)`,
      [generateId(), characterId, slot.level, slot.total, slot.used, slot.bonusSlots],
    );
  }
}

export async function updateSpellSlotUsed(
  characterId: string,
  spellLevel: number,
  used: number,
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE character_spell_slots SET used = ? WHERE character_id = ? AND spell_level = ?',
    [used, characterId, spellLevel],
  );
}

// ──────────────────────────────────────────────
// SPELLS
// ──────────────────────────────────────────────

async function getSpellsForCharacter(characterId: string): Promise<SpellEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM character_spells WHERE character_id = ? ORDER BY spell_level, sort_order',
    [characterId],
  );
  return rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    level: r.spell_level as number,
    school: r.school as string,
    description: r.description as string,
    prepared: (r.prepared as number) === 1,
    cast: (r.cast as number) === 1,
  }));
}

async function saveSpellsForCharacter(
  characterId: string,
  spells: SpellEntry[],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM character_spells WHERE character_id = ?',
    [characterId],
  );
  for (let i = 0; i < spells.length; i++) {
    const spell = spells[i];
    await database.runAsync(
      `INSERT INTO character_spells (id, character_id, name, spell_level, school, description, prepared, cast, sort_order)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        spell.id,
        characterId,
        spell.name,
        spell.level,
        spell.school,
        spell.description,
        spell.prepared ? 1 : 0,
        spell.cast ? 1 : 0,
        i,
      ],
    );
  }
}

// ──────────────────────────────────────────────
// INVENTORY
// ──────────────────────────────────────────────

export async function getInventoryForCharacter(
  characterId: string,
): Promise<InventoryItem[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM inventory_items WHERE character_id = ? ORDER BY category, name',
    [characterId],
  );
  return rows.map(r => ({
    id: r.id as string,
    characterId: r.character_id as string,
    name: r.name as string,
    description: r.description as string,
    weight: r.weight as number,
    quantity: r.quantity as number,
    category: r.category as ItemCategory,
    value: r.value as number,
    notes: r.notes as string,
    createdAt: r.created_at as string,
  }));
}

export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO inventory_items (id, character_id, name, description, weight, quantity, category, value, notes, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      item.id,
      item.characterId,
      item.name,
      item.description,
      item.weight,
      item.quantity,
      item.category,
      item.value,
      item.notes,
      item.createdAt,
    ],
  );
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM inventory_items WHERE id = ?', [id]);
}

// ──────────────────────────────────────────────
// EQUIPMENT (Paper Doll)
// ──────────────────────────────────────────────

export async function getEquipmentForCharacter(
  characterId: string,
): Promise<EquippedItem[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM equipped_items WHERE character_id = ?',
    [characterId],
  );
  return rows.map(r => ({
    id: r.id as string,
    characterId: r.character_id as string,
    slot: r.slot as EquipmentSlot,
    itemId: r.item_id as string | null,
    itemName: r.item_name as string,
    itemDescription: r.item_description as string,
    artworkUri: r.artwork_uri as string | null,
    artworkPrompt: r.artwork_prompt as string | null,
  }));
}

export async function saveEquippedItem(item: EquippedItem): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO equipped_items (id, character_id, slot, item_id, item_name, item_description, artwork_uri, artwork_prompt)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      item.id,
      item.characterId,
      item.slot,
      item.itemId,
      item.itemName,
      item.itemDescription,
      item.artworkUri,
      item.artworkPrompt,
    ],
  );
}

export async function clearEquipmentSlot(
  characterId: string,
  slot: EquipmentSlot,
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM equipped_items WHERE character_id = ? AND slot = ?',
    [characterId, slot],
  );
}

export async function initializeEquipmentSlots(
  characterId: string,
): Promise<EquippedItem[]> {
  const slots = Object.values(EquipmentSlot);
  const items: EquippedItem[] = [];
  for (const slot of slots) {
    const item: EquippedItem = {
      id: generateId(),
      characterId,
      slot,
      itemId: null,
      itemName: '',
      itemDescription: '',
      artworkUri: null,
      artworkPrompt: null,
    };
    await saveEquippedItem(item);
    items.push(item);
  }
  return items;
}

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function rowToCharacter(row: Record<string, unknown>): Character {
  return {
    id: row.id as string,
    name: row.name as string,
    playerName: row.player_name as string,
    campaign: row.campaign as string,
    race: row.race as Race,
    characterClass: row.character_class as CharacterClass,
    level: row.level as number,
    alignment: row.alignment as Alignment,
    deity: row.deity as string,
    size: row.size as Size,
    age: row.age as number,
    gender: row.gender as string,
    height: row.height as string,
    weight: row.weight as string,
    eyes: row.eyes as string,
    hair: row.hair as string,
    skin: row.skin as string,
    abilityScores: {
      str: row.str as number,
      dex: row.dex as number,
      con: row.con as number,
      int: row.int as number,
      wis: row.wis as number,
      cha: row.cha as number,
    },
    hitPoints: {
      max: row.hp_max as number,
      current: row.hp_current as number,
      temporary: row.hp_temporary as number,
      nonlethal: row.hp_nonlethal as number,
    },
    armorClass: {
      total: 10,
      touch: 10,
      flatFooted: 10,
      armorBonus: row.ac_armor_bonus as number,
      shieldBonus: row.ac_shield_bonus as number,
      dexMod: 0,
      sizeMod: 0,
      naturalArmor: row.ac_natural_armor as number,
      deflection: row.ac_deflection as number,
      misc: row.ac_misc as number,
    },
    savingThrows: {
      fortitude: {
        base: row.save_fort_base as number,
        abilityMod: 0,
        magicMod: row.save_fort_magic as number,
        miscMod: row.save_fort_misc as number,
      },
      reflex: {
        base: row.save_ref_base as number,
        abilityMod: 0,
        magicMod: row.save_ref_magic as number,
        miscMod: row.save_ref_misc as number,
      },
      will: {
        base: row.save_will_base as number,
        abilityMod: 0,
        magicMod: row.save_will_magic as number,
        miscMod: row.save_will_misc as number,
      },
    },
    attackBonuses: {
      baseAttackBonus: row.bab as number,
      grappleModifier: 0,
      meleeAttackBonus: 0,
      rangedAttackBonus: 0,
    },
    skills: [],
    feats: [],
    specialAbilities: [],
    spellSlots: [],
    spells: [],
    experiencePoints: row.experience_points as number,
    currency: {
      platinum: row.currency_platinum as number,
      gold: row.currency_gold as number,
      silver: row.currency_silver as number,
      copper: row.currency_copper as number,
      electrum: row.currency_electrum as number,
    },
    portraitUri: row.portrait_uri as string | null,
    portraitLocked: (row.portrait_locked as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
