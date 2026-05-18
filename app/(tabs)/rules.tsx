import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/theme';
import { RulesChat } from '../../src/components/RulesChat';

export default function RulesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <RulesChat />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
});
