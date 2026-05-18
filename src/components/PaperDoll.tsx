import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Ellipse, Line, Rect } from 'react-native-svg';
import { COLORS, FONTS } from '../theme';
import { EquipmentSlot } from '../types/dnd';
import type { EquippedItem } from '../types/character';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DOLL_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);
const DOLL_HEIGHT = DOLL_WIDTH * 1.4;

interface PaperDollProps {
  equipment: Record<EquipmentSlot, EquippedItem | null>;
  onSlotPress: (slot: EquipmentSlot) => void;
}

interface SlotPosition {
  slot: EquipmentSlot;
  x: number; // 0-1 relative
  y: number; // 0-1 relative
  label: string;
}

const SLOT_POSITIONS: SlotPosition[] = [
  { slot: EquipmentSlot.Head,        x: 0.5,  y: 0.05,  label: 'HEAD' },
  { slot: EquipmentSlot.Face,        x: 0.5,  y: 0.13,  label: 'FACE' },
  { slot: EquipmentSlot.Throat,      x: 0.5,  y: 0.21,  label: 'THROAT' },
  { slot: EquipmentSlot.Shoulders,   x: 0.5,  y: 0.30,  label: 'SHLDRS' },
  { slot: EquipmentSlot.Body,        x: 0.5,  y: 0.42,  label: 'BODY' },
  { slot: EquipmentSlot.Torso,       x: 0.5,  y: 0.53,  label: 'TORSO' },
  { slot: EquipmentSlot.Arms,        x: 0.14, y: 0.42,  label: 'ARMS' },
  { slot: EquipmentSlot.Hands,       x: 0.14, y: 0.53,  label: 'HANDS' },
  { slot: EquipmentSlot.RingLeft,    x: 0.08, y: 0.62,  label: 'RING L' },
  { slot: EquipmentSlot.RingRight,   x: 0.92, y: 0.62,  label: 'RING R' },
  { slot: EquipmentSlot.Waist,       x: 0.5,  y: 0.63,  label: 'WAIST' },
  { slot: EquipmentSlot.Feet,        x: 0.5,  y: 0.93,  label: 'FEET' },
  { slot: EquipmentSlot.WeaponMain,  x: 0.15, y: 0.72,  label: 'WEAPON' },
  { slot: EquipmentSlot.OffHand,     x: 0.85, y: 0.72,  label: 'OFF-H' },
];

export function PaperDoll({ equipment, onSlotPress }: PaperDollProps) {
  return (
    <View style={[styles.container, { width: DOLL_WIDTH, height: DOLL_HEIGHT }]}>
      {/* SVG body silhouette */}
      <Svg
        width={DOLL_WIDTH}
        height={DOLL_HEIGHT}
        viewBox="0 0 200 280"
        style={StyleSheet.absoluteFill}
      >
        {/* Background */}
        <Rect x="0" y="0" width="200" height="280" fill={COLORS.parchmentDark} rx="8" />

        {/* Body outline - head */}
        <Circle cx="100" cy="28" r="20" fill={COLORS.parchment} stroke={COLORS.border} strokeWidth="1.5" />

        {/* Neck */}
        <Rect x="92" y="46" width="16" height="14" fill={COLORS.parchment} stroke={COLORS.border} strokeWidth="1" />

        {/* Shoulders / upper body */}
        <Path
          d="M60,60 Q70,56 80,58 L92,60 L108,60 L120,58 Q130,56 140,60 L148,72 L152,100 L148,120 L50,120 L48,100 L52,72 Z"
          fill={COLORS.parchment}
          stroke={COLORS.border}
          strokeWidth="1.5"
        />

        {/* Left arm */}
        <Path
          d="M60,62 L44,64 L36,80 L34,120 L38,130 L44,128 L48,100 L52,72 Z"
          fill={COLORS.parchment}
          stroke={COLORS.border}
          strokeWidth="1.5"
        />

        {/* Right arm */}
        <Path
          d="M140,62 L156,64 L164,80 L166,120 L162,130 L156,128 L152,100 L148,72 Z"
          fill={COLORS.parchment}
          stroke={COLORS.border}
          strokeWidth="1.5"
        />

        {/* Left hand */}
        <Ellipse cx="41" cy="135" rx="9" ry="8" fill={COLORS.parchment} stroke={COLORS.border} strokeWidth="1.5" />

        {/* Right hand */}
        <Ellipse cx="159" cy="135" rx="9" ry="8" fill={COLORS.parchment} stroke={COLORS.border} strokeWidth="1.5" />

        {/* Torso lower */}
        <Path
          d="M50,120 L148,120 L144,170 L56,170 Z"
          fill={COLORS.parchment}
          stroke={COLORS.border}
          strokeWidth="1.5"
        />

        {/* Belt line */}
        <Line x1="54" y1="168" x2="146" y2="168" stroke={COLORS.border} strokeWidth="1" />

        {/* Left leg */}
        <Path
          d="M56,170 L80,170 L84,240 L64,240 Z"
          fill={COLORS.parchment}
          stroke={COLORS.border}
          strokeWidth="1.5"
        />

        {/* Right leg */}
        <Path
          d="M120,170 L144,170 L136,240 L116,240 Z"
          fill={COLORS.parchment}
          stroke={COLORS.border}
          strokeWidth="1.5"
        />

        {/* Left foot */}
        <Ellipse cx="74" cy="244" rx="14" ry="7" fill={COLORS.parchment} stroke={COLORS.border} strokeWidth="1.5" />

        {/* Right foot */}
        <Ellipse cx="126" cy="244" rx="14" ry="7" fill={COLORS.parchment} stroke={COLORS.border} strokeWidth="1.5" />

        {/* Decorative borders */}
        <Rect x="2" y="2" width="196" height="276" fill="none" stroke={COLORS.accentDark} strokeWidth="1" rx="6" />
        <Rect x="4" y="4" width="192" height="272" fill="none" stroke={COLORS.borderLight} strokeWidth="0.5" rx="5" />
      </Svg>

      {/* Slot tap targets */}
      {SLOT_POSITIONS.map(pos => {
        const equipped = equipment[pos.slot];
        const hasItem = !!(equipped?.itemName);
        const x = pos.x * DOLL_WIDTH;
        const y = pos.y * DOLL_HEIGHT;

        return (
          <TouchableOpacity
            key={pos.slot}
            style={[
              styles.slotButton,
              {
                left: x - 28,
                top: y - 14,
              },
              hasItem && styles.slotButtonEquipped,
            ]}
            onPress={() => onSlotPress(pos.slot)}
            activeOpacity={0.7}
          >
            <Text style={[styles.slotLabel, hasItem && styles.slotLabelEquipped]} numberOfLines={1}>
              {hasItem ? equipped!.itemName : pos.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  slotButton: {
    position: 'absolute',
    backgroundColor: 'rgba(229, 200, 140, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
    width: 56,
    alignItems: 'center',
    zIndex: 10,
  },
  slotButtonEquipped: {
    backgroundColor: 'rgba(139, 26, 26, 0.15)',
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  slotLabel: {
    fontFamily: FONTS.serif,
    fontSize: 7,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  slotLabelEquipped: {
    color: COLORS.accent,
    fontSize: 7,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
