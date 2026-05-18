import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import type { HitPoints } from '../types/character';

interface HPTrackerProps {
  hitPoints: HitPoints;
  onUpdate: (hp: Partial<HitPoints>) => void;
}

export function HPTracker({ hitPoints, onUpdate }: HPTrackerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [damageInput, setDamageInput] = useState('');
  const [healInput, setHealInput] = useState('');
  const [editField, setEditField] = useState<keyof HitPoints | null>(null);
  const [fieldValue, setFieldValue] = useState('');

  const hpPercent = hitPoints.max > 0 ? hitPoints.current / hitPoints.max : 0;
  const effectiveHP = hitPoints.current + hitPoints.temporary;

  let hpColor = COLORS.hpGood;
  if (hpPercent <= 0.25) hpColor = COLORS.hpCritical;
  else if (hpPercent <= 0.5) hpColor = COLORS.hpWounded;

  let status = 'Healthy';
  if (hitPoints.current <= 0) {
    if (hitPoints.current <= -10) status = 'Dead';
    else if (hitPoints.current < 0) status = 'Dying';
    else status = 'Disabled';
  } else if (hpPercent <= 0.25) status = 'Bloodied';
  else if (hpPercent <= 0.5) status = 'Wounded';

  const applyDamage = () => {
    const dmg = parseInt(damageInput, 10);
    if (isNaN(dmg) || dmg <= 0) return;

    let remaining = dmg;
    let newTemp = hitPoints.temporary;
    if (newTemp > 0) {
      const absorbed = Math.min(newTemp, remaining);
      remaining -= absorbed;
      newTemp -= absorbed;
    }
    const newCurrent = hitPoints.current - remaining;
    onUpdate({ current: newCurrent, temporary: newTemp });
    setDamageInput('');
  };

  const applyHeal = () => {
    const heal = parseInt(healInput, 10);
    if (isNaN(heal) || heal <= 0) return;
    const newCurrent = Math.min(hitPoints.max, hitPoints.current + heal);
    onUpdate({ current: newCurrent });
    setHealInput('');
  };

  const openEdit = (field: keyof HitPoints) => {
    setEditField(field);
    setFieldValue(String(hitPoints[field]));
    setModalVisible(true);
  };

  const saveEdit = () => {
    if (!editField) return;
    const val = parseInt(fieldValue, 10);
    if (!isNaN(val)) {
      onUpdate({ [editField]: val });
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* HP Bar */}
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, hpPercent * 100))}%`, backgroundColor: hpColor }]} />
        <Text style={styles.barLabel}>{status}</Text>
      </View>

      {/* HP Grid */}
      <View style={styles.hpGrid}>
        <TouchableOpacity style={styles.hpBox} onPress={() => openEdit('max')}>
          <Text style={styles.hpLabel}>MAX HP</Text>
          <Text style={styles.hpValue}>{hitPoints.max}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.hpBox, styles.hpCurrent]} onPress={() => openEdit('current')}>
          <Text style={styles.hpLabel}>CURRENT</Text>
          <Text style={[styles.hpValue, styles.hpCurrentValue, { color: hpColor }]}>{hitPoints.current}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hpBox} onPress={() => openEdit('temporary')}>
          <Text style={styles.hpLabel}>TEMP</Text>
          <Text style={[styles.hpValue, { color: COLORS.info }]}>{hitPoints.temporary}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hpBox} onPress={() => openEdit('nonlethal')}>
          <Text style={styles.hpLabel}>NONLETHAL</Text>
          <Text style={[styles.hpValue, { color: COLORS.warning }]}>{hitPoints.nonlethal}</Text>
        </TouchableOpacity>
      </View>

      {/* Damage / Heal Row */}
      <View style={styles.actionRow}>
        <View style={styles.actionGroup}>
          <TextInput
            style={styles.actionInput}
            value={damageInput}
            onChangeText={setDamageInput}
            keyboardType="numeric"
            placeholder="Dmg"
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity style={[styles.actionBtn, styles.damageBtn]} onPress={applyDamage}>
            <Text style={styles.actionBtnText}>Damage</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionGroup}>
          <TextInput
            style={styles.actionInput}
            value={healInput}
            onChangeText={setHealInput}
            keyboardType="numeric"
            placeholder="Heal"
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity style={[styles.actionBtn, styles.healBtn]} onPress={applyHeal}>
            <Text style={styles.actionBtnText}>Heal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit {editField?.toUpperCase()}</Text>
            <TextInput
              style={styles.modalInput}
              value={fieldValue}
              onChangeText={setFieldValue}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveEdit}
              >
                <Text style={styles.saveBtnText}>Save</Text>
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
  barContainer: {
    height: 24,
    backgroundColor: COLORS.parchmentDark,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
  },
  barLabel: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 24,
  },
  hpGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  hpBox: {
    flex: 1,
    backgroundColor: COLORS.parchmentDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
  },
  hpCurrent: {
    flex: 1.5,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  hpLabel: {
    fontFamily: FONTS.serif,
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  hpValue: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  hpCurrentValue: {
    fontSize: 28,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  actionInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  damageBtn: {
    backgroundColor: COLORS.danger,
  },
  healBtn: {
    backgroundColor: COLORS.success,
  },
  actionBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.parchment,
    borderRadius: 12,
    padding: SPACING.xl,
    width: 240,
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
    borderRadius: 4,
    padding: SPACING.sm,
    fontFamily: FONTS.serif,
    fontSize: 24,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalButtons: {
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
  saveBtn: {
    backgroundColor: COLORS.accent,
  },
  cancelBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  saveBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '700',
  },
});
