import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';

interface PortraitDisplayProps {
  portraitUri: string | null;
  portraitLocked: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  onUpdate: () => void;
}

export function PortraitDisplay({
  portraitUri,
  portraitLocked,
  isGenerating,
  onGenerate,
  onUpdate,
}: PortraitDisplayProps) {
  return (
    <View style={styles.container}>
      {/* Portrait Frame */}
      <View style={styles.frame}>
        {portraitUri ? (
          <Image
            source={{ uri: portraitUri }}
            style={styles.portrait}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>⚔</Text>
            <Text style={styles.placeholderText}>No Portrait</Text>
            <Text style={styles.placeholderSub}>Generate a character portrait below</Text>
          </View>
        )}

        {/* Lock overlay */}
        {portraitLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!portraitUri ? (
          <TouchableOpacity
            style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
            onPress={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.generateBtnText}>Generate Portrait</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.lockedActions}>
            {portraitLocked ? (
              <>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedText}>Portrait Locked</Text>
                </View>
                <TouchableOpacity style={styles.updateBtn} onPress={onUpdate}>
                  <Text style={styles.updateBtnText}>Update Portrait</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
                onPress={onGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.generateBtnText}>Regenerate Portrait</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  frame: {
    width: 280,
    height: 320,
    borderWidth: 4,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.parchmentDark,
    ...SHADOWS.card,
    position: 'relative',
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  placeholderText: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  placeholderSub: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    fontStyle: 'italic',
  },
  lockBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 4,
  },
  lockIcon: {
    fontSize: 16,
  },
  actions: {
    alignItems: 'center',
  },
  generateBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    ...SHADOWS.button,
  },
  generateBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  generateBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  lockedActions: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lockedBadge: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  lockedText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  updateBtn: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 2,
    borderColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  updateBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
