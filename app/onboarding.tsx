import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveAnthropicKey, saveOpenAIKey } from '../src/hooks/useAIGeneration';
import { COLORS, FONTS, SPACING, SHADOWS } from '../src/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!anthropicKey.trim() && !openAIKey.trim()) {
      Alert.alert(
        'No Keys Entered',
        'You can still use the app without API keys, but AI features (rules assistant, item descriptions, portrait generation) will not work. Continue?',
        [
          { text: 'Go Back', style: 'cancel' },
          { text: 'Continue Without Keys', onPress: () => router.replace('/(tabs)') },
        ],
      );
      return;
    }

    setIsSaving(true);
    try {
      if (anthropicKey.trim()) {
        await saveAnthropicKey(anthropicKey.trim());
      }
      if (openAIKey.trim()) {
        await saveOpenAIKey(openAIKey.trim());
      }
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Error', `Failed to save API keys: ${String(e)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoText}>⚔</Text>
            <Text style={styles.title}>Toon Sheet</Text>
            <Text style={styles.subtitle}>D&D 3.5e Character Tracker</Text>
          </View>

          {/* Welcome */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome, Adventurer!</Text>
            <Text style={styles.welcomeText}>
              Toon Sheet is your complete D&D 3.5e character management app. To unlock AI-powered features, enter your API keys below. Your keys are stored securely on your device and never sent to our servers.
            </Text>
          </View>

          {/* Anthropic Key */}
          <View style={styles.keyCard}>
            <View style={styles.keyHeader}>
              <View style={styles.keyIcon}>
                <Text style={styles.keyIconText}>🤖</Text>
              </View>
              <View style={styles.keyInfo}>
                <Text style={styles.keyTitle}>Anthropic API Key</Text>
                <Text style={styles.keyDesc}>Powers the Rules Assistant and item description generation</Text>
              </View>
            </View>
            <View style={styles.keyInputRow}>
              <TextInput
                style={styles.keyInput}
                value={anthropicKey}
                onChangeText={setAnthropicKey}
                placeholder="sk-ant-..."
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!showAnthropicKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowAnthropicKey(!showAnthropicKey)}
              >
                <Text style={styles.eyeBtnText}>{showAnthropicKey ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.keyHint}>
              Get your key at console.anthropic.com → API Keys
            </Text>
          </View>

          {/* OpenAI Key */}
          <View style={styles.keyCard}>
            <View style={styles.keyHeader}>
              <View style={styles.keyIcon}>
                <Text style={styles.keyIconText}>🎨</Text>
              </View>
              <View style={styles.keyInfo}>
                <Text style={styles.keyTitle}>OpenAI API Key</Text>
                <Text style={styles.keyDesc}>Powers DALL-E 3 portrait and equipment artwork generation</Text>
              </View>
            </View>
            <View style={styles.keyInputRow}>
              <TextInput
                style={styles.keyInput}
                value={openAIKey}
                onChangeText={setOpenAIKey}
                placeholder="sk-..."
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={!showOpenAIKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowOpenAIKey(!showOpenAIKey)}
              >
                <Text style={styles.eyeBtnText}>{showOpenAIKey ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.keyHint}>
              Get your key at platform.openai.com → API Keys (DALL-E 3 is ~$0.04/image)
            </Text>
          </View>

          {/* Security notice */}
          <View style={styles.securityNote}>
            <Text style={styles.securityText}>
              🔒 Your API keys are stored using Expo SecureStore (iOS Keychain / Android Keystore) and never leave your device.
            </Text>
          </View>

          {/* Feature list */}
          <View style={styles.featureList}>
            <Text style={styles.featureTitle}>APP FEATURES</Text>
            {[
              { icon: '📋', text: 'Full D&D 3.5e character sheet with all fields' },
              { icon: '⚔️', text: 'Automatic ability modifier and combat calculations' },
              { icon: '🎒', text: 'Inventory tracking with encumbrance calculation' },
              { icon: '🎭', text: 'Paper doll equipment visual with SVG silhouette' },
              { icon: '🎨', text: 'AI character portrait generation (DALL-E 3)' },
              { icon: '📖', text: 'D&D 3.5e rules assistant powered by Claude AI' },
              { icon: '💾', text: 'All data stored locally using SQLite' },
            ].map(feature => (
              <View key={feature.text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? 'Saving...' : 'Save Keys & Enter App'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipBtnText}>Skip for now (AI features disabled)</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  logoText: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  welcomeCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 8,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  welcomeTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
  },
  welcomeText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  keyCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  keyHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  keyIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyIconText: {
    fontSize: 20,
  },
  keyInfo: {
    flex: 1,
  },
  keyTitle: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  keyDesc: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  keyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  keyInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    fontFamily: FONTS.mono,
    fontSize: 13,
    color: COLORS.text,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  eyeBtnText: {
    fontSize: 20,
  },
  keyHint: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  securityNote: {
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 6,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  securityText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  featureList: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  featureTitle: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  buttons: {
    gap: SPACING.sm,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  saveBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  skipBtn: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
