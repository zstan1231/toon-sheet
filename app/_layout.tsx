import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getAnthropicKey } from '../src/hooks/useAIGeneration';
import { useCharacterStore } from '../src/store/characterStore';
import { COLORS } from '../src/theme';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const { loadAllCharacters, createCharacter, characters } = useCharacterStore();
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load characters from DB
        await loadAllCharacters();

        // Check if we need onboarding (no API key set)
        const key = await getAnthropicKey();

        setIsLoading(false);

        if (!key) {
          // Navigate to onboarding after mount
          setTimeout(() => router.replace('/onboarding'), 100);
        }
      } catch (e) {
        console.error('Initialization error:', e);
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor={COLORS.parchmentDark} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.parchment,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
