// SQLite schema definitions for Toon Sheet

export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL DEFAULT 'New Character',
    player_name TEXT NOT NULL DEFAULT '',
    campaign TEXT NOT NULL DEFAULT '',
    race TEXT NOT NULL DEFAULT 'Human',
    character_class TEXT NOT NULL DEFAULT 'Fighter',
    level INTEGER NOT NULL DEFAULT 1,
    alignment TEXT NOT NULL DEFAULT 'True Neutral',
    deity TEXT NOT NULL DEFAULT '',
    size TEXT NOT NULL DEFAULT 'Medium',
    age INTEGER NOT NULL DEFAULT 25,
    gender TEXT NOT NULL DEFAULT '',
    height TEXT NOT NULL DEFAULT '',
    weight TEXT NOT NULL DEFAULT '',
    eyes TEXT NOT NULL DEFAULT '',
    hair TEXT NOT NULL DEFAULT '',
    skin TEXT NOT NULL DEFAULT '',
    -- Ability Scores
    str INTEGER NOT NULL DEFAULT 10,
    dex INTEGER NOT NULL DEFAULT 10,
    con INTEGER NOT NULL DEFAULT 10,
    int INTEGER NOT NULL DEFAULT 10,
    wis INTEGER NOT NULL DEFAULT 10,
    cha INTEGER NOT NULL DEFAULT 10,
    -- Hit Points
    hp_max INTEGER NOT NULL DEFAULT 10,
    hp_current INTEGER NOT NULL DEFAULT 10,
    hp_temporary INTEGER NOT NULL DEFAULT 0,
    hp_nonlethal INTEGER NOT NULL DEFAULT 0,
    -- Armor Class
    ac_armor_bonus INTEGER NOT NULL DEFAULT 0,
    ac_shield_bonus INTEGER NOT NULL DEFAULT 0,
    ac_natural_armor INTEGER NOT NULL DEFAULT 0,
    ac_deflection INTEGER NOT NULL DEFAULT 0,
    ac_misc INTEGER NOT NULL DEFAULT 0,
    -- Saves (base values; ability mods calculated dynamically)
    save_fort_base INTEGER NOT NULL DEFAULT 2,
    save_fort_magic INTEGER NOT NULL DEFAULT 0,
    save_fort_misc INTEGER NOT NULL DEFAULT 0,
    save_ref_base INTEGER NOT NULL DEFAULT 0,
    save_ref_magic INTEGER NOT NULL DEFAULT 0,
    save_ref_misc INTEGER NOT NULL DEFAULT 0,
    save_will_base INTEGER NOT NULL DEFAULT 0,
    save_will_magic INTEGER NOT NULL DEFAULT 0,
    save_will_misc INTEGER NOT NULL DEFAULT 0,
    -- Attack Bonuses
    bab INTEGER NOT NULL DEFAULT 1,
    -- XP
    experience_points INTEGER NOT NULL DEFAULT 0,
    -- Currency
    currency_platinum INTEGER NOT NULL DEFAULT 0,
    currency_gold INTEGER NOT NULL DEFAULT 0,
    currency_silver INTEGER NOT NULL DEFAULT 0,
    currency_copper INTEGER NOT NULL DEFAULT 0,
    currency_electrum INTEGER NOT NULL DEFAULT 0,
    -- Portrait
    portrait_uri TEXT,
    portrait_locked INTEGER NOT NULL DEFAULT 0,
    -- Timestamps
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS character_skills (
    id TEXT PRIMARY KEY NOT NULL,
    character_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    key_ability TEXT NOT NULL,
    ranks REAL NOT NULL DEFAULT 0,
    misc_mod INTEGER NOT NULL DEFAULT 0,
    is_class_skill INTEGER NOT NULL DEFAULT 0,
    armor_check_penalty INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS character_feats (
    id TEXT PRIMARY KEY NOT NULL,
    character_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    prerequisites TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS character_special_abilities (
    id TEXT PRIMARY KEY NOT NULL,
    character_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS character_spell_slots (
    id TEXT PRIMARY KEY NOT NULL,
    character_id TEXT NOT NULL,
    spell_level INTEGER NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    used INTEGER NOT NULL DEFAULT 0,
    bonus_slots INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS character_spells (
    id TEXT PRIMARY KEY NOT NULL,
    character_id TEXT NOT NULL,
    name TEXT NOT NULL,
    spell_level INTEGER NOT NULL DEFAULT 0,
    school TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    prepared INTEGER NOT NULL DEFAULT 0,
    cast INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY NOT NULL,
    character_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    weight REAL NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL DEFAULT 'Other',
    value REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS equipped_items (
    id TEXT PRIMARY KEY NOT NULL,
    character_id TEXT NOT NULL,
    slot TEXT NOT NULL UNIQUE,
    item_id TEXT,
    item_name TEXT NOT NULL DEFAULT '',
    item_description TEXT NOT NULL DEFAULT '',
    artwork_uri TEXT,
    artwork_prompt TEXT,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_skills_character ON character_skills(character_id);
  CREATE INDEX IF NOT EXISTS idx_feats_character ON character_feats(character_id);
  CREATE INDEX IF NOT EXISTS idx_abilities_character ON character_special_abilities(character_id);
  CREATE INDEX IF NOT EXISTS idx_spell_slots_character ON character_spell_slots(character_id);
  CREATE INDEX IF NOT EXISTS idx_spells_character ON character_spells(character_id);
  CREATE INDEX IF NOT EXISTS idx_inventory_character ON inventory_items(character_id);
  CREATE INDEX IF NOT EXISTS idx_equipped_character ON equipped_items(character_id);
`;
