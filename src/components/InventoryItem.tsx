import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';
import type { InventoryItem as InventoryItemType } from '../types/character';

interface InventoryItemProps {
  item: InventoryItemType;
  onEdit: (item: InventoryItemType) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Weapons: COLORS.danger,
  Armor: COLORS.info,
  Potions: COLORS.success,
  Scrolls: COLORS.warning,
  'Wondrous Items': '#7B1FA2',
  'Mundane Gear': COLORS.textMuted,
  Other: COLORS.textLight,
};

export function InventoryItemRow({ item, onEdit, onDelete }: InventoryItemProps) {
  const [expanded, setExpanded] = useState(false);
  const categoryColor = CATEGORY_COLORS[item.category] ?? COLORS.textMuted;

  const confirmDelete = () => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onDelete(item.id) },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
        <View style={styles.nameSection}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
        <Text style={styles.quantity}>×{item.quantity}</Text>
        <Text style={styles.weight}>{(item.weight * item.quantity).toFixed(1)} lb</Text>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.body}>
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
          {item.notes ? (
            <Text style={styles.notes}>Notes: {item.notes}</Text>
          ) : null}
          <Text style={styles.valueText}>
            Value: {item.value > 0 ? `${item.value} GP` : 'Unknown'} | Weight: {item.weight} lb/unit
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
              <Text style={styles.deleteBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    marginBottom: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nameSection: {
    flex: 1,
  },
  itemName: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemCategory: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  quantity: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    minWidth: 24,
    textAlign: 'center',
  },
  weight: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    minWidth: 44,
    textAlign: 'right',
  },
  expandIcon: {
    fontFamily: FONTS.serif,
    fontSize: 9,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  body: {
    padding: SPACING.sm,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.parchmentDark,
    gap: 4,
  },
  description: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  notes: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  valueText: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  editBtn: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});
