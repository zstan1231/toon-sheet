import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, FONTS } from '../../src/theme';

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: COLORS.accent,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Character Sheet',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Sheet" emoji="📋" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Inv" emoji="🎒" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="equipment"
        options={{
          title: 'Equipment',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Equip" emoji="⚔️" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="portrait"
        options={{
          title: 'Portrait',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Art" emoji="🎨" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: 'Rules',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Rules" emoji="📖" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBackground,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 4,
    paddingTop: 4,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontFamily: FONTS.serif,
    fontSize: 9,
    color: COLORS.tabInactive,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: COLORS.tabActive,
    fontWeight: '700',
  },
  header: {
    backgroundColor: COLORS.parchmentDark,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontFamily: FONTS.serif,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
});
