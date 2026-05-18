import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';
import type { InventoryItem } from '../types/character';
import { ItemCategory } from '../types/dnd';
import { DnDInput } from './DnDInput';
import { VoiceInputButton } from './VoiceInputButton';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useAIGeneration } from '../hooks/useAIGeneration';

interface AddItemModalProps {
  visible: boolean;
  characterId: string;
  editItem?: InventoryItem | null;
  onSave: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const CATEGORIES = Object.values(ItemCategory);

export function AddItemModal({
  visible,
  characterId,
  editItem,
  onSave,
  onClose,
}: AddItemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('0');
  const [quantity, setQuantity] = useState('1');
  const [value, setValue] = useState('0');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.Other);
  const [notes, setNotes] = useState('');

  const { isListening, transcript, error: voiceError, startListening } = useVoiceInput();
  const { isGenerating, generateItemDescription, parseVoiceInput } = useAIGeneration();

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDescription(editItem.description);
      setWeight(String(editItem.weight));
      setQuantity(String(editItem.quantity));
      setValue(String(editItem.value));
      setCategory(editItem.category);
      setNotes(editItem.notes);
    } else {
      resetForm();
    }
  }, [editItem, visible]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setWeight('0');
    setQuantity('1');
    setValue('0');
    setCategory(ItemCategory.Other);
    setNotes('');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      characterId,
      name: name.trim(),
      description: description.trim(),
      weight: parseFloat(weight) || 0,
      quantity: parseInt(quantity, 10) || 1,
      value: parseFloat(value) || 0,
      category,
      notes: notes.trim(),
    });
    resetForm();
    onClose();
  };

  const handleGenerateDescription = async () => {
    if (!name.trim()) return;
    try {
      const desc = await generateItemDescription(name, category);
      setDescription(desc);
    } catch {
      // Error shown in hook
    }
  };

  const handleVoice = async () => {
    await startListening();
  };

  useEffect(() => {
    if (transcript) {
      (async () => {
        try {
          const parsed = await parseVoiceInput(transcript);
          setName(parsed.name);
          setDescription(parsed.description);
          setWeight(String(parsed.weight));
          setQuantity(String(parsed.quantity));
          const matchedCategory = CATEGORIES.find(
            c => c.toLowerCase() === parsed.category.toLowerCase(),
          );
          if (matchedCategory) setCategory(matchedCategory);
        } catch {
          setName(transcript);
        }
      })();
    }
  }, [transcript]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editItem ? 'Edit Item' : 'Add Item'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          {/* Voice Input */}
          <View style={styles.voiceRow}>
            <VoiceInputButton isListening={isListening} onPress={handleVoice} size={40} />
            <Text style={styles.voiceHint}>
              {isListening
                ? 'Listening...'
                : 'Tap mic to describe item by voice'}
            </Text>
          </View>
          {voiceError ? (
            <Text style={styles.voiceError}>{voiceError}</Text>
          ) : null}

          {/* Name */}
          <DnDInput
            label="Item Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Longsword +1"
          />

          {/* Category */}
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Description */}
          <View style={styles.descRow}>
            <DnDInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.descInput}
              placeholder="Item description..."
            />
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={handleGenerateDescription}
              disabled={isGenerating || !name.trim()}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.aiBtnText}>AI ✦</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statField}>
              <DnDInput
                label="Qty"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                compact
              />
            </View>
            <View style={styles.statField}>
              <DnDInput
                label="Weight (lb)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                compact
              />
            </View>
            <View style={styles.statField}>
              <DnDInput
                label="Value (GP)"
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                compact
              />
            </View>
          </View>

          {/* Notes */}
          <DnDInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            placeholder="Additional notes..."
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.parchmentDark,
  },
  cancelText: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.accent,
  },
  saveText: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
  },
  body: {
    flex: 1,
    padding: SPACING.lg,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  voiceHint: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
    fontStyle: 'italic',
  },
  voiceError: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.warning,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  fieldLabel: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.parchmentDark,
    marginRight: SPACING.xs,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  categoryChipText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  descRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'flex-end',
  },
  descInput: {
    flex: 1,
    textAlignVertical: 'top',
    minHeight: 72,
  },
  aiBtn: {
    backgroundColor: COLORS.accent,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  aiBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statField: {
    flex: 1,
  },
});
