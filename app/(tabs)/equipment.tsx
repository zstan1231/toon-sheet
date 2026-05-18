import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCharacterStore } from '../../src/store/characterStore';
import { useEquipmentStore } from '../../src/store/equipmentStore';
import { useInventoryStore } from '../../src/store/inventoryStore';
import { useAIGeneration } from '../../src/hooks/useAIGeneration';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../src/theme';
import { PaperDoll } from '../../src/components/PaperDoll';
import { SectionHeader } from '../../src/components/SectionHeader';
import { EquipmentSlot } from '../../src/types/dnd';
import type { EquippedItem } from '../../src/types/character';

export default function EquipmentScreen() {
  const { activeCharacter } = useCharacterStore();
  const equipment = useEquipmentStore();
  const { items } = useInventoryStore();
  const { isGenerating, generateEquipmentArtworkPrompt, generateImageWithOpenAI } = useAIGeneration();

  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [equipModalVisible, setEquipModalVisible] = useState(false);
  const [artworkModalVisible, setArtworkModalVisible] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [artPrompt, setArtPrompt] = useState('');

  useEffect(() => {
    if (activeCharacter?.id) {
      equipment.loadEquipment(activeCharacter.id);
    }
  }, [activeCharacter?.id]);

  if (!activeCharacter) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.noCharText}>No character loaded.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSlotPress = (slot: EquipmentSlot) => {
    setSelectedSlot(slot);
    setCustomItemName('');
    setCustomItemDesc('');
    setEquipModalVisible(true);
  };

  const handleEquipInventoryItem = (itemName: string, itemDesc: string, itemId: string) => {
    if (!selectedSlot || !activeCharacter) return;
    equipment.equipItem(activeCharacter.id, selectedSlot, itemName, itemDesc, itemId);
    setEquipModalVisible(false);
  };

  const handleEquipCustom = () => {
    if (!selectedSlot || !customItemName.trim() || !activeCharacter) return;
    equipment.equipItem(activeCharacter.id, selectedSlot, customItemName.trim(), customItemDesc.trim());
    setEquipModalVisible(false);
  };

  const handleUnequip = () => {
    if (!selectedSlot || !activeCharacter) return;
    equipment.unequipSlot(activeCharacter.id, selectedSlot);
    setEquipModalVisible(false);
  };

  const handleGenerateArtwork = async () => {
    if (!selectedSlot || !activeCharacter) return;
    const equipped = equipment.equipment[selectedSlot];
    if (!equipped?.itemName) return;

    const prompt = generateEquipmentArtworkPrompt(
      equipped.itemName,
      equipped.itemDescription,
      selectedSlot,
      activeCharacter,
    );
    setArtPrompt(prompt);
    setEquipModalVisible(false);
    setArtworkModalVisible(true);
  };

  const handleConfirmGenerateArt = async () => {
    if (!selectedSlot || !activeCharacter) return;
    try {
      const imageUrl = await generateImageWithOpenAI(artPrompt);
      await equipment.updateArtwork(activeCharacter.id, selectedSlot, imageUrl, artPrompt);
      setArtworkModalVisible(false);
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  };

  const selectedEquipped = selectedSlot ? equipment.equipment[selectedSlot] : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Paper Doll" subtitle="Tap a slot to equip" />

        {/* Paper Doll */}
        <PaperDoll
          equipment={equipment.equipment}
          onSlotPress={handleSlotPress}
        />

        {/* Equipped items list */}
        <SectionHeader title="Equipped Items" />
        <View style={styles.equippedList}>
          {Object.values(EquipmentSlot).map(slot => {
            const equipped = equipment.equipment[slot];
            if (!equipped?.itemName) return null;
            return (
              <TouchableOpacity
                key={slot}
                style={styles.equippedRow}
                onPress={() => {
                  setSelectedSlot(slot);
                  setEquipModalVisible(true);
                }}
              >
                <View style={styles.equippedSlotBadge}>
                  <Text style={styles.equippedSlotText}>{slot.substring(0, 4).toUpperCase()}</Text>
                </View>
                <View style={styles.equippedInfo}>
                  <Text style={styles.equippedName}>{equipped.itemName}</Text>
                  {equipped.itemDescription ? (
                    <Text style={styles.equippedDesc} numberOfLines={1}>{equipped.itemDescription}</Text>
                  ) : null}
                </View>
                {equipped.artworkUri ? (
                  <Image source={{ uri: equipped.artworkUri }} style={styles.equippedThumbnail} />
                ) : (
                  <TouchableOpacity
                    style={styles.artBtn}
                    onPress={() => {
                      setSelectedSlot(slot);
                      handleGenerateArtwork();
                    }}
                  >
                    <Text style={styles.artBtnText}>Art ✦</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
          {Object.values(equipment.equipment).every(e => !e?.itemName) && (
            <View style={styles.emptyEquipped}>
              <Text style={styles.emptyEquippedText}>No items equipped. Tap slots on the paper doll to equip.</Text>
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Equip Modal */}
      <Modal visible={equipModalVisible} transparent animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEquipModalVisible(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedSlot}</Text>
            {selectedEquipped?.itemName ? (
              <TouchableOpacity onPress={handleUnequip}>
                <Text style={styles.unequipBtn}>Unequip</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 60 }} />
            )}
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Current equipped */}
            {selectedEquipped?.itemName ? (
              <View style={styles.currentEquipped}>
                <Text style={styles.currentLabel}>CURRENTLY EQUIPPED</Text>
                <Text style={styles.currentName}>{selectedEquipped.itemName}</Text>
                {selectedEquipped.artworkUri ? (
                  <Image source={{ uri: selectedEquipped.artworkUri }} style={styles.artworkImage} />
                ) : null}
                <TouchableOpacity style={styles.generateArtBtn} onPress={handleGenerateArtwork} disabled={isGenerating}>
                  {isGenerating ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.generateArtBtnText}>Generate Artwork (DALL-E 3) ✦</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            {/* From inventory */}
            {items.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>FROM INVENTORY</Text>
                {items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.inventoryOption}
                    onPress={() => handleEquipInventoryItem(item.name, item.description, item.id)}
                  >
                    <Text style={styles.inventoryOptionName}>{item.name}</Text>
                    <Text style={styles.inventoryOptionCat}>{item.category}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Custom item */}
            <Text style={styles.sectionLabel}>CUSTOM ITEM</Text>
            <TextInput
              style={styles.customInput}
              value={customItemName}
              onChangeText={setCustomItemName}
              placeholder="Item name..."
              placeholderTextColor={COLORS.textLight}
            />
            <TextInput
              style={[styles.customInput, { height: 60, textAlignVertical: 'top' }]}
              value={customItemDesc}
              onChangeText={setCustomItemDesc}
              placeholder="Description (optional)..."
              placeholderTextColor={COLORS.textLight}
              multiline
            />
            <TouchableOpacity
              style={[styles.equipBtn, !customItemName.trim() && styles.equipBtnDisabled]}
              onPress={handleEquipCustom}
              disabled={!customItemName.trim()}
            >
              <Text style={styles.equipBtnText}>Equip Custom Item</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Artwork Generation Modal */}
      <Modal visible={artworkModalVisible} transparent animationType="fade">
        <View style={styles.artModalOverlay}>
          <View style={styles.artModalCard}>
            <Text style={styles.artModalTitle}>Generate Artwork</Text>
            <Text style={styles.artModalSubtitle}>DALL-E 3 Prompt:</Text>
            <TextInput
              style={styles.artPromptInput}
              value={artPrompt}
              onChangeText={setArtPrompt}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.artCost}>
              Note: This will use your OpenAI API key (DALL-E 3 ~$0.04/image)
            </Text>
            <View style={styles.artModalBtns}>
              <TouchableOpacity
                style={[styles.artModalBtn, styles.artCancelBtn]}
                onPress={() => setArtworkModalVisible(false)}
              >
                <Text style={styles.artCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.artModalBtn, styles.artConfirmBtn]}
                onPress={handleConfirmGenerateArt}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.artConfirmText}>Generate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
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
  equippedList: {
    width: '100%',
    gap: SPACING.xs,
  },
  equippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  equippedSlotBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 44,
    alignItems: 'center',
  },
  equippedSlotText: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  equippedInfo: {
    flex: 1,
  },
  equippedName: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  equippedDesc: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  equippedThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artBtn: {
    backgroundColor: COLORS.parchmentDeep,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  artBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '700',
  },
  emptyEquipped: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyEquippedText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
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
  modalClose: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  modalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.accent,
  },
  unequipBtn: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: SPACING.lg,
  },
  currentEquipped: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  currentLabel: {
    fontFamily: FONTS.serif,
    fontSize: 9,
    color: COLORS.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  currentName: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  artworkImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  generateArtBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    ...SHADOWS.button,
  },
  generateArtBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionLabel: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  inventoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  inventoryOptionName: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  inventoryOptionCat: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  customInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  equipBtn: {
    backgroundColor: COLORS.accent,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  equipBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  equipBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  artModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  artModalCard: {
    backgroundColor: COLORS.parchment,
    borderRadius: 12,
    padding: SPACING.xl,
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  artModalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
  },
  artModalSubtitle: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  artPromptInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  artCost: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.warning,
    fontStyle: 'italic',
  },
  artModalBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  artModalBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  artCancelBtn: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artConfirmBtn: {
    backgroundColor: COLORS.accent,
  },
  artCancelText: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.text,
  },
  artConfirmText: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
