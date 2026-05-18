import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import type { Currency } from '../types/character';

interface CurrencyTrackerProps {
  currency: Currency;
  onUpdate: (currency: Partial<Currency>) => void;
}

type CurrencyKey = keyof Currency;

const CURRENCY_CONFIG: {
  key: CurrencyKey;
  label: string;
  abbr: string;
  color: string;
}[] = [
  { key: 'platinum', label: 'Platinum', abbr: 'PP', color: '#E5E4E2' },
  { key: 'gold', label: 'Gold', abbr: 'GP', color: '#FFD700' },
  { key: 'electrum', label: 'Electrum', abbr: 'EP', color: '#C0D0D8' },
  { key: 'silver', label: 'Silver', abbr: 'SP', color: '#C0C0C0' },
  { key: 'copper', label: 'Copper', abbr: 'CP', color: '#B87333' },
];

export function CurrencyTracker({ currency, onUpdate }: CurrencyTrackerProps) {
  const [editKey, setEditKey] = useState<CurrencyKey | null>(null);
  const [editValue, setEditValue] = useState('');

  const openEdit = (key: CurrencyKey) => {
    setEditKey(key);
    setEditValue(String(currency[key]));
  };

  const saveEdit = () => {
    if (!editKey) return;
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdate({ [editKey]: val });
    }
    setEditKey(null);
  };

  const gpTotal =
    currency.platinum * 10 +
    currency.gold +
    currency.electrum * 0.5 +
    currency.silver * 0.1 +
    currency.copper * 0.01;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {CURRENCY_CONFIG.map(cfg => (
          <TouchableOpacity
            key={cfg.key}
            style={[styles.coinBox, { borderColor: cfg.color }]}
            onPress={() => openEdit(cfg.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.coinCircle, { backgroundColor: cfg.color }]}>
              <Text style={styles.coinAbbr}>{cfg.abbr}</Text>
            </View>
            <Text style={styles.coinValue}>{currency[cfg.key]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.total}>Total value: {gpTotal.toFixed(2)} GP</Text>

      <Modal visible={editKey !== null} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Edit {CURRENCY_CONFIG.find(c => c.key === editKey)?.label}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditKey(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveEdit}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    ...SHADOWS.card,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  coinBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 6,
    borderWidth: 2,
    padding: SPACING.xs,
  },
  coinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  coinAbbr: {
    fontFamily: FONTS.serif,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.text,
  },
  coinValue: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  total: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.parchment,
    borderRadius: 12,
    padding: SPACING.xl,
    width: 220,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: SPACING.sm,
    fontFamily: FONTS.serif,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: { backgroundColor: COLORS.accent },
  cancelText: { fontFamily: FONTS.serif, fontSize: 14, color: COLORS.text },
  saveText: { fontFamily: FONTS.serif, fontSize: 14, color: COLORS.white, fontWeight: '700' },
});
