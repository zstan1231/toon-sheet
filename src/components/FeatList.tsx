import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import type { Feat } from '../types/character';
import { CORE_FEATS, searchFeats } from '../data/feats';

interface FeatListProps {
  feats: Feat[];
  onAddFeat: (feat: Feat) => void;
  onRemoveFeat: (id: string) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function FeatList({ feats, onAddFeat, onRemoveFeat }: FeatListProps) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(CORE_FEATS);

  const handleSearch = (text: string) => {
    setQuery(text);
    setResults(text.trim() ? searchFeats(text) : CORE_FEATS);
  };

  const handleSelectFeat = (featDef: (typeof CORE_FEATS)[0]) => {
    onAddFeat({
      id: generateId(),
      name: featDef.name,
      description: featDef.benefit,
      prerequisites: featDef.prerequisites,
    });
    setSearchVisible(false);
    setQuery('');
    setResults(CORE_FEATS);
  };

  return (
    <View style={styles.container}>
      {feats.map(feat => (
        <FeatItem key={feat.id} feat={feat} onRemove={() => onRemoveFeat(feat.id)} />
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => setSearchVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Feat</Text>
      </TouchableOpacity>

      <Modal visible={searchVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Feat</Text>
            <TouchableOpacity onPress={() => setSearchVisible(false)}>
              <Text style={styles.closeBtn}>Done</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search feats..."
            placeholderTextColor={COLORS.textLight}
            autoFocus
          />
          <FlatList
            data={results}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectFeat(item)}
              >
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultPre} numberOfLines={1}>
                  Req: {item.prerequisites}
                </Text>
                <Text style={styles.resultBenefit} numberOfLines={2}>
                  {item.benefit}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </View>
  );
}

function FeatItem({ feat, onRemove }: { feat: Feat; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.featCard}>
      <TouchableOpacity
        style={styles.featHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.featDot} />
        <Text style={styles.featName}>{feat.name}</Text>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.featBody}>
          {feat.prerequisites ? (
            <Text style={styles.featPre}>Requires: {feat.prerequisites}</Text>
          ) : null}
          <Text style={styles.featDesc}>{feat.description}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  featCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  featHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  featDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  featName: {
    flex: 1,
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  expandIcon: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    color: COLORS.textMuted,
    marginRight: 4,
  },
  removeBtn: {
    padding: 4,
  },
  removeBtnText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '700',
  },
  featBody: {
    padding: SPACING.sm,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.parchmentDark,
  },
  featPre: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  featDesc: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },
  addButton: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.parchmentDark,
  },
  modalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
  },
  closeBtn: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  searchInput: {
    margin: SPACING.md,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.text,
  },
  resultItem: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
  },
  resultName: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  resultPre: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  resultBenefit: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
});
