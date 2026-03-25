import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setStepData } from '../../../store/slices/attendanceSlice';
import { AppButton, AppCheckbox, AppInput, AppCard } from '../../../components';
import { Colors, Typography, Spacing } from '../../../theme';

interface StepEquipmentCheckProps {
  onNext: () => void;
  onPrev: () => void;
}

const EQUIPMENT_ITEMS = [
  { id: 'tools', label: 'All required tools available' },
  { id: 'ppe', label: 'Personal Protective Equipment worn' },
  { id: 'calibration', label: 'Instruments calibrated and tested' },
  { id: 'spare_parts', label: 'Spare parts available if needed' },
  { id: 'documentation', label: 'Equipment documentation accessible' },
];

const StepEquipmentCheck: React.FC<StepEquipmentCheckProps> = ({
  onNext,
  onPrev,
}) => {
  const dispatch = useAppDispatch();
  const stepData = useAppSelector((state) => state.attendance.stepData[3]);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    (stepData?.checkedItems as Record<string, boolean>) ?? {},
  );
  const [equipmentNotes, setEquipmentNotes] = useState(
    (stepData?.equipmentNotes as string) ?? '',
  );

  const toggleItem = useCallback((id: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const allChecked = EQUIPMENT_ITEMS.every((item) => checkedItems[item.id]);

  const handleNext = useCallback(() => {
    if (!allChecked) {
      Alert.alert(
        'Validation',
        'All equipment checks must be completed before proceeding.',
      );
      return;
    }

    dispatch(
      setStepData({
        step: 3,
        data: {
          checkedItems,
          equipmentNotes,
          equipmentVerified: true,
        },
      }),
    );
    onNext();
  }, [allChecked, checkedItems, equipmentNotes, dispatch, onNext]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Equipment Check</Text>
      <Text style={styles.subtitle}>
        Verify all equipment and tools are ready.
      </Text>

      <AppCard variant="outlined" padding="lg" style={styles.card}>
        <View style={styles.cardHeader}>
          <Wrench size={18} color={Colors.blue} />
          <Text style={styles.cardTitle}>Equipment Checklist</Text>
        </View>
        <View style={styles.checklist}>
          {EQUIPMENT_ITEMS.map((item) => (
            <AppCheckbox
              key={item.id}
              label={item.label}
              checked={checkedItems[item.id] ?? false}
              onChange={(checked) => toggleItem(item.id, checked)}
            />
          ))}
        </View>
      </AppCard>

      <AppInput
        label="Equipment Notes"
        placeholder="Any notes about equipment condition..."
        value={equipmentNotes}
        onChangeText={setEquipmentNotes}
        multiline
        numberOfLines={3}
      />

      <View style={styles.actions}>
        <AppButton
          title="Previous"
          onPress={onPrev}
          variant="outline"
          style={styles.actionBtn}
        />
        <AppButton
          title="Next"
          onPress={handleNext}
          style={styles.actionBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
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
  card: {
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.navy,
  },
  checklist: {
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
});

export default React.memo(StepEquipmentCheck);
