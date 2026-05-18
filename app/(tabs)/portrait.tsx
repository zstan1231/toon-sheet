import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCharacterStore } from '../../src/store/characterStore';
import { useEquipmentStore } from '../../src/store/equipmentStore';
import { useAIGeneration } from '../../src/hooks/useAIGeneration';
import { COLORS, FONTS, SPACING } from '../../src/theme';
import { SectionHeader } from '../../src/components/SectionHeader';
import { PortraitDisplay } from '../../src/components/PortraitDisplay';
import type { EquippedItem } from '../../src/types/character';
import { EquipmentSlot } from '../../src/types/dnd';

export default function PortraitScreen() {
  const { activeCharacter, updatePortrait } = useCharacterStore();
  const { equipment, loadEquipment } = useEquipmentStore();
  const { isGenerating, generateCharacterPortraitPrompt, generateImageWithOpenAI } = useAIGeneration();
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  useEffect(() => {
    if (activeCharacter?.id) {
      loadEquipment(activeCharacter.id);
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

  const equippedItems = Object.values(equipment).filter(
    (e): e is EquippedItem => e !== null && !!e.itemName,
  );

  const handleGenerate = async () => {
    if (activeCharacter.portraitLocked) return;

    const prompt = generateCharacterPortraitPrompt(activeCharacter, equippedItems);
    setGeneratedPrompt(prompt);

    try {
      const imageUrl = await generateImageWithOpenAI(prompt);
      await updatePortrait(imageUrl, true); // Lock portrait after generation
    } catch (e) {
      Alert.alert('Generation Failed', String(e));
    }
  };

  const handleUpdate = () => {
    Alert.alert(
      'Update Portrait',
      'Are you sure you want to unlock and regenerate the character portrait? The current portrait will be replaced.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          style: 'destructive',
          onPress: async () => {
            // Unlock first
            await updatePortrait(activeCharacter.portraitUri ?? '', false);
            // Then regenerate
            const prompt = generateCharacterPortraitPrompt(activeCharacter, equippedItems);
            setGeneratedPrompt(prompt);
            try {
              const imageUrl = await generateImageWithOpenAI(prompt);
              await updatePortrait(imageUrl, true);
            } catch (e) {
              Alert.alert('Generation Failed', String(e));
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Character Portrait" subtitle="Wayne Reynolds Style" />

        {/* Character summary for context */}
        <View style={styles.charSummary}>
          <Text style={styles.charName}>{activeCharacter.name}</Text>
          <Text style={styles.charDetails}>
            Level {activeCharacter.level} {activeCharacter.race} {activeCharacter.characterClass}
          </Text>
          <Text style={styles.charAppearance}>
            {[activeCharacter.gender, activeCharacter.height, activeCharacter.weight].filter(Boolean).join(' • ')}
          </Text>
          {(activeCharacter.eyes || activeCharacter.hair || activeCharacter.skin) && (
            <Text style={styles.charAppearance}>
              {[
                activeCharacter.eyes && `Eyes: ${activeCharacter.eyes}`,
                activeCharacter.hair && `Hair: ${activeCharacter.hair}`,
                activeCharacter.skin && `Skin: ${activeCharacter.skin}`,
              ]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          )}
        </View>

        {/* Portrait Display */}
        <PortraitDisplay
          portraitUri={activeCharacter.portraitUri}
          portraitLocked={activeCharacter.portraitLocked}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onUpdate={handleUpdate}
        />

        {/* Equipped gear that will be in portrait */}
        {equippedItems.length > 0 && (
          <>
            <SectionHeader title="Visible Equipment" subtitle="Included in portrait generation" />
            <View style={styles.gearList}>
              {equippedItems.map(item => (
                <View key={item.slot} style={styles.gearRow}>
                  <View style={styles.gearSlot}>
                    <Text style={styles.gearSlotText}>{item.slot.substring(0, 4).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.gearName}>{item.itemName}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Prompt preview */}
        {generatedPrompt ? (
          <>
            <SectionHeader title="Last Generated Prompt" />
            <View style={styles.promptCard}>
              <Text style={styles.promptText}>{generatedPrompt}</Text>
            </View>
          </>
        ) : null}

        {/* Style info */}
        <View style={styles.styleCard}>
          <Text style={styles.styleTitle}>Art Style Guide</Text>
          <Text style={styles.styleText}>
            Portraits are generated in the iconic D&D 3.5e style: detailed pen and ink with watercolor washes, dramatic lighting, high fantasy composition. The style evokes the work of Wayne Reynolds, the renowned illustrator for the 3.5 Player's Handbook and sourcebooks.
          </Text>
          <Text style={styles.styleNote}>
            Note: Portrait generation requires an OpenAI API key configured in Settings.
          </Text>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
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
    gap: SPACING.md,
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
  charSummary: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  charName: {
    fontFamily: FONTS.serif,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.accent,
  },
  charDetails: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  charAppearance: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  gearList: {
    width: '100%',
    gap: SPACING.xs,
  },
  gearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 6,
    padding: SPACING.xs,
  },
  gearSlot: {
    backgroundColor: COLORS.parchmentDeep,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 40,
    alignItems: 'center',
  },
  gearSlotText: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gearName: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.text,
  },
  promptCard: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    width: '100%',
  },
  promptText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  styleCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    width: '100%',
    gap: SPACING.sm,
  },
  styleTitle: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  styleText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  styleNote: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.warning,
  },
});
