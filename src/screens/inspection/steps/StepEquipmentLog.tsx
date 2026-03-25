import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Camera, Plus, Trash2, Wrench } from 'lucide-react-native';
import { useAppDispatch } from '../../../store';
import { setEquipment } from '../../../store/slices/inspectionSlice';
import { AppButton, AppInput, AppCard } from '../../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { generateId } from '../../../utils';
import type {
  RoomInspection,
  RoomEquipmentEntry,
  EquipmentType,
  InspectionPhoto,
} from '../../../types/inspection';
import { EQUIPMENT_OPTIONS } from '../../../types/inspection';

interface Props {
  path: { floorId: string; unitId: string; roomId: string };
  room: RoomInspection;
  onNext: () => void;
  onPrev: () => void;
}

const StepEquipmentLog: React.FC<Props> = ({ path, room, onNext, onPrev }) => {
  const dispatch = useAppDispatch();

  const [entries, setEntries] = useState<RoomEquipmentEntry[]>(
    room.equipment.length > 0
      ? room.equipment
      : [],
  );
  const [eqPhoto, setEqPhoto] = useState<InspectionPhoto | null>(
    room.equipmentPhoto,
  );

  const addEntry = useCallback((type: EquipmentType) => {
    setEntries((prev) => [
      ...prev,
      { id: generateId(), equipmentType: type, quantity: 1 },
    ]);
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }, []);

  const updateQuantity = useCallback((entryId: string, qty: string) => {
    const num = parseInt(qty, 10);
    if (isNaN(num) || num < 0) return;
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, quantity: num } : e)),
    );
  }, []);

  const handleCapturePhoto = useCallback(() => {
    const photo: InspectionPhoto = {
      id: generateId(),
      uri: `equipment_${room.name}_${Date.now()}.jpg`,
      timestamp: new Date().toISOString(),
      tags: {
        roomName: room.name,
        type: 'equipment_confirmation',
      },
      type: 'equipment_confirmation',
    };
    setEqPhoto(photo);
  }, [room.name]);

  const handleNext = useCallback(() => {
    if (entries.length === 0) {
      Alert.alert(
        'Equipment Required',
        'Log at least one piece of equipment for this room.',
      );
      return;
    }
    if (!eqPhoto) {
      Alert.alert(
        'Photo Required',
        'An equipment confirmation photo is required per room.',
      );
      return;
    }

    dispatch(setEquipment({ path, equipment: entries, photo: eqPhoto }));
    onNext();
  }, [entries, eqPhoto, dispatch, path, onNext]);

  const getLabel = (key: EquipmentType) =>
    EQUIPMENT_OPTIONS.find((e) => e.key === key)?.label ?? key;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.stepNum}>Step 4</Text>
      <Text style={styles.title}>Equipment Logged Per Room</Text>
      <Text style={styles.subtitle}>
        Log all equipment placed in this room and capture a confirmation photo.
      </Text>

      {/* Equipment Photo */}
      <AppButton
        title={eqPhoto ? 'Retake equipment photo' : 'Capture equipment confirmation photo'}
        onPress={handleCapturePhoto}
        variant="outline"
        icon={<Camera size={18} color={Colors.blue} />}
        fullWidth
        size="lg"
        style={styles.captureBtn}
      />
      <Text style={styles.tagHint}>Required per attendance per room</Text>

      {eqPhoto && (
        <Text style={styles.photoCaptured}>
          ✓ Photo captured at{' '}
          {new Date(eqPhoto.timestamp).toLocaleTimeString()}
        </Text>
      )}

      {/* Equipment Entries */}
      <View style={styles.entriesSection}>
        <Text style={styles.sectionTitle}>Equipment</Text>

        {entries.map((entry) => (
          <AppCard
            key={entry.id}
            variant="outlined"
            padding="md"
            style={styles.entryCard}>
            <View style={styles.entryRow}>
              <Wrench size={16} color={Colors.blue} />
              <Text style={styles.entryLabel}>{getLabel(entry.equipmentType)}</Text>
              <View style={styles.qtyControl}>
                <AppInput
                  value={entry.quantity.toString()}
                  onChangeText={(v) => updateQuantity(entry.id, v)}
                  keyboardType="number-pad"
                  containerStyle={styles.qtyInput}
                />
              </View>
              <AppButton
                title=""
                onPress={() => removeEntry(entry.id)}
                variant="ghost"
                size="sm"
                icon={<Trash2 size={16} color={Colors.red} />}
              />
            </View>
          </AppCard>
        ))}

        {/* Add equipment selector */}
        <Text style={styles.addLabel}>Add Equipment:</Text>
        <View style={styles.eqGrid}>
          {EQUIPMENT_OPTIONS.map((option) => (
            <AppCard
              key={option.key}
              onPress={() => addEntry(option.key)}
              variant="outlined"
              padding="sm"
              style={styles.eqChip}>
              <View style={styles.eqChipContent}>
                <Plus size={12} color={Colors.blue} />
                <Text style={styles.eqChipText}>{option.label}</Text>
              </View>
            </AppCard>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Previous"
          onPress={onPrev}
          variant="outline"
          style={styles.actionBtn}
        />
        <AppButton title="Next" onPress={handleNext} style={styles.actionBtn} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  stepNum: {
    ...Typography.captionBold,
    color: Colors.blue,
    marginBottom: Spacing.xxs,
  },
  title: {
    ...Typography.h2,
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
  },
  captureBtn: {
    borderStyle: 'dashed',
    minHeight: 80,
    marginBottom: Spacing.sm,
  },
  tagHint: {
    ...Typography.caption,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  photoCaptured: {
    ...Typography.captionBold,
    color: Colors.green,
    marginBottom: Spacing.xl,
  },
  entriesSection: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  entryCard: {
    marginBottom: Spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entryLabel: {
    ...Typography.body,
    color: Colors.gray700,
    flex: 1,
  },
  qtyControl: {
    width: 64,
  },
  qtyInput: {
    marginBottom: 0,
  },
  addLabel: {
    ...Typography.captionBold,
    color: Colors.gray700,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  eqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  eqChip: {},
  eqChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  eqChipText: {
    ...Typography.caption,
    color: Colors.blue,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
  actionBtn: { flex: 1 },
});

export default React.memo(StepEquipmentLog);
