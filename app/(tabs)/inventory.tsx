import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCharacterStore } from '../../src/store/characterStore';
import { useInventoryStore } from '../../src/store/inventoryStore';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../src/theme';
import { SectionHeader } from '../../src/components/SectionHeader';
import { InventoryItemRow } from '../../src/components/InventoryItem';
import { AddItemModal } from '../../src/components/AddItemModal';
import { ItemCategory, EncumbranceLevel } from '../../src/types/dnd';
import type { InventoryItem } from '../../src/types/character';
import { getEncumbranceThresholds } from '../../src/data/encumbrance';

const ENCUMBRANCE_COLORS: Record<EncumbranceLevel, string> = {
  [EncumbranceLevel.Light]: COLORS.success,
  [EncumbranceLevel.Medium]: COLORS.warning,
  [EncumbranceLevel.Heavy]: COLORS.danger,
  [EncumbranceLevel.Overload]: '#7B1FA2',
};

export default function InventoryScreen() {
  const { activeCharacter } = useCharacterStore();
  const inventory = useInventoryStore();
  const [addVisible, setAddVisible] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'All'>('All');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (activeCharacter?.id) {
      inventory.loadInventory(activeCharacter.id);
    }
  }, [activeCharacter?.id]);

  if (!activeCharacter) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.noCharText}>No character loaded. Create one in the Sheet tab.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const str = activeCharacter.abilityScores.str;
  const totalWeight = inventory.getTotalWeight();
  const encumbrance = inventory.getEncumbrance(str);
  const thresholds = getEncumbranceThresholds(str);
  const encumbranceColor = ENCUMBRANCE_COLORS[encumbrance];

  const filteredItems = inventory.items.filter(item => {
    const matchCat = filterCategory === 'All' || item.category === filterCategory;
    const matchSearch = !searchText || item.name.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSave = (itemData: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    if (editItem) {
      inventory.updateItem({ ...editItem, ...itemData });
    } else {
      inventory.addItem(itemData);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditItem(item);
    setAddVisible(true);
  };

  const handleCloseModal = () => {
    setAddVisible(false);
    setEditItem(null);
  };

  const itemCounts = inventory.getItemsByCategory();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Encumbrance Summary */}
            <View style={[styles.encumbranceCard, { borderColor: encumbranceColor }]}>
              <View style={styles.encumbranceMain}>
                <Text style={styles.encumbranceTitle}>ENCUMBRANCE</Text>
                <Text style={[styles.encumbranceLevel, { color: encumbranceColor }]}>
                  {encumbrance}
                </Text>
              </View>
              <View style={styles.encumbranceStats}>
                <View style={styles.encumbranceStat}>
                  <Text style={styles.encumbranceStatLabel}>Carried</Text>
                  <Text style={styles.encumbranceStatValue}>{totalWeight.toFixed(1)} lb</Text>
                </View>
                <View style={styles.encumbranceStat}>
                  <Text style={styles.encumbranceStatLabel}>Light ≤</Text>
                  <Text style={styles.encumbranceStatValue}>{thresholds.light} lb</Text>
                </View>
                <View style={styles.encumbranceStat}>
                  <Text style={styles.encumbranceStatLabel}>Medium ≤</Text>
                  <Text style={styles.encumbranceStatValue}>{thresholds.medium} lb</Text>
                </View>
                <View style={styles.encumbranceStat}>
                  <Text style={styles.encumbranceStatLabel}>Heavy ≤</Text>
                  <Text style={styles.encumbranceStatValue}>{thresholds.heavy} lb</Text>
                </View>
              </View>
              {/* Weight bar */}
              <View style={styles.weightBar}>
                <View
                  style={[
                    styles.weightBarFill,
                    {
                      width: `${Math.min(100, (totalWeight / thresholds.heavy) * 100)}%`,
                      backgroundColor: encumbranceColor,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Category summary */}
            <View style={styles.categoryRow}>
              {Object.values(ItemCategory).map(cat => {
                const count = itemCounts[cat]?.length ?? 0;
                if (count === 0) return null;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      filterCategory === cat && styles.catChipActive,
                    ]}
                    onPress={() => setFilterCategory(filterCategory === cat ? 'All' : cat)}
                  >
                    <Text style={[styles.catChipText, filterCategory === cat && styles.catChipTextActive]}>
                      {cat} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search items..."
              placeholderTextColor={COLORS.textLight}
            />

            <SectionHeader title={`Items ${filterCategory !== 'All' ? `(${filterCategory})` : ''}`} />
          </>
        }
        renderItem={({ item }) => (
          <InventoryItemRow
            item={item}
            onEdit={handleEdit}
            onDelete={id => inventory.removeItem(id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎒</Text>
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add items</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditItem(null);
          setAddVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddItemModal
        visible={addVisible}
        characterId={activeCharacter.id}
        editItem={editItem}
        onSave={handleSave}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noCharText: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  encumbranceCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  encumbranceMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  encumbranceTitle: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  encumbranceLevel: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
  },
  encumbranceStats: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  encumbranceStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 4,
    padding: 4,
  },
  encumbranceStatLabel: {
    fontFamily: FONTS.serif,
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  encumbranceStatValue: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  weightBar: {
    height: 6,
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  weightBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  catChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.parchmentDark,
  },
  catChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  catChipText: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  catChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  emptySubtext: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  fabText: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: '700',
    lineHeight: 34,
  },
});
